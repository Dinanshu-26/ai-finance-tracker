"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BudgetManager({ initialLimit }: { initialLimit: number }) {
  const [limit, setLimit] = useState(initialLimit.toString());
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  async function handleUpdate() {
    setLoading(true);
    setSuccess(false);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ budget_limit: parseFloat(limit) })
      .eq("id", user.id);

    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
    setLoading(false);
  }

  return (
    <Card className="gradient-card border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Monthly Budget Limit</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
            <Input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="pl-7 bg-secondary/50 border-border/50 h-9"
              placeholder="Set monthly limit..."
            />
          </div>
          <Button 
            onClick={handleUpdate} 
            disabled={loading}
            size="sm"
            className="gradient-primary text-white h-9"
          >
            {loading ? "..." : success ? "✓" : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
