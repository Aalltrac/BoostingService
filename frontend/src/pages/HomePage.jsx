import { Link } from "react-router-dom";
import { GAMES } from "../constants";
import {
  ArrowUpRight,
  Trophy,
  ShieldCheck,
  Zap,
  MessageSquare,
  Star,
  ChevronRight,
} from "lucide-react";

/**
 * HomePage — refonte sobre & professionnelle.
 * Conserve : palette (ink-950 / brand), typographies (font-display, font-mono-label),
 * classe metallic-text, animations fade-up déjà définies dans le projet.
 * Améliore : hiérarchie, densité d'info utile, responsive mobile, micro-interactions.
 */
const HomePage = () => {
  const games = Object.values(GAMES);

  const trustStats = [
    { v: "12 480+", l: "Commandes livrées" },
    { v: "4.9/5", l: "Note moyenne" },
    { v: "< 2 min", l: "Temps de réponse" },
  ];

  const steps = [
    {
      icon: <ChevronRight size={16} />,
      n: "01",
      t: "Choisis ton jeu",
      d: "Sélectionne ton terrain, ton mode et ton rang de départ.",
    },
    {
      icon: <Zap size={16} />,
      n: "02",
      t: "Configure ton boost",
      d: "Options, fenêtres horaires, stream privé. Devis instantané.",
    },
    {
      icon: <MessageSquare size={16} />,
      n: "03",
      t: "Suis ta progression",
      d: "Chat direct avec ton boosteur, suivi temps réel jusqu’à la livraison.",
    },
  ];

  const perks = [
    {
      icon: <ShieldCheck size={16} className="text-brand" />,
      v: "5%",
      l: "Commission < 10€",
    },
    {
      icon: <Trophy size={16} className="text-brand" />,
      v: "15%",
      l: "100€ → 1 000€",
    },
    {
      icon: <MessageSquare size={16} className="text-brand" />,
      v: "Chat",
      l: "Direct boosteur ↔ client",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 lg:py-16">
      {/* ───────────── HERO ───────────── */}
      <section
        data-testid="home-hero"
        className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-end mb-14 lg:mb-20"
      >
        <div className="lg:col-span-8">
          <div className="font-mono-label text-[11px] text-brand mb-3 flex items-center gap-2">
            <span className="inline-block w-6 h-px bg-brand/60" />
            Nos jeux supportés
          </div>
          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-5 leading-[0.95]">
            Choisis ton <span className="metallic-text">terrain.</span>
          </h1>
          <p className="text-slate-400 max-w-2xl text-sm sm:text-base leading-relaxed">
            Boosting et vente de comptes par des joueurs vérifiés. Sélectionne
            le jeu sur lequel tu veux progresser, configure ton boost en moins
            d’une minute et suis la livraison en direct.
          </p>
        </div>

        {/* Trust strip — à droite sur desktop, dessous sur mobile */}
        <div
          data-testid="home-trust-strip"
          className="lg:col-span-4 grid grid-cols-3 lg:grid-cols-1 border-t lg:border-t-0 lg:border-l border-white/10 lg:pl-6 pt-6 lg:pt-0 gap-px lg:gap-0 bg-white/5 lg:bg-transparent"
        >
          {trustStats.map((s, i) => (
            <div
              key={i}
              className="bg-ink-950 lg:bg-transparent p-4 lg:p-0 lg:py-3 lg:flex lg:items-baseline lg:justify-between lg:border-b lg:border-white/5 last:border-b-0"
            >
              <div className="font-display font-black text-xl lg:text-2xl tracking-tighter">
                {s.v}
              </div>
              <div className="font-mono-label text-[10px] text-slate-500 mt-1 lg:mt-0">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── GAMES GRID ───────────── */}
      <section data-testid="home-games-section" className="mb-20 lg:mb-28">
        <div className="flex items-end justify-between mb-6 lg:mb-8">
          <div>
            <div className="font-mono-label text-[10px] text-slate-500">
              [01] — Catalogue
            </div>
            <h2 className="font-display font-black text-2xl lg:text-3xl tracking-tighter mt-1">
              Sélectionne un jeu
            </h2>
          </div>
          <div className="font-mono-label text-[10px] text-slate-500 hidden sm:block">
            {games.length} {games.length > 1 ? "jeux disponibles" : "jeu disponible"}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 lg:gap-7">
          {games.map((g, idx) => (
            <Link
              key={g.id}
              to={`/games/${g.id}`}
              data-testid={`game-card-${g.id}`}
              className="group relative overflow-hidden border border-white/10 hover:border-brand/40 transition-all duration-300 rounded-sm fade-up bg-ink-950"
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              {/* Image */}
              <div className="aspect-[16/10] overflow-hidden bg-ink-900 relative">
                <img
                  src={g.image}
                  alt={g.name}
                  loading="lazy"
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-95 group-hover:scale-105 transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />

                {/* Top tag row */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="font-mono-label text-[10px] tracking-wider bg-ink-950/80 backdrop-blur-sm border border-white/10 text-slate-300 px-2 py-1 rounded-sm">
                    {g.modes.length || 1} mode{g.modes.length > 1 ? "s" : ""} · {g.ranks.length} ranks
                  </span>
                  {idx === 0 && (
                    <span
                      data-testid={`game-card-${g.id}-badge`}
                      className="font-mono-label text-[10px] tracking-wider bg-brand/15 border border-brand/40 text-brand px-2 py-1 rounded-sm"
                    >
                      POPULAIRE
                    </span>
                  )}
                </div>
              </div>

              {/* Footer content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 lg:p-8">
                <div className="flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl tracking-tighter mb-1 leading-none truncate">
                      {g.name}
                    </h3>
                    <p className="text-slate-300 text-xs sm:text-sm truncate">
                      {g.tagline}
                    </p>
                  </div>
                  <div className="bg-brand p-2.5 sm:p-3 rounded-sm group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300 shrink-0">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
              </div>

              {/* Hairline accent on hover */}
              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-brand scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
            </Link>
          ))}
        </div>
      </section>

      {/* ───────────── HOW IT WORKS ───────────── */}
      <section data-testid="home-how-it-works" className="mb-20 lg:mb-28">
        <div className="mb-8 lg:mb-10">
          <div className="font-mono-label text-[10px] text-slate-500">
            [02] — Process
          </div>
          <h2 className="font-display font-black text-2xl lg:text-3xl tracking-tighter mt-1">
            Comment ça marche
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-px bg-white/5 border border-white/10 rounded-sm overflow-hidden">
          {steps.map((s, i) => (
            <div
              key={i}
              data-testid={`how-step-${i + 1}`}
              className="bg-ink-950 p-6 lg:p-8 group hover:bg-ink-900/60 transition-colors"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono-label text-[10px] text-brand">
                  {s.n}
                </span>
                <span className="text-slate-500 group-hover:text-brand transition-colors">
                  {s.icon}
                </span>
              </div>
              <div className="font-display font-black text-xl lg:text-2xl tracking-tighter mb-2">
                {s.t}
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── PERKS / STATS ───────────── */}
      <section
        data-testid="home-perks"
        className="border-t border-white/10 pt-12"
      >
        <div className="grid sm:grid-cols-3 gap-px bg-white/5">
          {perks.map((s, i) => (
            <div
              key={i}
              data-testid={`perk-${i + 1}`}
              className="bg-ink-950 p-6 lg:p-8 flex flex-col gap-3"
            >
              <div className="flex items-center gap-2">
                {s.icon}
                <Star size={12} className="text-brand/40" />
              </div>
              <div className="font-display font-black text-2xl lg:text-3xl tracking-tighter">
                {s.v}
              </div>
              <div className="font-mono-label text-[10px] text-slate-500">
                {s.l}
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border border-white/10 rounded-sm p-6 lg:p-8 bg-ink-950">
          <div>
            <div className="font-mono-label text-[10px] text-brand mb-2">
              — Prêt à grimper ?
            </div>
            <div className="font-display font-black text-xl lg:text-2xl tracking-tighter">
              Lance ta première commande en moins de 60 secondes.
            </div>
          </div>
          <Link
            to={`/games/${games[0]?.id ?? ""}`}
            data-testid="home-cta-start"
            className="group inline-flex items-center gap-3 bg-brand text-ink-950 px-5 py-3 rounded-sm font-mono-label text-[11px] tracking-wider hover:gap-4 transition-all"
          >
            COMMENCER
            <ArrowUpRight
              size={16}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
