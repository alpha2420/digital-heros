'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addScoreAction(formData: FormData) {
  const score = parseInt(formData.get('score') as string)
  const playedDate = formData.get('playedDate') as string
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // 1. Check current score count
  const { count } = await supabase
    .from('scores')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // 2. FIFO Logic: If we have 5 or more, delete the oldest
  if (count !== null && count >= 5) {
    const { data: oldestScores } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', user.id)
      .order('played_date', { ascending: true })
      .order('created_at', { ascending: true }) // Tie-breaker
      .limit(1)

    if (oldestScores && oldestScores.length > 0) {
      await supabase.from('scores').delete().eq('id', oldestScores[0].id)
    }
  }

  // 3. Insert new score
  const { error } = await supabase.from('scores').insert({
    user_id: user.id,
    score,
    played_date: playedDate
  })

  if (error) {
    if (error.code === '23505') {
       return { error: 'You already have a score for this date.' }
    }
    return { error: error.message }
  }

  revalidatePath('/dashboard/scores')
  return { success: true }
}

export async function updateScoreAction(id: string, formData: FormData) {
  const score = parseInt(formData.get('score') as string)
  const playedDate = formData.get('playedDate') as string
  
  const supabase = await createClient()
  const { error } = await supabase
    .from('scores')
    .update({ score, played_date: playedDate })
    .eq('id', id)

  if (error) {
    if (error.code === '23505') {
       return { error: 'You already have a score for this date.' }
    }
    return { error: error.message }
  }

  revalidatePath('/dashboard/scores')
  return { success: true }
}

export async function deleteScoreAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('scores').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/scores')
  return { success: true }
}
