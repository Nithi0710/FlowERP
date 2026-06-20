import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 text-center">
      <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30 mb-6">
        <ShieldAlert className="h-12 w-12 text-red-600 dark:text-red-400" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
        Access Denied
      </h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
        You do not have the required permissions to access this module. Please contact your system administrator if you believe this is a mistake.
      </p>
      <Link href="/">
        <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
          Return to My Workspace
        </Button>
      </Link>
    </div>
  );
}
