'use server'

import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function createCheckoutSession(formData: FormData) {
  const priceId = formData.get('priceId') as string
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const origin = (await headers()).get('origin')

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${origin}/?success=true`,
    cancel_url: `${origin}/subscribe?canceled=true`,
    metadata: {
      userId: user.id,
    },
  })

  if (!session.url) {
    throw new Error('Failed to create checkout session')
  }

  return redirect(session.url)
}

export async function createPortalSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!subscription?.stripe_customer_id) {
    return redirect('/subscribe')
  }

  const origin = (await headers()).get('origin')

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${origin}/dashboard`,
  })

  return redirect(session.url)
}
