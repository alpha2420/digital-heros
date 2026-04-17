'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'

// Charity Discovery Actions
export async function getCharities(search?: string) {
  const supabase = await createClient()
  let query = supabase.from('charities').select('*')
  
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }
  
  const { data, error } = await query.order('is_featured', { ascending: false }).order('name')
  if (error) throw new Error(error.message)
  return data
}

export async function getCharityById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('charities').select('*').eq('id', id).single()
  if (error) throw new Error(error.message)
  return data
}

// User Preference Actions
export async function updateCharitySelectionAction(formData: FormData) {
  const charityId = formData.get('charityId') as string
  const contribution = parseInt(formData.get('contribution') as string)
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('charity_selections')
    .upsert({
      user_id: user.id,
      charity_id: charityId,
      contribution_percent: contribution
    }, { onConflict: 'user_id' })

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard')
  return { success: true }
}

// Donation Action
export async function createDonationSession(charityId: string, amount: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const origin = (await headers()).get('origin')

  const { data: charity } = await supabase.from('charities').select('name').eq('id', charityId).single()

  const session = await stripe.checkout.sessions.create({
    customer_email: user?.email,
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `Donation to ${charity?.name || 'Charity'}`,
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${origin}/charities/${charityId}?success=true`,
    cancel_url: `${origin}/charities/${charityId}?canceled=true`,
    metadata: {
      charityId,
      userId: user?.id || null,
      type: 'one_time_donation'
    }
  })

  if (!session.url) throw new Error('Failed to create donation session')
  redirect(session.url)
}

// Admin Actions
export async function createCharityAction(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const imageUrl = formData.get('imageUrl') as string
  const isFeatured = formData.get('isFeatured') === 'on'
  
  const supabase = await createAdminClient()
  const { error } = await supabase.from('charities').insert({
    name,
    description,
    image_url: imageUrl,
    is_featured: isFeatured,
    events: []
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/charities')
  revalidatePath('/charities')
  return { success: true }
}

export async function deleteCharityAction(id: string) {
  const supabase = await createAdminClient()
  const { error } = await supabase.from('charities').delete().eq('id', id)
  
  if (error) return { error: error.message }
  revalidatePath('/admin/charities')
  revalidatePath('/charities')
  return { success: true }
}
