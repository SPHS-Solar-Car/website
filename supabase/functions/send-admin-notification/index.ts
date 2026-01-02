import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminNotificationRequest {
  fullName: string;
  email: string;
  phone: string;
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  amount: number;
  tier: string;
  publicSponsor: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      fullName, 
      email, 
      phone, 
      billingAddress, 
      amount, 
      tier,
      publicSponsor 
    }: AdminNotificationRequest = await req.json();

    console.log("Sending admin notification for donation:", { fullName, email, amount, tier });

    const formattedAmount = (amount / 100).toFixed(2);
    const addressLine2 = billingAddress.line2 ? `${billingAddress.line2}<br/>` : '';
    
    const emailResponse = await resend.emails.send({
      from: "Solar Car Donations <noreply@receipt.stonypointsolarcar.org>",
      to: ["ishansinghal123@gmail.com", "president@stonypointsolarcar.org", "treasurer@stonypointsolarcar.org"],
      subject: `New Donation Received - $${formattedAmount}`,
      html: `
        <h1>New Donation Notification</h1>
        <p>A new donation has been received. Here are the details:</p>
        
        <h2>Donor Information</h2>
        <ul>
          <li><strong>Full Name:</strong> ${fullName}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Phone:</strong> ${phone}</li>
          <li><strong>Public Sponsor:</strong> ${publicSponsor === 'yes' ? 'Yes - Wants public recognition' : 'No - Private donation'}</li>
        </ul>
        
        <h2>Billing Address</h2>
        <p>
          ${billingAddress.line1}<br/>
          ${addressLine2}
          ${billingAddress.city}, ${billingAddress.state} ${billingAddress.postal_code}<br/>
          ${billingAddress.country}
        </p>
        
        <h2>Donation Details</h2>
        <ul>
          <li><strong>Amount:</strong> $${formattedAmount}</li>
          <li><strong>Tier:</strong> ${tier.charAt(0).toUpperCase() + tier.slice(1)}</li>
        </ul>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          This email was automatically generated from the Stony Point Solar Car Team donation system.
        </p>
      `,
    });

    console.log("Admin notification sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-admin-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
