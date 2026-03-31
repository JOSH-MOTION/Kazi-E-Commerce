import { NextRequest, NextResponse } from 'next/server';

// Secret key lives ONLY here — never sent to the browser
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    }

    if (!PAYSTACK_SECRET) {
      console.error('PAYSTACK_SECRET_KEY is not set in environment variables');
      return NextResponse.json({ error: 'Payment verification unavailable' }, { status: 500 });
    }

    // Call Paystack's verify endpoint
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await paystackRes.json();

    if (!paystackRes.ok || !data.status) {
      return NextResponse.json(
        { error: data.message || 'Verification failed' },
        { status: 400 }
      );
    }

    const tx = data.data;

    // Return only what the client needs — never expose full Paystack response
    return NextResponse.json({
      verified:   tx.status === 'success',
      status:     tx.status,          // 'success' | 'failed' | 'abandoned'
      amount:     tx.amount / 100,    // convert back from pesewas to GHS
      currency:   tx.currency,
      reference:  tx.reference,
      paidAt:     tx.paid_at,
      channel:    tx.channel,         // 'card' | 'mobile_money' | 'bank' etc.
      customerEmail: tx.customer?.email,
    });
  } catch (err) {
    console.error('Paystack verify error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}