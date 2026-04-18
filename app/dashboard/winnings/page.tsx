import { createClient } from '@/lib/supabase/server'
import { ProofUpload } from '@/components/winners/ProofUpload'
import { redirect } from 'next/navigation'
import { Trophy, Clock, CheckCircle2, XCircle, CreditCard } from 'lucide-react'

export default async function WinningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: winnings } = await supabase
    .from('winners')
    .select('*, draws(month)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const totalWon = winnings?.reduce((acc, curr) => acc + (curr.status === 'paid' ? curr.prize_amount : 0), 0) || 0

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-4 py-12 space-y-12">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-2">
            Prize History
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Your <span className="text-primary italic">Winnings</span></h1>
        </div>
        
        <div className="glass p-6 rounded-[2rem] border border-emerald-500/20 text-right">
          <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest mb-1">Total Paid Out</p>
          <p className="text-3xl font-black text-emerald-500">£{totalWon.toLocaleString()}</p>
        </div>
      </header>

      <div className="grid gap-6">
        {winnings?.map((win) => (
          <div key={win.id} className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:border-white/10 transition-all duration-300">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Trophy className="w-8 h-8 text-amber-500" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none mb-1">
                   Draw: {win.draws?.month || 'Unknown'}
                </p>
                <h3 className="text-2xl font-black italic uppercase tracking-tight leading-none">
                  {win.match_type} Winner
                </h3>
                <p className="text-2xl font-black text-primary">£{win.prize_amount.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex flex-col md:items-end gap-4 min-w-[280px]">
              <StatusBadge status={win.status} />
              
              {!win.proof_url && win.status === 'pending' && (
                <div className="w-full">
                  <ProofUpload winnerId={win.id} />
                </div>
              )}

              {win.proof_url && win.status === 'pending' && (
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium italic">
                  <Clock className="w-4 h-4" /> Proof submitted. Admin review in progress.
                </div>
              )}
            </div>
          </div>
        ))}

        {(!winnings || winnings.length === 0) && (
          <div className="text-center py-24 glass rounded-[3rem] border border-dashed border-white/10 space-y-4">
             <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
               <Trophy className="w-8 h-8 text-gray-600" />
             </div>
             <p className="text-gray-500 font-medium italic">You haven't won any draws yet. Keep playing to make history!</p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { icon: any, color: string, bg: string, border: string, label: string }> = {
    pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Pending Verification' },
    approved: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Approved' },
    rejected: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20', label: 'Rejected' },
    paid: { icon: CreditCard, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', label: 'Paid Out' },
  }

  const config = configs[status] || configs.pending

  return (
    <div className={`px-4 py-1.5 rounded-full ${config.bg} ${config.color} border ${config.border} flex items-center gap-2 text-[10px] font-black uppercase tracking-wider`}>
      <config.icon className="w-3.5 h-3.5" />
      {config.label}
    </div>
  )
}
