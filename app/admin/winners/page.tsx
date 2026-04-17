import { createAdminClient } from '@/lib/supabase/server'
import { updateWinnerStatusAction, markAsPaidAction } from '@/lib/actions/winners'
import { Check, X, CreditCard, ExternalLink, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

export default async function AdminWinnersPage() {
  const supabase = await createAdminClient()
  
  const { data: winners } = await supabase
    .from('winners')
    .select('*, users(full_name, email), draws(month)')
    .order('created_at', { ascending: false })

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto p-4 py-12 space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-2">
            System Admin
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Verification <span className="text-primary italic">Center</span></h1>
        </div>
      </header>

      <div className="grid gap-6">
        {winners?.map((win) => (
          <div key={win.id} className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-8 group hover:border-white/10 transition-all duration-300">
            <div className="flex items-center gap-6 flex-1">
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl overflow-hidden glass border border-white/10 shrink-0 relative group/img">
                {win.proof_url ? (
                  <>
                    <img src={win.proof_url} alt="Proof" className="w-full h-full object-cover" />
                    <Link 
                      href={win.proof_url} 
                      target="_blank"
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                    >
                      <ExternalLink className="w-6 h-6 text-white" />
                    </Link>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 gap-2">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-[8px] font-black uppercase tracking-widest">No Proof</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold uppercase tracking-tight">{win.users?.full_name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                    win.match_type === 'JACKPOT' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-primary/10 text-primary border-primary/20'
                  }`}>
                    {win.match_type}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium">{win.users?.email}</p>
                <div className="flex items-baseline gap-2 mt-4">
                  <p className="text-4xl font-black text-white">£{win.prize_amount.toLocaleString()}</p>
                </div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mt-2">Draw: {win.draws?.month}</p>
              </div>
            </div>

            <div className="flex flex-col lg:items-end gap-4 min-w-[240px]">
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                win.status === 'paid' ? 'bg-primary/10 text-primary border-primary/20' : 
                win.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                win.status === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
              }`}>
                {win.status}
              </div>

              <div className="flex gap-2 w-full lg:w-auto">
                {win.status === 'pending' && (
                  <>
                    <form action={updateWinnerStatusAction.bind(null, win.id, 'approved')} className="flex-1">
                      <button className="w-full p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 transition-colors hover:text-white flex items-center justify-center group/btn">
                        <Check className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </form>
                    <form action={updateWinnerStatusAction.bind(null, win.id, 'rejected')} className="flex-1">
                      <button className="w-full p-4 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive transition-colors hover:text-white flex items-center justify-center group/btn">
                        <X className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </form>
                  </>
                )}
                
                {win.status === 'approved' && (
                  <form action={markAsPaidAction.bind(null, win.id)} className="w-full">
                    <button className="w-full py-4 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs hover:opacity-90 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-primary/20">
                       <CreditCard className="w-5 h-5" /> Confirm Payout
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        ))}

        {(!winners || winners.length === 0) && (
          <div className="text-center py-20 glass rounded-[3rem] border border-dashed border-white/10">
            <p className="text-gray-500 font-medium italic">No winners awaiting verification.</p>
          </div>
        )}
      </div>
    </div>
  )
}
