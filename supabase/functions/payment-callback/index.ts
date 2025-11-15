import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PayHeroCallback {
  forward_url: string;
  response: {
    Amount: number;
    CheckoutRequestID: string;
    ExternalReference: string;
    MerchantRequestID: string;
    MpesaReceiptNumber?: string;
    Phone: string;
    ResultCode: number;
    ResultDesc: string;
    Status: string;
  };
  status: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse callback data
    const callbackData: PayHeroCallback = await req.json();
    console.log("Received PayHero callback:", JSON.stringify(callbackData));

    const { response } = callbackData;
    const {
      CheckoutRequestID,
      ExternalReference,
      MpesaReceiptNumber,
      ResultCode,
      ResultDesc,
      Status,
      Amount,
      Phone,
    } = response;

    // Determine payment status based on ResultCode
    let paymentStatus: string;
    if (ResultCode === 0) {
      paymentStatus = "SUCCESS";
    } else if (ResultCode === 1032) {
      paymentStatus = "CANCELLED";
    } else {
      paymentStatus = "FAILED";
    }

    // Find the payment by CheckoutRequestID or ExternalReference
    const { data: payment, error: findError } = await supabase
      .from("payments")
      .select("*")
      .or(`checkout_request_id.eq.${CheckoutRequestID},external_reference.eq.${ExternalReference}`)
      .maybeSingle();

    if (findError) {
      console.error("Error finding payment:", findError);
      throw new Error(`Database error: ${findError.message}`);
    }

    if (!payment) {
      console.warn("Payment not found for callback:", { CheckoutRequestID, ExternalReference });
      return new Response(
        JSON.stringify({ error: "Payment not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update payment record
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        status: paymentStatus,
        result_code: ResultCode,
        result_description: ResultDesc,
        mpesa_receipt_number: MpesaReceiptNumber || null,
        metadata: {
          ...payment.metadata,
          callback_data: response,
          callback_received_at: new Date().toISOString(),
        },
      })
      .eq("id", payment.id);

    if (updateError) {
      console.error("Error updating payment:", updateError);
      throw new Error(`Database update error: ${updateError.message}`);
    }

    console.log(`Payment ${payment.id} updated to status: ${paymentStatus}`);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Callback processed successfully",
        payment_id: payment.id,
        status: paymentStatus,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing callback:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
