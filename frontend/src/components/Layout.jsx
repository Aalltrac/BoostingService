import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { LogOut, LayoutDashboard, Shield, Sparkles, Gamepad2, Menu, X } from "lucide-react";
import { useState } from "react";

const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_f73653a2-3d46-44d2-95d3-e500614cfc81/artifacts/16ijes9k_ChatGPT%20Image%2014%20mai%202026%2C%2014_53_15_11zon.png";

const Layout = ({ children }) => {
  const { user, profile, isCreator, isBooster, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navLink = (to, label, testId) => (
    <Link
      key={to}
      to={to}
      data-testid={testId}
      onClick={() => setMobileOpen(false)}
      className={`text-sm font-medium transition-colors ${
        location.pathname.startsWith(to) ? "text-white" : "text-slate-400 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col bg-ink-950 text-white">
      <header
        className="sticky top-0 z-50 backdrop-blur-xl bg-ink-950/80 border-b border-white/10"
        data-testid="site-header"
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Link to={user ? "/games" : "/"} className="flex items-center gap-3" data-testid="logo-link">
            <img src={LOGO_URL} alt="Boosting Service" className="h-10 w-10 rounded-full ring-1 ring-brand/30" />
            <div className="leading-tight hidden sm:block">
              <div className="font-display font-black text-sm tracking-tight">BOOSTING</div>
              <div className="font-mono-label text-[10px] text-brand">SERVICE</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {user && navLink("/games", "Jeux", "nav-games")}
            {user && navLink("/dashboard", "Tableau de bord", "nav-dashboard")}
            {user && isBooster && navLink("/booster/create", "Créer une offre", "nav-create-offer")}
            {user && navLink("/become-booster", "Devenir boosteur", "nav-become-booster")}
            {user && isCreator && navLink("/admin", "Admin", "nav-admin")}
            {navLink("/cgu", "CGU", "nav-cgu")}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded-sm">
                  {isCreator && <Shield size={14} className="text-yellow-400" />}
                  {!isCreator && isBooster && <Sparkles size={14} className="text-brand" />}
                  <span className="text-xs font-medium truncate max-w-[120px]" data-testid="header-display-name">
                    {profile?.displayName || user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  data-testid="logout-btn"
                  className="p-2 border border-white/10 hover:border-brand/50 transition-colors rounded-sm"
                  aria-label="Se déconnecter"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                data-testid="header-login-btn"
                className="px-4 py-2 bg-brand hover:bg-brand-hover transition-colors text-sm font-semibold rounded-sm purple-glow"
              >
                Connexion
              </Link>
            )}
            <button
              className="md:hidden p-2 border border-white/10 rounded-sm"
              onClick={() => setMobileOpen((v) => !v)}
              data-testid="mobile-menu-toggle"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-ink-900">
            <div className="px-4 py-4 flex flex-col gap-3">
              {user && navLink("/games", "Jeux", "nav-games-m")}
              {user && navLink("/dashboard", "Tableau de bord", "nav-dashboard-m")}
              {user && isBooster && navLink("/booster/create", "Créer une offre", "nav-create-offer-m")}
              {user && navLink("/become-booster", "Devenir boosteur", "nav-become-booster-m")}
              {user && isCreator && navLink("/admin", "Admin", "nav-admin-m")}
              {navLink("/cgu", "CGU", "nav-cgu-m")}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 flex flex-col md:flex-row gap-6 justify-between items-start">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="" className="h-12 w-12 rounded-full" />
            <div>
              <div className="font-display font-black text-base">BOOSTING SERVICE</div>
              <div className="font-mono-label text-[10px] text-slate-500 mt-1">
                Marketplace boosting & ventes de comptes
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-sm text-slate-400">
            <Link to="/cgu" className="hover:text-white transition-colors" data-testid="footer-cgu">
              Conditions d'utilisation
            </Link>
            <a
              href="https://ko-fi.com/polycodeschool"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              data-testid="footer-kofi"
            >
              Soutenir sur Ko-fi
            </a>
            <a
              href="https://paypal.me/aalltraca"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              data-testid="footer-paypal"
            >
              PayPal
            </a>
          </div>
        </div>
        <div className="text-center text-[11px] text-slate-600 pb-6 font-mono-label">
          © {new Date().getFullYear()} Boosting Service. Chaque vendeur est indépendant.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
