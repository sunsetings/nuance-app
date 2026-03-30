import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(Buffer.from(data)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rawBody = await getRawBody(req);
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.client_reference_id;

      if (userId) {
        const { error } = await supabase
          .from("profiles")
          .update({
            is_pro: true,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
          })
          .eq("id", userId);

        if (error) {
          console.error("Supabase update failed:", error.message);
          return res.status(500).json({ error: "Database update failed" });
        }

        console.log(`User ${userId} upgraded to Pro ✅`);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;

      const { error } = await supabase
        .from("profiles")
        .update({ is_pro: false })
        .eq("stripe_subscription_id", subscription.id);

      if (error) {
        console.error("Supabase downgrade failed:", error.message);
        return res.status(500).json({ error: "Database update failed" });
      }

      console.log(`Subscription ${subscription.id} cancelled — Pro removed`);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return res.status(200).json({ received: true });
}
