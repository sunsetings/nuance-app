const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim();
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "Payment setup error. Please contact support or try again later." });
  }

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return res.status(500).json({ error: "Account setup error. Please contact support or try again later." });
  }

  try {
    const accessToken = getBearerToken(req);
    if (!accessToken) {
      return res.status(401).json({ error: "Please sign in first." });
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user?.id) {
      return res.status(401).json({ error: "Please sign in again." });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("stripe_customer_id,is_pro")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.is_pro || !profile?.stripe_customer_id) {
      return res.status(400).json({ error: "No active Pro subscription found." });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = req.headers.origin || process.env.NEXT_PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL || "https://www.tonara.app";
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/app`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Create portal failed:", error);
    return res.status(500).json({ error: "Couldn't open subscription settings right now." });
  }
};
