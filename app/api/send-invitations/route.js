import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendMail } from '@/lib/mail'

export async function GET() {
  try {
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

    const matchDate = new Date(match.match_date).toLocaleString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const registrationTo = new Date(match.registration_to).toLocaleString('cs-CZ', {
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
            <strong>${match.home} - ${match.away}</strong>.
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

    const { error: updateError } = await supabase
      .from('matches')
      .update({ registration_email_sent_at: new Date().toISOString() })
      .eq('id', match.id)

    if (updateError) {
      return NextResponse.json(
        { ok: false, error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      sent: invitedEmails.length,
      matchId: match.id,
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Neočekávaná chyba.' },
      { status: 500 }
    )
  }
}