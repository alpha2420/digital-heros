import { getAdminReports } from '@/lib/actions/admin'
import { Heart, ShieldCheck, BarChart3 } from 'lucide-react'

export default async function AdminReportsPage() {
  const reports = await getAdminReports()

  return (
    <div className="p-8 space-y-12">
      <header>
        <h1 className="text-3xl font-black uppercase tracking-tight italic">Platform <span className="text-primary italic">Analytics</span></h1>
        <p className="text-sm text-gray-500 font-medium font-outfit uppercase tracking-tighter">Real-time health and performance metrics for the ecosystem.</p>
      </header>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reports.metrics.map((metric) => (
          <div key={metric.label} className="glass p-8 rounded-[2rem] border border-white/5 space-y-4 hover:border-white/10 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{metric.label}</span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${metric.trend.includes('+') ? 'text-emerald-500' : 'text-primary'}`}>
                {metric.trend}
              </span>
            </div>
            <div className={`text-4xl font-black tracking-tighter shrink-0 ${metric.color}`}>
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charity Impact Section */}
        <div className="lg:col-span-2 glass p-10 rounded-[3rem] border border-white/5 space-y-10 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-5 scale-150">
              <Heart className="w-64 h-64 text-primary" />
           </div>
           
           <div className="relative space-y-6">
              <div className="space-y-2">
                <h2 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Social Impact Projection
                </h2>
                <h3 className="text-4xl font-black uppercase tracking-tighter italic">Cumulative <span className="text-white">Partner Funding</span></h3>
              </div>
              
              <div className="flex items-baseline gap-4">
                 <span className="text-7xl font-black text-white tracking-tighter">£{reports.charityImpact.toLocaleString()}</span>
                 <span className="text-lg font-bold text-gray-500 italic">Estimated Overall</span>
              </div>
              
              <p className="text-gray-400 max-w-xl text-lg leading-relaxed">
                 Based on current active subscriptions and contribution percentages, 
                 this represents the real-world value delivered to our charity partners this month.
              </p>
           </div>
        </div>

        {/* Engagement Stats */}
        <div className="glass p-10 rounded-[3rem] border border-white/5 flex flex-col justify-center space-y-8">
           <div className="space-y-4">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Engagement Ratios</h3>
              <div className="flex justify-center">
                 <div className="w-32 h-32 rounded-full border-8 border-primary border-t-white/5 animate-pulse flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-primary" />
                 </div>
              </div>
           </div>
           
           <div className="space-y-3">
              {[
                { label: 'Draw Participation', rate: '92%' },
                { label: 'Score Retention', rate: '88%' },
                { label: 'Profile Completion', rate: '100%' },
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between text-xs">
                   <span className="text-gray-500 font-bold uppercase tracking-tighter">{stat.label}</span>
                   <span className="text-white font-black">{stat.rate}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  )
}
