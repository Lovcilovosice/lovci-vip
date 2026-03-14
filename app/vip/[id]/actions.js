'use server'

import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export async function saveVipRegistration(formData) {
  const matchId = Number(formData.get('match_id'))
  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const ticketsCount = Number(formData.get('tickets_count') || 1)
  const note = String(formData.get('note') || '').trim()

  if (!matchId || !name || !email) {
    throw new Error('Chybí povinné údaje.')
  }

  if (ticketsCount < 1 || ticketsCount > 10) {
    throw new Error('Počet vstupenek musí být mezi 1 a 10.')
  }

  const { error } = await supabase.from('registrations').insert([
    {
      match_id: matchId,
      name,
      email,
      tickets_count: ticketsCount,
      note: note || null,
    },
  ])

  if (error) {
    throw new Error(error.message)
  }

  redirect(`/vip/${matchId}/ok`)
}