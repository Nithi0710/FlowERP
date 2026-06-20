"use client";

import { GenericMasterCrud } from "@/components/masters/generic-master-crud";
import { createUnitFromForm, updateUnitFromForm, deleteUnit } from "@/lib/actions/masters";

interface Item {
  id: string;
  name: string;
  symbol: string;
}

export function UnitsCrud({ items, canWrite }: { items: Item[]; canWrite: boolean }) {
  return (
    <GenericMasterCrud
      title="Units of Measure"
      description="Measurement units for products"
      items={items}
      canWrite={canWrite}
      fields={[
        { key: "name", label: "Unit Name", required: true },
        { key: "symbol", label: "Symbol (e.g. pcs, kg)", required: true },
      ]}
      columns={[
        { key: "name", header: "Name" },
        { key: "symbol", header: "Symbol" },
      ]}
      onCreate={createUnitFromForm}
      onUpdate={updateUnitFromForm}
      onDelete={deleteUnit}
    />
  );
}
