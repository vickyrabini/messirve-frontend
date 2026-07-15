-- =============================================
-- Distingue "desactivado por falta de pago" de otras razones para que
-- is_active sea false (pendiente de revisión de admin, desactivado a mano).
-- Sólo se marca true cuando el webhook de Stripe es quien apaga is_active
-- por un cobro de renovación fallido, así sabe si le corresponde
-- reactivarlo automáticamente cuando el pago se regulariza.
-- =============================================
alter table public.services
  add column if not exists suspended_for_nonpayment boolean not null default false;

comment on column public.services.suspended_for_nonpayment is
  'True when is_active was set to false by the Stripe webhook due to a failed renewal charge (subscription past_due/unpaid). Used to know whether to auto re-enable on payment recovery, as opposed to services disabled for other reasons (pending admin review, manual deactivation).';
