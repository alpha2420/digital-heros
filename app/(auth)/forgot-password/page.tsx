import { AuthCard } from '@/components/ui/AuthCard'
import { forgotPassword } from '@/lib/actions/auth'
import Link from 'next/link'

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string, success?: string }> }) {
  const { error, success } = await searchParams

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <AuthCard 
        title="Reset Password" 
        description="Enter your email to receive a reset link"
      >
        <form action={forgotPassword} className="space-y-4">
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
          
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm text-center">
              {success}
            </div>
          )}

          <button type="submit" className="btn-primary w-full mt-2">
            Send Reset Link
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-400">
          Remembered?{' '}
          <Link href="/login" className="text-white hover:text-primary transition-colors font-semibold">
            Back to login
          </Link>
        </p>
      </AuthCard>
    </div>
  )
}
