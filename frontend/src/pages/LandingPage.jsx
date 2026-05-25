import { Link } from "react-router-dom";
import { ArrowRight, Trophy, MessageSquare, ShieldCheck, Gamepad2 } from "lucide-react";
import { useAuth } from "../AuthContext";

const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_f73653a2-3d46-44d2-95d3-e500614cfc81/artifacts/16ijes9k_ChatGPT%20Image%2014%20mai%202026%2C%2014_53_15_11zon.png";

const HERO_BG =
  "https://static.prod-images.emergentagent.com/jobs/f73653a2-3d46-44d2-95d3-e500614cfc81/images/b3573f89ac529232241d2c31b60b97f7c39dbca0d40eaed2b75dd02b669e9799.png";

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-ink-950 text-white overflow-hidden relative">
      {/* HEADER */}
      <header className="absolute top-0 left-0 right-0 z-30">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" data-testid="landing-logo">
            <img src={LOGO_URL} alt="" className="h-11 w-11 rounded-full ring-1 ring-brand/40" />
            <div className="leading-tight">
              <div className="font-display font-black text-sm tracking-tight">BOOSTING</div>
              <div className="font-mono-label text-[10px] text-brand">SERVICE</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/cgu"
              className="text-xs font-mono-label text-slate-400 hover:text-white transition-colors"
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
      <section className="relative pt-32 pb-24 lg:pt-44 lg:pb-32">
        <div
          className="absolute inset-0 z-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-ink-950/40 via-ink-950/70 to-ink-950" />
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
            <p className="mt-6 max-w-xl text-slate-400 text-lg leading-relaxed fade-up" style={{ animationDelay: "0.1s" }}>
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
                className="inline-flex items-center gap-2 border border-white/15 hover:border-brand/40 px-7 py-4 font-semibold rounded-sm transition-colors"
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
                <div key={s.l} className="border-l border-brand/40 pl-4">
                  <div className="font-display font-black text-2xl">{s.v}</div>
                  <div className="font-mono-label text-[10px] text-slate-500 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:block relative">
            <div className="relative aspect-square flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-brand/20 blur-3xl" />
              <img src={LOGO_URL} alt="" className="relative z-10 w-full max-w-md drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-20 border-t border-white/5">
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
                <div key={step.n} className="bg-ink-900 p-8 group hover:bg-ink-800 transition-colors relative">
                  <div className="font-display font-black text-6xl text-brand/20 absolute top-4 right-6">{step.n}</div>
                  <Icon size={22} className="text-brand mb-6" />
                  <h3 className="font-display font-bold text-xl mb-3">{step.t}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="relative py-20 border-t border-white/5">
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
            <div className="font-mono-label text-[10px] text-brand mb-4">— Notre engagement</div>
            <ul className="space-y-5">
              {[
                "Boosteurs vérifiés par l'admin",
                "Chat client ↔ boosteur sécurisé",
                "Commission transparente (5 → 20%)",
                "Médiation en cas d'incident",
              ].map((p) => (
                <li key={p} className="flex gap-3 items-start">
                  <span className="h-1.5 w-1.5 bg-brand rounded-full mt-2.5" />
                  <span className="text-slate-200">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="relative py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center">
          <h2 className="font-display font-black text-3xl sm:text-5xl tracking-tight mb-6">
            Prêt à <span className="metallic-text">grimper</span> ?
          </h2>
          <p className="text-slate-400 mb-10">Crée ton compte en 30 secondes. Email ou Google.</p>
          <Link
            to={user ? "/games" : "/auth"}
            data-testid="landing-cta-bottom"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover transition-all px-8 py-4 font-bold rounded-sm purple-glow"
          >
            {user ? "Accéder à mes jeux" : "Commencer maintenant"}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-[11px] text-slate-600 font-mono-label">
        © {new Date().getFullYear()} Boosting Service · <Link to="/cgu" className="hover:text-white">CGU</Link>
      </footer>
    </div>
  );
};

export default LandingPage;
