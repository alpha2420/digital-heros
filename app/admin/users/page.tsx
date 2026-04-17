import { getUserList } from '@/lib/actions/admin'
import { BadgeCheck, Search, ChevronRight } from 'lucide-react'

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const users = await getUserList(q)

  return (
    <div className="p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight italic">User <span className="text-primary italic">Registry</span></h1>
          <p className="text-sm text-gray-500 font-medium font-outfit uppercase tracking-tighter">Manage your community and verify subscription standing.</p>
        </div>

        <form className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
          <input 
            name="q" 
            defaultValue={q}
            placeholder="Search by name or email..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm"
          />
        </form>
      </header>

      <div className="glass rounded-[2rem] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">User</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Joined</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users?.map((user) => (
                <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-xs border border-primary/20 shrink-0">
                        {user.full_name?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-white group-hover:text-primary transition-colors truncate">{user.full_name}</p>
                        <p className="text-xs text-gray-500 font-medium truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                     {user.subscriptions?.[0]?.status === 'active' ? (
                       <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                          <BadgeCheck className="w-3 h-3" /> Active {user.subscriptions[0].plan}
                       </div>
                     ) : (
                       <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-widest border border-white/10 italic">
                          No Subscription
                       </div>
                     )}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-400 font-medium">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5">
                     <button className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {(!users || users.length === 0) && (
          <div className="text-center py-20">
            <p className="text-gray-500 font-medium italic">No users found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}
