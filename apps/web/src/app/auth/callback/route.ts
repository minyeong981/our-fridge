import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/fridges'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${siteUrl}${next}`)
    }
  }

  // 실패 시 로그인 페이지로 (에러 메시지 포함)
  return NextResponse.redirect(`${siteUrl}/login?error=auth_failed`)
}
