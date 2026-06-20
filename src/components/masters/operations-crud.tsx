"use client";

import { GenericMasterCrud } from "@/components/masters/generic-master-crud";
import {
  createOperationFromForm,
  updateOperationFromForm,
  deleteOperation,
} from "@/lib/actions/masters";

interface Item {
  id: string;
  name: string;
  description: string | null;
  sequence: number;
  duration: number;
  workCenterId: string | null;
  workCenter?: { name: string } | null;
}

export function OperationsCrud({
  items,
  workCenters,
  canWrite,
}: {
  items: Item[];
  workCenters: { id: string; name: string }[];
  canWrite: boolean;
}) {
  const wcOptions = workCenters.map((w) => ({ value: w.id, label: w.name }));

  return (
    <GenericMasterCrud
      title="Operations"
      description="Manufacturing routing operations and work steps"
      items={items}
      canWrite={canWrite}
      fields={[
        { key: "name", label: "Operation Name", required: true },
        { key: "description", label: "Description", type: "textarea", required: false },
        { key: "sequence", label: "Sequence", type: "number", required: false },
        { key: "duration", label: "Duration (minutes)", type: "number", required: false },
        {
          key: "workCenterId",
          label: "Work Center",
          type: "select",
          required: false,
          options: wcOptions,
        },
      ]}
      columns={[
        { key: "name", header: "Name" },
        { key: "sequence", header: "Seq" },
        { key: "duration", header: "Duration (min)" },
        {
          key: "workCenterId",
          header: "Work Center",
          render: (item) => item.workCenter?.name ?? "—",
        },
        { key: "description", header: "Description" },
      ]}
      onCreate={createOperationFromForm}
      onUpdate={updateOperationFromForm}
      onDelete={deleteOperation}
    />
  );
}
