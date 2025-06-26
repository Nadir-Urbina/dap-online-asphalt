import { loadStripe } from '@stripe/stripe-js';

// Client-side Stripe instance only
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
); 