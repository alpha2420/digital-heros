import { createAdminClient } from '@/lib/supabase/server'
import { createCharityAction, deleteCharityAction } from '@/lib/actions/charities'
import { Plus, Trash2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'

export default async function AdminCharitiesPage() {
  const supabase = await createAdminClient()
  const { data: charities } = await supabase.from('charities').select('*').order('name')

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto p-4 py-12 space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-2">
            System Admin
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Registry <span className="text-primary italic">Management</span></h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Add Form */}
        <div className="space-y-6">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest px-1 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Register New Partner
          </h2>
          <form action={createCharityAction} className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Charity Name</label>
              <input name="name" required placeholder="Partner name..." className="input-field" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Description</label>
              <textarea name="description" required rows={4} placeholder="Decribe the mission..." className="input-field resize-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Cover Image URL</label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input name="imageUrl" required placeholder="https://..." className="input-field pl-12" />
              </div>
            </div>
            <div className="flex items-center gap-2 px-2 py-4">
              <input type="checkbox" name="isFeatured" id="isFeatured" className="w-4 h-4 accent-primary" />
              <label htmlFor="isFeatured" className="text-sm font-medium text-gray-300">Feature in Spotlight Section</label>
            </div>
            <button type="submit" className="btn-primary w-full py-4 text-sm">Create Partner Profile</button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest px-1">Active Partners</h2>
          <div className="grid gap-4">
            {charities?.map((charity) => (
              <div key={charity.id} className="glass p-6 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-white/20 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden glass border border-white/10 shrink-0">
                    <img src={charity.image_url} className="w-full h-full object-cover" alt={charity.name} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{charity.name}</h3>
                      {charity.is_featured && <span className="bg-primary/20 text-primary text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-primary/30">Spotlight</span>}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1 max-w-sm">{charity.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                   <Link href={`/charities/${charity.id}`} className="p-3 hover:bg-white/5 rounded-2xl text-gray-500 hover:text-white transition-colors">
                    <LinkIcon className="w-5 h-5" />
                  </Link>
                  <form action={deleteCharityAction.bind(null, charity.id)}>
                    <button className="p-3 hover:bg-destructive/10 rounded-2xl text-gray-500 hover:text-destructive transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </div>
            ))}

            {(!charities || charities.length === 0) && (
               <div className="text-center py-20 glass rounded-[2.5rem] border border-dashed border-white/10">
                <p className="text-gray-500">No partner charities registered yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
