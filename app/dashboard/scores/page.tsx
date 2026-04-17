import { createClient } from '@/lib/supabase/server'
import { ScoreForm } from '@/components/scores/ScoreForm'
import { ScoreList } from '@/components/scores/ScoreList'
import { redirect } from 'next/navigation'

export default async function ScoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: scores } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', user.id)
    .order('played_date', { ascending: false })

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto p-4 py-12 space-y-12">
      <header className="text-center">
        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
          Performance Tracking
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">Your <span className="text-primary italic">Scores</span></h1>
        <p className="text-gray-400">Track your performance and secure your eligibility for the next draw.</p>
      </header>

      <div className="space-y-10">
        <section className="space-y-3">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">Log New Activity</h2>
          <ScoreForm />
        </section>

        <section className="space-y-5">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">Recent Performance</h2>
          <ScoreList scores={scores || []} />
        </section>
      </div>
    </div>
  )
}
