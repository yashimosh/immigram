import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateEvent } from "@polar-sh/sdk/webhooks";

// Polar webhooks — subscription.created / subscription.updated / subscription.canceled
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("webhook-signature") ?? "";

  // Convert Headers to plain object for validateEvent
  const headersObj: Record<string, string> = {};
  request.headers.forEach((value, key) => { headersObj[key] = value; });

  let event: ReturnType<typeof validateEvent>;
  try {
    event = validateEvent(body, headersObj, process.env.POLAR_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const supabase = await createClient();

  if (event.type === "subscription.created" || event.type === "subscription.updated") {
    const sub = event.data;
    const customerEmail = sub.customer?.email;
    const productId = sub.productId;
    const isActive = sub.status === "active";

    if (!customerEmail || !isActive) return NextResponse.json({ ok: true });

    // Match plan from product ID
    const planEntry = Object.entries({
      pro: process.env.POLAR_PRODUCT_ID_PRO,
      agency: process.env.POLAR_PRODUCT_ID_AGENCY,
    }).find(([, id]) => id === productId);

    if (!planEntry) return NextResponse.json({ ok: true });
    const [plan] = planEntry;

    // Find user by email
    const { data: userData } = await supabase
      .from("imm_users")
      .select("id")
      .eq("email", customerEmail)
      .single();

    if (!userData) return NextResponse.json({ ok: true });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 32); // ~1 month buffer

    await supabase
      .from("imm_users")
      .update({
        subscription_tier: plan,
        subscription_expires_at: expiresAt.toISOString(),
      })
      .eq("id", userData.id);
  }

  if (event.type === "subscription.canceled") {
    const sub = event.data;
    const customerEmail = sub.customer?.email;
    if (!customerEmail) return NextResponse.json({ ok: true });

    await supabase
      .from("imm_users")
      .update({ subscription_tier: "free", subscription_expires_at: null })
      .eq("email", customerEmail);
  }

  return NextResponse.json({ ok: true });
}
