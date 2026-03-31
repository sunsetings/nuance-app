const Stripe = require("stripe");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const { priceId, userId, userEmail } = body;

  if (!priceId) {
    return res.status(400).json({ error: "Missing priceId" });
  }

  if (!userId) {
    return res.status(400).json({ error: "Please sign in before upgrading." });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || req.headers.origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: userId,
      customer_email: userEmail,
      success_url: `${siteUrl}/app`,
      cancel_url: `${siteUrl}/app`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};
