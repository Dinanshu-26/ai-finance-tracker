"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "🏠" },
  { href: "/dashboard/add", label: "Add Expense", icon: "➕" },
  { href: "/dashboard/expenses", label: "All Expenses", icon: "📋" },
  { href: "/dashboard/insights", label: "AI Insights", icon: "🤖" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/40 bg-[oklch(0.12_0.015_265)] shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-border/40">
          <span className="text-2xl">💰</span>
          <span className="font-bold text-lg tracking-tight">FinanceAI</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Separator className="bg-border/40" />

        {/* User area */}
        <div className="p-4 flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
              U
            </AvatarFallback>
          </Avatar>
          <span className="flex-1 text-xs text-muted-foreground truncate">
            Your Account
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-xs text-muted-foreground hover:text-destructive px-2"
            title="Sign Out"
          >
            ↩
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-[oklch(0.12_0.015_265)] border-b border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xl">💰</span>
          <span className="font-bold tracking-tight">FinanceAI</span>
        </div>
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "p-2 rounded-lg text-sm transition-all",
                pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title={item.label}
            >
              {item.icon}
            </Link>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-xs text-muted-foreground hover:text-destructive ml-1"
          >
            ↩
          </Button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto md:pt-0 pt-14">
        <div className="max-w-6xl mx-auto p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
