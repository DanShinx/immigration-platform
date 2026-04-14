import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isProtectedPath = pathname.startsWith('/lawyer') || pathname.startsWith('/immigrant') || pathname.startsWith('/admin')
  const isAuthEntryPath = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup')
  const isCompleteProfilePath = pathname.startsWith('/auth/complete-profile')

  // If not logged in and trying to access protected routes
  if (!user && (isProtectedPath || isCompleteProfilePath)) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  let profile: { role: 'lawyer' | 'immigrant' } | null = null

  if (user && (isProtectedPath || isAuthEntryPath || isCompleteProfilePath)) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    profile = data
  }

  if (user && !profile && (isProtectedPath || isAuthEntryPath)) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/complete-profile'
    return NextResponse.redirect(url)
  }

  // If logged in, check role-based access
  if (user && isProtectedPath && profile) {
    const role = profile.role
    if (pathname.startsWith('/admin') && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'lawyer' ? '/lawyer/dashboard' : '/immigrant/dashboard'
      return NextResponse.redirect(url)
    }
    if (pathname.startsWith('/lawyer') && role !== 'lawyer') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'admin' ? '/admin/dashboard' : '/immigrant/dashboard'
      return NextResponse.redirect(url)
    }
    if (pathname.startsWith('/immigrant') && role !== 'immigrant') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'admin' ? '/admin/dashboard' : '/lawyer/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Redirect logged-in users away from auth pages
  if (user && isAuthEntryPath && profile) {
    const url = request.nextUrl.clone()
    if (profile.role === 'admin') url.pathname = '/admin/dashboard'
    else if (profile.role === 'lawyer') url.pathname = '/lawyer/dashboard'
    else url.pathname = '/immigrant/dashboard'
    return NextResponse.redirect(url)
  }

  if (user && isCompleteProfilePath && profile) {
    const url = request.nextUrl.clone()
    if (profile.role === 'admin') url.pathname = '/admin/dashboard'
    else if (profile.role === 'lawyer') url.pathname = '/lawyer/dashboard'
    else url.pathname = '/immigrant/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
