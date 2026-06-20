"use client";

import { GenericMasterCrud } from "@/components/masters/generic-master-crud";
import {
  createCategoryFromForm,
  updateCategoryFromForm,
  deleteCategory,
} from "@/lib/actions/masters";

interface Item {
  id: string;
  name: string;
  description: string | null;
}

export function CategoriesCrud({ items, canWrite }: { items: Item[]; canWrite: boolean }) {
  return (
    <GenericMasterCrud
      title="Categories"
      description="Product categories master data"
      items={items}
      canWrite={canWrite}
      fields={[
        { key: "name", label: "Category Name", required: true },
        { key: "description", label: "Description", type: "textarea", required: false },
      ]}
      columns={[
        { key: "name", header: "Name" },
        { key: "description", header: "Description" },
      ]}
      onCreate={createCategoryFromForm}
      onUpdate={updateCategoryFromForm}
      onDelete={deleteCategory}
    />
  );
}
