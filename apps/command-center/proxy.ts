import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/crm', '/admin']

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

/**
 * Next.js proxy (formerly middleware).
 *
 * Responsibilities:
 *  1. Refresh the Supabase auth cookies so server components and route
 *     handlers see a valid session.
 *  2. Block anonymous visitors from /crm and /admin before any page renders.
 *  3. Send already-signed-in visitors away from the sign-in screen.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  let response = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isProtected(pathname)) {
      return NextResponse.redirect(new URL('/signon?setup=required', request.url))
    }
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value))
      },
    },
  })

  let signedIn = false
  try {
    const { data } = await supabase.auth.getUser()
    signedIn = Boolean(data.user)
  } catch {
    signedIn = false
  }

  if (!signedIn && isProtected(pathname)) {
    const signInUrl = new URL('/signon', request.url)
    signInUrl.searchParams.set('next', `${pathname}${search}`)
    if (pathname.startsWith('/admin')) signInUrl.searchParams.set('admin', '1')
    return NextResponse.redirect(signInUrl)
  }

  if (signedIn && pathname === '/signon') {
    const target = request.nextUrl.searchParams.get('next')
    const safeTarget = target && target.startsWith('/') && !target.startsWith('//') ? target : '/crm'
    return NextResponse.redirect(new URL(safeTarget, request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Skip API routes, static assets, and image optimisation.
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|ico)$).*)',
  ],
}
