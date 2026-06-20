import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BomCrud } from "@/components/manufacturing/bom-crud";

export default async function BOMPage() {
  const boms = await prisma.billOfMaterial.findMany({
    include: {
      product: true,
      components: { include: { product: true } },
      operations: { include: { workCenter: true }, orderBy: { sequence: "asc" } },
    },
  });
  const products = await prisma.product.findMany();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bill of Materials</h1>
          <p className="text-sm text-gray-500">Product composition and manufacturing operations</p>
        </div>
        <BomCrud products={products} />
      </div>

      {boms.map((bom) => (
        <Card key={bom.id}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{bom.product.name}</h3>
                <p className="text-sm text-gray-500">{bom.name}</p>
              </div>
              <Badge>{bom.components.length} components</Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Components</h4>
                <div className="space-y-2">
                  {bom.components.map((comp) => (
                    <div
                      key={comp.id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800"
                    >
                      <span className="text-sm">{comp.product.name}</span>
                      <span className="text-sm font-medium text-indigo-600">
                        × {comp.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Operations</h4>
                <div className="space-y-2">
                  {bom.operations.map((op, i) => (
                    <div
                      key={op.id}
                      className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{op.name}</p>
                        <p className="text-xs text-gray-400">
                          {op.workCenter?.name || "No work center"} — {op.duration}min
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {boms.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No bills of materials defined yet. Seed the database to see sample BOMs.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
