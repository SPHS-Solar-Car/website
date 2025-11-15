import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EIN = "746002018";
const ORGANIZATION_NAME = "Stony Point Solar Car Team";

interface ReceiptRequest {
  email: string;
  amount: number; // in cents
  tier: string;
  sessionId: string;
  publicSponsor?: string;
}

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
};

const getTierBenefits = (tier: string) => {
  const benefits: { [key: string]: string[] } = {
    bronze: [
      "Tax Deduction",
      "Car Updates via Newsletter",
      "Logo on Website"
    ],
    silver: [
      "Tax Deduction",
      "Car Updates via Newsletter",
      "Logo on Website",
      "Featured in our Newsletter",
      "Social Media Recognition"
    ],
    gold: [
      "Tax Deduction",
      "Car Updates via Newsletter",
      "Logo on Website",
      "Featured in our Newsletter",
      "Social Media Recognition",
      "Name on Team Trailer",
      "Logo on Banner",
      "Logo on Team Apparel"
    ],
    platinum: [
      "Tax Deduction",
      "Car Updates via Newsletter",
      "Logo on Website",
      "Featured in our Newsletter",
      "Social Media Recognition",
      "Name on Team Trailer",
      "Logo on Banner",
      "Logo on Team Apparel",
      "Name on Car",
      "Media Coverage",
      "Priority Placement and Sizing of Logo on Car"
    ],
    diamond: [
      "Tax Deduction",
      "Car Updates via Newsletter",
      "Logo on Website",
      "Featured in our Newsletter",
      "Social Media Recognition",
      "Name on Team Trailer",
      "Logo on Banner",
      "Logo on Team Apparel",
      "Name on Car",
      "Media Coverage",
      "Priority Placement and Sizing of Logo on Car",
      "Dedicated Paragraph on Website",
      "Media Mentions"
    ],
    custom: [
      "Tax Deduction",
      "Our sincere gratitude for your support"
    ]
  };
  
  return benefits[tier.toLowerCase()] || benefits.custom;
};

const getTierName = (amount: number): string => {
  // Amount is in cents
  if (amount >= 1000000) return "Diamond"; // $10,000+
  if (amount >= 500000) return "Platinum";  // $5,000+
  if (amount >= 300000) return "Gold";      // $3,000+
  if (amount >= 100000) return "Silver";    // $1,000+
  if (amount >= 50000) return "Bronze";     // $500+
  return "Custom";                          // Below $500
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, amount, tier, sessionId, publicSponsor }: ReceiptRequest = await req.json();

    console.log("Sending receipt to:", email, "Amount:", amount, "Tier:", tier, "Public:", publicSponsor);

    // Automatically determine tier based on amount if it's a custom donation
    const actualTier = tier === "custom" ? getTierName(amount).toLowerCase() : tier;
    const tierName = actualTier.charAt(0).toUpperCase() + actualTier.slice(1);

    const receiptDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const benefits = getTierBenefits(actualTier);
    const benefitsList = benefits.map(b => `<li style="margin-bottom: 8px;">${b}</li>`).join('');
    
    // Show tier info only if public sponsor
    const showTierInfo = publicSponsor === 'yes';
    // Show next steps only if public sponsor and not custom tier
    const showNextSteps = publicSponsor === 'yes' && tier !== 'custom';

    const emailResponse = await resend.emails.send({
      from: "Stony Point Solar Car Team <noreply@receipt.stonypointsolarcar.org>",
      to: [email],
      subject: `Thank You for Your ${tierName} Sponsorship - Tax Receipt`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #000; color: #fff; padding: 30px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; }
            .receipt-box { background-color: #fff; border: 2px solid #000; padding: 20px; margin: 20px 0; }
            .amount { font-size: 32px; font-weight: bold; color: #000; margin: 10px 0; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            ul { list-style-type: none; padding-left: 0; }
            li { padding: 5px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Sponsorship Receipt</h1>
              <p>${ORGANIZATION_NAME}</p>
            </div>
            
            <div class="content">
              <h2>Thank You for Your Generous Support!</h2>
              <p>We are deeply grateful for your ${showTierInfo ? tierName + ' tier ' : ''}sponsorship. Your contribution directly supports our mission to design, build, and race a solar-powered vehicle.</p>
              
              <div class="receipt-box">
                <h3 style="margin-top: 0; border-bottom: 2px solid #000; padding-bottom: 10px;">Tax Receipt</h3>
                
                <div class="info-row">
                  <span class="label">Receipt Date:</span>
                  <span>${receiptDate}</span>
                </div>
                
                <div class="info-row">
                  <span class="label">Transaction ID:</span>
                  <span>${sessionId}</span>
                </div>
                
                ${showTierInfo ? `
                <div class="info-row">
                  <span class="label">Sponsorship Tier:</span>
                  <span>${tierName}</span>
                </div>
                ` : ''}
                
                <div class="info-row" style="border-bottom: 2px solid #000;">
                  <span class="label">Donation Amount:</span>
                  <span class="amount">${formatCurrency(amount)}</span>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5;">
                  <p style="margin: 0;"><strong>Tax Information:</strong></p>
                  <p style="margin: 5px 0 0 0;">EIN: ${EIN}</p>
                  <p style="margin: 5px 0 0 0; font-size: 12px;">This donation is tax-deductible to the extent allowed by law. Please consult your tax advisor for details.</p>
                </div>
              </div>
              
              <h3>Your Sponsorship Benefits:</h3>
              <ul style="background-color: #fff; padding: 20px; border-left: 4px solid #000;">
                ${benefitsList}
              </ul>
              
              ${showNextSteps ? `
              <p><strong>Next Steps:</strong></p>
              <p>Our team will contact you within 48 hours to:</p>
              <ul>
                <li>✓ Collect your logo and branding materials</li>
                <li>✓ Discuss placement and visibility options</li>
                <li>✓ Schedule updates on our progress</li>
              </ul>
              ` : ''}
              
              <p>If you have any questions, please don't hesitate to contact us.</p>
            </div>
            
            <div class="footer">
              <p>This is an automated receipt from ${ORGANIZATION_NAME}</p>
              <p>Please save this email for your tax records</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Receipt email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending receipt:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
