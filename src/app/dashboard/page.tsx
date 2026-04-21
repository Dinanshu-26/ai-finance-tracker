import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { generateInsights, type Expense } from "@/lib/ai/insights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BudgetManager } from "@/components/budget-manager";
import { DashboardHeader } from "@/components/dashboard-header";
import { getExchangeRates } from "@/lib/currency";
import { formatCurrency } from "@/lib/utils";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
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

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch expenses and profile in parallel
  const [expensesRes, profileRes] = await Promise.all([
    supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false })
      .limit(100),
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
  ]);

  const allExpenses: Expense[] = expensesRes.data || [];
  const profile = profileRes.data;
  const isPro = profile?.is_pro || false;
  const baseCurrency = profile?.preferred_currency || "USD";
  const budgetLimit = profile?.budget_limit || 0;
  
  // Count expenses in the last 24 hours for freemium limit
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: recentCount } = await supabase
    .from("expenses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", twentyFourHoursAgo);

  const FREE_LIMIT = 3;
  const hasReachedLimit = !isPro && (recentCount || 0) >= FREE_LIMIT;
  
  // Fetch live exchange rates relative to the base currency
  const rates = await getExchangeRates(baseCurrency);
  
  const insights = generateInsights(allExpenses, rates, baseCurrency);
  const recent = allExpenses.slice(0, 5);

  const budgetProgress = budgetLimit > 0 ? (insights.thisMonth / budgetLimit) * 100 : 0;
  const isBudgetWarning = budgetLimit > 0 && budgetProgress >= 80;

  const summaryCards = [
    {
      title: "Total Spent",
      value: formatCurrency(insights.totalSpent, baseCurrency),
      sub: `All time (${baseCurrency})`,
      icon: "💰",
      accent: "text-primary",
    },
    {
      title: "This Month",
      value: formatCurrency(insights.thisMonth, baseCurrency),
      sub:
        insights.monthOverMonthChange !== 0
          ? `${insights.monthOverMonthChange > 0 ? "+" : ""}${insights.monthOverMonthChange.toFixed(1)}% vs last month`
          : "vs last month",
      icon: "📅",
      accent:
        insights.monthOverMonthChange > 10
          ? "text-destructive"
          : insights.monthOverMonthChange < -5
            ? "text-green-400"
            : "text-primary",
    },
    {
      title: "Budget Status",
      value: budgetLimit > 0 ? `${budgetProgress.toFixed(0)}%` : "Not Set",
      sub: budgetLimit > 0 ? `${formatCurrency(insights.thisMonth, baseCurrency)} / ${formatCurrency(budgetLimit, baseCurrency)}` : "Set a limit",
      icon: "📉",
      accent: isBudgetWarning ? "text-destructive" : "text-primary",
    },
    {
      title: "Transactions",
      value: allExpenses.length.toString(),
      sub: "Total logged",
      icon: "🧾",
      accent: "text-primary",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <DashboardHeader 
        hasReachedLimit={hasReachedLimit} 
        recentCount={recentCount || 0} 
        isPro={isPro} 
        freeLimit={FREE_LIMIT} 
      />

      {/* Budget Warning Alert */}
      {isBudgetWarning && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500 rounded-2xl bg-destructive/10 border border-destructive/30 p-6 flex items-center gap-4 text-destructive glow-destructive">
          <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center text-2xl shrink-0">
            ⚠️
          </div>
          <div>
            <h3 className="font-bold text-lg">Budget Warning!</h3>
            <p className="text-destructive/80 text-sm">
              You have spent <span className="font-bold">{budgetProgress.toFixed(1)}%</span> of your monthly budget. 
              {budgetProgress >= 100 ? " You have exceeded your limit!" : " You're approaching your limit."}
            </p>
          </div>
          <div className="ml-auto w-32 h-2 bg-destructive/20 rounded-full overflow-hidden hidden sm:block">
            <div 
              className="h-full bg-destructive transition-all duration-1000" 
              style={{ width: `${Math.min(budgetProgress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card
            key={card.title}
            className={`gradient-card border-border/40 hover:border-primary/30 transition-all hover:-translate-y-0.5 ${card.title === "Budget Status" && isBudgetWarning ? "border-destructive/40 shadow-lg shadow-destructive/10" : ""}`}
          >
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <span className="text-xl">{card.icon}</span>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold truncate ${card.accent}`}>
                {card.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>


      {/* AI Tip */}
      {insights.aiTips[0] && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4 flex items-start gap-3">
            <span className="text-2xl mt-0.5">🤖</span>
            <div>
              <p className="text-sm font-medium text-primary mb-0.5">
                AI Insight
              </p>
              <p className="text-sm text-muted-foreground">
                {insights.aiTips[0]}
              </p>
            </div>
            <Link href="/dashboard/insights" className="ml-auto shrink-0">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-xs">
                See all →
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Recent Expenses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Expenses</h2>
          <Link href="/dashboard/expenses">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs">
              View all →
            </Button>
          </Link>
        </div>

        {recent.length === 0 ? (
          <Card className="gradient-card border-border/40 border-dashed">
            <CardContent className="py-16 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="font-semibold text-lg mb-1">No expenses yet</p>
              <p className="text-muted-foreground text-sm mb-5">
                Start by logging your first expense
              </p>
              <Link href="/dashboard/add">
                <Button className="gradient-primary text-white hover:opacity-90">
                  Add your first expense
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recent.map((expense) => (
              <Card
                key={expense.id}
                className="gradient-card border-border/40 hover:border-primary/30 transition-all"
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      {insights.categoryBreakdown.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>
          <div className="space-y-3">
            {insights.categoryBreakdown.slice(0, 5).map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{cat.category}</span>
                  <span className="font-medium">
                    {formatCurrency(cat.total, baseCurrency)}{" "}
                    <span className="text-muted-foreground text-xs">
                      ({cat.percentage.toFixed(0)}%)
                    </span>
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
