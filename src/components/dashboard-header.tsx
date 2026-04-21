"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProModal } from "./pro-modal";

interface DashboardHeaderProps {
  hasReachedLimit: boolean;
  recentCount: number;
  isPro: boolean;
  freeLimit: number;
}

export function DashboardHeader({ hasReachedLimit, recentCount, isPro, freeLimit }: DashboardHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here&apos;s your financial summary.
        </p>
      </div>
      <div className="flex items-center gap-2">
        {/* Usage Indicator */}
        <div className={`h-11 px-4 rounded-xl border flex items-center gap-2 text-sm font-medium transition-all ${
          isPro 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : hasReachedLimit 
              ? "bg-destructive/10 border-destructive/20 text-destructive animate-pulse" 
              : "bg-secondary/50 border-border/40 text-muted-foreground"
        }`}>
          {isPro ? (
            <span className="flex items-center gap-1.5">💎 Pro</span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span className="text-xs uppercase tracking-wider opacity-60">Usage:</span>
              <span className={hasReachedLimit ? "text-destructive font-bold" : "text-foreground"}>
                {recentCount}/{freeLimit}
              </span>
            </span>
          )}
        </div>

        {hasReachedLimit ? (
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30 h-11 px-6 font-semibold"
          >
            ⭐ Upgrade
          </Button>
        ) : (
          <Link href="/dashboard/add">
            <Button className="gradient-primary text-white hover:opacity-90 transition-all hover:scale-105 h-11 px-6 shadow-lg shadow-indigo-500/20">
              ➕ Add Expense
            </Button>
          </Link>
        )}
      </div>

      <ProModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
