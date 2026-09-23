import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export type CrudField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "switch" | "select" | "tags";
  options?: { value: string; label: string }[];
  placeholder?: string;
  help?: string;
  required?: boolean;
  span?: boolean;
  readOnlyOnEdit?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export function AdminCrud({
  table,
  title,
  description,
  fields,
  select = "*",
  orderBy = "created_at",
  ascending = true,
  defaults,
  primary,
  secondary,
  addLabel = "Añadir",
}: {
  table: string;
  title: string;
  description: string;
  fields: CrudField[];
  select?: string;
  orderBy?: string;
  ascending?: boolean;
  defaults: Row;
  primary: (row: Row) => string;
  secondary: (row: Row) => string;
  addLabel?: string;
}) {
  const qc = useQueryClient();
  const queryKey = ["admin-crud", table];
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Row>(defaults);
  const [toDelete, setToDelete] = useState<Row | null>(null);

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await (supabase.from(table as never) as any)
        .select(select)
        .order(orderBy, { ascending });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const save = useMutation({
    mutationFn: async (values: Row) => {
      const payload: Row = {};
      for (const f of fields) {
        let v = values[f.name];
        if (f.type === "number") v = Number(v) || 0;
        if (f.type === "tags")
          v = String(v ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        if ((f.type === "date" || f.type === "select") && v === "") v = null;
        payload[f.name] = v;
      }
      if (editing) {
        const { error } = await (supabase.from(table as never) as any)
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from(table as never) as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Cambios guardados" : "Registro creado");
      setOpen(false);
      setEditing(null);
      qc.invalidateQueries();
    },
    onError: (e: any) => toast.error(e?.message ?? "No se pudo guardar"),
  });

  const remove = useMutation({
    mutationFn: async (row: Row) => {
      const { error } = await (supabase.from(table as never) as any).delete().eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Registro eliminado");
      setToDelete(null);
      qc.invalidateQueries();
    },
    onError: (e: any) => toast.error(e?.message ?? "No se pudo eliminar"),
  });

  const rows = useMemo(() => data ?? [], [data]);

  function startCreate() {
    setEditing(null);
    setForm(defaults);
    setOpen(true);
  }

  function startEdit(row: Row) {
    const next: Row = { ...defaults };
    for (const f of fields) {
      const v = row[f.name];
      next[f.name] = Array.isArray(v) ? v.join(", ") : (v ?? defaults[f.name] ?? "");
    }
    setEditing(row);
    setForm(next);
    setOpen(true);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button onClick={startCreate} className="gap-2">
          <Plus className="size-4" /> {addLabel}
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-56 rounded-2xl" />
      ) : rows.length === 0 ? (
        <p className="surface p-8 text-center text-sm text-muted-foreground">
          Todavía no hay registros. Usa “{addLabel}” para crear el primero.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.id} className="surface flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-semibold">{primary(row)}</p>
                <p className="truncate text-sm text-muted-foreground">{secondary(row)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="gap-1.5" onClick={() => startEdit(row)}>
                  <Pencil className="size-3.5" /> Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-destructive hover:text-destructive"
                  onClick={() => setToDelete(row)}
                >
                  <Trash2 className="size-3.5" /> Borrar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Editar registro" : addLabel}
            </DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate(form);
            }}
          >
            {fields.map((f) => (
              <div key={f.name} className={f.span || f.type === "textarea" ? "sm:col-span-2" : ""}>
                <Label htmlFor={f.name} className="text-sm">
                  {f.label}
                </Label>
                <div className="mt-1.5">
                  {f.type === "textarea" ? (
                    <Textarea
                      id={f.name}
                      rows={4}
                      required={f.required}
                      value={form[f.name] ?? ""}
                      placeholder={f.placeholder}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    />
                  ) : f.type === "switch" ? (
                    <div className="flex h-10 items-center">
                      <Switch
                        id={f.name}
                        checked={Boolean(form[f.name])}
                        onCheckedChange={(v) => setForm({ ...form, [f.name]: v })}
                      />
                    </div>
                  ) : f.type === "select" ? (
                    <Select
                      value={String(form[f.name] ?? "")}
                      onValueChange={(v) => setForm({ ...form, [f.name]: v })}
                    >
                      <SelectTrigger id={f.name}>
                        <SelectValue placeholder="Selecciona una opción" />
                      </SelectTrigger>
                      <SelectContent>
                        {(f.options ?? []).map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={f.name}
                      type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                      required={f.required}
                      disabled={Boolean(editing && f.readOnlyOnEdit)}
                      value={form[f.name] ?? ""}
                      placeholder={f.placeholder}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    />
                  )}
                </div>
                {f.help && <p className="mt-1 text-xs text-muted-foreground">{f.help}</p>}
              </div>
            ))}

            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Guardando…" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">¿Eliminar este registro?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete ? primary(toDelete) : ""} se eliminará de la página. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => toDelete && remove.mutate(toDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
