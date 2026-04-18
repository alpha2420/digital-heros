import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const createMockClient = () => {
  const mockResponse = { data: null, error: null, count: 0, status: 200, statusText: 'OK' };
  const mockPromise = Promise.resolve(mockResponse);

  const handler: ProxyHandler<any> = {
    get: (target, prop) => {
      if (prop === 'then') return mockPromise.then.bind(mockPromise);
      if (prop === 'catch') return mockPromise.catch.bind(mockPromise);
      if (prop === 'finally') return mockPromise.finally.bind(mockPromise);

      if (prop === 'auth') {
        return {
          getUser: async () => ({ data: { user: null }, error: null }),
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signOut: async () => ({ error: null }),
        };
      }

      return new Proxy(() => {}, handler);
    },
    apply: () => {
      return new Proxy(() => {}, handler);
    },
  };

  return new Proxy(() => {}, handler);
};

const mockClient = createMockClient();

export async function createClient() {
  const cookieStore = await cookies()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-url')) {
    return mockClient
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  )
}

export async function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-url')) {
    return mockClient
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // No-op for admin client
        },
      },
    }
  )
}
