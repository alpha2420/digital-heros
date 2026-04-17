import { getCharities } from '@/lib/actions/charities'
import Link from 'next/link'
import { Search, Heart, ArrowRight } from 'lucide-react'

export default async function CharitiesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const charities = await getCharities(q)

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-4 py-12 space-y-12">
      <header className="text-center max-w-2xl mx-auto space-y-6">
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">
          Partner <span className="text-primary">Charities</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Discover the causes your play supports. From environmental conservation 
          to mental health initiatives, your impact is real.
        </p>
        
        <form className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
          <input 
            name="q" 
            placeholder="Search by name or mission..." 
            defaultValue={q}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
          />
        </form>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {charities.map((charity) => (
          <Link 
            key={charity.id} 
            href={`/charities/${charity.id}`}
            className="glass rounded-3xl overflow-hidden group hover:border-white/20 transition-all flex flex-col"
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={charity.image_url} 
                alt={charity.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {charity.is_featured && (
                <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Heart className="w-3 h-3 fill-current" /> Spotlight
                </div>
              )}
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{charity.name}</h3>
                <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                  {charity.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">View Profile</span>
                <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {charities.length === 0 && (
        <div className="text-center py-24 glass rounded-[3rem] border border-dashed border-white/10">
          <p className="text-gray-500">No charities found matching your search. Try a broader term?</p>
        </div>
      )}
    </div>
  )
}
