// Vercel Serverless Function: IntaSend Webhook Receiver
// Verify with optional secret if provided. IntaSend typically signs payloads; adapt as needed.

export const config = { runtime: 'edge' };

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return json({ error: 'Method Not Allowed' }, 405);
  }

  try {
    const text = await req.text();

    // Optionally verify signature here if IntaSend provides one
    // const sig = req.headers.get('x-intasend-signature');
    // const secret = process.env.INTASEND_WEBHOOK_SECRET;
    // TODO: implement HMAC verification if required

    let payload: any;
    try {
      payload = JSON.parse(text);
    } catch {
      return json({ error: 'Invalid JSON' }, 400);
    }

    // TODO: Update your database with payload details
    // console.log('Webhook payload:', payload);

    return json({ received: true }, 200);
  } catch (error: any) {
    return json({ error: error?.message || 'Internal Server Error' }, 500);
  }
}


