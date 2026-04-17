'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { generateNumbers, calculatePoolAndWinners } from '@/lib/draw-engine'
import { revalidatePath } from 'next/cache'

export async function simulateDrawAction(month: string, mode: 'random' | 'algorithmic') {
  const supabase = await createAdminClient()

  // 1. Get previous jackpot carry over
  const { data: previousDraws } = await supabase
    .from('prize_pools')
    .select('jackpot_carried_over')
    .order('created_at', { ascending: false })
    .limit(1)

  const carryOver = previousDraws?.[0]?.jackpot_carried_over || 0

  // 2. Generate numbers
  const drawNumbers = await generateNumbers(mode)

  // 3. Calculate winners
  const data = await calculatePoolAndWinners(drawNumbers, carryOver)
  if (!data) return { error: 'No active subscribers found.' }

  // 4. Save as draft/simulated draw
  const { data: draw, error: drawError } = await supabase
    .from('draws')
    .insert({
      month,
      status: 'simulated',
      draw_numbers: drawNumbers,
      jackpot_amount: data.fiveMatchPool
    })
    .select()
    .single()

  if (drawError) return { error: drawError.message }

  // 5. Save simulated prize pool
  await supabase.from('prize_pools').insert({
    draw_id: draw.id,
    total_pool: data.totalPool,
    five_match_pool: data.fiveMatchPool,
    four_match_pool: data.fourMatchPool,
    three_match_pool: data.threeMatchPool,
    jackpot_carried_over: 0 // Will be set on publish if no 5-match winners
  })

  revalidatePath('/admin/draws')
  return { success: true, drawId: draw.id }
}

export async function publishDrawAction(drawId: string) {
  const supabase = await createAdminClient()

  // 1. Fetch draw and simulated pool
  const { data: draw } = await supabase.from('draws').select('*').eq('id', drawId).single()
  const { data: pool } = await supabase.from('prize_pools').select('*').eq('draw_id', drawId).single()

  if (!draw || !pool) return { error: 'Draw or pool not found.' }

  // 2. Re-calculate winners to be sure
  // (In a real app, you might want to lock this during simulation)
  const carryOver = pool.five_match_pool - (pool.total_pool * 0.40)
  const data = await calculatePoolAndWinners(draw.draw_numbers, carryOver)
  if (!data) return { error: 'Failed to calculate winners for publication.' }

  // 3. Record Draw Entries and Winners
  const entries: any[] = []
  
  // Helper to record winners per tier
  const recordWinners = async (userIds: string[], amount: number, matchCount: number, type: string) => {
    if (userIds.length === 0) return
    const prizePerPerson = amount / userIds.length
    
    for (const userId of userIds) {
      entries.push({
        draw_id: drawId,
        user_id: userId,
        match_count: matchCount,
        prize_amount: prizePerPerson
      })
      
      await supabase.from('winners').insert({
        draw_id: drawId,
        user_id: userId,
        match_type: type,
        prize_amount: prizePerPerson,
        status: 'pending'
      })
    }
  }

  await recordWinners(data.results.fiveMatch, data.fiveMatchPool, 5, 'JACKPOT')
  await recordWinners(data.results.fourMatch, data.fourMatchPool, 4, '4-MATCH')
  await recordWinners(data.results.threeMatch, data.threeMatchPool, 3, '3-MATCH')

  if (entries.length > 0) {
    await supabase.from('draw_entries').insert(entries)
  }

  // 4. Handle Jackpot carry over if no 5-match winners
  const finalCarryOver = data.results.fiveMatch.length === 0 ? data.fiveMatchPool : 0
  
  await supabase.from('prize_pools')
    .update({ jackpot_carried_over: finalCarryOver })
    .eq('draw_id', drawId)

  // 5. Publish Draw
  await supabase.from('draws').update({ status: 'published' }).eq('id', drawId)

  // 6. Placeholder for Email Notification
  console.log(`PUBLISHED DRAW ${drawId}: Notifying winners...`)

  revalidatePath('/admin/draws')
  return { success: true }
}
