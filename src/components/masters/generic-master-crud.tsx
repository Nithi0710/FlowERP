"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { CrudActions, FormModal, PageHeader, FormField, selectClass } from "@/components/crud/crud-ui";

type FieldType = "text" | "email" | "number" | "textarea" | "select";

export interface FieldDef {
  key: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

interface GenericMasterCrudProps<T extends { id: string }> {
  title: string;
  description: string;
  items: T[];
  fields: FieldDef[];
  columns: { key: string; header: string; render?: (item: T) => React.ReactNode }[];
  onCreate: (data: Record<string, string>) => Promise<unknown>;
  onUpdate: (id: string, data: Record<string, string>) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
  canWrite?: boolean;
}

export function GenericMasterCrud<T extends { id: string }>({
  title,
  description,
  items,
  fields,
  columns,
  onCreate,
  onUpdate,
  onDelete,
  canWrite = true,
}: GenericMasterCrudProps<T>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(item: T) {
    setEditing(item);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    fields.forEach((f) => {
      data[f.key] = String(form.get(f.key) || "");
    });

    try {
      if (editing) {
        await onUpdate(editing.id, data);
        toast.success("Updated successfully");
      } else {
        await onCreate(data);
        toast.success("Created successfully");
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        action={
          canWrite ? (
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Add New
            </Button>
          ) : undefined
        }
      />

      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80 dark:border-gray-800">
                {columns.map((c) => (
                  <th key={c.key} className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    {c.header}
                  </th>
                ))}
                {canWrite && <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-12 text-center text-gray-400">
                    No records yet. {canWrite && "Click Add New to create one."}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="bg-white dark:bg-gray-950">
                    {columns.map((c) => (
                      <td key={c.key} className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {c.render ? c.render(item) : String((item as Record<string, unknown>)[c.key] ?? "-")}
                      </td>
                    ))}
                    {canWrite && (
                      <td className="px-4 py-3">
                        <CrudActions
                          onEdit={() => openEdit(item)}
                          onDelete={() => onDelete(item.id) as Promise<{ success?: boolean }>}
                          deleteLabel={title.slice(0, -1).toLowerCase()}
                        />
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <FormModal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((f) => (
            <FormField key={f.key} label={f.label}>
              {f.type === "textarea" ? (
                <textarea
                  name={f.key}
                  defaultValue={editing ? String((editing as Record<string, unknown>)[f.key] ?? "") : ""}
                  required={f.required}
                  placeholder={f.placeholder}
                  className={selectClass + " min-h-[80px] py-2"}
                />
              ) : f.type === "select" ? (
                <select
                  name={f.key}
                  defaultValue={editing ? String((editing as Record<string, unknown>)[f.key] ?? "") : ""}
                  required={f.required}
                  className={selectClass + " mt-1"}
                >
                  <option value="">— None —</option>
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  name={f.key}
                  type={f.type || "text"}
                  defaultValue={editing ? String((editing as Record<string, unknown>)[f.key] ?? "") : ""}
                  required={f.required ?? true}
                  placeholder={f.placeholder}
                  className="mt-1"
                />
              )}
            </FormField>
          ))}
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
