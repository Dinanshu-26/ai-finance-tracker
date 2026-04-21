"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Zap, BrainCircuit, BarChart3, ShieldCheck, ArrowRight, Menu } from "lucide-react";
import { createCheckoutSession } from "@/app/actions/stripe-actions";

const features = [
  {
    icon: <BrainCircuit className="h-6 w-6 text-indigo-400" />,
    title: "AI Auto-Categorization",
    desc: "Powered by Gemini 2.5 Flash. Instantly understands context — 'Uber to airport' is magically Transport.",
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-purple-400" />,
    title: "Visual Intelligence",
    desc: "Deep analytics that show you exactly where your wealth is leaking and how to fix it.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />,
    title: "Bank-Level Privacy",
    desc: "We use military-grade Row-Level Security (RLS). Your data is yours, and yours alone.",
  },
  {
    icon: <Zap className="h-6 w-6 text-yellow-400" />,
    title: "Instant Logging",
    desc: "A frictionless experience designed to get out of your way. Log in 3 seconds or less.",
  },
];

const pricing = [
  {
    name: "Free",
    price: "₹0",
    desc: "Perfect for getting started with smart finance tracking.",
    features: [
      "3 expenses per 24 hours",
      "Basic AI categorization",
      "Monthly spending summary",
      "Single currency",
    ],
    cta: "Get Started",
    link: "/signup",
    popular: false,
  },
  {
    name: "Pro",
    price: "₹9",
    yearlyPrice: "₹99",
    period: "/month",
    yearlyPeriod: "/year",
    desc: "For individuals serious about financial optimization.",
    features: [
      "Unlimited transactions",
      "Advanced AI insights & reports",
      "Smart budget alerts",
      "Multi-currency support",
      "Spending trend analysis",
      "Export to CSV & PDF",
    ],
    cta: "Start Free Trial",
    priceId: "price_1TOgLLPac5trUwZRugfFnVad",
    yearlyPriceId: "price_1TOgLXPac5trUwZROUskCZaS",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "₹299",
    period: "/month",
    desc: "For teams and businesses that need advanced control.",
    features: [
      "Everything in Pro",
      "Team collaboration (up to 10)",
      "Priority support",
      "Custom integrations & API access",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    link: "/signup",
    popular: false,
  },
];

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const [isYearly, setIsYearly] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  async function handleCheckout(priceId: string | undefined, link: string) {
    if (!priceId) {
      router.push(link);
      return;
    }

    setCheckoutLoading(priceId);
    try {
      await createCheckoutSession(priceId);
    } catch (err) {
      console.error("Checkout error:", err);
      setCheckoutLoading(null);
    }
  }

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();
  }, [supabase.auth]);

  return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-indigo-500/30">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-purple-500/10 blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#030712]/50 backdrop-blur-xl">
        <div className="container mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-xl font-bold">💰</span>
            </div>
            <span className="text-xl font-bold tracking-tight">FinanceAI</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/dashboard">
                <Button className="gradient-primary text-white shadow-xl shadow-indigo-500/20 border-none px-6">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="gradient-primary text-white shadow-xl shadow-indigo-500/20 border-none px-6">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="pt-20 pb-32 px-6">
          <div className="container mx-auto max-w-7xl flex flex-col items-center text-center">
            <Badge variant="outline" className="mb-8 px-4 py-1.5 rounded-full border-indigo-500/30 bg-indigo-500/5 text-indigo-400 text-sm font-medium animate-in fade-in slide-in-from-bottom-3 duration-1000">
              ✨ Experience the Future of Finance
            </Badge>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
              Master Your Money <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                with AI Clarity.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/50 max-w-2xl mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-300">
              Stop guessing where your money goes. FinanceAI uses Gemini 2.5 to
              instantly categorize your spending and reveal deep financial insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 mb-24 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500">
              <Link href={user ? "/dashboard" : "/signup"}>
                <Button size="lg" className="gradient-primary text-white text-lg px-10 py-7 rounded-2xl shadow-2xl shadow-indigo-500/30 hover:scale-[1.03] transition-all active:scale-100">
                  {user ? "Back to Dashboard" : "Start Tracking Now"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              {!user && (
                <Link href="/login">
                  <Button size="lg" variant="outline" className="bg-white/5 border-white/10 text-white text-lg px-10 py-7 rounded-2xl hover:bg-white/10 transition-all">
                    Watch Demo
                  </Button>
                </Link>
              )}
            </div>

            {/* Product Preview */}
            <div className="relative w-full max-w-5xl mx-auto group animate-in fade-in zoom-in duration-1000 delay-700">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative glass rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
                <Image
                  src="/dashboard-mockup.png"
                  alt="FinanceAI Dashboard"
                  width={1200}
                  height={800}
                  className="w-full h-auto object-cover opacity-90"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 bg-white/5 relative">
          <div className="container mx-auto max-w-7xl px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 italic tracking-tight">Smarts beyond simple spreadsheets</h2>
              <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
                We combined cutting-edge AI with military-grade security to give you the ultimate financial sidekick.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.05] transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:gradient-primary transition-all duration-500 shadow-inner">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-white/40 leading-relaxed text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 px-6 bg-gradient-to-b from-transparent to-indigo-500/[0.02]">
          <div className="container mx-auto max-w-7xl">
            {/* Pricing Toggle */}
            <div className="flex justify-center mb-16">
              <div className="p-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-1">
                <button 
                  onClick={() => setIsYearly(false)}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!isYearly ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg' : 'hover:bg-white/5 text-white/40'}`}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => setIsYearly(true)}
                  className={`px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${isYearly ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg' : 'hover:bg-white/5 text-white/40'}`}
                >
                  Annual
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Save 27%</span>
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricing.map((p, i) => {
                const currentPriceId = isYearly ? p.yearlyPriceId : p.priceId;
                const isLoading = checkoutLoading === currentPriceId;
                const isPro = p.name === "Pro";
                
                return (
                  <div
                    key={i}
                    className={`relative group ${isPro ? 'lg:scale-110 z-10' : ''}`}
                  >
                    {isPro && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-[10px] font-black tracking-widest uppercase shadow-xl z-20">
                        Most Popular
                      </div>
                    )}
                    
                    <Card className={`h-full rounded-[2.5rem] border ${isPro ? 'border-indigo-500/50 bg-[#0f111a]' : 'border-white/10 bg-white/[0.02]'} backdrop-blur-sm transition-all duration-500 flex flex-col`}>
                      <CardContent className="p-10 flex flex-col flex-1">
                        <div className="mb-8">
                          <h3 className="text-2xl font-bold mb-3">{p.name}</h3>
                          <p className="text-white/40 text-sm leading-relaxed">{p.desc}</p>
                        </div>

                        <div className="mb-10">
                          <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                              {isYearly && p.yearlyPrice ? p.yearlyPrice : p.price}
                            </span>
                            <span className="text-white/40 font-medium">
                              {isYearly && p.yearlyPeriod ? p.yearlyPeriod : p.period}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4 mb-12 flex-1">
                          {p.features.map((feat, j) => (
                            <div key={j} className="flex items-start gap-3">
                              <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                              <span className="text-sm text-white/70">{feat}</span>
                            </div>
                          ))}
                        </div>

                        <Button 
                          disabled={isLoading}
                          onClick={() => handleCheckout(currentPriceId, p.link || "/signup")}
                          className={`w-full py-7 rounded-2xl text-lg font-bold transition-all ${isPro ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[1.02] shadow-xl shadow-indigo-500/20' : 'bg-white/5 hover:bg-white/10 border border-white/10'}`}
                        >
                          {isLoading ? "Loading..." : p.cta}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="relative rounded-[3rem] overflow-hidden p-12 md:p-20 text-center gradient-primary shadow-2xl shadow-indigo-500/20">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
              <h2 className="relative text-4xl md:text-6xl font-black mb-8 leading-tight">Ready to transform <br /> your relationship with money?</h2>
              <p className="relative text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
                Join 10,000+ users who have simplified their finances with AI.
                Start your journey for free today.
              </p>
              <div className="relative flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-white text-indigo-600 hover:bg-white/90 text-xl font-bold px-10 py-8 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-100">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-16 px-6 bg-[#010309]">
        <div className="container mx-auto max-w-7xl grid md:grid-cols-4 gap-12">
          <Link href="/" className="md:col-span-1 space-y-6 group">
            <div className="flex items-center gap-2 group-hover:opacity-80 transition-opacity">
              <span className="text-2xl">💰</span>
              <span className="text-xl font-bold tracking-tight">FinanceAI</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              Making financial freedom accessible through artificial intelligence. Built for the modern generation.
            </p>
          </Link>
          <div className="space-y-6">
            <h4 className="font-bold">Product</h4>
            <ul className="space-y-4 text-sm text-white/40 font-medium">
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">AI Guide</a></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold">Company</h4>
            <ul className="space-y-4 text-sm text-white/40 font-medium">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold">Subscribe</h4>
            <p className="text-sm text-white/40">Get weekly AI financial tips in your inbox.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="email@example.com"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm flex-1 focus:outline-none focus:border-indigo-500/50"
              />
              <Button size="sm" className="gradient-primary">Join</Button>
            </div>
          </div>
        </div>
        <div className="container mx-auto max-w-7xl pt-16 mt-16 border-t border-white/5 text-center text-white/20 text-xs">
          © 2026 FinanceAI. All rights reserved. Powered by Gemini 2.5.
        </div>
      </footer>
    </div>
  );
}
