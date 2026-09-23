-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  city TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CATEGORIES
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'heart',
  accent TEXT NOT NULL DEFAULT 'default',
  needs TEXT[] NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "categories_admin_write" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- CAMPAIGNS
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  image_key TEXT NOT NULL DEFAULT 'general',
  goal_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  raised_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  donors_count INT NOT NULL DEFAULT 0,
  location TEXT NOT NULL DEFAULT '',
  organization TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'activa',
  is_urgent BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  accepts_goods BOOLEAN NOT NULL DEFAULT true,
  ends_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.campaigns TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaigns_public_read" ON public.campaigns FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "campaigns_admin_write" ON public.campaigns FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON public.campaigns
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- DONATIONS
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  donor_name TEXT NOT NULL DEFAULT '',
  donor_email TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'dinero',
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  goods_description TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'confirmada',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.donations TO authenticated;
GRANT INSERT ON public.donations TO anon;
GRANT ALL ON public.donations TO service_role;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "donations_insert_anyone" ON public.donations FOR INSERT TO anon, authenticated WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "donations_select_own" ON public.donations FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.sync_campaign_totals()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.campaign_id IS NOT NULL AND NEW.kind = 'dinero' AND NEW.status = 'confirmada' THEN
    UPDATE public.campaigns
      SET raised_amount = raised_amount + NEW.amount,
          donors_count = donors_count + 1
      WHERE id = NEW.campaign_id;
  ELSIF NEW.campaign_id IS NOT NULL THEN
    UPDATE public.campaigns SET donors_count = donors_count + 1 WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER donations_sync_totals AFTER INSERT ON public.donations
FOR EACH ROW EXECUTE FUNCTION public.sync_campaign_totals();

-- VOLUNTEERS
CREATE TABLE public.volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  skills TEXT NOT NULL DEFAULT '',
  availability TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.volunteers TO anon;
GRANT SELECT, INSERT ON public.volunteers TO authenticated;
GRANT ALL ON public.volunteers TO service_role;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "volunteers_insert_anyone" ON public.volunteers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "volunteers_select_admin" ON public.volunteers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

-- CONTACT
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_insert_anyone" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "contact_select_admin" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- NEWSLETTER
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT SELECT, INSERT ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "newsletter_insert_anyone" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "newsletter_select_admin" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- TESTIMONIALS
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  quote TEXT NOT NULL,
  initials TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "testimonials_public_read" ON public.testimonials FOR SELECT TO anon, authenticated USING (true);

-- FAQS
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  topic TEXT NOT NULL DEFAULT 'general',
  sort_order INT NOT NULL DEFAULT 0
);
GRANT SELECT ON public.faqs TO anon, authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faqs_public_read" ON public.faqs FOR SELECT TO anon, authenticated USING (true);

-- DROP OFF POINTS
CREATE TABLE public.drop_off_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  hours TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0
);
GRANT SELECT ON public.drop_off_points TO anon, authenticated;
GRANT ALL ON public.drop_off_points TO service_role;
ALTER TABLE public.drop_off_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "drop_off_public_read" ON public.drop_off_points FOR SELECT TO anon, authenticated USING (true);

-- TRANSPARENCY
CREATE TABLE public.transparency_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  total_raised NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_beneficiaries INT NOT NULL DEFAULT 0,
  programs_pct INT NOT NULL DEFAULT 85,
  admin_pct INT NOT NULL DEFAULT 10,
  fundraising_pct INT NOT NULL DEFAULT 5
);
GRANT SELECT ON public.transparency_reports TO anon, authenticated;
GRANT ALL ON public.transparency_reports TO service_role;
ALTER TABLE public.transparency_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transparency_public_read" ON public.transparency_reports FOR SELECT TO anon, authenticated USING (true);

-- SEED DATA
INSERT INTO public.categories (slug, name, description, icon, accent, needs, sort_order) VALUES
('ropa', 'Ropa y calzado', 'Prendas en buen estado, abrigos, uniformes escolares y zapatos para todas las edades.', 'shirt', 'sky', ARRAY['Abrigos y chompas','Uniformes escolares','Calzado en buen estado','Ropa de bebé'], 1),
('alimentos', 'Alimentos', 'Canastas básicas, alimentos no perecibles y desayunos para comedores populares.', 'utensils', 'amber', ARRAY['Arroz, menestras y aceite','Leche y conservas','Alimentos no perecibles','Agua embotellada'], 2),
('medicinas', 'Salud y medicinas', 'Medicamentos vigentes, insumos médicos y apoyo para tratamientos.', 'stethoscope', 'rose', ARRAY['Medicamentos sin abrir','Insumos de primeros auxilios','Sillas de ruedas y muletas','Apoyo para tratamientos'], 3),
('educacion', 'Educación', 'Útiles escolares, libros y becas para que nadie deje de estudiar.', 'graduation-cap', 'indigo', ARRAY['Cuadernos y útiles','Libros y mochilas','Laptops y tablets','Becas escolares'], 4),
('juguetes', 'Juguetes y recreación', 'Juguetes, juegos y material deportivo para la niñez.', 'gift', 'violet', ARRAY['Juguetes en buen estado','Juegos de mesa','Pelotas y material deportivo','Libros infantiles'], 5),
('higiene', 'Higiene y cuidado', 'Kits de aseo personal, pañales y productos de limpieza.', 'droplets', 'teal', ARRAY['Jabón y shampoo','Pañales y toallas','Pasta y cepillos dentales','Productos de limpieza'], 6),
('hogar', 'Hogar y muebles', 'Colchones, frazadas, muebles y enseres para familias reubicadas.', 'sofa', 'emerald', ARRAY['Frazadas y colchones','Ollas y menaje','Muebles funcionales','Electrodomésticos'], 7),
('tecnologia', 'Tecnología', 'Equipos y conectividad para aulas y talleres comunitarios.', 'laptop', 'slate', ARRAY['Laptops y PCs','Tablets','Routers y módems','Audífonos'], 8);

INSERT INTO public.campaigns (slug, title, summary, description, category_id, image_key, goal_amount, raised_amount, donors_count, location, organization, status, is_urgent, is_featured, accepts_goods, ends_at) VALUES
('abrigo-para-el-invierno', 'Abrigo para el invierno andino', 'Frazadas y ropa térmica para 500 familias en zonas de heladas.', 'Cada año las heladas superan los -10 °C en las comunidades altoandinas. Con tu donación entregamos kits de abrigo compuestos por dos frazadas polares, chompas térmicas, gorros y guantes. Los kits se arman con voluntarios locales y se entregan casa por casa junto a las postas médicas de la zona.', (SELECT id FROM public.categories WHERE slug='ropa'), 'ropa', 45000, 31200, 412, 'Puno, Perú', 'Red Solidaria Altiplano', 'activa', true, true, true, '2026-11-30'),
('ollas-que-abrazan', 'Ollas que abrazan', 'Insumos para 12 comedores populares durante seis meses.', 'Doce comedores populares sirven más de 3.000 almuerzos semanales. Esta campaña financia la compra mensual de arroz, menestras, aceite, verduras y gas, además de capacitación en nutrición para las socias que cocinan cada día.', (SELECT id FROM public.categories WHERE slug='alimentos'), 'alimentos', 60000, 48900, 723, 'Lima, Perú', 'Comedores Unidos', 'activa', false, true, true, '2026-12-15'),
('medicinas-que-no-esperan', 'Medicinas que no esperan', 'Tratamientos oncológicos para 40 pacientes sin seguro.', 'Trabajamos con dos hospitales públicos para cubrir medicamentos que no están en el listado gratuito. Cada aporte se destina directamente a la farmacia hospitalaria y se reporta con boleta y número de historia clínica anonimizado.', (SELECT id FROM public.categories WHERE slug='medicinas'), 'medicinas', 80000, 22400, 289, 'Arequipa, Perú', 'Fundación Vida Plena', 'activa', true, true, false, '2026-10-31'),
('mochilas-con-futuro', 'Mochilas con futuro', 'Útiles escolares completos para 1.200 escolares.', 'Antes del inicio de clases entregamos mochilas con cuadernos, útiles, textos de lectura y un kit de higiene. El programa incluye seguimiento durante el año para reducir la deserción escolar.', (SELECT id FROM public.categories WHERE slug='educacion'), 'educacion', 36000, 33750, 655, 'Cusco, Perú', 'Educa Perú', 'activa', false, true, true, '2027-02-28'),
('navidad-sin-nadie-fuera', 'Navidad sin nadie fuera', 'Juguetes nuevos y chocolatadas para 2.000 niños.', 'Una campaña de fin de año con más de 300 voluntarios: recolección de juguetes, armado de bolsas y 25 chocolatadas comunitarias en barrios periféricos.', (SELECT id FROM public.categories WHERE slug='juguetes'), 'juguetes', 25000, 9800, 197, 'Trujillo, Perú', 'Voluntarios del Norte', 'activa', false, false, true, '2026-12-20'),
('agua-limpia-y-manos-limpias', 'Agua limpia, manos limpias', 'Kits de higiene y filtros de agua para 800 hogares.', 'Instalamos filtros cerámicos domiciliarios y entregamos kits de higiene con jabón, shampoo, pasta dental y toallas. Incluye talleres de lavado de manos en colegios.', (SELECT id FROM public.categories WHERE slug='higiene'), 'higiene', 40000, 27600, 388, 'Iquitos, Perú', 'Agua Viva', 'activa', false, false, true, '2026-11-15'),
('un-techo-y-una-cama', 'Un techo y una cama', 'Colchones, frazadas y menaje para familias damnificadas.', 'Después de las lluvias, 300 familias perdieron sus enseres. Entregamos colchones, frazadas, ollas y kits de cocina, priorizando hogares con niños y adultos mayores.', (SELECT id FROM public.categories WHERE slug='hogar'), 'hogar', 55000, 41300, 501, 'Piura, Perú', 'Manos que Construyen', 'activa', true, false, true, '2026-10-20'),
('aulas-conectadas', 'Aulas conectadas', 'Laptops y conectividad para 15 escuelas rurales.', 'Reacondicionamos laptops donadas por empresas, instalamos routers satelitales y capacitamos a docentes en herramientas digitales.', (SELECT id FROM public.categories WHERE slug='tecnologia'), 'tecnologia', 70000, 18450, 164, 'Ayacucho, Perú', 'Conecta Rural', 'activa', false, false, true, '2027-03-31'),
('desayunos-escolares-2025', 'Desayunos escolares 2025', 'Meta cumplida: 180.000 desayunos servidos.', 'Gracias a 1.240 donantes cubrimos un año completo de desayunos en 9 escuelas. El informe final de gastos está disponible en la sección de transparencia.', (SELECT id FROM public.categories WHERE slug='alimentos'), 'alimentos', 50000, 50000, 1240, 'Lima, Perú', 'Comedores Unidos', 'completada', false, false, false, '2025-12-31');

INSERT INTO public.testimonials (name, role, quote, initials, sort_order) VALUES
('Rosa Quispe', 'Presidenta de comedor popular, Lima', 'Con DonAcción dejamos de improvisar. Sabemos cuánto llega, en qué se gasta y cuántos platos podemos servir cada semana.', 'RQ', 1),
('Diego Salazar', 'Donante recurrente', 'Aporto 50 soles al mes y recibo el reporte de la campaña. Es la primera vez que siento que mi donación tiene nombre y apellido.', 'DS', 2),
('Lucía Fernández', 'Voluntaria de logística', 'Me inscribí un sábado y el martes ya estaba armando kits de abrigo. La organización es impecable.', 'LF', 3),
('Carlos Medina', 'Director, Educa Perú', 'La plataforma nos permitió llegar a 655 donantes nuevos en una sola campaña escolar.', 'CM', 4);

INSERT INTO public.faqs (question, answer, topic, sort_order) VALUES
('¿Cómo sé que mi donación llega a su destino?', 'Cada campaña publica su meta, lo recaudado y un informe de rendición. Además, los reportes anuales de transparencia detallan cuánto se destinó a programas, administración y captación de fondos.', 'transparencia', 1),
('¿Puedo donar sin crear una cuenta?', 'Sí. Puedes donar como invitado con tu nombre y correo. Si creas una cuenta, guardamos el historial de tus donaciones y tus certificados.', 'donaciones', 2),
('¿Qué pasa si una campaña no llega a su meta?', 'Los fondos se ejecutan de forma parcial priorizando lo más urgente, y el remanente se traslada a una campaña de la misma categoría. Siempre se informa al donante.', 'donaciones', 3),
('¿Puedo donar cosas en lugar de dinero?', 'Claro. Las campañas marcadas como "recibe donaciones en especie" aceptan ropa, alimentos, útiles y más. Puedes llevarlos a cualquiera de nuestros puntos de acopio.', 'especie', 4),
('¿En qué estado deben estar las prendas o juguetes?', 'Deben estar limpios, completos y en condiciones de ser usados. Los alimentos deben tener al menos tres meses antes de su vencimiento y estar sellados.', 'especie', 5),
('¿Emiten certificado de donación?', 'Sí. El certificado se genera automáticamente y queda disponible en tu panel apenas se confirma la donación.', 'donaciones', 6),
('¿Puedo hacer una donación mensual?', 'Sí, al donar puedes marcar la opción de aporte recurrente y elegir el monto mensual. Puedes pausarlo cuando quieras desde tu panel.', 'donaciones', 7),
('¿Cómo me convierto en voluntario?', 'Completa el formulario de voluntariado con tus habilidades y disponibilidad. El equipo de coordinación te contacta en un plazo de 72 horas.', 'voluntariado', 8),
('¿Mi organización puede publicar una campaña?', 'Sí. Escríbenos desde la página de contacto con la documentación de tu organización y el proyecto. Verificamos y publicamos en un promedio de 10 días hábiles.', 'organizaciones', 9),
('¿Cómo protegen mis datos personales?', 'Solo usamos tus datos para gestionar la donación y enviarte información de la campaña. Nunca los compartimos ni los vendemos a terceros.', 'privacidad', 10);

INSERT INTO public.drop_off_points (name, address, city, hours, phone, sort_order) VALUES
('Centro de acopio Miraflores', 'Av. Larco 1234, Miraflores', 'Lima', 'Lun a Sáb, 9:00 - 19:00', '+51 1 555 0101', 1),
('Almacén San Juan de Lurigancho', 'Av. Próceres 890', 'Lima', 'Lun a Vie, 8:00 - 17:00', '+51 1 555 0102', 2),
('Punto solidario Arequipa', 'Calle Mercaderes 210, Cercado', 'Arequipa', 'Lun a Sáb, 10:00 - 18:00', '+51 54 555 0103', 3),
('Punto solidario Cusco', 'Av. El Sol 456', 'Cusco', 'Mar a Dom, 9:00 - 18:00', '+51 84 555 0104', 4),
('Punto solidario Trujillo', 'Jr. Pizarro 733', 'Trujillo', 'Lun a Sáb, 9:00 - 18:00', '+51 44 555 0105', 5),
('Punto solidario Puno', 'Av. Simón Bolívar 145', 'Puno', 'Lun a Vie, 9:00 - 17:00', '+51 51 555 0106', 6);

INSERT INTO public.transparency_reports (year, title, description, total_raised, total_beneficiaries, programs_pct, admin_pct, fundraising_pct) VALUES
(2025, 'Memoria anual 2025', 'Cierre de 24 campañas, con auditoría externa y detalle por categoría.', 1284500, 48200, 87, 8, 5),
(2024, 'Memoria anual 2024', 'Primer año con auditoría independiente y tablero público de campañas.', 942300, 36400, 85, 10, 5),
(2023, 'Memoria anual 2023', 'Consolidación de la red de puntos de acopio en seis regiones.', 615800, 21700, 83, 12, 5);