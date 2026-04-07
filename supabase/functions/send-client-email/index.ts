import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const resendApiKey = Deno.env.get("RESEND_API_KEY")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS Pre-Flight validation from browser (Vite)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { clientEmail, portalUrl, orgName, projectName } = await req.json()

    if (!resendApiKey) {
      throw new Error("Missing RESEND_API_KEY. Please add it via `supabase secrets set RESEND_API_KEY=xxx`")
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'Onboarding <onboarding@resend.dev>', // resend.dev allows testing without a verified domain
        to: [clientEmail],
        subject: `Your Secure Onboarding Portal from ${orgName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #fcfbf8; padding: 40px; border-radius: 12px; border: 1px solid #eaeaea;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2D2D2D; font-size: 24px; margin: 0;">Welcome to ${orgName}</h1>
            </div>
            
            <p style="color: #555; font-size: 16px; line-height: 1.5;">
              We have explicitly prepared a secure, highly-optimized onboarding checklist for <strong>${projectName}</strong>. 
            </p>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 40px;">
              Please access the portal via the one-time secure link below to furnish the required items.
            </p>
            
            <div style="text-align: center;">
              <a href="${portalUrl}" style="background-color: #2D2D2D; color: #E5FE44; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Launch Secure Portal
              </a>
            </div>

            <hr style="border: 0; border-top: 1px solid #eaeaea; margin-top: 40px; margin-bottom: 20px;" />
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              This is a secure, automated notification dispatched via SwiftBoard framework.
            </p>
          </div>
        `
      })
    })

    const data = await res.json()

    // Resend wraps its errors in data.error natively if unauthorized
    if (data.error) {
      throw new Error(data.error.message)
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    const error = err as Error;
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
