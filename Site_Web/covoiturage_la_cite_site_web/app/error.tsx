'use client';

import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#08316e_0%,#0d3f7e_45%,#ffffff_100%)] text-white flex items-center justify-center px-6 py-14">
      <section className="w-full max-w-xl rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm shadow-xl p-8">
        <div
          aria-hidden="true"
          className="w-12 h-12 rounded-full bg-white text-[#08316e] flex items-center justify-center text-2xl font-bold mb-5"
        >
          !
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">Quelque chose s&apos;est mal passe</h1>
        <p className="mt-3 text-sm text-white/90">
          Une erreur inattendue est survenue. Vous pouvez reessayer maintenant ou revenir a l&apos;accueil.
        </p>

        {error.digest ? (
          <p className="mt-4 rounded-lg bg-white/90 px-3 py-2 text-xs text-[#08316e]">
            Code de reference: <span className="font-mono">{error.digest}</span>
          </p>
        ) : null}

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            aria-label="Reessayer"
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#08316e] hover:bg-gray-100 transition-colors"
          >
            Reessayer
          </button>
          <Link
            href="/"
            className="rounded-lg border border-white/50 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 transition-colors"
          >
            Retour a l&apos;accueil
          </Link>
        </div>
      </section>
    </main>
  );
}
