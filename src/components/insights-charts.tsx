"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryBreakdown, MonthlyTrend } from "@/lib/ai/insights";
import { formatCurrency } from "@/lib/utils";

interface ChartsProps {
  monthlyTrend: MonthlyTrend[];
  categoryBreakdown: CategoryBreakdown[];
}

export function InsightsCharts({
  monthlyTrend,
  categoryBreakdown,
}: ChartsProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Monthly Trend Bar Chart */}
      <Card className="gradient-card border-border/40">
        <CardHeader>
          <CardTitle className="text-base">Monthly Spending Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyTrend} barCategoryGap="30%">
              <XAxis
                dataKey="month"
                tick={{ fill: "oklch(0.62 0.02 265)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "oklch(0.62 0.02 265)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
                }
              />
              <Tooltip
                formatter={(v) => [formatCurrency(Number(v || 0)), "Spent"]}
                contentStyle={{
                  backgroundColor: "oklch(0.14 0.015 265)",
                  border: "1px solid oklch(1 0 0 / 8%)",
                  borderRadius: "8px",
                  color: "oklch(0.96 0.005 265)",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="total"
                fill="oklch(0.6 0.2 265)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Donut Chart */}
      <Card className="gradient-card border-border/40">
        <CardHeader>
          <CardTitle className="text-base">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <PieChart width={180} height={180}>
              <Pie
                data={categoryBreakdown}
                cx={90}
                cy={90}
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="total"
              >
                {categoryBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [formatCurrency(Number(v || 0)), ""]}
                contentStyle={{
                  backgroundColor: "oklch(0.14 0.015 265)",
                  border: "1px solid oklch(1 0 0 / 8%)",
                  borderRadius: "8px",
                  color: "oklch(0.96 0.005 265)",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </div>
          <div className="space-y-2 mt-1">
            {categoryBreakdown.slice(0, 5).map((cat) => (
              <div key={cat.category} className="flex items-center gap-2 text-sm">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="flex-1 text-muted-foreground truncate">
                  {cat.category}
                </span>
                <Badge variant="outline" className="text-xs border-border/40">
                  {cat.percentage.toFixed(0)}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
