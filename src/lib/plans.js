export const PLANS = {
  FREE: {
    id: "free",
    name: "Gratis",
    price: 0,
    credits: 10000,
    validityDays: 30,
    type: "subscription",
    tier: "FREE"
  },
  CREATOR: {
    id: "creator",
    name: "Creator",
    price: 99000,
    credits: 200000,
    validityDays: 30,
    type: "subscription",
    tier: "CREATOR",
    isPopular: true
  },
  PRO: {
    id: "pro",
    name: "Pro",
    price: 199000,
    credits: 600000,
    validityDays: 30,
    type: "subscription",
    tier: "PRO"
  },
  BUSINESS: {
    id: "business",
    name: "Business",
    price: -1, // Indicates contact us
    credits: -1, // Unlimited / Custom
    validityDays: 30,
    type: "subscription",
    tier: "BUSINESS"
  }
};
