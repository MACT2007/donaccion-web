GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.drop_off_points TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transparency_reports TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
GRANT ALL ON public.faqs TO service_role;
GRANT ALL ON public.drop_off_points TO service_role;
GRANT ALL ON public.transparency_reports TO service_role;

CREATE POLICY testimonials_admin_write ON public.testimonials FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY faqs_admin_write ON public.faqs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY drop_off_admin_write ON public.drop_off_points FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY transparency_admin_write ON public.transparency_reports FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));