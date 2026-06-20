"use client";

import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  LogOut,
  User,
  Command,
} from "lucide-react";
import { useState, useEffect } from "react";
import { CommandPalette } from "./command-palette";

import { ROLE_LABELS } from "@/lib/permissions";

interface TopNavProps {
  userName?: string | null;
  userEmail?: string | null;
  userRole?: string;
}

export function TopNav({ userName, userEmail, userRole }: TopNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [showCommand, setShowCommand] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCommand(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    async function loadUnread() {
      try {
        const response = await fetch("/api/notifications/unread");
        if (!response.ok) return;
        const data = await response.json();
        setUnreadCount(data.count ?? 0);
      } catch {
        setUnreadCount(0);
      }
    }
    loadUnread();
  }, [pathname]);

  const displayName = userName || session?.user?.name || "User";
  const displayEmail = userEmail || session?.user?.email || "";
  const displayRole =
    (userRole && ROLE_LABELS[userRole as keyof typeof ROLE_LABELS]) ||
    (session?.user as { role?: string })?.role?.replace("_", " ") ||
    "Admin";

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white/80 px-6 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search orders, products, customers..."
            className="pl-10 pr-20"
            onFocus={() => setShowCommand(true)}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-400 dark:border-gray-700 dark:bg-gray-800">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex gap-2"
            onClick={() => setShowCommand(true)}
          >
            <Plus className="h-4 w-4" />
            Quick Actions
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => router.push("/notifications")}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && pathname !== "/notifications" && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {unreadCount}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-medium text-white">
                {displayName[0] || "U"}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-gray-500">{displayRole}</p>
              </div>
            </button>

            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                {displayEmail && (
                  <p className="border-b border-gray-100 px-4 py-2 text-xs text-gray-500 dark:border-gray-800">{displayEmail}</p>
                )}
                <button
                  onClick={() => {
                    setShowProfile(false);
                    router.push("/profile");
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button
                  onClick={() =>
                    signOut({ callbackUrl: `${window.location.origin}/login` })
                  }
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <CommandPalette open={showCommand} onOpenChange={setShowCommand} />
    </>
  );
}
