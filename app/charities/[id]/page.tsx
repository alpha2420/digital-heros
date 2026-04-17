import { getCharityById, createDonationSession } from '@/lib/actions/charities'
import { Calendar, MapPin, Heart, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function CharityProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const charity = await getCharityById(id)

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-4 py-12 space-y-12">
      <Link href="/charities" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to All Charities
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative aspect-video rounded-[3rem] overflow-hidden glass border border-white/10">
            <img 
              src={charity.image_url} 
              alt={charity.name} 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight uppercase">{charity.name}</h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              {charity.description}
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 uppercase tracking-tight italic">
              <Calendar className="w-5 h-5 text-primary" /> Upcoming Golf Days
            </h2>
            <div className="grid gap-4">
              {charity.events && charity.events.length > 0 ? (
                charity.events.map((event: any, index: number) => (
                  <div key={index} className="glass p-6 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors">
                    <div className="space-y-1">
                      <p className="font-bold text-lg">{event.title || 'Charity Golf Classic'}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {event.date || 'TBD'}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {event.location || 'Local Course'}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-primary font-black">{event.price || '£99'}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Entry Fee</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass p-12 rounded-[2rem] border border-dashed border-white/10 text-center text-gray-500">
                  <p>No upcoming events scheduled right now. Check back soon!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Donation Card */}
        <div className="space-y-6">
          <div className="glass p-8 rounded-[2.5rem] border border-primary/20 sticky top-24 space-y-8">
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase italic">Make an <span className="text-primary">Impact</span></h3>
              <p className="text-xs text-gray-400">100% of your independent donation goes directly to {charity.name}.</p>
            </div>

            <div className="grid gap-3">
              {[10, 25, 50, 100].map((amount) => (
                <form key={amount} action={createDonationSession.bind(null, id, amount)}>
                  <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-between px-6 group">
                    <span>£{amount}</span>
                    <Heart className="w-4 h-4 text-gray-600 group-hover:text-white/80 transition-colors" />
                  </button>
                </form>
              ))}
            </div>

            <div className="pt-4 border-t border-white/5 text-center">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                Securely processed by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
