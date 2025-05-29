import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
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
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is authenticated, ensure they have a profile
  if (user) {
    try {
      // Check if the user has a profile
      const { error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single()

      // If profile doesn't exist, create one
      if (profileError && profileError.code === 'PGRST116') {
        // Get first and last name from user metadata if available
        const firstName = user.user_metadata?.first_name || null;
        const lastName = user.user_metadata?.last_name || null;
        
        // Creating a profile for the user
        await supabase
          .from('profiles')
          .insert([{
            user_id: user.id,
            first_name: firstName,
            last_name: lastName,
            email: user.email,
            phone_number: null,
            location: null,
            website: null,
            linkedin_url: null,
            github_url: null,
            work_experience: [],
            education: [],
            skills: [],
            projects: [],
            certifications: [],
          }])
      }
    } catch (error) {
      console.error('Error checking/creating profile in middleware:', error)
      // Continue with the request even if profile creation fails
    }
  }

  // Create a new headers object with the existing headers
  // Given an incoming request...
  const requestHeaders = new Headers(request.headers)

  // Create new response with enriched headers
  supabaseResponse = NextResponse.next({
    request: {
      ...request,
      headers: requestHeaders,
    },
  })

  supabaseResponse.cookies.set('show-banner', 'false')

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    request.nextUrl.pathname !== '/'
  ) {
    // no user, redirect to homepage
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}