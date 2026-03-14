export default function VipRegistrationOkPage() {
  return (
    <main className="min-h-screen bg-[#1b1e32] text-[#bad2ed]">
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold text-white">
          Děkujeme za registraci
        </h1>

        <p className="mt-6 text-white/80 leading-relaxed">
          Vaše VIP registrace byla úspěšně přijata.
        </p>

        <p className="mt-4 text-white/80 leading-relaxed">
          VIP vstupenky vám budou zaslány na uvedený e-mail
          <span className="font-semibold text-white"> v den zápasu.</span>
        </p>

        <a
          href="/vip"
          className="mt-10 inline-block rounded-2xl border border-[#bad2ed] bg-[#bad2ed] px-6 py-3 text-sm font-semibold text-[#1b1e32] hover:opacity-90"
        >
          Zpět na seznam zápasů
        </a>
      </div>
    </main>
  )
}