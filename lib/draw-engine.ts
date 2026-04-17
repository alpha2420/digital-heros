import { createAdminClient } from '@/lib/supabase/server'

/**
 * Generates 5 unique numbers between 1 and 45.
 * @param mode 'random' or 'algorithmic' (weighted by frequency of existing scores)
 */
export async function generateNumbers(mode: 'random' | 'algorithmic') {
  if (mode === 'random') {
    const numbers = new Set<number>()
    while (numbers.size < 5) {
      numbers.add(Math.floor(Math.random() * 45) + 1)
    }
    return Array.from(numbers).sort((a, b) => a - b)
  }

  // Algorithmic: Weighted by frequency across all users
  const supabase = await createAdminClient()
  const { data: scores } = await supabase.from('scores').select('score')
  
  const frequencyMap: Record<number, number> = {}
  for (let i = 1; i <= 45; i++) frequencyMap[i] = 1 // Baseline weight to ensure every number can be picked
  
  scores?.forEach(s => {
    frequencyMap[s.score] = (frequencyMap[s.score] || 0) + 1
  })

  const numbers = new Set<number>()
  const entries = Object.entries(frequencyMap).map(([score, weight]) => ({
    score: parseInt(score),
    weight
  }))

  while (numbers.size < 5) {
    const totalWeight = entries.reduce((acc, curr) => acc + curr.weight, 0)
    let random = Math.random() * totalWeight
    for (const entry of entries) {
      random -= entry.weight
      if (random <= 0) {
        numbers.add(entry.score)
        break
      }
    }
  }

  return Array.from(numbers).sort((a, b) => a - b)
}

/**
 * Calculates match tiers and prize splits based on active subscribers.
 */
export async function calculatePoolAndWinners(drawNumbers: number[], previousJackpot: number = 0) {
  const supabase = await createAdminClient()
  
  // 1. Fetch active subscribers
  const { data: activeSubs } = await supabase
    .from('subscriptions')
    .select('user_id, plan')
    .eq('status', 'active')

  if (!activeSubs || activeSubs.length === 0) return null

  // 2. Calculate Total Pool (Example: 50% of £10 monthly fee equivalent)
  const subscriberCount = activeSubs.length
  const totalPool = subscriberCount * 10 * 0.5 
  
  const fiveMatchPool = totalPool * 0.40 + previousJackpot
  const fourMatchPool = totalPool * 0.35
  const threeMatchPool = totalPool * 0.25

  // 3. Fetch scores for these users
  const userIds = activeSubs.map(s => s.user_id)
  const { data: allScores } = await supabase
    .from('scores')
    .select('user_id, score')
    .in('user_id', userIds)

  const userScoresMap: Record<string, number[]> = {}
  allScores?.forEach(s => {
    if (!userScoresMap[s.user_id]) userScoresMap[s.user_id] = []
    userScoresMap[s.user_id].push(s.score)
  })

  // 4. Find Matches
  const results = {
    fiveMatch: [] as string[],
    fourMatch: [] as string[],
    threeMatch: [] as string[],
  }

  Object.entries(userScoresMap).forEach(([userId, userScores]) => {
    const matchedNumbers = userScores.filter(s => drawNumbers.includes(s))
    const count = matchedNumbers.length
    
    if (count === 5) results.fiveMatch.push(userId)
    else if (count === 4) results.fourMatch.push(userId)
    else if (count === 3) results.threeMatch.push(userId)
  })

  return {
    subscriberCount,
    totalPool,
    fiveMatchPool,
    fourMatchPool,
    threeMatchPool,
    results,
    drawNumbers
  }
}
