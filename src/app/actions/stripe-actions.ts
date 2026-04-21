"use server";

import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";
import { redirect } from "next/navigation";

export async function createCheckoutSession(priceId: string) {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user's email for Stripe
  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email || profile?.email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/#pricing`,
    metadata: {
      userId: user.id,
    },
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  redirect(session.url);
}
