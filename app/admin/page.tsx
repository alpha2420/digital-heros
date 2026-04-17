import { getAdminReports } from '@/lib/actions/admin'
import { Rocket, Target, Heart, Trophy, BarChart3, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export default async function AdminOverviewPage() {
  const reports = await getAdminReports()

  return (
    <div className="p-8 space-y-12">
      <header className="space-y-2">
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Administrative <span className="text-primary italic">Overview</span></h1>
        <p className="text-gray-400 font-medium font-outfit uppercase tracking-tighter">System status, performance, and impact metrics.</p>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reports.metrics.map((metric) => (
          <div key={metric.label} className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-4 hover:border-white/10 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{metric.label}</span>
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <BarChart3 className="w-3.5 h-3.5 text-primary" />
              </div>
            </div>
            <div className={`text-4xl font-black tracking-tighter ${metric.color}`}>
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">Management Hub</h2>
          <div className="grid grid-cols-1 gap-4">
             <ActionCard 
                href="/admin/draws" 
                title="Publish Monthly Draw" 
                description="Finalize simulated results and notify winners."
                icon={Rocket}
                color="text-primary"
             />
             <ActionCard 
                href="/admin/charities" 
                title="Manage Partner Registry" 
                description="Update partner mission details and events."
                icon={Heart}
                color="text-violet-500"
             />
             <ActionCard 
                href="/admin/winners" 
                title="Verify Prize Claims" 
                description="Review proof screenshots and payouts."
                icon={Trophy}
                color="text-amber-500"
             />
          </div>
        </div>

        {/* Live Status Section */}
        <div className="space-y-6">
           <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">Environment Health</h2>
           <div className="glass p-10 rounded-[3rem] border border-white/5 space-y-10 flex flex-col justify-center h-full">
              <div className="space-y-4 text-center">
                 <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto border border-emerald-500/20">
                    <Target className="w-10 h-10 text-emerald-500" />
                 </div>
                 <h3 className="text-2xl font-black uppercase italic tracking-tight leading-none">Status: <span className="text-emerald-500">Nominal</span></h3>
                 <p className="text-gray-400 text-sm font-medium italic">Global systems connected. Stripe and Auth services are active.</p>
              </div>
              
              <div className="pt-8 border-t border-white/5 space-y-5">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none">API Latency</span>
                    <span className="flex items-center gap-2 text-xs font-black text-emerald-500 uppercase">
                       Under 24ms
                    </span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none">Database</span>
                    <span className="flex items-center gap-2 text-xs font-black text-emerald-500 uppercase">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Secure
                    </span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

function ActionCard({ href, title, description, icon: Icon, color }: { href: string, title: string, description: string, icon: any, color: string }) {
  return (
    <Link href={href} className="glass p-6 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all duration-300">
      <div className="flex items-center gap-5">
        <div className={`w-12 h-12 rounded-2xl ${color.replace('text-', 'bg-')}/10 flex items-center justify-center border ${color.replace('text-', 'border-')}/20 shrink-0`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-xs text-gray-500 font-medium line-clamp-1">{description}</p>
        </div>
      </div>
      <ArrowUpRight className="w-5 h-5 text-gray-700 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
    </Link>
  )
}
