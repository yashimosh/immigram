import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession, type PlanKey, POLAR_PRODUCTS } from "@/lib/polar";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await request.json() as { plan: PlanKey };
  if (!POLAR_PRODUCTS[plan]) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?status=success`;

  const checkoutUrl = await createCheckoutSession({
    plan,
    userEmail: user.email!,
    successUrl,
  });

  return NextResponse.json({ checkoutUrl });
}
