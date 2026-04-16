import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-url')) {
    console.error('Supabase credentials missing or invalid in .env.local')
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value, options))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/signup') || 
                     request.nextUrl.pathname.startsWith('/forgot-password')
  
  const isOnboardingPage = request.nextUrl.pathname.startsWith('/onboarding')

  const isPublicPage = request.nextUrl.pathname === '/' || 
                       request.nextUrl.pathname.startsWith('/charities') ||
                       isAuthPage

  const isProtectedPage = request.nextUrl.pathname.startsWith('/dashboard') ||
                          isOnboardingPage ||
                          request.nextUrl.pathname.startsWith('/admin')

  // 1. Redirect unauthenticated users from protected pages
  if (!user && isProtectedPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2. Redirect authenticated users from auth pages to dashboard
  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // 3. Subscription enforcement for protected features
  if (user && isProtectedPage && !isOnboardingPage && request.nextUrl.pathname !== '/subscribe') {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!subscription || subscription.status !== 'active') {
      const url = request.nextUrl.clone()
      url.pathname = '/subscribe'
      if (subscription?.status === 'lapsed') {
        url.searchParams.set('reason', 'expired')
      }
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
