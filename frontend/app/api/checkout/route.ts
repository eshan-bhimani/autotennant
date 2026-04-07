import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const PRICE_MAP: Record<string, { monthly: number; annual: number }> = {
  starter:   { monthly: 9900,  annual: 5900  },
  growth:    { monthly: 7900,  annual: 4700  },
  portfolio: { monthly: 4900,  annual: 2900  },
};

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey || secretKey === "sk_test_placeholder") {
    return NextResponse.json(
      { error: "Stripe is not configured. Please add your Stripe secret key.", fallback: true },
      { status: 503 }
    );
  }

  const { tier, billing } = await req.json();

  const priceData = PRICE_MAP[tier];
  if (!priceData) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  try {
    const stripe = new Stripe(secretKey, { apiVersion: "2025-03-31.basil" });

    const unitAmount = billing === "annual" ? priceData.annual : priceData.monthly;
    const interval = billing === "annual" ? "year" : "month";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            recurring: { interval },
            product_data: {
              name: `AutoTenant ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
              description: `Per property, billed ${interval}ly`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      success_url: `${req.nextUrl.origin}/landlord/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/#pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
