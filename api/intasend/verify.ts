// Vercel Edge Function: IntaSend Verify Payment
export const config = { runtime: 'edge' };

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    return json({ error: 'Method Not Allowed' }, 405);
  }

  try {
    const url = new URL(req.url);
    const transactionId = url.searchParams.get('transactionId');
    if (!transactionId) {
      return json({ error: 'Missing transactionId' }, 400);
    }

    const secretKey = (process.env.INTASEND_SECRET_KEY || process.env.VITE_INTASEND_API_SECRET) as string | undefined;
    const envBase = (process.env.VITE_INTASEND_BASE_URL as string) || 'https://payment.intasend.com/api/v1';
    if (!secretKey) {
      return json({ error: 'IntaSend secret key is not configured' }, 500);
    }

    const response = await fetch(`${envBase}/payments/${transactionId}/`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return json({ error: text || `Verify failed with status ${response.status}` }, response.status);
    }

    const data = await response.json();
    return json({ success: true, status: data.state, raw: data }, 200);
  } catch (error: any) {
    return json({ error: error?.message || 'Internal Server Error' }, 500);
  }
}
