import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Clock, HeartHandshake, Loader2, Truck, Warehouse } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/voluntariado")({
  head: () => ({
    meta: [
      { title: "Voluntariado: súmate al equipo de DonAcción" },
      {
        name: "description",
        content:
          "Postula como voluntario en acopio, armado de kits, reparto en campo o apoyo profesional. Turnos flexibles en seis regiones.",
      },
      { property: "og:title", content: "Voluntariado en DonAcción" },
      {
        property: "og:description",
        content: "Elige tu área y disponibilidad; te escribimos con el próximo turno cerca de ti.",
      },
    ],
  }),
  component: VolunteerPage,
});

const AREAS = [
  { icon: Warehouse, title: "Acopio y clasificación", text: "Recibir, revisar y ordenar donaciones en los puntos de acopio." },
  { icon: HeartHandshake, title: "Armado de kits", text: "Preparar paquetes de alimentos, higiene o útiles escolares." },
  { icon: Truck, title: "Reparto en campo", text: "Acompañar las entregas y el registro de actas en comunidad." },
  { icon: Clock, title: "Apoyo profesional", text: "Diseño, contabilidad, salud, educación o soporte legal pro bono." },
];

const AREA_OPTIONS = ["Acopio y clasificación", "Armado de kits", "Reparto en campo", "Apoyo profesional"];
const DAYS = ["Lunes a viernes (mañana)", "Lunes a viernes (tarde)", "Sábados", "Domingos", "Remoto"];

function VolunteerPage() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", city: "", message: "" });
  const [areas, setAreas] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("volunteers").insert({
        name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        skills: areas.join(", "),
        availability: availability.join(", "),
        message: form.message.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setDone(true);
      toast.success("¡Postulación recibida! Te escribiremos muy pronto.");
    },
    onError: () => toast.error("No pudimos enviar tu postulación. Inténtalo de nuevo."),
  });

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) {
      toast.error("Necesitamos tu nombre y correo.");
      return;
    }
    if (areas.length === 0) {
      toast.error("Elige al menos un área de interés.");
      return;
    }
    mutation.mutate();
  }

  return (
    <>
      <section className="ink-panel grain">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wide opacity-70">Voluntariado</p>
          <h1 className="animate-fade-up mt-3 max-w-3xl font-display text-4xl font-bold sm:text-5xl">
            Tu tiempo también es una donación
          </h1>
          <p className="animate-fade-up mt-4 max-w-2xl opacity-80 [animation-delay:120ms]">
            Somos 312 voluntarios en seis regiones. No necesitas experiencia previa: te capacitamos antes de tu primer
            turno y puedes empezar con cuatro horas al mes.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8">
        <div>
          <h2 className="font-display text-2xl font-bold">Áreas donde puedes sumar</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {AREAS.map((area, i) => (
              <Reveal key={area.title} delay={i * 80}>
                <div className="surface h-full p-5">
                  <span className="grid size-10 place-items-center rounded-xl bg-secondary text-accent">
                    <area.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold">{area.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{area.text}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="surface mt-8 p-6">
            <h3 className="font-display text-lg font-semibold">Requisitos</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Ser mayor de 18 años (16 con autorización de un adulto responsable).</li>
              <li>Documento de identidad vigente.</li>
              <li>Asistir a la inducción virtual de una hora.</li>
              <li>Compromiso mínimo de cuatro horas al mes.</li>
            </ul>
          </div>
        </div>

        <div className="surface h-fit p-6 lg:sticky lg:top-24">
          {done ? (
            <div className="py-10 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-secondary text-accent">
                <CheckCircle2 className="size-7" />
              </span>
              <h2 className="mt-5 font-display text-xl font-bold">Postulación enviada</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Revisaremos tu perfil y te escribiremos a {form.email} con la fecha de la próxima inducción.
              </p>
              <Button variant="outline" className="mt-6" onClick={() => setDone(false)}>
                Enviar otra postulación
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold">Quiero ser voluntario</h2>
                <p className="mt-1 text-sm text-muted-foreground">Toma menos de dos minutos.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="v-name">Nombre completo *</Label>
                  <Input
                    id="v-name"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    placeholder="María Quispe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="v-email">Correo *</Label>
                  <Input
                    id="v-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="maria@correo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="v-phone">Teléfono</Label>
                  <Input
                    id="v-phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="999 999 999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="v-city">Ciudad</Label>
                  <Input
                    id="v-city"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Lima"
                  />
                </div>
              </div>

              <fieldset className="space-y-3">
                <legend className="text-sm font-medium">Áreas de interés *</legend>
                {AREA_OPTIONS.map((option) => (
                  <label key={option} className="flex items-center gap-2.5 text-sm">
                    <Checkbox
                      checked={areas.includes(option)}
                      onCheckedChange={() => toggle(areas, setAreas, option)}
                    />
                    {option}
                  </label>
                ))}
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="text-sm font-medium">Disponibilidad</legend>
                {DAYS.map((option) => (
                  <label key={option} className="flex items-center gap-2.5 text-sm">
                    <Checkbox
                      checked={availability.includes(option)}
                      onCheckedChange={() => toggle(availability, setAvailability, option)}
                    />
                    {option}
                  </label>
                ))}
              </fieldset>

              <div className="space-y-2">
                <Label htmlFor="v-message">Cuéntanos algo más</Label>
                <Textarea
                  id="v-message"
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Experiencia previa, habilidades, motivación…"
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
                Enviar postulación
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
