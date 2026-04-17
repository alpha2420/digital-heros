import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { saveOnboarding } from '@/lib/actions/onboarding'
import { AuthCard } from '@/components/ui/AuthCard'
import { Heart, Percent } from 'lucide-react'

const MOCK_CHARITIES = [
  {
    id: 'charity-1',
    name: 'Clean Oceans Initiative',
    description: 'Removing plastics from our oceans one reef at a time.',
    image_url: 'https://images.unsplash.com/photo-1518481612222-68bbe828ecd1?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'charity-2',
    name: 'Global Forest Fund',
    description: 'Reforesting the Amazon and protecting biodiversity.',
    image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'charity-3',
    name: 'Mental Health Matter',
    description: 'Providing therapy and support to those in need worldwide.',
    image_url: 'https://images.unsplash.com/photo-1527137342181-19aab11a8ee1?auto=format&fit=crop&q=80&w=400',
  }
]

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await searchParams

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <AuthCard 
        title="Impact Selection" 
        description="Choose where your contributions will make a difference"
      >
        <form action={saveOnboarding} className="space-y-8">
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" /> Select a Charity
            </label>
            <div className="grid gap-4">
              {MOCK_CHARITIES.map((charity) => (
                <label 
                  key={charity.id}
                  className="relative flex flex-col p-4 glass rounded-2xl cursor-pointer hover:border-primary/50 transition-all border border-transparent has-[:checked]:border-primary group"
                >
                  <input 
                    type="radio" 
                    name="charityId" 
                    value={charity.id} 
                    required 
                    className="absolute opacity-0"
                  />
                  <div className="flex gap-4">
                    <img 
                      src={charity.image_url} 
                      alt={charity.name} 
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-white group-hover:text-primary transition-colors">
                        {charity.name}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2">
                         {charity.description}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-400 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-primary" /> Contribution Level
              </span>
              <span className="text-primary font-bold">Min 10%</span>
            </label>
            <input 
              name="contribution" 
              type="range" 
              min="10" 
              max="100" 
              defaultValue="10"
              className="w-full accent-primary bg-white/5 h-2 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-medium px-1">
              <span>10%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full shadow-xl shadow-primary/30">
            Complete Setup
          </button>
        </form>
      </AuthCard>
    </div>
  )
}
