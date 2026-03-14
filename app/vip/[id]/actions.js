'use server'

import { redirect } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export async function saveVipRegistration(formData) {
  const matchId = Number(formData.get('match_id'))
  const name = formData.get('name')?.toString().trim() || ''
  const email = formData.get('email')?.toString().trim().toLowerCase() || ''
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

  redirect(`/vip/${matchId}/ok`)
}