"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { registerUser } from "@/lib/actions/auth-actions";
import {
  AuthShell,
  AuthFooterLink,
  FormSection,
  FormRow,
  FormField,
  selectClass,
} from "@/components/auth/auth-shell";

const INDUSTRIES = [
  "Furniture Manufacturing",
  "General Manufacturing",
  "Retail & Distribution",
  "Construction",
  "Automotive",
  "Electronics",
  "Food & Beverage",
  "Other",
];

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [companyData, setCompanyData] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (step === 1) {
      setCompanyData({
        companyName: String(fd.get("companyName")),
        domain: String(fd.get("domain")),
        industry: String(fd.get("industry") || ""),
        address: String(fd.get("address") || ""),
        city: String(fd.get("city") || ""),
        state: String(fd.get("state") || ""),
        country: String(fd.get("country") || "India"),
        postalCode: String(fd.get("postalCode") || ""),
        companyPhone: String(fd.get("companyPhone") || ""),
        website: String(fd.get("website") || ""),
        taxId: String(fd.get("taxId") || ""),
      });
      setStep(2);
      return;
    }

    setLoading(true);
    const password = String(fd.get("password"));
    const confirm = String(fd.get("confirm"));

    if (password !== confirm) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const result = await registerUser({
        name: String(fd.get("name")),
        email: String(fd.get("email")),
        password,
        phone: String(fd.get("phone") || ""),
        jobTitle: String(fd.get("jobTitle") || ""),
        companyName: companyData.companyName,
        domain: companyData.domain,
        industry: companyData.industry,
        address: companyData.address,
        city: companyData.city,
        state: companyData.state,
        country: companyData.country,
        postalCode: companyData.postalCode,
        companyPhone: companyData.companyPhone,
        website: companyData.website,
        taxId: companyData.taxId,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      const signInResult = await signIn("credentials", {
        email: String(fd.get("email")),
        password,
        redirect: false,
      });

      if (!signInResult?.ok || signInResult?.error) {
        toast.success("Company registered! Please sign in.");
        router.push("/login");
      } else {
        toast.success("Welcome to FlowERP!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Unable to create your company. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={step === 1 ? "Register your company" : "Your account details"}
      subtitle={
        step === 1
          ? "Set up your organization profile and business domain"
          : "Create your admin account to manage the ERP"
      }
      footer={
        <AuthFooterLink href="/login" label="Already have an account?" linkText="Sign in" />
      }
    >
      <div className="mb-4 flex gap-2">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= step ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 ? (
          <FormSection title="Company Information">
            <FormField label="Company Name" required>
              <Input name="companyName" placeholder="Example Enterprises" required className="mt-0" />
            </FormField>
            <FormRow>
              <FormField label="Business Domain" required>
                <Input name="domain" placeholder="example.com" required className="mt-0" />
              </FormField>
              <FormField label="Industry">
                <select name="industry" className={selectClass} defaultValue="Furniture Manufacturing">
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </FormField>
            </FormRow>
            <FormField label="Registered Address">
              <Input name="address" placeholder="Street address" className="mt-0" />
            </FormField>
            <FormRow>
              <FormField label="City">
                <Input name="city" placeholder="Coimbatore" className="mt-0" />
              </FormField>
              <FormField label="State">
                <Input name="state" placeholder="Tamil Nadu" className="mt-0" />
              </FormField>
            </FormRow>
            <FormRow>
              <FormField label="Country">
                <Input name="country" defaultValue="India" className="mt-0" />
              </FormField>
              <FormField label="Postal Code">
                <Input name="postalCode" placeholder="641001" className="mt-0" />
              </FormField>
            </FormRow>
            <FormRow>
              <FormField label="Company Phone">
                <Input name="companyPhone" type="tel" placeholder="+91 98765 43210" className="mt-0" />
              </FormField>
              <FormField label="Website">
                <Input name="website" placeholder="https://example.com" className="mt-0" />
              </FormField>
            </FormRow>
            <FormField label="Tax ID / GSTIN">
              <Input name="taxId" placeholder="33AAAAA0000A1Z5" className="mt-0" />
            </FormField>
          </FormSection>
        ) : (
          <FormSection title="Admin Account">
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              Registering: <strong>{companyData.companyName}</strong>
              {companyData.domain && <> · {companyData.domain}</>}
            </p>
            <FormField label="Full Name" required>
              <Input name="name" placeholder="John Doe" required className="mt-0" />
            </FormField>
            <FormRow>
              <FormField label="Work Email" required>
                <Input name="email" type="email" placeholder="admin@example.com" required className="mt-0" />
              </FormField>
              <FormField label="Phone">
                <Input name="phone" type="tel" placeholder="+91 98765 43210" className="mt-0" />
              </FormField>
            </FormRow>
            <FormField label="Job Title">
              <Input name="jobTitle" placeholder="Managing Director" className="mt-0" />
            </FormField>
            <FormRow>
              <FormField label="Password" required>
                <Input name="password" type="password" required minLength={6} className="mt-0" />
              </FormField>
              <FormField label="Confirm Password" required>
                <Input name="confirm" type="password" required minLength={6} className="mt-0" />
              </FormField>
            </FormRow>
            <p className="rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
              You will be assigned as <strong>Administrator</strong> with full access to all ERP modules.
            </p>
          </FormSection>
        )}

        <div className="flex gap-3">
          {step === 2 && (
            <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
              Back
            </Button>
          )}
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? "Creating..." : step === 1 ? "Continue" : "Create Company & Sign In"}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
