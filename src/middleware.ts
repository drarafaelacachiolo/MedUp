import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)

  const pathname = request.nextUrl.pathname
  const isPublicRoute = ['/login', '/privacidade', '/termos', '/auth/callback'].includes(pathname)

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    // must_change_password === false → senha já definida
    // true ou undefined → ainda precisa definir (admin-criado ou primeiro login Google)
    const mustChangePassword = user.user_metadata?.must_change_password !== false

    if (pathname === '/login') {
      const url = request.nextUrl.clone()
      url.pathname = mustChangePassword ? '/definir-senha' : '/'
      return NextResponse.redirect(url)
    }

    // Bloqueia acesso ao app enquanto senha não for definida
    if (mustChangePassword && pathname !== '/definir-senha') {
      const url = request.nextUrl.clone()
      url.pathname = '/definir-senha'
      return NextResponse.redirect(url)
    }

    // Impede acesso à tela de definir senha após já ter definido
    if (!mustChangePassword && pathname === '/definir-senha') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // CRÍTICO: retornar supabaseResponse (não NextResponse.next())
  // para preservar os cookies de sessão renovados
  return supabaseResponse
}

export const config = {
  matcher: [
    // Roda em todas as rotas exceto assets estáticos do Next.js
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
