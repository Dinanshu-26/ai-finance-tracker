"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ALL_CATEGORIES } from "@/lib/ai/categorize";
import { getExchangeRates } from "@/lib/currency";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface Expense {
  id: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  date: string;
  created_at: string;
}

const categoryColors: Record<string, string> = {
  "Food & Dining": "bg-orange-500/15 text-orange-400 border-orange-500/20",
  Transport: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  Shopping: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  Entertainment: "bg-pink-500/15 text-pink-400 border-pink-500/20",
  "Health & Medical": "bg-green-500/15 text-green-400 border-green-500/20",
  "Housing & Bills": "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  Education: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  Travel: "bg-teal-500/15 text-teal-400 border-teal-500/20",
  Subscriptions: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  "Salary & Income": "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Other: "bg-gray-500/15 text-gray-400 border-gray-500/20",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ExpensesPage() {
  const supabase = createClient();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [rates, setRates] = useState<Record<string, number>>({});

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [expensesRes, profileRes] = await Promise.all([
      supabase.from("expenses").select("*").order("date", { ascending: false }),
      supabase.from("profiles").select("preferred_currency").eq("id", user.id).single()
    ]);

    setExpenses(expensesRes.data || []);
    
    const prefCurrency = profileRes.data?.preferred_currency || "USD";
    setBaseCurrency(prefCurrency);

    // Fetch live rates using centralized utility with fallbacks
    const ratesData = await getExchangeRates(prefCurrency);
    setRates(ratesData);

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await supabase.from("expenses").delete().eq("id", deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    fetchExpenses();
  }

  const filtered = expenses.filter((e) => {
    const matchSearch =
      !search ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      categoryFilter === "all" || e.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const totalFiltered = filtered.reduce((sum, e) => {
    const rate = rates[e.currency] || 1;
    const amountInBase = Number(e.amount) / rate;
    return sum + amountInBase;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            All Expenses
          </h1>
          <p className="text-muted-foreground mt-1">
            {expenses.length} total expense{expenses.length !== 1 ? "s" : ""} logged
          </p>
        </div>
        <Link href="/dashboard/add">
          <Button className="gradient-primary text-white hover:opacity-90 transition-all hover:scale-105">
            ➕ Add
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by description or category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-secondary/50 border-border/50 focus:border-primary h-10 flex-1"
        />
        <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val ?? "all")}>
          <SelectTrigger className="bg-secondary/50 border-border/50 focus:border-primary h-10 w-full sm:w-52">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border/50">
            <SelectItem value="all">All Categories</SelectItem>
            {ALL_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary bar */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-sm px-1">
          <span className="text-muted-foreground">
            Showing {filtered.length} expense{filtered.length !== 1 ? "s" : ""}
          </span>
          <span className="font-semibold text-primary">
            Total: {formatCurrency(totalFiltered, baseCurrency)} <span className="text-[10px] font-normal text-muted-foreground">({baseCurrency} converted)</span>
          </span>
        </div>
      )}

      {/* Expense List */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-secondary/30 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="gradient-card border-border/40 border-dashed">
          <CardContent className="py-16 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-lg mb-1">
              {expenses.length === 0 ? "No expenses yet" : "No results found"}
            </p>
            <p className="text-muted-foreground text-sm mb-5">
              {expenses.length === 0
                ? "Start logging to see your expenses here."
                : "Try adjusting your search or filter."}
            </p>
            {expenses.length === 0 && (
              <Link href="/dashboard/add">
                <Button className="gradient-primary text-white hover:opacity-90">
                  Add your first expense
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((expense) => (
            <Card
              key={expense.id}
              className="gradient-card border-border/40 hover:border-primary/30 transition-all group"
            >
              <CardContent className="py-3 px-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {expense.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(expense.date)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs shrink-0 ${categoryColors[expense.category] ?? categoryColors["Other"]}`}
                >
                  {expense.category}
                </Badge>
                <p className="font-bold text-sm text-primary shrink-0">
                  {formatCurrency(Number(expense.amount), expense.currency || "INR")}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteTarget(expense)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all px-2 h-8 shrink-0"
                  title="Delete"
                >
                  🗑️
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="bg-card border-border/50 max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Expense?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.description}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-2">
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="flex-1 border-border/50"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
