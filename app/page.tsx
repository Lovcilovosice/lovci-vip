import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#1b1e32] text-[#bad2ed]">
      <div className="text-center space-y-6">
        <img src="/logo.png" className="h-24 mx-auto" />

        <h1 className="text-4xl font-semibold">
          VIP Lovci Lovosice
        </h1>

        <Link
          href="/vip"
          className="bg-[#bad2ed] text-[#1b1e32] px-6 py-3 rounded-xl font-semibold"
        >
          Otevřít VIP registraci
        </Link>
      </div>
    </main>
  )
}