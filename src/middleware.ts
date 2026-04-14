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

  // If not logged in and trying to access protected routes
  if (
    !user &&
    (pathname.startsWith('/lawyer') || pathname.startsWith('/immigrant'))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // If logged in, check role-based access
  if (user && (pathname.startsWith('/lawyer') || pathname.startsWith('/immigrant'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile) {
      const role = profile.role
      if (pathname.startsWith('/lawyer') && role !== 'lawyer') {
        const url = request.nextUrl.clone()
        url.pathname = '/immigrant/dashboard'
        return NextResponse.redirect(url)
      }
      if (pathname.startsWith('/immigrant') && role !== 'immigrant') {
        const url = request.nextUrl.clone()
        url.pathname = '/lawyer/dashboard'
        return NextResponse.redirect(url)
      }
    }
  }

  // Redirect logged-in users away from auth pages
  if (user && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role === 'lawyer') {
      const url = request.nextUrl.clone()
      url.pathname = '/lawyer/dashboard'
      return NextResponse.redirect(url)
    }
    if (profile?.role === 'immigrant') {
      const url = request.nextUrl.clone()
      url.pathname = '/immigrant/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
