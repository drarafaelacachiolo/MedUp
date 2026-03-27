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

      // Usuário veio pelo Google. Se nunca definiu senha própria, manda para /definir-senha.
      // A flag 'google_first_login' é usada para distinguir do fluxo admin (=== true).
      // false → já passou pelo fluxo antes, deixa entrar normalmente.
      const alreadySetPassword = user.user_metadata?.must_change_password === false
      const isAdminFlow = user.user_metadata?.must_change_password === true

      if (!alreadySetPassword && !isAdminFlow) {
        // Primeiro login Google: seta flag e manda definir senha
        await supabase.auth.updateUser({ data: { must_change_password: 'google_first_login' } })
        return NextResponse.redirect(`${origin}/definir-senha`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
