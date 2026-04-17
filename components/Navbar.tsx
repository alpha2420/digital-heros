import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/actions/auth'
import { LogOut, User } from 'lucide-react'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="glass sticky top-4 mx-4 px-6 py-4 rounded-2xl z-50 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold tracking-tighter hover:opacity-80 transition-opacity">
        LOTTERY<span className="text-primary">CHARITY</span>
      </Link>

      <div className="flex items-center gap-6">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/5 rounded-full border border-black/10">
              {user.user_metadata.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt={user.user_metadata.full_name} 
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <User className="w-4 h-4 text-gray-500" />
              )}
              <span className="text-sm font-medium text-foreground">
                {user.user_metadata.full_name || user.email}
              </span>
            </div>
            <form action={signOut}>
              <button className="p-2 hover:bg-black/5 rounded-full text-gray-400 hover:text-foreground transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Login
            </Link>
            <Link href="/signup" className="btn-primary py-2 px-4 text-sm">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
