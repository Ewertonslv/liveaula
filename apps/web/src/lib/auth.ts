import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');

export interface SessionUser {
  id: string;
  role: 'PROFESSOR' | 'PARENT' | 'ADMIN';
}

export async function getServerSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  if (!accessToken) return null;

  try {
    const { payload } = await jwtVerify(accessToken, JWT_SECRET);
    return { id: payload.sub as string, role: payload.role as SessionUser['role'] };
  } catch {
    return null;
  }
}
