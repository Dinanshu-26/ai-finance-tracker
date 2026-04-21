"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Info, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

export default function BudgetPage() {
  const [limit, setLimit] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadBudget() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("budget_limit, preferred_currency")
        .eq("id", user.id)
        .single();

      if (data) {
        setLimit(data.budget_limit?.toString() || "0");
        setCurrency(data.preferred_currency || "USD");
      }
    }
    loadBudget();
  }, [supabase]);

  async function handleSetBudget() {
    setLoading(true);
    setSuccess(false);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ 
        budget_limit: parseFloat(limit),
        preferred_currency: currency 
      })
      .eq("id", user.id);

    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-indigo-400">Budget</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Set and monitor your monthly spending limits
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Settings Card */}
        <Card className="gradient-card border-border/40 shadow-2xl bg-[#0f111a]/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <span className="text-xl">🖥️</span> Budget Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="budget" className="text-[10px] font-bold tracking-widest text-white/40 uppercase">
                MONTHLY BUDGET LIMIT ({currency === "USD" ? "$" : currency})
              </Label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Input
                    id="budget"
                    type="number"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    className="bg-black/40 border-white/10 h-12 text-lg focus:border-indigo-500/50 transition-all pl-4"
                    placeholder="0.00"
                  />
                </div>
                <Select value={currency} onValueChange={(val) => setCurrency(val as string)}>
                  <SelectTrigger className="w-32 bg-black/40 border-white/10 h-12 focus:border-indigo-500/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1c2e] border-white/10 text-white">
                    <SelectItem value="USD">$ USD</SelectItem>
                    <SelectItem value="INR">₹ INR</SelectItem>
                    <SelectItem value="EUR">€ EUR</SelectItem>
                    <SelectItem value="GBP">£ GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleSetBudget}
              disabled={loading}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400 hover:opacity-90 transition-all hover:scale-[1.01] active:scale-100 shadow-lg shadow-indigo-500/20 text-white border-none"
            >
              <Save className="mr-2 h-5 w-5" />
              {loading ? "Updating..." : success ? "Budget Set! ✅" : "Set Budget"}
            </Button>
          </CardContent>
        </Card>

        {/* How It Works Card */}
        <Card className="gradient-card border-border/40 shadow-xl bg-[#0f111a]/30">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Info className="h-5 w-5 text-indigo-400" /> How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-3 w-3 rounded-full bg-green-500 mt-1.5 shrink-0 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <div>
                <h4 className="font-bold text-sm">Under 80%</h4>
                <p className="text-xs text-white/50 leading-relaxed">
                  You&apos;re on track! A green indicator shows your progress.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-3 w-3 rounded-full bg-orange-500 mt-1.5 shrink-0 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
              <div>
                <h4 className="font-bold text-sm">80% - 99%</h4>
                <p className="text-xs text-white/50 leading-relaxed">
                  Warning! A red alert appears on your dashboard.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-3 w-3 rounded-full bg-red-600 mt-1.5 shrink-0 shadow-[0_0_15px_rgba(220,38,38,0.6)] animate-pulse" />
              <div>
                <h4 className="font-bold text-sm">100%+</h4>
                <p className="text-xs text-white/50 leading-relaxed">
                  Budget exceeded! Critical alert with pulse animation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
