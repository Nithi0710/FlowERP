import { requireAuth } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, User, ShieldCheck } from "lucide-react";

export default async function ProfilePage() {
  const user = await requireAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your account details and company membership.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <User className="h-5 w-5" />
              <CardTitle>Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Name</p>
              <p className="font-medium text-slate-900 dark:text-white">{user.name || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</p>
              <p className="font-medium text-slate-900 dark:text-white">{user.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Role</p>
              <p className="font-medium text-slate-900 dark:text-white">{user.role || "User"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Building2 className="h-5 w-5" />
              <CardTitle>Company</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Company</p>
              <p className="font-medium text-slate-900 dark:text-white">{user.companyName || "No company assigned"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">User ID</p>
              <p className="font-medium text-slate-900 dark:text-white break-all">{user.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <ShieldCheck className="h-5 w-5" />
            <CardTitle>Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Signed in as</p>
            <p className="font-medium text-slate-900 dark:text-white">{user.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Next step</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage your company settings in the <a href="/settings" className="text-indigo-600 hover:underline">Settings</a> page.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
