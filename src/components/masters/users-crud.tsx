"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { CrudActions, FormModal, PageHeader, FormField, selectClass } from "@/components/crud/crud-ui";
import { createUser, updateUser, deleteUser } from "@/lib/actions/masters";
import { ROLE_LABELS } from "@/lib/permissions";
import { Role } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  ADMIN: "Manages the ERP system, including users, roles, master data, permissions, and operational modules.",
  SALES_USER: "Manages customer orders and deliveries.",
  PURCHASE_USER: "Handles procurement and vendor purchases.",
  MANUFACTURING_USER: "Manages production activities such as BoMs and Manufacturing Orders.",
  INVENTORY_MANAGER: "Controls stock, warehouse operations, and inventory tracking.",
  BUSINESS_OWNER: "Focuses on monitoring business performance through dashboards, analytics, reports, Business Health Score, and the Executive War Room to make strategic decisions.",
};

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  isActive: boolean;
}

export function UsersCrud({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>("SALES_USER");

  const openModal = (user?: UserRow) => {
    setEditing(user || null);
    setSelectedRole(user?.role || "SALES_USER");
    setOpen(true);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name"));
    const email = String(fd.get("email"));
    const role = String(fd.get("role")) as Role;
    const password = String(fd.get("password") || "");
    const isActive = fd.get("isActive") === "on";

    try {
      if (editing) {
        await updateUser(editing.id, {
          name,
          email,
          role,
          isActive,
          ...(password ? { password } : {}),
        });
        toast.success("User updated");
      } else {
        if (!password) throw new Error("Password required for new users");
        await createUser({ name, email, password, role });
        toast.success("User created");
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & Roles"
        description="Manage user accounts and role-based access control"
        action={
          <Button onClick={() => openModal()} className="gap-2">
            <Plus className="h-4 w-4" /> Add User
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/80">
                {["Name", "Email", "Role", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant="default">{ROLE_LABELS[u.role]}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.isActive ? "success" : "destructive"}>
                      {u.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <CrudActions
                      onEdit={() => openModal(u)}
                      onDelete={() => deleteUser(u.id)}
                      deleteLabel={u.email}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <FormModal open={open} onClose={() => setOpen(false)} title={editing ? "Edit User" : "Add User"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name"><Input name="name" defaultValue={editing?.name ?? ""} required className="mt-1" /></FormField>
          <FormField label="Email"><Input name="email" type="email" defaultValue={editing?.email} required className="mt-1" /></FormField>
          <FormField label="Role">
            <div className="space-y-2">
              <select 
                name="role" 
                value={selectedRole} 
                onChange={(e) => setSelectedRole(e.target.value as Role)} 
                className={selectClass}
              >
                {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">{ROLE_DESCRIPTIONS[selectedRole]}</p>
            </div>
          </FormField>
          <FormField label={editing ? "New Password (leave blank to keep)" : "Password"}>
            <Input name="password" type="password" required={!editing} minLength={6} className="mt-1" />
          </FormField>
          {editing && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked={editing.isActive} />
              Active account
            </label>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
