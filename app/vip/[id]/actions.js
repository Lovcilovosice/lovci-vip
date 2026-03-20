'use server'

import { redirect } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { sendMail } from '@/lib/mail'

export async function saveVipRegistration(formData) {
  const matchId = Number(formData.get('match_id'))
  const name = formData.get('name')?.toString().trim() || ''
  const email =
    formData.get('email')?.toString().trim().toLowerCase().replace(/\s+/g, '') || ''
  const ticketsCount = Number(formData.get('tickets_count'))
  const note = formData.get('note')?.toString().trim() || ''

  if (!matchId || Number.isNaN(matchId)) {
    redirect('/vip')
  }

  if (!name || !email || !ticketsCount) {
    redirect(`/vip/${matchId}?error=missing_fields`)
  }

  const { data: invitedEmail, error: invitedEmailError } = await supabase
    .from('vip_invited_emails')
    .select('id, email')
    .eq('email', email)
    .maybeSingle()

  if (invitedEmailError) {
    redirect(`/vip/${matchId}?error=email_check_failed`)
  }

  if (!invitedEmail) {
    redirect(`/vip/${matchId}?error=email_not_invited`)
  }

  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('id, home, away, match_date')
    .eq('id', matchId)
    .single()

  if (matchError || !match) {
    redirect(`/vip/${matchId}?error=match_not_found`)
  }

  const { error: insertError } = await supabase
    .from('registrations')
    .insert([
      {
        match_id: matchId,
        name,
        email,
        tickets_count: ticketsCount,
        note,
      },
    ])

  if (insertError) {
    if (insertError.code === '23505') {
      redirect(`/vip/${matchId}?error=already_registered`)
    }

    redirect(`/vip/${matchId}?error=save_failed`)
  }

  try {
    await sendMail({
      to: email,
      subject: 'Potvrzení VIP registrace',
      html: `
        <p>Vážený pane / paní ${name},</p>
    
        <p>potvrzujeme vám registraci na utkání 
        <strong>${match.home} - ${match.away}</strong>.</p>
    
        <p>Počet VIP vstupenek: <strong>${ticketsCount}</strong></p>
    
        <p>VIP vstupenky vám budou zaslány v den zápasu.</p>
    
        <br/>
    
        <p>S pozdravem<br/>
        <strong>Lovci Lovosice</strong></p>
    
        <p style="font-size:14px;color:#555;">
        V případě nejasností se obracejte na 
        <a href="mailto:lucie@hazenalovosice.cz">lucie@hazenalovosice.cz</a>
        </p>
      `,
    })
  } catch (mailError) {
    console.error('Failed to send VIP registration confirmation email', {
      matchId,
      email,
      error: mailError,
    })
  }

  redirect(`/vip/${matchId}/ok`)
}
