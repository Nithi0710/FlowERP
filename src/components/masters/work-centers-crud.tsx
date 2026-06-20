"use client";

import { GenericMasterCrud } from "@/components/masters/generic-master-crud";
import {
  createWorkCenterFromForm,
  updateWorkCenterFromForm,
  deleteWorkCenter,
} from "@/lib/actions/masters";

interface Item {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
}

export function WorkCentersCrud({ items, canWrite }: { items: Item[]; canWrite: boolean }) {
  return (
    <GenericMasterCrud
      title="Work Centers"
      description="Manufacturing work centers and capacity"
      items={items}
      canWrite={canWrite}
      fields={[
        { key: "name", label: "Name", required: true },
        { key: "description", label: "Description", required: false },
        { key: "capacity", label: "Capacity", type: "number", required: false },
      ]}
      columns={[
        { key: "name", header: "Name" },
        { key: "description", header: "Description" },
        { key: "capacity", header: "Capacity" },
      ]}
      onCreate={createWorkCenterFromForm}
      onUpdate={updateWorkCenterFromForm}
      onDelete={deleteWorkCenter}
    />
  );
}
