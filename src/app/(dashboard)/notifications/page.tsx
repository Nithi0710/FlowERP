import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { BellRing, CheckCircle2, AlertTriangle, Mail } from "lucide-react";


function NotificationIcon({ type }: { type: string }) {
  if (type === "warning") return <AlertTriangle className="h-5 w-5" />;
  if (type === "success") return <CheckCircle2 className="h-5 w-5" />;
  if (type === "alert") return <BellRing className="h-5 w-5" />;
  return <Mail className="h-5 w-5" />;
}

export default async function NotificationsPage() {
  const user = await requireAuth();

  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Review recent system alerts, approvals, and updates for your company.
        </p>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500 dark:text-slate-400">
            <p>No notifications at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {notifications.map((notification) => (
            <Card key={notification.id} className="overflow-hidden">
              <CardContent className="flex items-start gap-4">
                <div className={`mt-1 flex h-10 w-10 items-center justify-center rounded-xl ${
                  notification.type === "warning"
                    ? "bg-amber-100 text-amber-700"
                    : notification.type === "success"
                    ? "bg-emerald-100 text-emerald-700"
                    : notification.type === "alert"
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-slate-100 text-slate-700"
                }`}>
                  <NotificationIcon type={notification.type} />
                </div>
                <div>
                  <CardTitle className="text-base">{notification.title}</CardTitle>
                  <CardDescription>{notification.message}</CardDescription>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
