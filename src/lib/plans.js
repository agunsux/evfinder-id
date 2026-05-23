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
  STARTER: {
    id: "starter",
    name: "Starter",
    price: 19000,
    credits: 50000,
    validityDays: 30,
    type: "topup", // From PRICING_STRATEGY: Rp 19.000 (Sekali) but server.js webhook says if type==='topup' & id==='starter' it updates tier
    tier: "STARTER"
  },
  KREATOR: {
    id: "kreator",
    name: "Kreator",
    price: 49000,
    yearlyPrice: 490000,
    credits: 150000,
    validityDays: 30,
    type: "subscription",
    tier: "KREATOR",
    isPopular: true
  },
  PRODUKTIF: {
    id: "produktif",
    name: "Produktif",
    price: 99000,
    yearlyPrice: 990000,
    credits: 400000,
    validityDays: 30,
    type: "subscription",
    tier: "PRODUKTIF"
  },
  BISNIS: {
    id: "bisnis",
    name: "Bisnis",
    price: 249000,
    yearlyPrice: 2490000,
    credits: 1500000,
    validityDays: 30,
    type: "subscription",
    tier: "BISNIS"
  },
  TOPUP_RECEH: {
    id: "topup_receh",
    name: "Paket Receh",
    price: 25000,
    credits: 60000,
    type: "topup"
  },
  TOPUP_AMAN: {
    id: "topup_aman",
    name: "Paket Aman",
    price: 75000,
    credits: 200000,
    type: "topup"
  },
  TOPUP_DARURAT: {
    id: "topup_darurat",
    name: "Paket Darurat Bisnis",
    price: 150000,
    credits: 500000,
    type: "topup"
  }
};
