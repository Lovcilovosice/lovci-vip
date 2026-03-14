import Link from 'next/link'

export default function VipMatchesPage() {
  const matches = [
    {
      id: 1,
      home: 'Lovci Lovosice',
      away: 'Talent tým Plzeňského kraje',
      venue: 'SH Chemik Lovosice',
      matchDate: '18. 9. 2026, 18:00',
      registrationFrom: '11. 9. 2026, 08:00',
      registrationTo: '16. 9. 2026, 18:00',
      registrationOpen: true,
    },
    {
      id: 2,
      home: 'Lovci Lovosice',
      away: 'HCB Karviná',
      venue: 'SH Chemik Lovosice',
      matchDate: '2. 10. 2026, 17:30',
      registrationFrom: '25. 9. 2026, 08:00',
      registrationTo: '30. 9. 2026, 18:00',
      registrationOpen: false,
    },
    {
      id: 3,
      home: 'Lovci Lovosice',
      away: 'HC Dukla Praha',
      venue: 'Sportovní hala Slaný',
      matchDate: '16. 10. 2026, 18:00',
      registrationFrom: '9. 10. 2026, 08:00',
      registrationTo: '14. 10. 2026, 18:00',
      registrationOpen: false,
    },
  ]

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

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          {matches.map((match) => (

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
                    {match.matchDate}
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
                    {match.registrationFrom}
                  </strong>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                  <span className="block text-xs uppercase tracking-[0.14em] text-[#bad2ed]/80">
                    Ukončení registrace
                  </span>
                  <strong className="mt-1 block text-base font-medium text-white">
                    {match.registrationTo}
                  </strong>
                </div>

              </div>

              <div className="mt-6">

                {match.registrationOpen ? (
                  <Link
                    href={`/vip/${match.id}`}
                    className="block w-full rounded-2xl border border-[#bad2ed] bg-[#bad2ed] text-[#1b1e32] px-4 py-3 text-center text-sm font-semibold hover:opacity-90"
                  >
                    Registrovat VIP
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full rounded-2xl border border-[#bad2ed]/25 bg-transparent px-4 py-3 text-sm font-semibold text-white/45 cursor-not-allowed"
                  >
                    Registrace zatím není otevřena
                  </button>
                )}

              </div>

            </article>

          ))}

        </section>

      </div>
    </main>
  )
}
