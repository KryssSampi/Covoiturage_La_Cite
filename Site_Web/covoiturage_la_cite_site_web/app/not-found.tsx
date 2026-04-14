import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#08316e_0%,#0d3f7e_45%,#ffffff_100%)] text-white flex items-center justify-center px-6 py-14">
      <section className="w-full max-w-xl rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm shadow-xl p-8">
        <div
          aria-hidden="true"
          className="w-12 h-12 rounded-full bg-white text-[#08316e] flex items-center justify-center text-xl font-bold mb-5"
        >
          404
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">Page introuvable</h1>
        <p className="mt-3 text-sm text-white/90">
          Cette page n&apos;existe pas ou son lien a ete deplace.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#08316e] hover:bg-gray-100 transition-colors"
          >
            Retour a l&apos;accueil
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-white/50 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </section>
    </main>
  );
}
