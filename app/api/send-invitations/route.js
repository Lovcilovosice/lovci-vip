import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendMail } from '@/lib/mail'

function requireEnv(name) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing env: ${name}`)
  }

  return value
}

function isAuthorized(req) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    throw new Error('Missing env: CRON_SECRET')
  }

  if (!authHeader) {
    return false
  }

  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createClient(
      requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
      requireEnv('SUPABASE_SERVICE_ROLE_KEY')
    )

    const now = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Europe/Prague' })
    ).toISOString()

    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select(
        'id, home, away, match_date, registration_from, registration_to, registration_email_sent_at'
      )
      .lte('registration_from', now)
      .is('registration_email_sent_at', null)
      .order('registration_from', { ascending: true })
      .limit(1)

    if (matchesError) {
      return NextResponse.json(
        { ok: false, error: matchesError.message },
        { status: 500 }
      )
    }

    if (!matches || matches.length === 0) {
      return NextResponse.json({ ok: true, message: 'Nic k odeslání.' })
    }

    const match = matches[0]
    const claimedAt = new Date().toISOString()

    const { data: claimedMatch, error: claimError } = await supabase
      .from('matches')
      .update({ registration_email_sent_at: claimedAt })
      .eq('id', match.id)
      .is('registration_email_sent_at', null)
      .select(
        'id, home, away, match_date, registration_from, registration_to, registration_email_sent_at'
      )
      .maybeSingle()

    if (claimError) {
      return NextResponse.json(
        { ok: false, error: claimError.message },
        { status: 500 }
      )
    }

    if (!claimedMatch) {
      return NextResponse.json({
        ok: true,
        message: 'Oznámení už mezitím zpracoval jiný běh cronu.',
      })
    }

    const { data: invitedEmails, error: invitedError } = await supabase
      .from('vip_invited_emails')
      .select('email')

    if (invitedError) {
      return NextResponse.json(
        { ok: false, error: invitedError.message },
        { status: 500 }
      )
    }

    if (!invitedEmails || invitedEmails.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Nejsou k dispozici žádné pozvané e-maily.' },
        { status: 500 }
      )
    }

    const matchDate = new Date(claimedMatch.match_date).toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const registrationTo = new Date(claimedMatch.registration_to).toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const registrationLink = 'https://lovci-vip.vercel.app/vip'

    for (const row of invitedEmails) {
      await sendMail({
        to: row.email,
        subject: 'Zahájení VIP registrace',
        html: `
          <p>Vážení,</p>

          <p>
            právě byla zahájena registrace do VIP prostor na utkání
            <strong>${claimedMatch.home} - ${claimedMatch.away}</strong>.
          </p>

          <p>Termín utkání: <strong>${matchDate}</strong></p>

          <p>Registraci můžete provést do: <strong>${registrationTo}</strong></p>

          <p>
            <a href="${registrationLink}">Odkaz na registraci</a>
          </p>

          <br/>

          <p>
            S pozdravem<br/>
            <strong>Lovci Lovosice</strong>
          </p>

          <p style="font-size:14px;color:#555;">
            V případě nejasností se obracejte na
            <a href="mailto:lucie@hazenalovosice.cz">lucie@hazenalovosice.cz</a>
          </p>
        `,
      })
    }

    return NextResponse.json({
      ok: true,
      sent: invitedEmails.length,
      matchId: claimedMatch.id,
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Neočekávaná chyba.' },
      { status: 500 }
    )
  }
}
