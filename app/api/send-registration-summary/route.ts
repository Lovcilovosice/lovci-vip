import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type MatchRow = {
  id: number;
  home: string | null;
  away: string | null;
  registration_to: string | null;
  registration_summary_sent_at: string | null;
};

type RegistrationRow = {
  id: number;
  match_id: number;
  name: string | null;
  email: string | null;
  tickets_count: number | null;
  note: string | null;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env: ${name}`);
  }
  return value;
}

function parseDbLocalDate(value: string | null): Date | null {
  if (!value) return null;

  const normalized = value.trim().replace('T', ' ');
  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/
  );

  if (!match) return null;

  const [, y, m, d, hh, mm, ss] = match;

  return new Date(
    Number(y),
    Number(m) - 1,
    Number(d),
    Number(hh),
    Number(mm),
    Number(ss ?? '0'),
    0
  );
}

function getNowPrague(): Date {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Prague',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';

  return new Date(
    Number(get('year')),
    Number(get('month')) - 1,
    Number(get('day')),
    Number(get('hour')),
    Number(get('minute')),
    Number(get('second'))
  );
}

function getNowDb(): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Prague',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).format(new Date());
}

function formatMatchName(match: MatchRow): string {
  return `${match.home ?? ''} vs ${match.away ?? ''}`.trim();
}

function buildExcel(registrations: RegistrationRow[]): Buffer {
  const data = registrations.map((r, i) => ({
    '#': i + 1,
    Jméno: r.name ?? '',
    Email: r.email ?? '',
    Vstupenky: r.tickets_count ?? 0,
    Poznámka: r.note ?? '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Registrace');

  return XLSX.write(wb, {
    type: 'buffer',
    bookType: 'xlsx',
  }) as Buffer;
}

async function sendMail(match: MatchRow, registrations: RegistrationRow[]) {
  const transporter = nodemailer.createTransport({
    host: requireEnv('SMTP_HOST'),
    port: Number(requireEnv('SMTP_PORT')),
    secure: Number(requireEnv('SMTP_PORT')) === 465,
    auth: {
      user: requireEnv('SMTP_USER'),
      pass: requireEnv('SMTP_PASS'),
    },
  });

  const excelBuffer = buildExcel(registrations);

  await transporter.sendMail({
    from: `"Lovci Lovosice VIP" <${requireEnv('SMTP_FROM')}>`,
    to: requireEnv('INTERNAL_SUMMARY_EMAIL'),
    subject: `Souhrn VIP registrací: ${formatMatchName(match)}`,
    text: 'Souhrn registrací je v příloze (Excel).',
    attachments: [
      {
        filename: `vip-registrace-${match.id}.xlsx`,
        content: excelBuffer,
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    ],
  });
}

export async function GET(_req: Request) {
  try {
    const supabase = createClient(
      requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
      requireEnv('SUPABASE_SERVICE_ROLE_KEY')
    );

    const now = getNowPrague();

    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .is('registration_summary_sent_at', null);

    if (matchesError) {
      throw matchesError;
    }

    const eligible = ((matches ?? []) as MatchRow[]).filter((match) => {
      const registrationTo = parseDbLocalDate(match.registration_to);
      return registrationTo !== null && registrationTo <= now;
    });

    for (const match of eligible) {
      const { data: registrations, error: registrationsError } = await supabase
        .from('registrations')
        .select('*')
        .eq('match_id', match.id);

      if (registrationsError) {
        throw registrationsError;
      }

      await sendMail(match, (registrations ?? []) as RegistrationRow[]);

      const { error: updateError } = await supabase
        .from('matches')
        .update({ registration_summary_sent_at: getNowDb() })
        .eq('id', match.id);

      if (updateError) {
        throw updateError;
      }
    }

    return NextResponse.json({
      ok: true,
      processed: eligible.length,
    });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : 'Unknown error';

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 }
    );
  }
}