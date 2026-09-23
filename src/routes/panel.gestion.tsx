import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminCrud, type CrudField } from "@/components/AdminCrud";
import { supabase } from "@/integrations/supabase/client";
import { IMAGES } from "@/lib/donaccion";
import { useSession } from "@/lib/session";
import type { Category } from "@/lib/types";

export const Route = createFileRoute("/panel/gestion")({
  head: () => ({
    meta: [
      { title: "Gestión de contenido | DonAcción" },
      {
        name: "description",
        content: "Panel de administración para crear y editar campañas, categorías y contenido del sitio.",
      },
      { property: "og:title", content: "Gestión de contenido | DonAcción" },
      { property: "og:description", content: "Administra campañas y contenido de DonAcción." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ManagePage,
});

const IMAGE_OPTIONS = Object.keys(IMAGES).map((k) => ({ value: k, label: k }));

const ACCENTS = ["default", "sky", "amber", "rose", "indigo", "violet", "teal", "emerald", "slate"].map(
  (v) => ({ value: v, label: v }),
);

const ICONS = [
  "heart",
  "shirt",
  "apple",
  "pill",
  "graduation-cap",
  "gamepad-2",
  "sparkles",
  "home",
  "laptop",
  "package",
].map((v) => ({ value: v, label: v }));

function ManagePage() {
  const { session, loading, isAdmin, roleLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate({ to: "/auth", replace: true });
      return;
    }
    if (!roleLoading && !isAdmin) navigate({ to: "/panel", replace: true });
  }, [loading, roleLoading, session, isAdmin, navigate]);

  const { data: categories } = useQuery({
    enabled: !!session && isAdmin,
    queryKey: ["admin-categories-options"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      return (data ?? []) as Category[];
    },
  });

  if (loading || roleLoading || !session || !isAdmin) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  const campaignFields: CrudField[] = [
    { name: "title", label: "Título", type: "text", required: true, span: true },
    {
      name: "slug",
      label: "Dirección web (slug)",
      type: "text",
      required: true,
      help: "Solo minúsculas y guiones, por ejemplo: abrigo-para-el-sur",
    },
    {
      name: "category_id",
      label: "Categoría",
      type: "select",
      options: (categories ?? []).map((c) => ({ value: c.id, label: c.name })),
    },
    { name: "summary", label: "Resumen corto", type: "textarea", required: true },
    { name: "description", label: "Descripción completa", type: "textarea" },
    { name: "image_key", label: "Imagen", type: "select", options: IMAGE_OPTIONS },
    {
      name: "status",
      label: "Estado",
      type: "select",
      options: [
        { value: "activa", label: "Activa" },
        { value: "completada", label: "Meta cumplida" },
        { value: "pausada", label: "Pausada" },
      ],
    },
    { name: "goal_amount", label: "Meta (S/)", type: "number" },
    { name: "raised_amount", label: "Recaudado (S/)", type: "number" },
    { name: "donors_count", label: "N° de donantes", type: "number" },
    { name: "ends_at", label: "Fecha de cierre", type: "date" },
    { name: "location", label: "Lugar", type: "text" },
    { name: "organization", label: "Organización aliada", type: "text" },
    { name: "is_urgent", label: "Marcar como urgente", type: "switch" },
    { name: "is_featured", label: "Destacar en portada", type: "switch" },
    { name: "accepts_goods", label: "Acepta donaciones en especie", type: "switch" },
  ];

  return (
    <>
      <section className="ink-panel grain">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-4 py-14 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide opacity-70">Administración</p>
            <h1 className="animate-fade-up mt-3 font-display text-3xl font-bold sm:text-4xl">
              Gestión de contenido
            </h1>
            <p className="animate-fade-up mt-2 max-w-2xl opacity-80 [animation-delay:120ms]">
              Crea, edita y elimina campañas, categorías, preguntas frecuentes, testimonios, puntos de
              acopio y memorias anuales. Los cambios se ven de inmediato en la página.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="secondary">
              <Link to="/panel/admin">Bandeja interna</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/panel">Mi panel</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Tabs defaultValue="campanas">
          <TabsList className="flex-wrap">
            <TabsTrigger value="campanas">Campañas</TabsTrigger>
            <TabsTrigger value="categorias">Categorías</TabsTrigger>
            <TabsTrigger value="faqs">Preguntas</TabsTrigger>
            <TabsTrigger value="testimonios">Testimonios</TabsTrigger>
            <TabsTrigger value="acopio">Puntos de acopio</TabsTrigger>
            <TabsTrigger value="memorias">Memorias</TabsTrigger>
          </TabsList>

          <TabsContent value="campanas" className="mt-8">
            <AdminCrud
              table="campaigns"
              title="Campañas"
              description="Cada campaña aparece en el listado público y tiene su propia página de donación."
              addLabel="Nueva campaña"
              orderBy="created_at"
              ascending={false}
              fields={campaignFields}
              primary={(r) => r.title}
              secondary={(r) =>
                `${r.status} · S/ ${Number(r.raised_amount)} de S/ ${Number(r.goal_amount)} · ${r.location || "sin lugar"}`
              }
              defaults={{
                title: "",
                slug: "",
                category_id: "",
                summary: "",
                description: "",
                image_key: "general",
                status: "activa",
                goal_amount: 0,
                raised_amount: 0,
                donors_count: 0,
                ends_at: "",
                location: "",
                organization: "",
                is_urgent: false,
                is_featured: false,
                accepts_goods: true,
              }}
            />
          </TabsContent>

          <TabsContent value="categorias" className="mt-8">
            <AdminCrud
              table="categories"
              title="Categorías"
              description="Agrupan las campañas y muestran la lista de necesidades de cada tipo de ayuda."
              addLabel="Nueva categoría"
              orderBy="sort_order"
              fields={[
                { name: "name", label: "Nombre", type: "text", required: true },
                { name: "slug", label: "Dirección web (slug)", type: "text", required: true },
                { name: "description", label: "Descripción", type: "textarea" },
                { name: "icon", label: "Icono", type: "select", options: ICONS },
                { name: "accent", label: "Color", type: "select", options: ACCENTS },
                {
                  name: "needs",
                  label: "Necesidades",
                  type: "tags",
                  span: true,
                  help: "Sepáralas con comas: chompas, frazadas, gorros",
                },
                { name: "sort_order", label: "Orden", type: "number" },
              ]}
              primary={(r) => r.name}
              secondary={(r) => `${r.slug} · ${(r.needs ?? []).length} necesidades`}
              defaults={{
                name: "",
                slug: "",
                description: "",
                icon: "heart",
                accent: "default",
                needs: "",
                sort_order: 0,
              }}
            />
          </TabsContent>

          <TabsContent value="faqs" className="mt-8">
            <AdminCrud
              table="faqs"
              title="Preguntas frecuentes"
              description="Se muestran agrupadas por tema en la página de preguntas frecuentes."
              addLabel="Nueva pregunta"
              orderBy="sort_order"
              fields={[
                { name: "question", label: "Pregunta", type: "text", required: true, span: true },
                { name: "answer", label: "Respuesta", type: "textarea", required: true },
                { name: "topic", label: "Tema", type: "text" },
                { name: "sort_order", label: "Orden", type: "number" },
              ]}
              primary={(r) => r.question}
              secondary={(r) => r.topic}
              defaults={{ question: "", answer: "", topic: "general", sort_order: 0 }}
            />
          </TabsContent>

          <TabsContent value="testimonios" className="mt-8">
            <AdminCrud
              table="testimonials"
              title="Testimonios"
              description="Aparecen en la portada como voces de donantes y beneficiarios."
              addLabel="Nuevo testimonio"
              orderBy="sort_order"
              fields={[
                { name: "name", label: "Nombre", type: "text", required: true },
                { name: "role", label: "Rol o descripción", type: "text" },
                { name: "quote", label: "Testimonio", type: "textarea", required: true },
                { name: "initials", label: "Iniciales", type: "text" },
                { name: "sort_order", label: "Orden", type: "number" },
              ]}
              primary={(r) => r.name}
              secondary={(r) => r.role || r.quote}
              defaults={{ name: "", role: "", quote: "", initials: "", sort_order: 0 }}
            />
          </TabsContent>

          <TabsContent value="acopio" className="mt-8">
            <AdminCrud
              table="drop_off_points"
              title="Puntos de acopio"
              description="Sedes donde las personas dejan sus donaciones en especie."
              addLabel="Nuevo punto"
              orderBy="sort_order"
              fields={[
                { name: "name", label: "Nombre de la sede", type: "text", required: true },
                { name: "city", label: "Ciudad", type: "text", required: true },
                { name: "address", label: "Dirección", type: "text", required: true, span: true },
                { name: "hours", label: "Horario", type: "text" },
                { name: "phone", label: "Teléfono", type: "text" },
                { name: "sort_order", label: "Orden", type: "number" },
              ]}
              primary={(r) => r.name}
              secondary={(r) => `${r.city} · ${r.address}`}
              defaults={{ name: "", city: "", address: "", hours: "", phone: "", sort_order: 0 }}
            />
          </TabsContent>

          <TabsContent value="memorias" className="mt-8">
            <AdminCrud
              table="transparency_reports"
              title="Memorias anuales"
              description="Cifras y distribución de gastos publicadas en la página de transparencia."
              addLabel="Nueva memoria"
              orderBy="year"
              ascending={false}
              fields={[
                { name: "year", label: "Año", type: "number", required: true },
                { name: "title", label: "Título", type: "text", required: true },
                { name: "description", label: "Descripción", type: "textarea" },
                { name: "total_raised", label: "Total recaudado (S/)", type: "number" },
                { name: "total_beneficiaries", label: "Personas beneficiadas", type: "number" },
                { name: "programs_pct", label: "% programas", type: "number" },
                { name: "admin_pct", label: "% administración", type: "number" },
                { name: "fundraising_pct", label: "% captación", type: "number" },
              ]}
              primary={(r) => `${r.year} · ${r.title}`}
              secondary={(r) => `S/ ${Number(r.total_raised)} · ${r.total_beneficiaries} personas`}
              defaults={{
                year: new Date().getFullYear(),
                title: "",
                description: "",
                total_raised: 0,
                total_beneficiaries: 0,
                programs_pct: 85,
                admin_pct: 10,
                fundraising_pct: 5,
              }}
            />
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
}
