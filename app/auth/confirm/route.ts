import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash') ?? searchParams.get('token')
  const type = searchParams.get('type') as 'email' | 'recovery' | null
  const code = searchParams.get('code')

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(`${origin}/verification-error`)
    }
    return NextResponse.redirect(`${origin}/email-verified`)
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (error) {
      return NextResponse.redirect(`${origin}/verification-error`)
    }
    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/auth/reset-password`)
    }
    return NextResponse.redirect(`${origin}/email-verified`)
  }

  return NextResponse.redirect(`${origin}/verification-error`)
}