import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, LayoutDashboard, Heart, Trophy, BarChart3, Settings } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Strict Admin Authorization
  if (!user || user.user_metadata.role !== 'admin') {
    redirect('/dashboard')
  }

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Draws', href: '/admin/draws', icon: Settings },
    { label: 'Charities', href: '/admin/charities', icon: Heart },
    { label: 'Winners', href: '/admin/winners', icon: Trophy },
    { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  ]

  return (
    <div className="flex min-h-[calc(100vh-64px)] relative">
      {/* Dynamic Sidebar */}
      <aside className="w-64 glass border-r border-white/5 p-8 flex flex-col space-y-10 hidden lg:flex sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-4 opacity-60">Control Panel</p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[13px] font-black uppercase tracking-tight text-gray-400 hover:text-white hover:bg-white/5 transition-all group border border-transparent hover:border-white/5"
              >
                <item.icon className="w-4 h-4 group-hover:text-primary transition-colors" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 rounded-3xl bg-primary/5 border border-primary/10">
           <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Status</p>
           <p className="text-xs font-bold text-white">Verified Admin</p>
        </div>
      </aside>

      {/* Main Administrative Workspace */}
      <main className="flex-1 bg-black/30 backdrop-blur-sm">
        {children}
      </main>
    </div>
  )
}
