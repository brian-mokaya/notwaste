// Vercel Edge Function: IntaSend Checkout
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
    const body = await req.json().catch((err) => {
      console.error('Invalid JSON body:', err);
      return {};
    });
    const {
      amount,
      currency,
      email,
      phone,
      items,
      userId,
      redirect_url,
      webhook_url,
    } = body as any;

    if (!amount || !currency || !email) {
      console.error('Validation failed. Missing fields:', { amount: !!amount, currency: !!currency, email: !!email });
      return json({ error: 'Missing required fields: amount, currency, email' }, 400);
    }

    const secretKey = (process.env.INTASEND_SECRET_KEY || process.env.INTASEND_API_SECRET) as string | undefined;
    const publicKey = process.env.INTASEND_PUBLIC_KEY as string | undefined;
    const envBase = (process.env.INTASEND_BASE_URL as string) || 'https://api.intasend.com/api/v1';
    if (!secretKey) {
      console.error('Missing INTASEND_SECRET_KEY/INTASEND_API_SECRET in environment');
      return json({ error: 'Server misconfiguration: INTASEND_SECRET_KEY is not set' }, 500);
    }
    if (!envBase) {
      console.error('Missing INTASEND_BASE_URL in environment');
      return json({ error: 'Server misconfiguration: INTASEND_BASE_URL is not set' }, 500);
    }

    const response = await fetch(`${envBase}/checkout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        amount,
        currency,
        method: ['MPESA', 'CARD'],
        email,
        phone_number: phone,
        redirect_url,
        webhook_url,
        ...(publicKey ? { public_key: publicKey } : {}),
        extra: { user_id: userId, items },
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('IntaSend checkout failed:', response.status, text);
      return json({ error: text || `Checkout failed with status ${response.status}` }, response.status);
    }

    const data = await response.json();
    return json({ success: true, payment_url: data.url, transaction_id: data.id }, 200);
  } catch (error: any) {
    console.error('Unexpected checkout error:', error);
    return json({ error: error?.message || 'Internal Server Error' }, 500);
  }
}
