import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, agentType, displayName } = await req.json();

    if (!email || !agentType) {
      return new Response(JSON.stringify({ error: 'Missing email or agentType' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    // For now, log the welcome email. In production, integrate with an email provider.
    // This edge function is ready to be wired to Resend/SendGrid/etc.
    
    const APP_ORIGIN = Deno.env.get('APP_ORIGIN') || 'https://agentorionv3.lovable.app';
    
    const isNew = agentType === 'new';
    
    const subject = isNew
      ? 'Your 30 Day AgentOrion Launch Program Starts Today'
      : 'Your Automated Lead Pipeline Starts Today';

    const ctaUrl = isNew
      ? `${APP_ORIGIN}/launch-program`
      : `${APP_ORIGIN}/`;

    const ctaText = isNew ? 'Start Day 1 Now' : 'Set Up My Pipeline';

    const body = isNew
      ? `Welcome to AgentOrion${displayName ? `, ${displayName}` : ''}! Your 30 Day Launch Program is ready. Click the link below to start Day 1 and get your first lead funnel live today.`
      : `Welcome to AgentOrion${displayName ? `, ${displayName}` : ''}! Your automated lead generation system is ready to set up. Click the link below to launch your first AI funnel and activate Autopilot in the next 30 minutes.`;

    console.log('Welcome email prepared:', { to: email, subject, body, ctaUrl, ctaText, agentType });

    // TODO: Wire to email provider when ready
    // For now return success - the email content is logged and ready

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Welcome email prepared',
      email_data: { to: email, subject, body, ctaUrl, ctaText }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-welcome-email:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
