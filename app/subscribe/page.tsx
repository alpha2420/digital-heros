import { createCheckoutSession } from '@/lib/actions/stripe'
import { Check, Zap, Star } from 'lucide-react'

const PLANS = [
  {
    name: 'Monthly',
    price: '£9.99',
    period: 'month',
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_monthly_id',
    description: 'Perfect for getting started and making a regular impact.',
    features: ['Access to all weekly draws', 'Monthly impact report', 'Basic community access'],
    icon: Zap,
    color: 'from-blue-500/20 to-blue-500/0'
  },
  {
    name: 'Yearly',
    price: '£99',
    period: 'year',
    priceId: process.env.STRIPE_YEARLY_PRICE_ID || 'price_yearly_id',
    description: 'Best value for long-term supporters and serious winners.',
    features: ['Access to all weekly draws', 'Priority impact reports', 'Premium community access', '2 months free included'],
    icon: Star,
    featured: true,
    color: 'from-primary/20 to-primary/0'
  }
]

export default async function SubscribePage({ searchParams }: { searchParams: Promise<{ canceled?: string }> }) {
  const { canceled } = await searchParams

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 py-20">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black tracking-tight mb-4 uppercase">
          Choose Your <span className="text-primary italic">Power</span>
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          Select a plan that fits your vision for impact. Every subscription fuels 
          positive change and gives you more chances to win big.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {PLANS.map((plan) => (
          <div 
            key={plan.name}
            className={`relative flex flex-col p-8 glass rounded-[2rem] border-white/5 overflow-hidden group transition-all duration-500 hover:border-white/10 ${plan.featured ? 'border-primary/50 shadow-2xl shadow-primary/10' : ''}`}
          >
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${plan.color} -mr-16 -mt-16 blur-3xl rounded-full`} />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl ${plan.featured ? 'bg-primary/10 text-primary' : 'bg-white/5 text-gray-400'}`}>
                  <plan.icon className="w-6 h-6" />
                </div>
                {plan.featured && (
                  <span className="bg-primary text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                    Best Value
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-5xl font-black">{plan.price}</span>
                <span className="text-gray-500 font-medium">/{plan.period}</span>
              </div>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                {plan.description}
              </p>

              <div className="space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>

              <form action={createCheckoutSession}>
                <input type="hidden" name="priceId" value={plan.priceId} />
                <button 
                  type="submit"
                  className={`w-full py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg ${
                    plan.featured 
                      ? 'bg-primary text-white hover:opacity-90 shadow-primary/20' 
                      : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  {plan.featured ? 'Get Started Yearly' : 'Subscribe Monthly'}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {canceled && (
        <p className="mt-8 text-destructive text-sm font-medium">
           Subscription process was canceled. Try again when you're ready.
        </p>
      )}
    </div>
  )
}
