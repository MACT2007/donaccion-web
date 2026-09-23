import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Clock, Loader2, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/donaccion";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto | DonAcción" },
      {
        name: "description",
        content:
          "Escríbenos por donaciones, alianzas corporativas, prensa, postulación de campañas o el canal de integridad.",
      },
      { property: "og:title", content: "Contacto | DonAcción" },
      { property: "og:description", content: "Correo, teléfono, WhatsApp y formulario directo con respuesta en 48 horas." },
    ],
  }),
  component: ContactPage,
});

const TOPICS = [
  "Quiero donar",
  "Alianza corporativa",
  "Postular una campaña",
  "Voluntariado",
  "Prensa",
  "Canal de integridad",
  "Otro",
];

function ContactPage() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", subject: "Quiero donar", message: "" });
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("contact_messages").insert({
        name: form.full_name.trim(),
        email: form.email.trim(),
        subject: form.subject,
        message: form.phone.trim()
          ? `${form.message.trim()}\n\nTeléfono: ${form.phone.trim()}`
          : form.message.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setDone(true);
      toast.success("Mensaje enviado. Te responderemos pronto.");
    },
    onError: () => toast.error("No pudimos enviar tu mensaje. Inténtalo de nuevo."),
  });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.full_name.trim() || !form.email.trim() || form.message.trim().length < 10) {
      toast.error("Completa tu nombre, correo y un mensaje de al menos 10 caracteres.");
      return;
    }
    mutation.mutate();
  }

  return (
    <>
      <section className="ink-panel grain">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide opacity-70">Contacto</p>
          <h1 className="animate-fade-up mt-3 font-display text-4xl font-bold sm:text-5xl">Hablemos</h1>
          <p className="animate-fade-up mt-4 max-w-2xl opacity-80 [animation-delay:120ms]">
            Respondemos todos los mensajes en un máximo de 48 horas hábiles. Si tu consulta es urgente, escríbenos por
            WhatsApp.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:px-8">
        <div className="space-y-4">
          {[
            { icon: Mail, label: "Correo", value: SITE.email, href: `https://mail.google.com/mail/?view=cm&fs=1&to=${SITE.email}`
},
            { icon: Phone, label: "Teléfono", value: SITE.phone, href: `tel:${SITE.phone.replace(/\s/g, "")}` },
            {
  icon: MessageCircle,
  label: "WhatsApp",
  value: "Escribir por WhatsApp",
  href: `https://api.whatsapp.com/send?phone=${SITE.whatsapp.replace(/\D/g, "")}`,
},
 
            { icon: MapPin, label: "Oficina", value: SITE.address },
            { icon: Clock, label: "Horario", value: "Lunes a viernes, 9:00 a 6:00" },
          ].map((item, i) => (
            <Reveal key={item.label} delay={i * 70}>
              <div className="surface flex items-start gap-4 p-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-accent">
                  <item.icon className="size-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                  {item.href ? (
                    <a
  href={item.href}
  target={item.href?.startsWith("http") ? "_blank" : undefined}
  rel="noopener noreferrer"
  className="mt-0.5 block font-medium underline-grow"
>
  {item.value}
</a>
                  ) : (
                    <p className="mt-0.5 font-medium">{item.value}</p>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="surface p-6 sm:p-8">
          {done ? (
            <div className="py-14 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-secondary text-accent">
                <CheckCircle2 className="size-7" />
              </span>
              <h2 className="mt-5 font-display text-xl font-bold">Mensaje enviado</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Gracias por escribirnos. Responderemos a {form.email} en un máximo de 48 horas hábiles.
              </p>
              <Button variant="outline" className="mt-6" onClick={() => setDone(false)}>
                Enviar otro mensaje
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <h2 className="font-display text-xl font-bold">Escríbenos</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="c-name">Nombre completo *</Label>
                  <Input
                    id="c-name"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-email">Correo *</Label>
                  <Input
                    id="c-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-phone">Teléfono</Label>
                  <Input
                    id="c-phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-subject">Motivo</Label>
                  <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
                    <SelectTrigger id="c-subject">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TOPICS.map((topic) => (
                        <SelectItem key={topic} value={topic}>
                          {topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-message">Mensaje *</Label>
                <Textarea
                  id="c-message"
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Cuéntanos en qué podemos ayudarte…"
                />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
                Enviar mensaje
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
