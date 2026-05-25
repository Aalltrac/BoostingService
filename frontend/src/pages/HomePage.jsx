import { Link } from "react-router-dom";
import { GAMES } from "../constants";
import { ArrowUpRight, Trophy } from "lucide-react";

const HomePage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 lg:py-16">
      <div className="font-mono-label text-[11px] text-brand mb-3">— Nos jeux supportés</div>
      <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-4">
        Choisis ton <span className="metallic-text">terrain.</span>
      </h1>
      <p className="text-slate-400 max-w-2xl mb-12">
        Boosting, vente de comptes. Sélectionne le jeu sur lequel tu veux progresser et découvre les offres
        disponibles.
      </p>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
        {Object.values(GAMES).map((g, idx) => (
          <Link
            key={g.id}
            to={`/games/${g.id}`}
            data-testid={`game-card-${g.id}`}
            className="group relative overflow-hidden border border-white/10 hover:border-brand/40 transition-all rounded-sm fade-up"
            style={{ animationDelay: `${idx * 0.08}s` }}
          >
            <div className="aspect-[16/10] overflow-hidden bg-ink-900 relative">
              <img
                src={g.image}
                alt={g.name}
                className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
              <div className="flex items-end justify-between">
                <div>
                  <div className="font-mono-label text-[10px] text-brand mb-2">— {g.modes.length || "1"} mode{g.modes.length > 1 ? "s" : ""} · {g.ranks.length} ranks</div>
                  <h2 className="font-display font-black text-3xl lg:text-4xl tracking-tighter mb-1">{g.name}</h2>
                  <p className="text-slate-300 text-sm">{g.tagline}</p>
                </div>
                <div className="bg-brand p-3 rounded-sm group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                  <ArrowUpRight size={20} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 border-t border-white/10 pt-12 grid md:grid-cols-3 gap-px bg-white/5">
        {[
          { v: "5%", l: "Commission < 10€" },
          { v: "15%", l: "100€ → 1 000€" },
          { v: "Chat", l: "Direct boosteur ↔ client" },
        ].map((s, i) => (
          <div key={i} className="bg-ink-950 p-8">
            <Trophy size={18} className="text-brand mb-3" />
            <div className="font-display font-black text-2xl mb-1">{s.v}</div>
            <div className="font-mono-label text-[10px] text-slate-500">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
