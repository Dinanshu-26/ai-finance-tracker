"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { categorizeExpense, ALL_CATEGORIES } from "@/lib/ai/categorize";
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
  const [date, setDate] = useState(today);
  const [category, setCategory] = useState<string>("");
  const [aiCategory, setAiCategory] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleDescriptionBlur() {
    if (!description.trim()) return;
    setAiLoading(true);
    const cat = await categorizeExpense(description);
    setAiCategory(cat);
    if (!category) setCategory(cat);
    setAiLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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

    const finalCategory = category || (await categorizeExpense(description));

    const { error: insertError } = await supabase.from("expenses").insert({
      user_id: user.id,
      description: description.trim(),
      amount: parseFloat(amount),
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

            {/* Amount and Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="bg-secondary/50 border-border/50 focus:border-primary h-11"
                />
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
                disabled={loading || success}
                className="flex-1 gradient-primary text-white font-semibold h-11 hover:opacity-90 transition-all hover:scale-[1.02] active:scale-100 disabled:opacity-60"
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
