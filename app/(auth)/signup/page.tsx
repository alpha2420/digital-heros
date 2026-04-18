import { AuthCard } from '@/components/ui/AuthCard'
import { signUp } from '@/lib/actions/auth'
import Link from 'next/link'

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <AuthCard 
        title="Join the Mission" 
        description="Create your account to start winning and giving"
      >
        <form action={signUp} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Full Name</label>
            <input 
              name="fullName" 
              type="text" 
              required 
              className="input-field" 
              placeholder="John Doe"
            />
          </div>
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
            <label className="text-sm font-medium text-gray-400">Password</label>
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
            Create Account
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-white hover:text-primary transition-colors font-semibold">
            Sign in here
          </Link>
        </p>
      </AuthCard>
    </div>
  )
}
