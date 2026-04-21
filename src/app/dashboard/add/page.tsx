"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ALL_CATEGORIES } from "@/lib/ai/categorize";
import { getAICategory } from "@/app/actions/ai-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AddExpensePage() {
  const router = useRouter();
  const supabase = createClient();

  const today = new Date().toISOString().split("T")[0];

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [date, setDate] = useState(today);
  const [category, setCategory] = useState<string>("");
  const [aiCategory, setAiCategory] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [recentCount, setRecentCount] = useState(0);
  const [checkingLimit, setCheckingLimit] = useState(true);

  const FREE_LIMIT = 3;

  useEffect(() => {
    async function checkLimit() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_pro")
        .eq("id", user.id)
        .single();
      
      setIsPro(profile?.is_pro || false);

      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("expenses")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", twentyFourHoursAgo);
      
      setRecentCount(count || 0);
      setCheckingLimit(false);
    }
    checkLimit();
  }, [supabase]);

  const hasReachedLimit = !isPro && recentCount >= FREE_LIMIT;
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const currencies = [
    { code: "INR", symbol: "₹" },
    { code: "USD", symbol: "$" },
    { code: "EUR", symbol: "€" },
    { code: "GBP", symbol: "£" },
  ];

  async function handleDescriptionBlur() {
    if (!description.trim() || description.length < 3) return;
    setAiLoading(true);
    try {
      const cat = await getAICategory(description);
      if (cat) {
        setAiCategory(cat);
        if (!category) setCategory(cat);
      }
    } catch (err) {
      console.error("AI Error:", err);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (hasReachedLimit) return;
    setError(null);
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const finalCategory = category || aiCategory || (await getAICategory(description)) || "Other";

    const { error: insertError } = await supabase.from("expenses").insert({
      user_id: user.id,
      description: description.trim(),
      amount: parseFloat(amount),
      currency: currency,
      category: finalCategory,
      date,
    });

    setLoading(false);
    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setDescription("");
        setAmount("");
        setCurrency("INR");
        setDate(today);
        setCategory("");
        setAiCategory(null);
      }, 1500);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Add Expense
        </h1>
        <p className="text-muted-foreground mt-1">
          Log a new expense. Our AI will auto-categorize it for you.
        </p>
      </div>

      <Card className="gradient-card border-border/40">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Expense Details</CardTitle>
          <CardDescription>
            Fill in the details below. The AI will suggest a category as you
            type.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {hasReachedLimit && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                  ⚠️
                </div>
                <p>
                  <strong>Daily limit reached!</strong> You can log up to {FREE_LIMIT} expenses per day on the free plan. Upgrade to Pro for unlimited access.
                </p>
              </div>
            )}
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="e.g., Uber ride to office, Pizza dinner..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setAiCategory(null);
                }}
                onBlur={handleDescriptionBlur}
                required
                className="bg-secondary/50 border-border/50 focus:border-primary h-11"
              />
            </div>

            {/* AI Category suggestion */}
            <div className="flex items-center gap-2 min-h-7">
              {aiLoading && (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg className="animate-spin h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  AI is categorizing…
                </span>
              )}
              {!aiLoading && aiCategory && (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  🤖 AI suggested:
                  <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                    {aiCategory}
                  </Badge>
                </span>
              )}
            </div>

            {/* Amount, Currency and Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 flex gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {currencies.find(c => c.code === currency)?.symbol}
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="bg-secondary/50 border-border/50 focus:border-primary h-11 pl-8"
                    />
                  </div>
                </div>
                <div className="w-24 space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={(val) => setCurrency(val as string)}>
                    <SelectTrigger className="bg-secondary/50 border-border/50 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(c => (
                        <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  max={today}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="bg-secondary/50 border-border/50 focus:border-primary h-11"
                />
              </div>
            </div>

            {/* Category override */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Category{" "}
                <span className="text-muted-foreground text-xs font-normal">
                  (optional — AI will auto-select)
                </span>
              </Label>
              <Select value={category} onValueChange={(val) => setCategory(val ?? "")}>
                <SelectTrigger
                  id="category"
                  className="bg-secondary/50 border-border/50 focus:border-primary h-11"
                >
                  <SelectValue placeholder="Let AI choose, or pick manually" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50">
                  {ALL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-destructive/15 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="rounded-lg bg-green-500/15 border border-green-500/30 px-4 py-3 text-sm text-green-400 flex items-center gap-2">
                <span>✅</span> Expense logged successfully!
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={loading || success || checkingLimit || hasReachedLimit}
                className={`flex-1 font-semibold h-11 transition-all ${
                  hasReachedLimit 
                    ? "bg-secondary text-muted-foreground cursor-not-allowed opacity-80" 
                    : "gradient-primary text-white hover:opacity-90 hover:scale-[1.02] active:scale-100 shadow-lg shadow-indigo-500/10"
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Saving…
                  </span>
                ) : success ? (
                  "✅ Saved!"
                ) : hasReachedLimit ? (
                  <span className="flex items-center gap-2 justify-center">
                    🔒 Limit Reached
                  </span>
                ) : (
                  "Log Expense"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="border-border/50 hover:bg-accent h-11"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-border/30 bg-card/50">
        <CardContent className="py-4 flex items-start gap-3">
          <span className="text-xl mt-0.5">💡</span>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              <span className="text-foreground font-medium">Tip:</span> Be
              descriptive! Writing &quot;Uber to airport&quot; instead of
              &quot;ride&quot; helps the AI categorize better.
            </p>
            <p>
              You can override the AI&apos;s category suggestion using the
              dropdown above.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
