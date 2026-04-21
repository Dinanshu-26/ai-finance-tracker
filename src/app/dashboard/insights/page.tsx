import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateInsights, type Expense } from "@/lib/ai/insights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InsightsCharts } from "@/components/insights-charts";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default async function InsightsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: expenses } = await supabase.from("expenses").select("*").order("date", { ascending: false });
  const allExpenses: Expense[] = expenses || [];
  const insights = generateInsights(allExpenses);

  if (allExpenses.length === 0) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Insights</h1>
          <p className="text-muted-foreground mt-1">Smart analysis of your spending patterns.</p>
        </div>
        <Card className="gradient-card border-border/40 border-dashed">
          <CardContent className="py-20 text-center">
            <p className="text-5xl mb-4">📊</p>
            <p className="font-semibold text-xl mb-2">No data yet</p>
            <p className="text-muted-foreground mb-6">Add some expenses to unlock AI-powered insights.</p>
            <Link href="/dashboard/add">
              <Button className="gradient-primary text-white hover:opacity-90">Add your first expense</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Insights</h1>
        <p className="text-muted-foreground mt-1">Smart analysis of your spending patterns.</p>
      </div>

      {/* AI Tips */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">🤖 AI Recommendations</h2>
        {insights.aiTips.map((tip, i) => (
          <Card key={i} className="border-primary/20 bg-primary/5">
            <CardContent className="py-4 px-5 text-sm text-muted-foreground">{tip}</CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "This Month", value: formatCurrency(insights.thisMonth), color: "text-primary" },
          { label: "Last Month", value: formatCurrency(insights.lastMonth), color: "" },
          {
            label: "MoM Change",
            value: `${insights.monthOverMonthChange > 0 ? "+" : ""}${insights.monthOverMonthChange.toFixed(1)}%`,
            color: insights.monthOverMonthChange > 0 ? "text-destructive" : "text-green-400",
          },
        ].map((s) => (
          <Card key={s.label} className="gradient-card border-border/40">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs text-muted-foreground font-medium">{s.label}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts (Client Component) */}
      <InsightsCharts
        monthlyTrend={insights.monthlyTrend}
        categoryBreakdown={insights.categoryBreakdown}
      />

      {/* Full breakdown */}
      <Card className="gradient-card border-border/40">
        <CardHeader><CardTitle className="text-base">Full Category Breakdown</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.categoryBreakdown.map((cat) => (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span>{cat.category}</span>
                    <span className="text-muted-foreground text-xs">({cat.count} {cat.count === 1 ? "expense" : "expenses"})</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(cat.total)}</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
