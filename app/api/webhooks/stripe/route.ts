import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const supabase = await createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode === 'subscription') {
        const subscriptionId = session.subscription as string
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        
        const userId = session.metadata?.userId
        if (!userId) break

        await supabase.from('subscriptions').upsert({
          user_id: userId,
          plan: subscription.items.data[0].plan.interval === 'month' ? 'monthly' : 'yearly',
          status: 'active',
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const status = subscription.status === 'active' ? 'active' : 'lapsed'
      
      await supabase.from('subscriptions').update({
        status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      }).eq('stripe_subscription_id', subscription.id)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      
      await supabase.from('subscriptions').update({
        status: 'lapsed',
      }).eq('stripe_subscription_id', subscription.id)
      break
    }
  }

  return new NextResponse(null, { status: 200 })
}
