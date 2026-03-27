import { Polar } from "@polar-sh/sdk";

export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
});

// ---------------------------------------------------------------------------
// Plans — add POLAR_PRODUCT_ID_PRO and POLAR_PRODUCT_ID_AGENCY to .env.local
// after creating products in Polar dashboard
// ---------------------------------------------------------------------------
export const POLAR_PRODUCTS = {
  pro: {
    productId: process.env.POLAR_PRODUCT_ID_PRO!,
    name: "Pro",
    priceUsd: 29,
    description: "For self-filers",
  },
  agency: {
    productId: process.env.POLAR_PRODUCT_ID_AGENCY!,
    name: "Agency",
    priceUsd: 99,
    description: "For lawyers & consultants",
  },
} as const;

export type PlanKey = keyof typeof POLAR_PRODUCTS;

// ---------------------------------------------------------------------------
// Create a Polar checkout session — returns a URL to redirect the user to
// ---------------------------------------------------------------------------
export async function createCheckoutSession(params: {
  plan: PlanKey;
  userEmail: string;
  successUrl: string;
}): Promise<string> {
  const product = POLAR_PRODUCTS[params.plan];

  const checkout = await polar.checkouts.create({
    productId: product.productId,
    customerEmail: params.userEmail,
    successUrl: params.successUrl,
  });

  return checkout.url;
}
