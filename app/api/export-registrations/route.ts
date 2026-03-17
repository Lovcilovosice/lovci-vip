import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type MatchRow = {
  id: number;
  home: string | null;
  away: string | null;
};

type RegistrationRow = {
  id: number;
  match_id: number;
  name: string | null;
  email: string | null;
  tickets_count: number | null;
  note: string | null;
  created_at: string | null;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env: ${name}`);
  }
  return value;
}

function isAuthorized(req: Request): boolean {
  const url = new URL(req.url);
  const secret = url.searchParams.get('secret');
  return secret === requireEnv('ADMIN_PIN');
}

function sanitizeFileName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildExcel(match: MatchRow, registrations: RegistrationRow[]): Buffer {
  const rows = registrations.map((r, index) => ({
    '#': index + 1,
    Jméno: r.name ?? '',
    Email: r.email ?? '',
    Vstupenky: r.tickets_count ?? 0,
    Poznámka: r.note ?? '',
    Registrováno: r.created_at ?? '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrace');

  return XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx',
  }) as Buffer;
}

export async function GET(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Unauthorized' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    const url = new URL(req.url);
    const matchIdRaw = url.searchParams.get('matchId');

    if (!matchIdRaw) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing matchId' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    const matchId = Number(matchIdRaw);

    if (!Number.isInteger(matchId) || matchId <= 0) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Invalid matchId' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    const supabase = createClient(
      requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
      requireEnv('SUPABASE_SERVICE_ROLE_KEY')
    );

    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('id, home, away')
      .eq('id', matchId)
      .single();

    if (matchError) {
      throw matchError;
    }

    if (!match) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Match not found' }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    const { data: registrations, error: registrationsError } = await supabase
      .from('registrations')
      .select('id, match_id, name, email, tickets_count, note, created_at')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });

    if (registrationsError) {
      throw registrationsError;
    }

    const excelBuffer = buildExcel(
      match as MatchRow,
      (registrations ?? []) as RegistrationRow[]
    );

    const fileName = sanitizeFileName(
      `vip-registrace-${match.id}-${match.home ?? 'domaci'}-vs-${match.away ?? 'hoste'}`
    );

    return new Response(new Uint8Array(excelBuffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}.xlsx"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';

    return new Response(
      JSON.stringify({
        ok: false,
        error: message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}