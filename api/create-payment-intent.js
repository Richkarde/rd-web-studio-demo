// This file lives at /api/create-payment-intent.js
// Vercel automatically turns this into a secure backend endpoint at:
// https://yoursite.vercel.app/api/create-payment-intent
//
// It uses your STRIPE_SECRET_KEY (stored safely in Vercel's Environment Variables)
// to ask Stripe to create a $30 payment, and sends back just enough info
// for the payment form on your site to securely collect the card.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    const params = new URLSearchParams();
    params.append('amount', '3000'); // $30.00 in cents
    params.append('currency', 'usd');
    params.append('automatic_payment_methods[enabled]', 'true');
    params.append('description', 'RD Design Co. — $30 design deposit');

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(secretKey + ':').toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'Stripe error' });
    }

    return res.status(200).json({ clientSecret: data.client_secret });
  } catch (err) {
    return res.status(500).json({ error: 'Server error creating payment' });
  }
}