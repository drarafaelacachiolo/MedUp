import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)

  const isPublicRoute = ['/login', '/privacidade', '/termos', '/auth/callback'].includes(request.nextUrl.pathname)

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  const isLoginPage = request.nextUrl.pathname === '/login'

  if (user && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
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
