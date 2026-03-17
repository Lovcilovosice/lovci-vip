import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env: ${name}`);
  }
  return value;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const pin = String(body?.pin ?? '').trim();

    if (!pin) {
      return NextResponse.json(
        { ok: false, error: 'Missing pin' },
        { status: 400 }
      );
    }

    if (pin !== requireEnv('ADMIN_PIN')) {
      return NextResponse.json(
        { ok: false, error: 'Invalid pin' },
        { status: 401 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}