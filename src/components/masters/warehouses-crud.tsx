"use client";

import { GenericMasterCrud } from "@/components/masters/generic-master-crud";
import {
  createWarehouseFromForm,
  updateWarehouseFromForm,
  deleteWarehouse,
} from "@/lib/actions/masters";

interface Item {
  id: string;
  name: string;
  location: string | null;
}

export function WarehousesCrud({ items, canWrite }: { items: Item[]; canWrite: boolean }) {
  return (
    <GenericMasterCrud
      title="Warehouses"
      description="Warehouse and storage locations"
      items={items}
      canWrite={canWrite}
      fields={[
        { key: "name", label: "Warehouse Name", required: true },
        { key: "location", label: "Location", required: false },
      ]}
      columns={[
        { key: "name", header: "Name" },
        { key: "location", header: "Location" },
      ]}
      onCreate={createWarehouseFromForm}
      onUpdate={updateWarehouseFromForm}
      onDelete={deleteWarehouse}
    />
  );
}
