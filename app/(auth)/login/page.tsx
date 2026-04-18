import { AuthCard } from '@/components/ui/AuthCard'
import { signIn } from '@/lib/actions/auth'
import Link from 'next/link'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <AuthCard 
        title="Welcome Back" 
        description="Login to manage your entries and impact"
      >
        <form action={signIn} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Email</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="input-field" 
              placeholder="name@example.com"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-400">Password</label>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot?
              </Link>
            </div>
            <input 
              name="password" 
              type="password" 
              required 
              className="input-field" 
              placeholder="••••••••"
            />
          </div>
          
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full mt-2">
            Sign In
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link href="/signup" className="text-white hover:text-primary transition-colors font-semibold">
            Create one for free
          </Link>
        </p>
      </AuthCard>
    </div>
  )
}
