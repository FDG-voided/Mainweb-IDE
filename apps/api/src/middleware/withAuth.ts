import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../auth/auth';

export async function withAuth(req: NextRequest, handler: (req: NextRequest, session: { id: string; email?: string | null; name?: string | null; image?: string | null }) => Promise<NextResponse>) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return handler(req, session.user as { id: string; email?: string | null; name?: string | null; image?: string | null });
}