"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { updateCompany } from "@/lib/actions/auth-actions";
import { FormField, FormRow } from "@/components/auth/auth-shell";
import { Building2, Globe, MapPin, FileText } from "lucide-react";

interface Company {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  taxId: string | null;
}

export function CompanySettingsForm({ company }: { company: Company }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await updateCompany({
        name: String(fd.get("name")),
        domain: String(fd.get("domain") || ""),
        industry: String(fd.get("industry") || ""),
        address: String(fd.get("address") || ""),
        city: String(fd.get("city") || ""),
        state: String(fd.get("state") || ""),
        country: String(fd.get("country") || ""),
        postalCode: String(fd.get("postalCode") || ""),
        phone: String(fd.get("phone") || ""),
        email: String(fd.get("email") || ""),
        website: String(fd.get("website") || ""),
        taxId: String(fd.get("taxId") || ""),
      });
      toast.success("Company profile updated");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Building2, label: "Company", value: company.name },
          { icon: Globe, label: "Domain", value: company.domain || "—" },
          { icon: MapPin, label: "Location", value: [company.city, company.state].filter(Boolean).join(", ") || "—" },
          { icon: FileText, label: "Tax ID", value: company.taxId || "—" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <Icon className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-sm font-medium truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <FormField label="Company Name" required>
            <Input name="name" defaultValue={company.name} required className="mt-0" />
          </FormField>
          <FormRow>
            <FormField label="Business Domain">
              <Input name="domain" defaultValue={company.domain ?? ""} placeholder="company.com" className="mt-0" />
            </FormField>
            <FormField label="Industry">
              <Input name="industry" defaultValue={company.industry ?? ""} className="mt-0" />
            </FormField>
          </FormRow>
          <FormField label="Address">
            <Input name="address" defaultValue={company.address ?? ""} className="mt-0" />
          </FormField>
          <FormRow>
            <FormField label="City"><Input name="city" defaultValue={company.city ?? ""} className="mt-0" /></FormField>
            <FormField label="State"><Input name="state" defaultValue={company.state ?? ""} className="mt-0" /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Country"><Input name="country" defaultValue={company.country} className="mt-0" /></FormField>
            <FormField label="Postal Code"><Input name="postalCode" defaultValue={company.postalCode ?? ""} className="mt-0" /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Phone"><Input name="phone" defaultValue={company.phone ?? ""} className="mt-0" /></FormField>
            <FormField label="Email"><Input name="email" type="email" defaultValue={company.email ?? ""} className="mt-0" /></FormField>
          </FormRow>
          <FormRow>
            <FormField label="Website"><Input name="website" defaultValue={company.website ?? ""} className="mt-0" /></FormField>
            <FormField label="Tax ID / GSTIN"><Input name="taxId" defaultValue={company.taxId ?? ""} className="mt-0" /></FormField>
          </FormRow>
          <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Company Profile"}</Button>
        </CardContent>
      </Card>
    </form>
  );
}
