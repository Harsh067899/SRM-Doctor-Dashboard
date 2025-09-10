import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    const expected = process.env.ACCESS_CODE;
    if (!expected) {
      return NextResponse.json({ success: false, message: 'Server not configured' }, { status: 500 });
    }
    if (code === expected) {
      const jar = await cookies();
      jar.set('access_granted', '1', {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        path: '/',
        maxAge: 60 * 60 * 8
      });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, message: 'Invalid code' }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, message: 'Bad request' }, { status: 400 });
  }
}
