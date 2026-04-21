import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: "🤖",
    title: "AI Auto-Categorization",
    desc: "Smart keyword analysis instantly categorizes every expense — no manual tagging needed.",
  },
  {
    icon: "📊",
    title: "Visual Insights",
    desc: "Beautiful charts and trends show where your money goes, month over month.",
  },
  {
    icon: "🔒",
    title: "Row-Level Security",
    desc: "Military-grade RLS ensures your data is 100% private — only you can see your expenses.",
  },
  {
    icon: "⚡",
    title: "Instant Logging",
    desc: "Log an expense in seconds. Our form is fast, smart, and frictionless.",
  },
  {
    icon: "💡",
    title: "Spending Tips",
    desc: "Get actionable AI tips to reduce overspending and build better financial habits.",
  },
  {
    icon: "📅",
    title: "Monthly Trends",
    desc: "Track your month-over-month progress and see how your habits improve over time.",
  },
];

const stats = [
  { value: "10k+", label: "Expenses Tracked" },
  { value: "100%", label: "Data Privacy" },
  { value: "< 1s", label: "Auto-Categorization" },
  { value: "Free", label: "To Get Started" },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background gradient blobs */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-20 blur-3xl bg-[oklch(0.6_0.2_265)]" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full opacity-15 blur-3xl bg-[oklch(0.6_0.18_300)]" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full opacity-10 blur-3xl bg-[oklch(0.65_0.18_200)]" />
      </div>

      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <span className="font-bold text-xl tracking-tight">FinanceAI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="gradient-primary text-white shadow-lg hover:opacity-90 transition-opacity">
              Get Started Free
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center px-6 pt-16 pb-24 max-w-5xl mx-auto">
        <Badge
          variant="secondary"
          className="mb-6 px-4 py-1.5 text-sm font-medium border border-primary/30 bg-primary/10 text-primary"
        >
          ✨ AI-Powered Financial Clarity
        </Badge>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6">
          Track Smarter,{" "}
          <span className="bg-gradient-to-r from-[oklch(0.65_0.22_265)] to-[oklch(0.65_0.22_300)] bg-clip-text text-transparent">
            Spend Better
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          FinanceAI automatically categorizes your daily expenses, surfaces
          powerful insights, and helps you understand exactly where your money
          goes — all with bank-grade security.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/signup">
            <Button
              size="lg"
              className="gradient-primary glow-primary text-white text-lg px-8 py-6 hover:opacity-90 transition-all hover:scale-105"
            >
              Start Tracking Free →
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-border/60 hover:bg-accent transition-all"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="glass rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-primary">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything you need to master your finances
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            A powerful, AI-enhanced toolkit designed to give you total control
            over your spending.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <Card
              key={f.title}
              className="gradient-card border-border/40 hover:border-primary/40 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 group"
            >
              <CardContent className="p-6">
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {f.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-28 text-center">
        <div className="glass rounded-3xl p-12 glow-primary">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to take control of your finances?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Join thousands of people who track smarter with FinanceAI.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="gradient-primary text-white text-lg px-10 py-6 hover:opacity-90 transition-all hover:scale-105"
            >
              Get Started — It&apos;s Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 FinanceAI. Built with Next.js 15 + Supabase.</p>
      </footer>
    </main>
  );
}
