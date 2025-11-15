import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PaymentRequest {
  amount: number;
  phone_number: string;
  channel_id: string;
  customer_name?: string;
  external_reference?: string;
}

interface PayHeroResponse {
  success: boolean;
  status: string;
  reference: string;
  CheckoutRequestID: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Parse request body
    const body: PaymentRequest = await req.json();
    const { amount, phone_number, channel_id, customer_name, external_reference } = body;

    // Validate required fields
    if (!amount || !phone_number || !channel_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: amount, phone_number, channel_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get payment channel details
    const { data: channel, error: channelError } = await supabase
      .from("payment_channels")
      .select("*")
      .eq("id", channel_id)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (channelError || !channel) {
      return new Response(
        JSON.stringify({ error: "Payment channel not found or inactive" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get PayHero credentials from environment
    const payheroAuthToken = Deno.env.get("PAYHERO_AUTH_TOKEN");
    if (!payheroAuthToken) {
      throw new Error("PayHero credentials not configured");
    }

    // Prepare PayHero request
    const payheroPayload: any = {
      amount,
      phone_number,
      channel_id: channel.channel_id,
      provider: channel.provider,
      external_reference: external_reference || crypto.randomUUID(),
      customer_name: customer_name || "",
      callback_url: `${supabaseUrl}/functions/v1/payment-callback`,
    };

    // Add network_code for wallet channels
    if (channel.is_wallet && channel.network_code) {
      payheroPayload.network_code = channel.network_code;
    }

    // Make request to PayHero API
    const payheroResponse = await fetch("https://backend.payhero.co.ke/api/v2/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${payheroAuthToken}`,
      },
      body: JSON.stringify(payheroPayload),
    });

    if (!payheroResponse.ok) {
      const errorText = await payheroResponse.text();
      throw new Error(`PayHero API error: ${errorText}`);
    }

    const payheroData: PayHeroResponse = await payheroResponse.json();

    // Save payment record to database
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        user_id: user.id,
        channel_id: channel.id,
        amount,
        phone_number,
        customer_name: customer_name || null,
        external_reference: payheroPayload.external_reference,
        payhero_reference: payheroData.reference,
        checkout_request_id: payheroData.CheckoutRequestID,
        status: payheroData.status,
        metadata: { payhero_response: payheroData },
      })
      .select()
      .single();

    if (paymentError) {
      throw new Error(`Database error: ${paymentError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_id: payment.id,
        payhero_reference: payheroData.reference,
        checkout_request_id: payheroData.CheckoutRequestID,
        status: payheroData.status,
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error initiating payment:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
