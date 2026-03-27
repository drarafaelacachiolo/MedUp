import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignorado quando chamado de Server Component
            }
          },
        },
      }
    )

    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && authData?.user) {
      const user = authData.user

      // Detecta login via Google sem senha definida ainda
      const isGoogleOnly =
        user.identities?.some((id) => id.provider === 'google') &&
        user.identities?.every((id) => id.provider !== 'email')

      // must_change_password === false significa que já passou pelo fluxo antes
      const hasDefinedPassword = user.user_metadata?.must_change_password === false

      if (isGoogleOnly && !hasDefinedPassword) {
        // Primeiro login pelo Google: marca flag e manda para definir senha
        await supabase.auth.updateUser({ data: { must_change_password: true } })
        return NextResponse.redirect(`${origin}/definir-senha`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
