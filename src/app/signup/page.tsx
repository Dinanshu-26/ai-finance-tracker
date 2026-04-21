"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-20 blur-3xl bg-[oklch(0.6_0.2_265)]" />
        </div>
        <Card className="gradient-card border-border/40 glow-primary shadow-2xl max-w-md w-full text-center p-8">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="text-2xl font-bold mb-2">Check your inbox!</h2>
          <p className="text-muted-foreground mb-6">
            We sent a confirmation link to <strong className="text-foreground">{email}</strong>.
            Click it to activate your account.
          </p>
          <Link href="/login">
            <Button variant="outline" className="border-border/50 hover:bg-accent">
              Back to Sign In
            </Button>
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-20 blur-3xl bg-[oklch(0.6_0.2_265)]" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full opacity-15 blur-3xl bg-[oklch(0.6_0.18_300)]" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-3xl">💰</span>
            <span className="font-bold text-2xl tracking-tight">FinanceAI</span>
          </Link>
        </div>

        <Card className="gradient-card border-border/40 glow-primary shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Start tracking your finances with AI — it&apos;s free
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email address</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-secondary/50 border-border/50 focus:border-primary transition-colors h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-secondary/50 border-border/50 focus:border-primary transition-colors h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm">Confirm password</Label>
                <Input
                  id="signup-confirm"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="bg-secondary/50 border-border/50 focus:border-primary transition-colors h-11"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/15 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 gradient-primary text-white font-semibold hover:opacity-90 transition-all hover:scale-[1.02] active:scale-100 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creating account…
                  </span>
                ) : (
                  "Create Account"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline transition-colors">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
