import { CATEGORY_COLORS, type ExpenseCategory } from "./categorize";

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  created_at: string;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
  percentage: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  total: number;
}

export interface SpendingInsights {
  totalSpent: number;
  thisMonth: number;
  lastMonth: number;
  monthOverMonthChange: number;
  topCategory: string;
  categoryBreakdown: CategoryBreakdown[];
  monthlyTrend: MonthlyTrend[];
  aiTips: string[];
}

/**
 * Generates spending insights from a list of expenses.
 * Produces category breakdowns, monthly trends, and AI-generated tips.
 *
 * @future Replace `generateAITips` with a real LLM call to produce personalized insights.
 */
export function generateInsights(expenses: Expense[]): SpendingInsights {
  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const thisMonth = expenses
    .filter((e) => e.date.startsWith(thisMonthKey))
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const lastMonth = expenses
    .filter((e) => e.date.startsWith(lastMonthKey))
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const monthOverMonthChange =
    lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

  // Category breakdown
  const categoryMap: Record<string, { total: number; count: number }> = {};
  for (const expense of expenses) {
    const cat = expense.category || "Other";
    if (!categoryMap[cat]) categoryMap[cat] = { total: 0, count: 0 };
    categoryMap[cat].total += Number(expense.amount);
    categoryMap[cat].count += 1;
  }

  const categoryBreakdown: CategoryBreakdown[] = Object.entries(categoryMap)
    .map(([category, { total, count }]) => ({
      category,
      total,
      count,
      percentage: totalSpent > 0 ? (total / totalSpent) * 100 : 0,
      color: CATEGORY_COLORS[category as ExpenseCategory] || "#6b7280",
    }))
    .sort((a, b) => b.total - a.total);

  const topCategory = categoryBreakdown[0]?.category || "N/A";

  // Monthly trend (last 6 months)
  const monthlyMap: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap[key] = 0;
  }
  for (const expense of expenses) {
    const monthKey = expense.date.substring(0, 7);
    if (monthKey in monthlyMap) {
      monthlyMap[monthKey] += Number(expense.amount);
    }
  }

  const monthlyTrend: MonthlyTrend[] = Object.entries(monthlyMap).map(
    ([month, total]) => ({
      month: new Date(month + "-01").toLocaleString("default", {
        month: "short",
        year: "2-digit",
      }),
      total,
    })
  );

  const aiTips = generateAITips(
    categoryBreakdown,
    monthOverMonthChange,
    thisMonth
  );

  return {
    totalSpent,
    thisMonth,
    lastMonth,
    monthOverMonthChange,
    topCategory,
    categoryBreakdown,
    monthlyTrend,
    aiTips,
  };
}

/**
 * Mock AI tip generator based on spending patterns.
 * @future Replace with a real LLM prompt for personalized financial advice.
 */
function generateAITips(
  breakdown: CategoryBreakdown[],
  momChange: number,
  thisMonth: number
): string[] {
  const tips: string[] = [];

  if (momChange > 20) {
    tips.push(
      `📈 Your spending increased by ${momChange.toFixed(1)}% compared to last month. Consider reviewing your recent expenses.`
    );
  } else if (momChange < -10) {
    tips.push(
      `✅ Great job! You reduced your spending by ${Math.abs(momChange).toFixed(1)}% compared to last month.`
    );
  }

  const topCat = breakdown[0];
  if (topCat && topCat.percentage > 40) {
    tips.push(
      `🔍 ${topCat.category} accounts for ${topCat.percentage.toFixed(1)}% of your spending. It might be worth checking if you can cut back.`
    );
  }

  if (breakdown.length > 0 && breakdown[0].category === "Food & Dining") {
    tips.push(
      `🍽️ Food & Dining is your top expense. Meal planning or cooking at home can significantly reduce this cost.`
    );
  }

  if (thisMonth > 50000) {
    tips.push(
      `💰 You've spent ₹${thisMonth.toLocaleString("en-IN")} this month. Setting a monthly budget can help stay on track.`
    );
  }

  if (tips.length === 0) {
    tips.push(
      `👍 Your spending looks balanced! Keep tracking to maintain healthy financial habits.`
    );
  }

  return tips;
}
