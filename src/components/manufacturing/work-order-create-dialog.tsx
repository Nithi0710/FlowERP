"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ManufacturingOrderForm } from "@/components/forms/manufacturing-order-form";

interface WorkOrderCreateDialogProps {
  products: any[];
  userId?: string;
}

export function WorkOrderCreateDialog({ products, userId }: WorkOrderCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSuccess() {
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Create Work Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>New Work Order</DialogTitle>
          <DialogDescription>
            Create a production order for a finished product and reserve the required components.
          </DialogDescription>
        </DialogHeader>
        <ManufacturingOrderForm 
          products={products} 
          userId={userId} 
          isDialog={true} 
          onSuccess={handleSuccess} 
        />
      </DialogContent>
    </Dialog>
  );
}
