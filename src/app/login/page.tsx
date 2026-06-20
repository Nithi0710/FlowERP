"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertTriangle, Database } from "lucide-react";
import { AuthShell, AuthFooterLink, FormField } from "@/components/auth/auth-shell";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    seeded: boolean;
    message?: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => {
        setDbStatus({
          connected: data.database === "connected",
          seeded: data.seeded === true,
          message: data.message,
        });
      })
      .catch(() => setDbStatus({ connected: false, seeded: false }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (dbStatus && !dbStatus.connected) {
      toast.error("Database not connected. Run npm run db:setup first.");
      return;
    }

    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      toast.error(dbStatus && !dbStatus.seeded ? "Database not seeded. Run: npm run db:setup" : "Invalid credentials");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your company ERP workspace"
      footer={
        <div className="space-y-4">
          <AuthFooterLink href="/signup" label="New company?" linkText="Register your organization" />
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
            <p className="text-xs font-medium text-slate-500">Demo Credentials</p>
            <p className="mt-1 text-xs text-slate-400">admin@shivfurniture.com / admin123</p>
          </div>
        </div>
      }
    >
      {dbStatus && !dbStatus.connected && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Database not connected</p>
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                Add <code className="rounded bg-amber-100 px-1">DATABASE_URL</code> to <code className="rounded bg-amber-100 px-1">.env</code>, then run{" "}
                <code className="rounded bg-amber-100 px-1">npm run db:setup</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {dbStatus?.connected && !dbStatus.seeded && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex gap-2">
            <Database className="h-5 w-5 shrink-0 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Database connected — seed required</p>
              <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                Run: <code className="rounded bg-blue-100 px-1">npm run db:setup</code>
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Work Email" required>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            className="mt-0"
          />
        </FormField>
        <FormField label="Password" required>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-0"
          />
        </FormField>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In to ERP"}
        </Button>
      </form>
    </AuthShell>
  );
}
