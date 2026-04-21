"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import { Globe, Save, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("preferred_currency")
        .eq("id", user.id)
        .single();

      if (data?.preferred_currency) {
        setBaseCurrency(data.preferred_currency);
      }
      setLoading(false);
    }
    loadSettings();
  }, [supabase]);

  async function handleSave() {
    setSaving(true);
    setSuccess(false);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ preferred_currency: baseCurrency })
      .eq("id", user.id);

    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
    setSaving(false);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account preferences and global display settings.
        </p>
      </div>

      <div className="max-w-2xl">
        <Card className="gradient-card border-border/40 bg-[#0f111a]/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> Global Base Currency
            </CardTitle>
            <CardDescription>
              This currency will be used to calculate all dashboard totals, charts, and budget limits.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="base-currency">Display all totals in:</Label>
              <Select 
                value={baseCurrency} 
                onValueChange={(val) => val && setBaseCurrency(val)}
                disabled={loading}
              >
                <SelectTrigger id="base-currency" className="bg-black/40 border-white/10 h-12 focus:border-primary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1c2e] border-white/10">
                  {SUPPORTED_CURRENCIES.map(c => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="flex items-center gap-2">
                        <span className="text-muted-foreground font-mono w-6">{c.symbol}</span>
                        {c.name} ({c.code})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving || loading}
              className="w-full h-12 font-bold gradient-primary text-white hover:opacity-90 transition-all shadow-lg shadow-indigo-500/20"
            >
              {saving ? "Saving Changes..." : success ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" /> Saved Successfully
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-5 w-5" /> Save Preferences
                </span>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="mt-8 border-border/30 bg-card/30">
          <CardContent className="py-4 flex items-start gap-3">
            <span className="text-xl mt-0.5">💡</span>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                <span className="text-foreground font-medium">How it works:</span> We use live exchange rates to mathematically convert your foreign expenses into your base currency.
              </p>
              <p>
                Individual expenses will still show their original currency, but they are converted before being added to your dashboard summaries.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
