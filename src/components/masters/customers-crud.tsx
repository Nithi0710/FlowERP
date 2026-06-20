"use client";

import { GenericMasterCrud } from "@/components/masters/generic-master-crud";
import {
  createCustomerFromForm,
  updateCustomerFromForm,
  deleteCustomer,
} from "@/lib/actions/masters";

interface Item {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export function CustomersCrud({ items, canWrite }: { items: Item[]; canWrite: boolean }) {
  return (
    <GenericMasterCrud
      title="Customers"
      description="Customer master data for sales orders"
      items={items}
      canWrite={canWrite}
      fields={[
        { key: "name", label: "Customer Name", required: true },
        { key: "email", label: "Email", type: "email", required: false },
        { key: "phone", label: "Phone", required: false },
        { key: "address", label: "Address", type: "textarea", required: false },
      ]}
      columns={[
        { key: "name", header: "Name" },
        { key: "email", header: "Email" },
        { key: "phone", header: "Phone" },
        { key: "address", header: "Address" },
      ]}
      onCreate={createCustomerFromForm}
      onUpdate={updateCustomerFromForm}
      onDelete={deleteCustomer}
    />
  );
}
