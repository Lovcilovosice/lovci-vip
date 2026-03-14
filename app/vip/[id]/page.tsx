export default function Page({ params }: { params: { id: string } }) {
    const id = params.id
  
    return (
      <main className="min-h-screen bg-[#1b1e32] text-[#bad2ed]">
        <div className="mx-auto max-w-2xl px-6 py-12">
  
          <h1 className="text-3xl font-semibold mb-8">
            VIP registrace – zápas {id}
          </h1>
  
          <form className="space-y-6">
  
            <div>
              <label className="block text-sm mb-2">Jméno</label>
              <input
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white"
                type="text"
              />
            </div>
  
            <div>
              <label className="block text-sm mb-2">E-mail</label>
              <input
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white"
                type="email"
              />
            </div>
  
            <div>
              <label className="block text-sm mb-2">Počet vstupenek</label>
              <input
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white"
                type="number"
                min="1"
                max="10"
                defaultValue="1"
              />
            </div>
  
            <div>
              <label className="block text-sm mb-2">Poznámka</label>
              <textarea
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white"
                rows={4}
              />
            </div>
  
            <button
              className="w-full rounded-2xl bg-[#bad2ed] text-[#1b1e32] font-semibold py-3"
            >
              Odeslat registraci
            </button>
  
          </form>
  
        </div>
      </main>
    )
  }