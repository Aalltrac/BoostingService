import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from "lucide-react";

const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_f73653a2-3d46-44d2-95d3-e500614cfc81/artifacts/16ijes9k_ChatGPT%20Image%2014%20mai%202026%2C%2014_53_15_11zon.png";

const HERO_BG =
  "https://static.prod-images.emergentagent.com/jobs/f73653a2-3d46-44d2-95d3-e500614cfc81/images/7ba283cf9da268bff3f13e3c9d9a61169edc43bcda5d4a85bf95059203315051.png";

const AuthPage = () => {
  const { user, loginEmail, signupEmail, loginGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/games" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        await loginEmail(email, password);
        toast.success("Connecté !");
      } else {
        await signupEmail(email, password, displayName);
        toast.success("Compte créé !");
      }
      navigate("/games");
    } catch (err) {
      toast.error(err.message || "Erreur d'authentification");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    try {
      await loginGoogle();
      toast.success("Connecté avec Google !");
      navigate("/games");
    } catch (err) {
      toast.error(err.message || "Erreur Google Sign-In");
    } finally {
      setBusy(false);
    }
  };

  const inputBase =
    "w-full bg-ink-900/80 border border-white/10 focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none pl-10 pr-3 py-3 text-sm rounded-sm transition-all placeholder:text-slate-600";

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ink-950 text-white">
      {/* LEFT: brand panel */}
      <div className="hidden lg:flex relative overflow-hidden p-12 flex-col justify-between border-r border-white/5">
        {/* Background image */}
        <div
          className="absolute inset-0 opacity-40 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        {/* Vignette / readability layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-ink-950 via-ink-950/80 to-ink-950/30" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Accent corner glow */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand/20 blur-3xl pointer-events-none" />

        {/* Top: back link + status badge */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors group"
            data-testid="auth-back"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Retour
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/10 bg-white/5 backdrop-blur-sm rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="font-mono-label text-[10px] text-slate-300 tracking-wider">
              BOOSTEURS EN LIGNE
            </span>
          </div>
        </div>

        {/* Middle: hero */}
        <div className="relative z-10">
          <img
            src={LOGO_URL}
            alt=""
            className="h-20 w-20 rounded-full mb-8 ring-2 ring-brand/40 purple-glow"
          />
          <div className="font-mono-label text-[11px] text-brand mb-4 tracking-widest">
            — PLATEFORME N°1 DU BOOST
          </div>
          <h1 className="font-display font-black text-5xl xl:text-6xl tracking-tighter leading-[0.95] mb-6">
            Boosting <span className="text-brand">Service</span>
          </h1>
          <p className="text-slate-400 max-w-md text-base leading-relaxed mb-8">
            Boost ton rank avec des pros vérifiés. Rocket League. Valorant.
            Communication directe avec ton boosteur.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mb-10">
            {["Rocket League", "Valorant", "Pros vérifiés"].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 border border-white/10 bg-white/5 font-mono-label text-[10px] text-slate-300 tracking-wider rounded-sm"
              >
                {tag.toUpperCase()}
              </span>
            ))}
          </div>

          {/* Trust row */}
          <ul className="space-y-3 text-sm text-slate-300 max-w-md">
            <li className="flex items-start gap-3">
              <ShieldCheck size={18} className="text-brand shrink-0 mt-0.5" />
              <span>Paiement sécurisé & comptes protégés</span>
            </li>
            <li className="flex items-start gap-3">
              <Zap size={18} className="text-brand shrink-0 mt-0.5" />
              <span>Démarrage rapide sous 15 min en moyenne</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-brand shrink-0 mt-0.5" />
              <span>Suivi en temps réel et communication directe</span>
            </li>
          </ul>
        </div>

        {/* Bottom: footer */}
        <div className="relative z-10 flex items-center justify-between font-mono-label text-[10px] text-slate-600">
          <span>© {new Date().getFullYear()} Boosting Service</span>
          <span className="tracking-widest">SECURE · v1.0</span>
        </div>
      </div>

      {/* RIGHT: form */}
      <div className="flex items-center justify-center p-6 lg:p-12 relative">
        {/* Subtle accent for right panel */}
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-brand/5 blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative">
          {/* Mobile header */}
          <div className="lg:hidden mb-8 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"
              data-testid="auth-back-mobile"
            >
              <ArrowLeft size={14} /> Retour
            </Link>
            <div className="flex items-center gap-3">
              <img
                src={LOGO_URL}
                alt=""
                className="h-10 w-10 rounded-full ring-1 ring-brand/40"
              />
              <div>
                <div className="font-display font-black text-sm leading-none">
                  BOOSTING SERVICE
                </div>
                <div className="font-mono-label text-[10px] text-brand mt-1">
                  — Connexion
                </div>
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="font-mono-label text-[11px] text-brand mb-3 tracking-widest">
            — {mode === "login" ? "CONNEXION" : "CRÉATION DE COMPTE"}
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl tracking-tight mb-2">
            {mode === "login" ? "Bon retour." : "Rejoins le boost."}
          </h2>
          <p className="text-slate-400 text-sm mb-8">
            {mode === "login"
              ? "Connecte-toi pour accéder aux jeux."
              : "Crée ton compte en 30 secondes."}
          </p>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            data-testid="google-signin-btn"
            className="w-full flex items-center justify-center gap-3 border border-white/15 hover:border-brand/50 hover:bg-white/[0.03] bg-ink-900 py-3 font-semibold text-sm rounded-sm transition-all mb-5 disabled:opacity-50 group"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.9 32.4 29.4 35.5 24 35.5c-6.4 0-11.5-5.2-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.6 16 18.9 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 16.3 4.5 9.6 8.9 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 43.5c5 0 9.5-1.9 12.9-5l-6-5c-1.9 1.4-4.3 2.3-6.9 2.3-5.3 0-9.8-3.1-11.3-7.5l-6.5 5C9.6 39 16.2 43.5 24 43.5z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.4 4.4-4.4 5.8l6 5C40.9 35.8 43.5 30.4 43.5 24c0-1.2-.1-2.3-.4-3.5z"
              />
            </svg>
            <span className="group-hover:text-white">Continuer avec Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="font-mono-label text-[10px] text-slate-500 tracking-widest">
              OU AVEC EMAIL
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            data-testid="auth-form"
          >
            {mode === "signup" && (
              <div>
                <label className="font-mono-label text-[10px] text-slate-400 block mb-2 tracking-widest">
                  PSEUDO
                </label>
                <div className="relative">
                  <UserIcon
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    data-testid="signup-display-name"
                    className={inputBase}
                    placeholder="ton_pseudo"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="font-mono-label text-[10px] text-slate-400 block mb-2 tracking-widest">
                EMAIL
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="auth-email"
                  className={inputBase}
                  placeholder="toi@email.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono-label text-[10px] text-slate-400 block tracking-widest">
                  MOT DE PASSE
                </label>
                {mode === "login" && (
                  <Link
                    to="/reset-password"
                    className="font-mono-label text-[10px] text-slate-400 hover:text-brand tracking-widest"
                    data-testid="forgot-password-link"
                  >
                    OUBLIÉ ?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="auth-password"
                  className={`${inputBase} pr-10`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  data-testid="toggle-password-visibility"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 transition-colors"
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              data-testid="auth-submit"
              className="w-full bg-brand hover:bg-brand-hover active:scale-[0.99] transition-all py-3 font-bold text-sm tracking-wide rounded-sm purple-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy
                ? "..."
                : mode === "login"
                ? "Se connecter"
                : "Créer mon compte"}
            </button>
          </form>

          {/* Switch mode */}
          <div className="mt-6 text-center text-sm text-slate-400">
            {mode === "login" ? (
              <>
                Pas de compte ?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-brand hover:text-brand-hover font-semibold underline-offset-4 hover:underline"
                  data-testid="switch-to-signup"
                >
                  Créer un compte
                </button>
              </>
            ) : (
              <>
                Déjà inscrit ?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-brand hover:text-brand-hover font-semibold underline-offset-4 hover:underline"
                  data-testid="switch-to-login"
                >
                  Se connecter
                </button>
              </>
            )}
          </div>

          {/* CGU */}
          <p className="mt-8 text-xs text-slate-500 text-center leading-relaxed">
            En continuant tu acceptes les{" "}
            <Link
              to="/cgu"
              className="underline underline-offset-2 hover:text-white"
            >
              Conditions d'utilisation
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
