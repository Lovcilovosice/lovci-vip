'use client';

import { useState } from 'react';

type Props = {
  matchId: number;
};

export default function AdminExportButton({ matchId }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    const pin = window.prompt('Zadej admin PIN');

    if (!pin) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        window.alert('Neplatný PIN');
        return;
      }

      const url = `/api/export-registrations?matchId=${matchId}&secret=${encodeURIComponent(pin)}`;
      window.location.href = url;
    } catch {
      window.alert('Chyba ověření admina');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-50"
    >
      {loading ? 'Ověřuji...' : 'Admin'}
    </button>
  );
}