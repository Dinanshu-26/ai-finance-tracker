import { createAdminClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return new NextResponse("STRIPE_SECRET_KEY is not set", { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  if (!webhookSecret) {
    return new NextResponse("STRIPE_WEBHOOK_SECRET is not set", { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = await createAdminClient();

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;

    if (userId) {
      const { error } = await supabase
        .from("profiles")
        .update({ is_pro: true })
        .eq("id", userId);
      
      if (error) {
        console.error("Webhook Update Error:", error);
        return new NextResponse("Database update failed", { status: 500 });
      }
    }
  }

  return new NextResponse("Webhook handled", { status: 200 });
}
