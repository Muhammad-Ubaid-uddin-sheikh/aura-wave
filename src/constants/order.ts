export const shippingOptions = [
  { label: "Free shipping", value: "Free Delivery", cost: 0 },
  // { label: "Fast & Secure Delivery (2–3 Days)", value: "Fast Delivery", cost: 299 },
] as const

export const provinces = [
  "Sindh",
  "Punjab",
  "Balochistan",
  "Azad Kashmir",
  "Gilgit Baltistan",
  "Federally Administered Tribal Areas (FATA)",
] as const

export const FIVE_MINUTES = 5 * 60 * 1000;
export const ORDERS_LIMIT = 50;

export const INITIAL_EDITABLE_SECTIONS = {
    customer: false,
    items: false,
    billing: false,
    discountAmount: false,
    paymentMethod: false,
    shippingMethod: false,
    shippingCost: false,
    subtotalAmount: false,
    totalAmount: false,
};

// not used for now because not working by export and import
export const statusColors: Record<string, string> = {
  pending: "bg-yellow-200 text-yellow-700 hover:bg-yellow-300",
  confirmed: "bg-sky-100 text-sky-700 hover:bg-sky-200",
  shipped: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
  delivered: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  cancelled: "bg-rose-100 text-rose-700 hover:bg-rose-200",
  returned: "bg-orange-100 text-orange-700 hover:bg-orange-200",
};