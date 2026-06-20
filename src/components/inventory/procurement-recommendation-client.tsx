"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Cpu, TrendingUp, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Recommendation {
  productId: string;
  name: string;
  sku: string;
  onHand: number;
  reorderLevel: number;
  recommendedQty: number;
  reason: string;
  confidence: number;
}

export function ProcurementRecommendationClient({ initialData }: { initialData: Recommendation[] }) {
  const [recommendations, setRecommendations] = useState(initialData);
  const [processing, setProcessing] = useState<string | null>(null);
  const router = useRouter();

  const handleApprove = async (rec: Recommendation) => {
    setProcessing(rec.productId);
    try {
      // In a real app, this would hit an API to create a ProcurementQueue entry or PurchaseOrder
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate AI processing
      
      toast.success(`Approved auto-procurement for ${rec.recommendedQty} units of ${rec.name}`, {
        icon: <ShoppingCart className="h-4 w-4 text-emerald-500" />
      });
      
      setRecommendations(prev => prev.filter(r => r.productId !== rec.productId));
      router.refresh();
    } catch (e) {
      toast.error("Failed to approve recommendation");
    } finally {
      setProcessing(null);
    }
  };

  if (recommendations.length === 0) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-800">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/30 mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-semibold text-emerald-900 dark:text-emerald-300">Inventory Optimal</h3>
          <p className="mt-2 text-emerald-600 dark:text-emerald-400 max-w-md">
            The prediction engine hasn't detected any imminent shortages or optimal buying windows. You are fully stocked!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {recommendations.map((rec) => (
        <Card key={rec.productId} className="relative overflow-hidden group hover:shadow-lg transition-all border-indigo-100 dark:border-indigo-900/50">
          <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
            <Cpu className="h-24 w-24 text-indigo-500" />
          </div>
          
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300">
                {rec.confidence}% Confidence
              </Badge>
              {rec.onHand <= rec.reorderLevel && (
                <Badge variant="destructive" className="animate-pulse">Critical Shortage</Badge>
              )}
            </div>
            <CardTitle className="mt-4 text-xl">{rec.name}</CardTitle>
            <p className="text-sm text-gray-500">{rec.sku}</p>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-2 gap-4 my-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">On Hand</p>
                <p className={`text-lg font-bold ${rec.onHand <= rec.reorderLevel ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                  {rec.onHand}
                </p>
              </div>
              <div>
                <p className="text-xs text-indigo-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Suggested Order
                </p>
                <p className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
                  +{rec.recommendedQty}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6 bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-100 dark:border-blue-900/50">
              <AlertTriangle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <p><strong>Reason:</strong> {rec.reason}</p>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
              onClick={() => handleApprove(rec)}
              disabled={processing === rec.productId}
            >
              {processing === rec.productId ? "Processing..." : "Approve & Procure"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
