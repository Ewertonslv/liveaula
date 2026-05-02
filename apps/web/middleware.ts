import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');

async function getPayload(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { sub: string; role: string };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const accessToken = request.cookies.get('accessToken')?.value;

  // Rotas públicas
  const publicPaths = ['/login', '/register', '/invite'];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Sem refresh token → redirecionar login
  if (!refreshToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Sem access token válido → redirecionar login (evita acesso a rotas protegidas
  // apenas com refreshToken presente, que pode estar expirado ou revogado)
  if (!accessToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await getPayload(accessToken);
  if (!payload) {
    // Token inválido ou expirado → login (cliente deve renovar via /auth/refresh)
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verificar role para proteção por rota
  if (pathname.startsWith('/professor') && payload.role !== 'PROFESSOR') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (pathname.startsWith('/parent') && payload.role !== 'PARENT') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
