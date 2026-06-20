import { getSessionCompany } from "@/lib/actions/auth-actions";
import { requireAdmin } from "@/lib/rbac";
import { CompanySettingsForm } from "@/components/settings/company-settings-form";
import { Card, CardContent } from "@/components/ui/card";

export default async function SettingsPage() {
  await requireAdmin();
  const company = await getSessionCompany();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500">Company profile, domain, and system configuration</p>
      </div>

      {company ? (
        <CompanySettingsForm company={company} />
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            <p>No company profile linked to this account.</p>
            <p className="mt-2 text-sm">Register a new organization at <a href="/signup" className="text-indigo-600 hover:underline">/signup</a></p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="py-6">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">System</p>
          <p className="mt-1 text-sm text-slate-500">FlowERP v1.0 · Next.js 14 · PostgreSQL · Prisma ORM</p>
        </CardContent>
      </Card>
    </div>
  );
}
