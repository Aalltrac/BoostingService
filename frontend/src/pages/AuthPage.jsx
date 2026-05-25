import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

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

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ink-950 text-white">
      {/* LEFT: brand panel */}
      <div className="hidden lg:flex relative overflow-hidden p-12 flex-col justify-between border-r border-white/5">
        <div
          className="absolute inset-0 opacity-40 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ink-950 via-ink-950/70 to-transparent" />
        <Link to="/" className="relative z-10 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white" data-testid="auth-back">
          <ArrowLeft size={14} /> Retour
        </Link>
        <div className="relative z-10">
          <img src={LOGO_URL} alt="" className="h-24 w-24 rounded-full mb-8 ring-2 ring-brand/40 purple-glow" />
          <h1 className="font-display font-black text-5xl xl:text-6xl tracking-tighter leading-none mb-6">
            Boosting <span className="text-brand">Service</span>
          </h1>
          <p className="text-slate-400 max-w-md text-base">
            Boost ton rank avec des pros vérifiés. Rocket League. Valorant. Communication directe avec ton boosteur.
          </p>
        </div>
        <div className="relative z-10 font-mono-label text-[10px] text-slate-600">
          © {new Date().getFullYear()} Boosting Service
        </div>
      </div>

      {/* RIGHT: form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <img src={LOGO_URL} alt="" className="h-12 w-12 rounded-full ring-1 ring-brand/40" />
            <div>
              <div className="font-display font-black text-sm">BOOSTING SERVICE</div>
              <div className="font-mono-label text-[10px] text-brand">— Connexion</div>
            </div>
          </div>

          <div className="font-mono-label text-[11px] text-brand mb-3">— {mode === "login" ? "Connexion" : "Création de compte"}</div>
          <h2 className="font-display font-black text-3xl sm:text-4xl tracking-tight mb-2">
            {mode === "login" ? "Bon retour." : "Rejoins le boost."}
          </h2>
          <p className="text-slate-400 text-sm mb-8">
            {mode === "login" ? "Connecte-toi pour accéder aux jeux." : "Crée ton compte en 30 secondes."}
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            data-testid="google-signin-btn"
            className="w-full flex items-center justify-center gap-3 border border-white/15 hover:border-brand/40 bg-ink-900 py-3 font-semibold text-sm rounded-sm transition-colors mb-4 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.4 29.4 35.5 24 35.5c-6.4 0-11.5-5.2-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 16.3 4.5 9.6 8.9 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.9 12.9-5l-6-5c-1.9 1.4-4.3 2.3-6.9 2.3-5.3 0-9.8-3.1-11.3-7.5l-6.5 5C9.6 39 16.2 43.5 24 43.5z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.4 4.4-4.4 5.8l6 5C40.9 35.8 43.5 30.4 43.5 24c0-1.2-.1-2.3-.4-3.5z" />
            </svg>
            Continuer avec Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="font-mono-label text-[10px] text-slate-500">OU</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="auth-form">
            {mode === "signup" && (
              <div>
                <label className="font-mono-label text-[10px] text-slate-400 block mb-2">Pseudo</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  data-testid="signup-display-name"
                  className="w-full bg-ink-900 border border-white/10 focus:border-brand focus:outline-none px-3 py-3 text-sm rounded-sm"
                  placeholder="ton_pseudo"
                />
              </div>
            )}
            <div>
              <label className="font-mono-label text-[10px] text-slate-400 block mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="auth-email"
                className="w-full bg-ink-900 border border-white/10 focus:border-brand focus:outline-none px-3 py-3 text-sm rounded-sm"
                placeholder="toi@email.com"
              />
            </div>
            <div>
              <label className="font-mono-label text-[10px] text-slate-400 block mb-2">Mot de passe</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="auth-password"
                className="w-full bg-ink-900 border border-white/10 focus:border-brand focus:outline-none px-3 py-3 text-sm rounded-sm"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              data-testid="auth-submit"
              className="w-full bg-brand hover:bg-brand-hover transition-colors py-3 font-bold rounded-sm purple-glow disabled:opacity-50"
            >
              {busy ? "..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            {mode === "login" ? (
              <>
                Pas de compte ?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-brand hover:text-brand-hover font-semibold"
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
                  className="text-brand hover:text-brand-hover font-semibold"
                  data-testid="switch-to-login"
                >
                  Se connecter
                </button>
              </>
            )}
          </div>

          <p className="mt-8 text-xs text-slate-500 text-center">
            En continuant tu acceptes les{" "}
            <Link to="/cgu" className="underline hover:text-white">
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
