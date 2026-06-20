"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  footer?: React.ReactNode;
}

export function AuthShell({ children, title, subtitle, footer }: AuthShellProps) {
  return (
    <div className="auth-page flex min-h-screen">
      <div className="auth-hero hidden lg:flex lg:w-[45%] xl:w-1/2">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex max-w-lg flex-col justify-center p-12 text-white"
        >
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold backdrop-blur-sm">
            FE
          </div>
          <h1 className="text-4xl font-bold leading-tight">FlowERP</h1>
          <p className="mt-3 text-lg text-indigo-100">
            Smart Manufacturing ERP & Business Control Tower
          </p>
          <p className="mt-6 text-sm leading-relaxed text-indigo-200/90">
            Complete demand-to-delivery lifecycle — inventory, sales, purchase,
            manufacturing, analytics, and role-based access in one platform.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-indigo-100">
            {[
              "Multi-company onboarding with domain profiles",
              "Full CRUD on products, orders & masters",
              "RBAC with 6 enterprise roles",
              "Real-time inventory & procurement engine",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
        <div className="auth-hero-pattern absolute inset-0 opacity-30" />
      </div>

      <div className="flex flex-1 items-center justify-center bg-slate-50 p-6 dark:bg-slate-950 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full max-w-xl"
        >
          <div className="mb-6 lg:hidden">
            <h1 className="text-2xl font-bold gradient-text">FlowERP</h1>
            <p className="text-sm text-slate-500">Enterprise Manufacturing ERP</p>
          </div>

          <div className="auth-card rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            <div className="mt-6">{children}</div>
            {footer && <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">{footer}</div>}
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} FlowERP · Secure cloud ERP platform
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export function AuthFooterLink({ href, label, linkText }: { href: string; label: string; linkText: string }) {
  return (
    <p className="text-center text-sm text-slate-500">
      {label}{" "}
      <Link href={href} className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400">
        {linkText}
      </Link>
    </p>
  );
}

export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="border-b border-slate-100 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

export function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export const selectClass =
  "flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";
