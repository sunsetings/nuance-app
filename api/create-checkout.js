const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || "https://zehwsrjfwgdrmnnclezl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BMWfC_3FdJkW7RMqYW1tcQ_cj79O7Y1";

function getBearerToken(req) {
  const authHeader = req.headers.authorization || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

function getPriceIdForPlan(plan) {
  if (plan === "yearly") return process.env.VITE_STRIPE_YEARLY_PRICE_ID;
  if (plan === "monthly") return process.env.VITE_STRIPE_MONTHLY_PRICE_ID;
  return null;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const { plan } = body;
  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({ error: "Please sign in before upgrading." });
  }

  if (!plan || !["monthly", "yearly"].includes(plan)) {
    return res.status(400).json({ error: "Invalid plan selected." });
  }

  const priceId = getPriceIdForPlan(plan);
  if (!priceId) {
    return res.status(500).json({ error: "Payment setup is missing. Please try again in a moment." });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: "Your session expired. Please sign in again." });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || req.headers.origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user.id,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        plan,
      },
      success_url: `${siteUrl}/app`,
      cancel_url: `${siteUrl}/app`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error.message);
    return res.status(500).json({ error: "Payment setup error. Please contact support or try again later." });
  }
};
