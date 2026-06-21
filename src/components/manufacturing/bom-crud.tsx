"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function BomCrud({ products }: { products: any[] }) {
  const router = useRouter();

  return (
    <Button onClick={() => router.push("/manufacturing/bom/new")} className="gap-2">
      <Plus className="h-4 w-4" /> Create BOM
    </Button>
  );
}
