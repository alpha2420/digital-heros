import { createBrowserClient } from '@supabase/ssr'

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

export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-url')) {
    return mockClient
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
