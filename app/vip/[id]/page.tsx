import { notFound } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { saveVipRegistration } from './actions'

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const resolvedSearchParams = await searchParams
  const matchId = Number(id)

  if (!matchId || Number.isNaN(matchId)) {
    notFound()
  }

  const { data: match, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single()

  if (error) {
    return (
      <main className="min-h-screen bg-[#1b1e32] px-6 py-12 text-red-300">
        Chyba databáze: {error.message}
      </main>
    )
  }

  if (!match) {
    notFound()
  }

  const matchDate = new Date(match.match_date).toLocaleString('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  let errorMessage = ''

  if (resolvedSearchParams.error === 'email_not_invited') {
    errorMessage = 'Zadaný e-mail není mezi pozvanými hosty.'
  } else if (resolvedSearchParams.error === 'missing_fields') {
    errorMessage = 'Prosím vyplňte všechna povinná pole.'
  } else if (resolvedSearchParams.error === 'save_failed') {
    errorMessage = 'Registraci se nepodařilo uložit. Zkuste to prosím znovu.'
  } else if (resolvedSearchParams.error === 'email_check_failed') {
    errorMessage = 'Nepodařilo se ověřit e-mail. Zkuste to prosím znovu.'
  } else if (resolvedSearchParams.error === 'already_registered') {
    errorMessage = 'Na tento zápas jste již registrován.'
  }

  return (
    <main className="min-h-screen bg-[#1b1e32] text-[#bad2ed]">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.22em] text-[#bad2ed]/70">
            VIP registrace
          </p>

          <h1 className="mt-2 text-3xl font-semibold leading-tight">
            {match.home}
            <span className="block text-[#bad2ed]">vs.</span>
            {match.away}
          </h1>

          <p className="mt-4 text-[#bad2ed]/90">{matchDate}</p>
          <p className="mt-1 text-[#bad2ed]/80">{match.venue}</p>
        </div>

        <div className="mb-6 rounded-2xl border border-[#bad2ed]/40 bg-[#bad2ed]/10 p-4 text-sm">
          <p className="font-semibold text-[#bad2ed]">
            Vstup do VIP prostor bude umožněn 1 hodinu před začátkem zápasu.
          </p>
        </div>

        {errorMessage ? (
          <div className="mb-6 rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm">
            <p className="font-semibold text-red-300">{errorMessage}</p>
          </div>
        ) : null}

        <form
          action={saveVipRegistration}
          className="space-y-6 rounded-3xl border border-[#bad2ed]/25 bg-white/[0.03] p-6"
        >
          <input type="hidden" name="match_id" value={match.id} />

          <div>
            <label className="mb-2 block text-sm text-[#bad2ed]/80">
              Jméno a příjmení
            </label>
            <input
              name="name"
              type="text"
              required
              className="w-full rounded-2xl border border-white/15 bg-black/10 px-4 py-3 text-[#bad2ed] outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[#bad2ed]/80">E-mail</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-2xl border border-white/15 bg-black/10 px-4 py-3 text-[#bad2ed] outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[#bad2ed]/80">
              Počet vstupenek
            </label>
            <input
              name="tickets_count"
              type="number"
              min="1"
              max="10"
              defaultValue="1"
              required
              className="w-full rounded-2xl border border-white/15 bg-black/10 px-4 py-3 text-[#bad2ed] outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[#bad2ed]/80">Poznámka</label>
            <textarea
              name="note"
              rows={4}
              className="w-full rounded-2xl border border-white/15 bg-black/10 px-4 py-3 text-[#bad2ed] outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl border border-[#bad2ed] bg-[#bad2ed] px-4 py-3 text-sm font-semibold text-[#1b1e32] hover:opacity-90"
          >
            Odeslat registraci
          </button>
        </form>
      </div>
    </main>
  )
}