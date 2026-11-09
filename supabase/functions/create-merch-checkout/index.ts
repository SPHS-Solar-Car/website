import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Source of truth for prices (in cents). The browser only sends item id, size and quantity,
// so nobody can change the price by editing the page. Keep in sync with src/config/merch.ts.
// Prices are per size, in cents.
const CATALOG: Record<string, { name: string; prices: Record<string, number> }> = {
  polo: {
    name: "Polo",
    prices: { S: 3100, M: 3100, L: 3100, XL: 3100, "2XL": 3300, "4XL": 3300 },
  },
  tshirt: {
    name: "T-Shirt",
    prices: { S: 1200, M: 1200, L: 1200, XL: 1200, "2XL": 1400, "4XL": 1500 },
  },
  hoodie: {
    name: "Hoodie",
    prices: { S: 2700, M: 2700, L: 2700, XL: 2700, "2XL": 3000, "4XL": 3000 },
  },
};

const MAX_QUANTITY_PER_LINE = 50;
const MAX_LINES = 20;

// Sales tax is calculated by Stripe Tax (automatic_tax) using the Texas registration in the
// Stripe dashboard. Items are tagged with Stripe's "Clothing and Footwear" tax code so clothing
// rules (e.g. Texas sales-tax-holiday exemptions) apply correctly.
const CLOTHING_TAX_CODE = "txcd_30011000";

interface OrderLine {
  itemId: string;
  size: string;
  quantity: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { items } = (await req.json()) as { items: OrderLine[] };

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Your order is empty.");
    }
    if (items.length > MAX_LINES) {
      throw new Error(`Orders are limited to ${MAX_LINES} lines.`);
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const lineItems = items.map((line) => {
      const product = CATALOG[line.itemId];
      if (!product) throw new Error(`Unknown item: ${line.itemId}`);
      const unitAmount = Object.hasOwn(product.prices, line.size) ? product.prices[line.size] : undefined;
      if (!unitAmount) {
        throw new Error(`Invalid size "${line.size}" for ${product.name}`);
      }
      const quantity = Number(line.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_LINE) {
        throw new Error(`Quantity for ${product.name} must be between 1 and ${MAX_QUANTITY_PER_LINE}.`);
      }
      return {
        price_data: {
          currency: "usd",
          product_data: { name: `${product.name} (${line.size})`, tax_code: CLOTHING_TAX_CODE },
          unit_amount: unitAmount,
          tax_behavior: "exclusive", // tax is added on top of the listed price
        },
        quantity,
      };
    });

    const origin = req.headers.get("origin");
    const orderSummary = items
      .map((l) => `${l.quantity}x ${CATALOG[l.itemId].name} ${l.size}`)
      .join(", ")
      .slice(0, 500); // Stripe metadata values max 500 chars

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      automatic_tax: { enabled: true },
      success_url: `${origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop`,
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      custom_fields: [
        {
          key: "full_name",
          label: { type: "custom", custom: "Full Name" },
          type: "text",
          optional: false,
        },
      ],
      metadata: { type: "merch", order: orderSummary },
      payment_intent_data: {
        description: `Merch order: ${orderSummary}`.slice(0, 1000),
        metadata: { type: "merch", order: orderSummary },
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating merch checkout:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
