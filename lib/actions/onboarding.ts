'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function saveOnboarding(formData: FormData) {
  const charityId = formData.get('charityId') as string
  const contributionPercent = parseInt(formData.get('contribution') as string)
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase
    .from('charity_selections')
    .insert({
      user_id: user.id,
      charity_id: charityId,
      contribution_percent: contributionPercent
    })

  if (error) {
    redirect(`/onboarding?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/')
}
