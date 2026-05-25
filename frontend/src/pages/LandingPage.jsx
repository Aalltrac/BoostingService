import { Link } from "react-router-dom";
import {
  ArrowRight,
  Trophy,
  MessageSquare,
  ShieldCheck,
  Gamepad2,
  Lock,
  Zap,
  Users,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { useAuth } from "../AuthContext";

const LOGO_URL =
  "https://i.postimg.cc/sxL0Tr5p/Chat-GPT-Image-14-mai-2026-14-53-15-11zon-removebg-preview.png";

const HERO_BG =
  "https://static.prod-images.emergentagent.com/jobs/f73653a2-3d46-44d2-95d3-e500614cfc81/images/b3573f89ac529232241d2c31b60b97f7c39dbca0d40eaed2b75dd02b669e9799.png";

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen w-full bg-ink-950 text-white">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-30 w-full backdrop-blur-md bg-ink-950/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" data-testid="landing-logo">
            <img src={LOGO_URL} alt="" className="h-11 w-11 rounded-full ring-1 ring-brand/40" />
            <div className="leading-tight">
              <div className="font-display font-black text-sm tracking-tight">BOOSTING</div>
              <div className="font-mono-label text-[10px] text-brand">SERVICE</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#games"
              className="text-xs font-mono-label text-slate-400 hover:text-white transition-colors"
              data-testid="nav-games"
            >
              JEUX
            </a>
            <a
              href="#how"
              className="text-xs font-mono-label text-slate-400 hover:text-white transition-colors"
              data-testid="nav-how"
            >
              PROCESSUS
            </a>
            <a
              href="#faq"
              className="text-xs font-mono-label text-slate-400 hover:text-white transition-colors"
              data-testid="nav-faq"
            >
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/cgu"
              className="hidden sm:inline text-xs font-mono-label text-slate-400 hover:text-white transition-colors"
              data-testid="landing-cgu"
            >
              CGU
            </Link>
            <Link
              to={user ? "/games" : "/auth"}
              data-testid="landing-cta-header"
              className="px-5 py-2.5 bg-brand hover:bg-brand-hover transition-colors font-semibold text-sm rounded-sm purple-glow"
            >
              {user ? "Mes jeux" : "Connexion"}
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative w-full pt-32 pb-24 lg:pt-44 lg:pb-32 overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-ink-950/40 via-ink-950/70 to-ink-950" />

        {/* Decorative grid */}
        <div
          className="absolute inset-0 z-10 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-20 max-w-7xl mx-auto px-4 lg:px-8 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-brand/30 bg-brand/10 rounded-sm mb-8 fade-up">
              <span className="h-1.5 w-1.5 bg-brand rounded-full pulse-dot" />
              <span className="font-mono-label text-[10px]">Boosteurs vérifiés · Chat en direct</span>
            </div>
            <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tighter fade-up">
              Monte de <span className="metallic-text">rank.</span>
              <br />
              Sans <span className="text-brand">galérer.</span>
            </h1>
            <p
              className="mt-6 max-w-xl text-slate-400 text-lg leading-relaxed fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              Boosting Service met en relation joueurs et boosteurs pros sur{" "}
              <span className="text-white font-semibold">Rocket League</span> &{" "}
              <span className="text-white font-semibold">Valorant</span>. Choisis ton boosteur, lance ta commande, suis
              la progression en temps réel.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 fade-up" style={{ animationDelay: "0.2s" }}>
              <Link
                to={user ? "/games" : "/auth"}
                data-testid="hero-cta-primary"
                className="group inline-flex items-center gap-2 bg-brand hover:bg-brand-hover transition-all px-7 py-4 font-bold rounded-sm purple-glow"
              >
                {user ? "Voir les jeux" : "Démarrer maintenant"}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to={user ? "/become-booster" : "/auth"}
                data-testid="hero-cta-secondary"
                className="inline-flex items-center gap-2 border border-white/15 hover:border-brand/40 hover:bg-white/[0.02] px-7 py-4 font-semibold rounded-sm transition-colors"
              >
                Devenir boosteur
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-4 max-w-xl fade-up" style={{ animationDelay: "0.3s" }}>
              {[
                { v: "2", l: "Jeux supportés" },
                { v: "100%", l: "Boosteurs vérifiés" },
                { v: "0€", l: "Frais cachés" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="border-l border-brand/40 pl-4 hover:border-brand transition-colors"
                >
                  <div className="font-display font-black text-2xl">{s.v}</div>
                  <div className="font-mono-label text-[10px] text-slate-500 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full bg-brand/10 blur-3xl" />
            <div className="absolute -inset-6 border border-brand/10 rounded-full" />
            <div className="absolute -inset-16 border border-white/[0.04] rounded-full" />
            <img
              src={LOGO_URL}
              alt=""
              className="relative z-10 w-full max-w-sm drop-shadow-2xl"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        </div>
      </section>

      {/* GAMES (nouveau) */}
      <section id="games" className="relative w-full py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="mb-12 flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="font-mono-label text-[11px] text-brand mb-3">— Jeux supportés</div>
              <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight">
                Deux jeux. <span className="metallic-text">Des pros vérifiés.</span>
              </h2>
            </div>
            <Link
              to={user ? "/games" : "/auth"}
              data-testid="games-cta"
              className="text-xs font-mono-label text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2"
            >
              VOIR LES OFFRES
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Rocket League",
                tag: "ROCKET LEAGUE",
                desc: "Boost en 1v1, 2v2, 3v3, Hoops, SnowDay, Rumble, Heatseeker, Dropshot. Du Bronze au SSL.",
                modes: ["Compétitif", "Placements", "Coaching"],
              },
              {
                title: "Valorant",
                tag: "VALORANT",
                desc: "Boost Solo Q / Duo Q. Toutes régions, placements, win boost.",
                modes: ["Solo Q", "Duo Q", "Placements"],
              },
            ].map((g) => (
              <div
                key={g.title}
                className="group relative border border-white/10 bg-ink-900 p-8 hover:border-brand/40 hover:bg-ink-800 transition-all"
              >
                <div className="absolute top-6 right-6 font-mono-label text-[10px] text-slate-600 group-hover:text-brand transition-colors">
                  {g.tag}
                </div>
                <Gamepad2 size={28} className="text-brand mb-6" />
                <h3 className="font-display font-black text-2xl mb-3">{g.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">{g.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {g.modes.map((m) => (
                    <span
                      key={m}
                      className="text-[10px] font-mono-label px-2.5 py-1 border border-white/10 text-slate-300"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative w-full py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="mb-12">
            <div className="font-mono-label text-[11px] text-brand mb-3">— Comment ça marche</div>
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight">
              Trois étapes. <span className="metallic-text">Zéro friction.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-white/10 border border-white/10">
            {[
              {
                n: "01",
                t: "Choisis ton jeu",
                d: "Rocket League ou Valorant. Pick ton mode, ton rank actuel et ton objectif.",
                icon: Gamepad2,
              },
              {
                n: "02",
                t: "Sélectionne ton boosteur",
                d: "Notre booster par défaut ou un autre pro vérifié. Tous transparents.",
                icon: Trophy,
              },
              {
                n: "03",
                t: "Suis ton boost en live",
                d: "Chat direct avec ton boosteur. Identifiants transmis de façon sécurisée.",
                icon: MessageSquare,
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.n}
                  className="bg-ink-900 p-8 group hover:bg-ink-800 transition-colors relative"
                >
                  <div className="font-display font-black text-6xl text-brand/20 absolute top-4 right-6 group-hover:text-brand/40 transition-colors">
                    {step.n}
                  </div>
                  <Icon size={22} className="text-brand mb-6" />
                  <h3 className="font-display font-bold text-xl mb-3">{step.t}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.d}</p>
                  <div className="mt-6 h-px w-10 bg-brand/40 group-hover:w-20 transition-all" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="relative w-full py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <ShieldCheck size={32} className="text-brand mb-6" />
            <h2 className="font-display font-black text-3xl sm:text-4xl tracking-tight mb-6">
              Une plateforme, <span className="text-brand">pas un intermédiaire.</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed mb-4">
              Boosting Service met en relation clients et boosteurs indépendants. Chaque transaction se fait directement
              entre eux. Notre rôle : garantir un cadre clair, un chat sécurisé et un point de contact en cas de litige.
            </p>
            <p className="text-slate-500 text-sm leading-relaxed">
              Le créateur est joignable à tout moment via la plateforme pour toute médiation. Conditions complètes dans
              les CGU.
            </p>
          </div>
          <div className="border border-white/10 bg-ink-900 p-8 lg:p-10">
            <div className="font-mono-label text-[10px] text-brand mb-6">— Notre engagement</div>
            <ul className="space-y-5">
              {[
                { icon: Users, t: "Boosteurs vérifiés par l'admin" },
                { icon: Lock, t: "Chat client ↔ boosteur sécurisé" },
                { icon: Zap, t: "Commission transparente (5 → 20%)" },
                { icon: ShieldCheck, t: "Médiation en cas d'incident" },
              ].map((p) => {
                const Icon = p.icon;
                return (
                  <li key={p.t} className="flex gap-4 items-start">
                    <span className="shrink-0 h-8 w-8 grid place-items-center border border-brand/30 bg-brand/10">
                      <Icon size={14} className="text-brand" />
                    </span>
                    <span className="text-slate-200 leading-relaxed">{p.t}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative w-full py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <div className="mb-12 text-center">
            <div className="font-mono-label text-[11px] text-brand mb-3">— FAQ</div>
            <h2 className="font-display font-black text-3xl sm:text-4xl tracking-tight">
              Les questions <span className="metallic-text">essentielles.</span>
            </h2>
          </div>
          <div className="divide-y divide-white/10 border-t border-b border-white/10">
            {[
              {
                q: "Mon compte est-il en sécurité ?",
                a: "Les identifiants transitent uniquement via le chat sécurisé avec ton boosteur vérifié. Aucun mot de passe n'est stocké côté plateforme.",
              },
              {
                q: "Comment sont sélectionnés les boosteurs ?",
                a: "Chaque boosteur est vérifié manuellement par l'admin avant d'apparaître sur la plateforme. Rank, historique et sérieux sont contrôlés.",
              },
              {
                q: "Quels sont les frais ?",
                a: "Une commission transparente de 5 à 20% selon le type de prestation. Aucun frais caché : le tarif affiché est le tarif final.",
              },
              {
                q: "Que se passe-t-il en cas de problème ?",
                a: "Le créateur de la plateforme est joignable à tout moment pour assurer la médiation entre le client et le boosteur.",
              },
            ].map((f, i) => (
              <details
                key={f.q}
                className="group py-5 px-1 cursor-pointer"
                data-testid={`faq-${i}`}
              >
                <summary className="flex items-center justify-between gap-6 list-none">
                  <span className="font-display font-bold text-base sm:text-lg text-white">{f.q}</span>
                  <span className="shrink-0 h-7 w-7 grid place-items-center border border-white/15 group-hover:border-brand/40 transition-colors">
                    <span className="font-mono-label text-brand text-sm group-open:rotate-45 transition-transform inline-block">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-4 text-slate-400 text-sm leading-relaxed pr-12">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative w-full py-24 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand/[0.04] to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 lg:px-8 text-center">
          <h2 className="font-display font-black text-3xl sm:text-5xl tracking-tight mb-6">
            Prêt à <span className="metallic-text">grimper</span> ?
          </h2>
          <p className="text-slate-400 mb-10">Crée ton compte en 30 secondes. Email ou Google.</p>
          <Link
            to={user ? "/games" : "/auth"}
            data-testid="landing-cta-bottom"
            className="group inline-flex items-center gap-2 bg-brand hover:bg-brand-hover transition-all px-8 py-4 font-bold rounded-sm purple-glow"
          >
            {user ? "Accéder à mes jeux" : "Commencer maintenant"}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <div className="mt-10 flex items-center justify-center gap-6 flex-wrap text-slate-500">
            {[
              "Paiement direct",
              "Chat sécurisé",
              "Boosteurs vérifiés",
            ].map((t) => (
              <div key={t} className="inline-flex items-center gap-2 text-xs font-mono-label">
                <CheckCircle2 size={14} className="text-brand" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-white/5 bg-ink-950">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-14 grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3" data-testid="footer-logo">
              <img src={LOGO_URL} alt="" className="h-10 w-10 rounded-full ring-1 ring-brand/40" />
              <div className="leading-tight">
                <div className="font-display font-black text-sm tracking-tight">BOOSTING</div>
                <div className="font-mono-label text-[10px] text-brand">SERVICE</div>
              </div>
            </Link>
            <p className="mt-5 text-slate-500 text-sm leading-relaxed max-w-sm">
              La plateforme qui met en relation joueurs et boosteurs vérifiés sur Rocket League et Valorant.
            </p>
          </div>

          <div>
            <div className="font-mono-label text-[10px] text-brand mb-4">— Plateforme</div>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#games" className="text-slate-400 hover:text-white transition-colors">
                  Jeux
                </a>
              </li>
              <li>
                <a href="#how" className="text-slate-400 hover:text-white transition-colors">
                  Processus
                </a>
              </li>
              <li>
                <a href="#faq" className="text-slate-400 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <Link
                  to={user ? "/become-booster" : "/auth"}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Devenir boosteur
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-mono-label text-[10px] text-brand mb-4">— Légal & Contact</div>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/cgu" className="text-slate-400 hover:text-white transition-colors">
                  CGU
                </Link>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Mail size={14} className="text-brand" />
                <span>Médiation via la plateforme</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 py-6 text-center text-[11px] text-slate-600 font-mono-label">
          © {new Date().getFullYear()} BOOSTING SERVICE · TOUS DROITS RÉSERVÉS
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
