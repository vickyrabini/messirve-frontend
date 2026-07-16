import Stripe from 'stripe'

// Server-only: never import this from a Client Component.
export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error('Missing Stripe credentials (STRIPE_SECRET_KEY)')
  }

  return new Stripe(secretKey, {
    apiVersion: '2026-06-24.dahlia',
  })
}
