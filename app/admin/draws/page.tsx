import { createAdminClient } from '@/lib/supabase/server'
import { simulateDrawAction, publishDrawAction } from '@/lib/actions/draws'
import { Trophy, Send, Play, Users, Wallet } from 'lucide-react'

export default async function AdminDrawsPage() {
  const supabase = await createAdminClient()
  
  const { data: draws } = await supabase
    .from('draws')
    .select('*, prize_pools(*)')
    .order('created_at', { ascending: false })

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto p-4 py-12 space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-2">
            Admin Console
          </div>
          <h1 className="text-4xl font-black tracking-tight uppercase">Draw <span className="text-primary italic">Management</span></h1>
        </div>

        <div className="flex gap-4">
          <form action={simulateDrawAction.bind(null, currentMonth, 'random')}>
            <button className="btn-primary flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10">
              <Play className="w-4 h-4" /> Simulate Random
            </button>
          </form>
          <form action={simulateDrawAction.bind(null, currentMonth, 'algorithmic')}>
            <button className="btn-primary flex items-center gap-2">
              <Zap className="w-4 h-4" /> Simulate Algo
            </button>
          </form>
        </div>
      </header>

      <div className="grid gap-8">
        {draws?.map((draw) => {
          const pool = draw.prize_pools?.[0]
          return (
            <div key={draw.id} className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{draw.month}</span>
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold">Draw Result</h2>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      draw.status === 'published' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {draw.status}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  {draw.draw_numbers.map((num: number) => (
                    <div key={num} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-primary/20 border border-primary/30 text-primary font-black text-xl">
                      {num}
                    </div>
                  ))}
                </div>
              </div>

              {pool && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Stat label="Total Pool" value={`£${pool.total_pool}`} icon={Wallet} />
                  <Stat label="Jackpot (5/5)" value={`£${pool.five_match_pool}`} icon={Trophy} />
                  <Stat label="4-Match Pool" value={`£${pool.four_match_pool}`} />
                  <Stat label="3-Match Pool" value={`£${pool.three_match_pool}`} />
                </div>
              )}

              {draw.status === 'simulated' && (
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <p className="text-sm text-gray-500 italic max-w-sm">
                    This draw is currently in simulation mode. Review the numbers and pool splits above before publishing to notify winners.
                  </p>
                  <form action={publishDrawAction.bind(null, draw.id)}>
                    <button className="btn-primary flex items-center gap-2 px-8 py-4 text-lg">
                      <Send className="w-5 h-5" /> Publish & Notify
                    </button>
                  </form>
                </div>
              )}
            </div>
          )
        })}

        {(!draws || draws.length === 0) && (
          <div className="text-center py-20 glass rounded-[3rem] border border-dashed border-white/10">
            <p className="text-gray-500 mb-6">No draws have been generated yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, icon: Icon }: { label: string, value: string, icon?: any }) {
  return (
    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-4 h-4 text-gray-500" />}
        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-2xl font-black">{value}</p>
    </div>
  )
}

function Zap(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  )
}
