export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { supabase } from '@/lib/supabase'

function parseDbLocalDate(value: string) {
  const normalized = value.replace('T', ' ').replace('Z', '')
  const [datePart, timePart = '00:00:00'] = normalized.split(' ')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute, second] = timePart.split(':').map(Number)

  return new Date(year, month - 1, day, hour, minute, second || 0)
}

function formatDbLocalDate(value: string) {
  const date = parseDbLocalDate(value)

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${day}. ${month}. ${year} ${hours}:${minutes}`
}

function getPragueNowAsLocalDate() {
  const pragueNowString = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Prague',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date())

  const [datePart, timePart] = pragueNowString.split(' ')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute, second] = timePart.split(':').map(Number)

  return new Date(year, month - 1, day, hour, minute, second)
}

export default async function VipMatchesPage() {
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true })

  if (error) {
    return (
      <main className="min-h-screen bg-[#1b1e32] text-[#bad2ed]">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-semibold">VIP registrace</h1>
          <p className="mt-4 text-white/80">Nepodařilo se načíst zápasy ze Supabase.</p>
          <p className="mt-2 text-sm text-red-300">{error.message}</p>
        </div>
      </main>
    )
  }

  const now = getPragueNowAsLocalDate()

  const futureMatches =
    matches?.filter((match) => parseDbLocalDate(match.match_date) >= now) ?? []

  return (
    <main className="min-h-screen bg-[#1b1e32] text-[#bad2ed]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-white/70">
              VIP registrace
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Domácí zápasy Lovců Lovosice
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-white/75">
              Vyberte si nadcházející domácí zápas a odešlete VIP registraci.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Lovci Lovosice"
              className="h-20 w-20 object-contain"
            />
          </div>
        </header>

        {futureMatches.length === 0 ? (
          <div className="rounded-3xl border border-[#bad2ed]/25 bg-white/[0.03] p-6 text-white/80">
            Aktuálně nejsou k dispozici žádné budoucí zápasy.
          </div>
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {futureMatches.map((match) => {
              const registrationOpen =
                parseDbLocalDate(match.registration_from) <= now &&
                parseDbLocalDate(match.registration_to) >= now

              const matchDate = formatDbLocalDate(match.match_date)
              const registrationFrom = formatDbLocalDate(match.registration_from)
              const registrationTo = formatDbLocalDate(match.registration_to)

              return (
                <article
                  key={match.id}
                  className="rounded-3xl border border-[#bad2ed]/25 bg-white/[0.03] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
                >
                  <div className="mb-5">
                    <p className="text-sm uppercase tracking-[0.18em] text-white/55">
                      Zápas
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold leading-tight">
                      {match.home}
                      <span className="block text-white">vs.</span>
                      {match.away}
                    </h2>
                  </div>

                  <div className="space-y-3 text-sm leading-6 text-white/85">
                    <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                      <span className="block text-xs uppercase tracking-[0.14em] text-[#bad2ed]/80">
                        Datum a čas zápasu
                      </span>
                      <strong className="mt-1 block text-base font-medium text-white">
                        {matchDate}
                      </strong>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                      <span className="block text-xs uppercase tracking-[0.14em] text-[#bad2ed]/80">
                        Místo zápasu
                      </span>
                      <strong className="mt-1 block text-base font-medium text-white">
                        {match.venue}
                      </strong>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                      <span className="block text-xs uppercase tracking-[0.14em] text-[#bad2ed]/80">
                        Spuštění registrace
                      </span>
                      <strong className="mt-1 block text-base font-medium text-white">
                        {registrationFrom}
                      </strong>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                      <span className="block text-xs uppercase tracking-[0.14em] text-[#bad2ed]/80">
                        Ukončení registrace
                      </span>
                      <strong className="mt-1 block text-base font-medium text-white">
                        {registrationTo}
                      </strong>
                    </div>
                  </div>

                  <div className="mt-6">
                    {registrationOpen ? (
                      <Link
                        href={`/vip/${match.id}`}
                        className="block w-full rounded-2xl border border-[#bad2ed] bg-[#bad2ed] px-4 py-3 text-center text-sm font-semibold text-[#1b1e32] hover:opacity-90"
                      >
                        Registrovat VIP
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="w-full cursor-not-allowed rounded-2xl border border-[#bad2ed]/25 bg-transparent px-4 py-3 text-sm font-semibold text-white/45"
                      >
                        Registrace zatím není otevřena
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </div>
    </main>
  )
}