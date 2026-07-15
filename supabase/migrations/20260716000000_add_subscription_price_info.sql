-- =============================================
-- Snapshot the subscription's price on our side, so the UI can display
-- amount/currency without a live Stripe API call on page render.
-- Populated by the webhook (app/api/stripe/webhook/route.ts) from
-- subscription.items.data[0].price on checkout.session.completed and
-- customer.subscription.updated/deleted.
-- =============================================
alter table public.subscriptions
  add column if not exists amount integer,
  add column if not exists currency text;

comment on column public.subscriptions.amount is
  'Price snapshot in the currency''s smallest unit (e.g. cents), mirrors Stripe Price.unit_amount.';
comment on column public.subscriptions.currency is
  'Lowercase 3-letter ISO currency code, mirrors Stripe Price.currency.';
