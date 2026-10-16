import type { SubscriptionStatus } from "@/types/database";

export type PaymentKey = "paid" | "overdue" | "pending" | "canceled" | "none";

export const paymentKeyByStatus: Record<SubscriptionStatus, PaymentKey> = {
  active: "paid",
  trialing: "paid",
  past_due: "overdue",
  unpaid: "overdue",
  canceled: "canceled",
  incomplete: "pending",
  incomplete_expired: "pending",
  paused: "pending",
};

export const paymentBadge: Record<
  PaymentKey,
  { label: string; className: string }
> = {
  paid: { label: "Pagado", className: "bg-[#E7F1E9] text-[#2E7D46]" },
  overdue: { label: "Pago vencido", className: "bg-red-50 text-red-500" },
  pending: { label: "Pendiente", className: "bg-dorado/15 text-dorado-dark" },
  canceled: { label: "Cancelado", className: "bg-gris/20 text-muted" },
  none: { label: "Sin pago", className: "bg-gris/20 text-muted" },
};

export const PAYMENT_KEYS = Object.keys(paymentBadge) as PaymentKey[];

export const isPaymentKey = (value: string | undefined): value is PaymentKey =>
  !!value && Object.hasOwn(paymentBadge, value);
