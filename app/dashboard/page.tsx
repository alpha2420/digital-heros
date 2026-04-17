import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createPortalSession } from '@/lib/actions/stripe'
import { ScoreForm } from '@/components/scores/ScoreForm'
import { ScoreList } from '@/components/scores/ScoreList'
import { Trophy, CreditCard, Heart, Calendar, ArrowRight, Target } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all dashboard data in parallel for optimal performance
  const [
    { data: subscription },
    { data: selection },
    { data: scores },
    { data: winnings },
    { data: entries }
  ] = await Promise.all([
    supabase.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('charity_selections').select('*, charities(*)').eq('user_id', user.id).maybeSingle(),
    supabase.from('scores').select('*').eq('user_id', user.id).order('played_date', { ascending: false }).limit(5),
    supabase.from('winners').select('*').eq('user_id', user.id),
    supabase.from('draw_entries').select('*, draws(month)').eq('user_id', user.id).order('id', { ascending: false }).limit(3)
  ])

  const totalWon = winnings?.reduce((acc, curr) => acc + (curr.status === 'paid' ? Number(curr.prize_amount) : 0), 0) || 0
  const pendingWin = winnings?.some(w => w.status === 'pending')

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 py-8 md:py-12 space-y-10 md:space-y-12">
      {/* Dynamic Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-black/5">
        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
            Control Center
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
            Impact <span className="text-primary italic">Dashboard</span>
          </h1>
          <p className="text-gray-400 font-medium">Hello, {user.user_metadata.full_name || 'Impact Maker'}. Current standing and performance.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="glass px-8 py-4 rounded-3xl border border-emerald-500/20 flex flex-col items-end">
            <span className="text-[10px] text-emerald-500/60 font-black uppercase tracking-widest mb-1">Total Prizes Won</span>
            <span className="text-3xl font-black text-emerald-500">£{totalWon.toLocaleString()}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        {/* Main Content: Performance & Participation */}
        <div className="lg:col-span-2 space-y-12">
           {/* Summary Stats */}
           <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card 
                title="Next Draw" 
                icon={Calendar} 
                className="bg-primary/5 border-primary/20"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black">MAY 2026</span>
                  <span className="text-xs text-primary font-black uppercase tracking-widest">Active</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 italic font-medium">Ensure your 5 scores are logged to be eligible.</p>
              </Card>

              <Card title="Draw History" icon={Target}>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black">{entries?.length || 0}</span>
                  <span className="text-xs text-gray-500 font-black uppercase tracking-widest">Draws Entered</span>
                </div>
                <Link href="/dashboard/winnings" className="text-[10px] text-primary font-black uppercase tracking-widest mt-5 flex items-center gap-1.5 hover:translate-x-1 transition-transform">
                  Full Participation History <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Card>
           </section>

           {/* Score Management Mini-Module */}
           <section className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                   Performance Tracker
                </h2>
                <Link href="/dashboard/scores" className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline">Manage All Scores</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                 <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">New Entry</h3>
                    <ScoreForm />
                 </div>
                 <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Recent Activity</h3>
                    <ScoreList scores={scores || []} />
                 </div>
              </div>
           </section>
        </div>

        {/* Sidebar: Subscription & Charity */}
        <div className="space-y-10">
           {/* Subscription Status Card */}
           <section className="space-y-4">
              <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">Subscription Billing</h2>
              <div className="glass p-8 rounded-[2.5rem] border border-black/5 space-y-8">
                 <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Current Membership</p>
                      <p className="text-3xl font-black uppercase italic tracking-tighter">{subscription?.plan || 'NONE'}</p>
                    </div>
                    <div className={`p-4 rounded-2xl ${subscription?.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                       <CreditCard className="w-8 h-8" />
                    </div>
                 </div>

                 <div className="space-y-1.5 pt-4 border-t border-black/5">
                    <div className="flex items-center justify-between text-xs font-medium">
                       <span className="text-gray-500 uppercase tracking-widest text-[9px]">Status</span>
                       <span className={`uppercase font-black ${subscription?.status === 'active' ? 'text-emerald-500' : 'text-destructive'}`}>
                          {subscription?.status || 'No Subscription'}
                       </span>
                    </div>
                    {subscription?.current_period_end && (
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-gray-500 uppercase tracking-widest text-[9px]">Renewal</span>
                        <span className="text-gray-300">{new Date(subscription.current_period_end).toLocaleDateString()}</span>
                      </div>
                    )}
                 </div>

                 <form action={createPortalSession}>
                    <button className="w-full py-4 rounded-2xl bg-black/5 hover:bg-black/10 border border-black/10 text-xs font-black uppercase tracking-widest transition-all active:scale-95 text-white/80">
                      Manage Billing & Invoices
                    </button>
                 </form>
              </div>
           </section>

           {/* Charity Selection Card */}
           <section className="space-y-4">
              <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">Active Choice</h2>
              {selection ? (
                <div className="glass p-8 rounded-[2.5rem] border border-black/5 space-y-8 group overflow-hidden relative">
                   <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Partner Charity</p>
                        <p className="text-2xl font-black leading-tight uppercase tracking-tight">{selection.charities?.name}</p>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Impact Level</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black text-primary italic">{selection.contribution_percent}%</span>
                          <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Share</span>
                        </div>
                      </div>
                   </div>
                   <Link href="/onboarding" className="w-full py-4 rounded-2xl bg-primary/10 text-primary text-xs font-black uppercase tracking-widest text-center block hover:bg-primary/20 transition-all border border-primary/20 active:scale-95">
                      Change Impact Choice
                   </Link>
                </div>
              ) : (
                <div className="glass p-8 rounded-[3rem] border border-dashed border-black/10 text-center space-y-6 py-12">
                   <div className="p-4 bg-black/5 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                     <Heart className="w-8 h-8 text-gray-700" />
                   </div>
                   <p className="text-sm text-gray-500 font-medium italic">No charity selected yet.</p>
                   <Link href="/onboarding" className="w-full py-4 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                      Select A Cause <ArrowRight className="w-4 h-4" />
                   </Link>
                </div>
              )}
           </section>

           {/* Pending Win Alert */}
           {pendingWin && (
             <Link href="/dashboard/winnings" className="block transform hover:scale-105 transition-all duration-300">
                <div className="p-5 rounded-[2rem] bg-amber-500 text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-amber-500/20">
                  <div className="p-2 bg-black/10 rounded-xl">
                    <Trophy className="w-5 h-5 flex-shrink-0" />
                  </div>
                  Claim Your Pending Prize
                </div>
             </Link>
           )}
        </div>
      </div>
    </div>
  )
}

function Card({ title, icon: Icon, children, className = '' }: { title: string, icon: any, children: React.ReactNode, className?: string }) {
  return (
    <div className={`glass p-8 rounded-[2.5rem] border border-black/5 flex flex-col justify-center space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-black/5 rounded-lg">
          <Icon className="w-3.5 h-3.5 text-gray-400" />
        </div>
        <h2 className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">{title}</h2>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
