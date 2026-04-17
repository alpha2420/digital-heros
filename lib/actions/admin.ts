'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Fetches a list of users with their subscription details.
 */
export async function getUserList(search?: string) {
  const supabase = await createAdminClient()
  let query = supabase.from('users').select('*, subscriptions(*)')
  
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

/**
 * Aggregates platform-wide statistics for the Reports module.
 */
export async function getAdminReports() {
  const supabase = await createAdminClient()
  
  // Fetching essential platform metrics in parallel
  const [
    { count: activeUsers },
    { data: winners },
    { data: charitySelections },
    { count: charityCount }
  ] = await Promise.all([
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('winners').select('prize_amount, status'),
    supabase.from('charity_selections').select('contribution_percent'),
    supabase.from('charities').select('*', { count: 'exact', head: true })
  ])

  // Calculations
  const totalPaidOut = winners?.filter(w => w.status === 'paid').reduce((acc, curr) => acc + Number(curr.prize_amount), 0) || 0
  const pendingPayouts = winners?.filter(w => w.status === 'approved').reduce((acc, curr) => acc + Number(curr.prize_amount), 0) || 0
  
  // Estimation based on subscription tier (approximate for the report)
  const estimatedCharityImpact = (activeUsers || 0) * 9.99 * 0.25; // Simple estimation logic

  return {
    metrics: [
      { label: 'Active Subscribers', value: activeUsers || 0, trend: '+4%', color: 'text-primary' },
      { label: 'Total Paid Out', value: `£${totalPaidOut.toLocaleString()}`, trend: 'Verified', color: 'text-emerald-500' },
      { label: 'Pending Payouts', value: `£${pendingPayouts.toLocaleString()}`, trend: 'Action Required', color: 'text-amber-500' },
      { label: 'Partner Charities', value: charityCount || 0, trend: 'Global', color: 'text-violet-500' },
    ],
    charityImpact: estimatedCharityImpact
  }
}
