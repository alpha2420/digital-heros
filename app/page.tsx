import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Star, Heart, Trophy, Target } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  
  // Safety check if Supabase failed to initialize
  if (!supabase.auth) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Setup <span className="text-primary">Required</span></h1>
        <p className="text-gray-400 max-w-md mx-auto">Please add your Supabase credentials to <code className="bg-white/5 px-2 py-1 rounded">.env.local</code> to view the live dashboard and charity spotlight.</p>
        <div className="pt-8">
           <Link href="/signup" className="btn-primary">Get Started</Link>
        </div>
      </div>
    )
  }

  const { data: { user } } = await supabase.auth.getUser()

  // Authenticated users go straight to their workspace
  if (user) {
    redirect('/dashboard')
  }

  const { data: spotlight } = await supabase
    .from('charities')
    .select('*')
    .eq('is_featured', true)
    .maybeSingle()

  return (
    <div className="flex-1 w-full space-y-24 pb-24">
      {/* High-Impact Hero Section */}
      <section className="relative h-[85vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_60%)]" />
        
        <div className="relative space-y-8 max-w-4xl mx-auto">
          <div className="inline-block px-4 py-2 rounded-full bg-black/5 border border-black/10 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] text-primary animate-pulse">
            The World's First Impact-Driven Lottery
          </div>
          
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.85] animate-title">
            PLAY <span className="text-primary">BIG.</span><br />
            GIVE <span className="text-transparent stroke-text">BIGGER.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Harness your game to change lives. Log performance, fuel partner charities, 
            and enter to win massive monthly jackpots.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-10">
            <Link href="/signup" className="w-full md:w-auto px-12 py-5 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95">
              Start Your Impact
            </Link>
            <Link href="/charities" className="w-full md:w-auto glass px-12 py-5 border border-black/10 text-foreground font-black uppercase tracking-widest text-[10px] hover:bg-black/5 transition-all rounded-2xl">
              Partner Registry
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Spotlight Segment */}
      {spotlight && (
        <section className="max-w-7xl mx-auto px-4">
          <div className="glass rounded-[4rem] overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-700 flex flex-col lg:flex-row">
             <div className="lg:w-1/2 relative h-96 lg:h-auto overflow-hidden group">
                <img src={spotlight.image_url} alt={spotlight.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                <div className="absolute inset-0 bg-secondary/30 group-hover:bg-secondary/10 transition-colors" />
                <div className="absolute top-8 left-8 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg">
                  <Star className="w-4 h-4 fill-current" /> Partner Spotlight
                </div>
             </div>
             <div className="p-12 lg:p-24 lg:w-1/2 flex flex-col justify-center space-y-10">
                <div className="space-y-6">
                  <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">{spotlight.name}</h3>
                  <p className="text-gray-400 text-xl leading-relaxed">
                    {spotlight.description}
                  </p>
                </div>
                <div>
                  <Link href={`/charities/${spotlight.id}`} className="btn-primary inline-flex items-center gap-3 px-12 py-6 text-sm">
                    Discover Their Mission <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
             </div>
          </div>
        </section>
      )}

      {/* Core Ecosystem Features */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10">
         <FeatureCard 
            icon={Target} 
            title="Log Performance" 
            description="Sync your Stableford performance. Every point improves your standing in our verified verification system."
         />
         <FeatureCard 
            icon={Heart} 
            title="Direct Impact" 
            description="Configure your participation to support specific partner charities. Transparent, high-impact contributions."
         />
         <FeatureCard 
            icon={Trophy} 
            title="Win Verified" 
            description="Enter monthly draws for audited prize pools split between winners. Real impact, real rewards."
         />
      </section>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="glass p-12 rounded-[3.5rem] border border-white/5 hover:border-primary/20 transition-all duration-500 space-y-8 group">
      <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
        <Icon className="w-10 h-10 text-primary" />
      </div>
      <div className="space-y-4">
        <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">{title}</h3>
        <p className="text-gray-400 font-medium leading-relaxed text-lg">{description}</p>
      </div>
    </div>
  )
}
