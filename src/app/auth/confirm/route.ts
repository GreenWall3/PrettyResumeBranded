import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

import { createClient, createServiceClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = '/' // Changed to always redirect to homepage

  // Create a response that redirects to the homepage by default
  let response = NextResponse.redirect(new URL(next + '?message=confirmation_success', request.url))

  if (token_hash && type) {
    const supabase = await createClient()

    // Verify the token and automatically sign in the user
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    
    if (!error) {
      // Get the user data after verification
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (!userError && user) {
        // Create a profile for the user if they don't have one
        try {
          // Use service client to bypass RLS policies
          const serviceClient = await createServiceClient()
          
          // Check if profile already exists
          const { data: existingProfile, error: profileCheckError } = await serviceClient
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()
          
          // If profile doesn't exist, create one
          if (profileCheckError && profileCheckError.code === 'PGRST116') {
            // Get first and last name from user metadata if available
            const firstName = user.user_metadata?.first_name || null;
            const lastName = user.user_metadata?.last_name || null;
            
            await serviceClient
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
        } catch (e) {
          console.error('Error creating profile after verification:', e)
          // Continue with the redirect even if profile creation fails
        }
      }
      
      // User is now authenticated, redirect to homepage with success message
      response = NextResponse.redirect(new URL(next + '?message=confirmation_success', request.url))
    } else {
      // Only redirect to login with error if verification actually failed
      response = NextResponse.redirect(new URL('/auth/login?error=email_confirmation', request.url))
    }
  }

  // Set a cookie to indicate successful authentication to prevent error flashes
  response.cookies.set('auth_redirect', 'true', {
    maxAge: 5, // Short-lived cookie, just to handle the redirect
    path: '/',
    httpOnly: false, // Needs to be readable by client JS
    sameSite: 'strict'
  })

  return response
}