import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priceId, tier, customAmount, baseAmount } = await req.json();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Calculate Stripe fee: 2.7% + $0.05
    const calculateTotalWithFee = (amountInCents: number) => {
      const stripeFeePercent = 0.027;
      const stripeFeeFixed = 5; // 5 cents in cents
      const totalAmount = Math.round(amountInCents + (amountInCents * stripeFeePercent) + stripeFeeFixed);
      return totalAmount;
    };

    let lineItems;
    let donationAmount;
    let totalAmount;
    
    if (customAmount) {
      // Custom donation amount (in cents)
      if (customAmount < 100) {
        throw new Error("Minimum donation amount is $1.00");
      }
      
      donationAmount = Math.round(customAmount);
      totalAmount = calculateTotalWithFee(donationAmount);
      
      lineItems = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Custom Sponsorship Donation",
              description: `Donation: $${(donationAmount / 100).toFixed(2)} + Stripe Fee: $${((totalAmount - donationAmount) / 100).toFixed(2)}`,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ];
    } else if (baseAmount) {
      // Tier-based donation with base amount
      if (baseAmount < 100) {
        throw new Error("Minimum donation amount is $1.00");
      }
      
      donationAmount = Math.round(baseAmount);
      totalAmount = calculateTotalWithFee(donationAmount);
      
      lineItems = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier Sponsorship`,
              description: `Donation: $${(donationAmount / 100).toFixed(2)} + Stripe Fee: $${((totalAmount - donationAmount) / 100).toFixed(2)}`,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ];
    } else {
      // Legacy tier-based donation (fallback to original price ID method)
      if (!priceId || !tier) {
        throw new Error("Price ID and tier are required for tier-based donations");
      }
      
      lineItems = [
        {
          price: priceId,
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/sponsor/success?tier=${tier || "custom"}&amount=${customAmount || ""}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/sponsor`,
      customer_email: undefined, // Let Stripe collect email
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: true,
      },
      custom_fields: [
        {
          key: "full_name",
          label: {
            type: "custom",
            custom: "Full Name",
          },
          type: "text",
          optional: false,
        },
        {
          key: "public_sponsor",
          label: {
            type: "custom",
            custom: "I want to be recognized as a public sponsor",
          },
          type: "dropdown",
          dropdown: {
            options: [
              { label: "Yes, recognize me publicly", value: "yes" },
              { label: "No, I'm donating privately", value: "no" },
            ],
          },
          optional: false,
        },
      ],
    });

    // Send receipt email in the background after session is created
    // We'll trigger this via webhook or client-side after successful payment
    // For now, we'll add the session metadata
    const sessionWithMetadata = await stripe.checkout.sessions.update(session.id, {
      metadata: {
        tier: tier || "custom",
        amount: customAmount ? customAmount.toString() : "",
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating payment session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
