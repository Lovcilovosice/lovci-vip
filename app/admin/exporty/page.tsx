import { createClient } from '@supabase/supabase-js';
import AdminExportButton from '@/components/AdminExportButton';

export const dynamic = 'force-dynamic';

type Match = {
  id: number;
  home: string | null;
  away: string | null;
  match_date: string | null;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env: ${name}`);
  }
  return value;
}

export default async function Page() {
  const supabase = createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  );

  const { data: matches, error } = await supabase
    .from('matches')
    .select('id, home, away, match_date')
    .order('id', { ascending: false });

  if (error) {
    return <div className="p-6">Chyba: {error.message}</div>;
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      <h1 className="text-2xl font-bold">Export registrací</h1>

      <div className="space-y-4">
        {(matches || []).map((match: Match) => (
          <div
            key={match.id}
            className="flex items-center justify-between border rounded-xl p-4"
          >
            <div>
              <div className="font-semibold">
                {match.home} vs {match.away}
              </div>
              <div className="text-sm text-gray-500">
                ID: {match.id}
              </div>
            </div>

            <AdminExportButton matchId={match.id} />
          </div>
        ))}
      </div>
    </div>
  );
}