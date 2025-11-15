// Vercel Edge Function: PayHero charge proxy
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
    }) as any;

    const { amount, phone_number } = body || {};
    if (!amount || !phone_number) {
      console.error('Validation failed. Missing fields:', { amount: !!amount, phone_number: !!phone_number });
      return json({ error: 'Missing required fields: amount, phone_number' }, 400);
    }

    const payheroUrl = 'https://backend.payhero.co.ke/api/v2/payments';
    const basicAuth = (process.env.PAYHERO_BASIC_AUTH || process.env.PAYHERO_BASIC_TOKEN) as string | undefined;

    if (!basicAuth) {
      console.error('Missing PAYHERO_BASIC_AUTH in environment');
      return json({ error: 'Server misconfiguration: PAYHERO_BASIC_AUTH is not set' }, 500);
    }

    const response = await fetch(payheroUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify(body),
    });

    const text = await response.text().catch(() => '');
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (err) {
      console.warn('PayHero returned non-JSON:', err);
      data = { raw: text };
    }

    if (!response.ok) {
      console.error('PayHero request failed:', response.status, data);
      return json({ error: data?.error || data?.message || text || `PayHero returned ${response.status}` }, response.status);
    }

    // Return PayHero response directly to the frontend.
    return json(data, 200);
  } catch (error: any) {
    console.error('Unexpected PayHero proxy error:', error);
    return json({ error: error?.message || 'Internal Server Error' }, 500);
  }
}
