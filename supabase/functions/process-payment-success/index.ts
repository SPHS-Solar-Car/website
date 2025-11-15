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
    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session with expanded data
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'line_items'],
    });

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract all the data we need
    const tier = session.metadata?.tier || "custom";
    const amount = session.metadata?.amount 
      ? parseInt(session.metadata.amount) 
      : session.amount_total || 0;
    
    const fullName = session.custom_fields?.find(f => f.key === 'full_name')?.text?.value || '';
    const publicSponsor = session.custom_fields?.find(f => f.key === 'public_sponsor')?.dropdown?.value || 'no';
    const email = session.customer_details?.email || '';
    const phone = session.customer_details?.phone || '';
    const billingAddress = session.customer_details?.address || {};

    // Send receipt email to sponsor
    const { error: receiptError } = await supabase.functions.invoke("send-receipt", {
      body: {
        email: email,
        amount: amount,
        tier: tier,
        sessionId: sessionId,
        publicSponsor: publicSponsor,
      },
    });

    if (receiptError) {
      console.error("Error sending receipt:", receiptError);
    }

    // Send admin notification email
    const { error: adminError } = await supabase.functions.invoke("send-admin-notification", {
      body: {
        fullName,
        email,
        phone,
        billingAddress,
        amount,
        tier,
        publicSponsor,
      },
    });

    if (adminError) {
      console.error("Error sending admin notification:", adminError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment processed and receipt sent" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing payment success:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
