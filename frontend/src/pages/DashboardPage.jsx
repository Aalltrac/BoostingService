import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import {
  MessageSquare,
  ShoppingBag,
  Sparkles,
  ArrowUpRight,
  Search,
  Inbox,
  TrendingUp,
  Clock,
  CheckCircle2,
  Shield,
  Gamepad2,
} from "lucide-react";

/* ---------- helpers ---------- */

const formatRelativeTime = (seconds) => {
  if (!seconds) return "—";
  const diff = Math.floor(Date.now() / 1000) - seconds;
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`;
  return new Date(seconds * 1000).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 6) return "Bonne nuit";
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
};

/* ---------- atomic UI ---------- */

const Avatar = ({ name, size = 36 }) => (
  <div
    className="shrink-0 rounded-full bg-gradient-to-br from-brand/30 to-brand/5 border border-brand/30 flex items-center justify-center font-display font-bold text-brand"
    style={{ width: size, height: size, fontSize: size * 0.36 }}
  >
    {getInitials(name)}
  </div>
);

const StatusDot = ({ status }) => {
  const map = {
    completed: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
    in_progress: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
    pending: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]",
    cancelled: "bg-rose-400",
  };
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full ${map[status] || "bg-slate-400"}`}
    />
  );
};

const StatCard = ({ label, value, hint, icon: Icon, testid }) => (
  <div
    data-testid={testid}
    className="group relative bg-ink-900 border border-white/10 p-5 transition-all hover:border-brand/40 hover:-translate-y-0.5 duration-200"
  >
    <div className="flex items-start justify-between mb-6">
      <span className="font-mono-label text-[10px] text-slate-500 tracking-widest">
        {label}
      </span>
      <Icon size={16} className="text-brand/60 group-hover:text-brand transition-colors" />
    </div>
    <div className="font-display font-black text-3xl tracking-tighter mb-1">
      {value}
    </div>
    {hint && (
      <div className="font-mono-label text-[10px] text-slate-500">{hint}</div>
    )}
    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
  </div>
);

const SectionHeading = ({ kicker, title, icon: Icon, right }) => (
  <div className="flex items-end justify-between gap-4 mb-5 pb-3 border-b border-white/5">
    <div>
      <div className="font-mono-label text-[10px] text-brand tracking-widest mb-1">
        — {kicker}
      </div>
      <h2 className="font-display font-bold text-xl flex items-center gap-2">
        <Icon size={18} className="text-brand" />
        {title}
      </h2>
    </div>
    {right}
  </div>
);

const EmptyState = ({ icon: Icon, title, hint, cta }) => (
  <div className="border border-dashed border-white/10 p-10 text-center">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand/5 border border-brand/20 mb-4">
      <Icon size={20} className="text-brand/70" />
    </div>
    <div className="font-display font-bold mb-1">{title}</div>
    <p className="text-sm text-slate-500 mb-4">{hint}</p>
    {cta}
  </div>
);

/* ---------- main ---------- */

const DashboardPage = () => {
  const { user, profile, isBooster, isCreator } = useAuth();
  const [orders, setOrders] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [orderFilter, setOrderFilter] = useState("all");
  const [convSearch, setConvSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    const q1 = query(collection(db, "orders"), where("clientUid", "==", user.uid));
    const q2 = query(collection(db, "orders"), where("boosterUid", "==", user.uid));
    const all = new Map();
    const merge = (snap) => {
      snap.docs.forEach((d) => all.set(d.id, { id: d.id, ...d.data() }));
      setOrders(
        Array.from(all.values()).sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        )
      );
    };
    const u1 = onSnapshot(q1, merge);
    const u2 = onSnapshot(q2, merge);

    const cq = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid)
    );
    const u3 = onSnapshot(cq, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
      setConversations(list);
    });

    return () => {
      u1();
      u2();
      u3();
    };
  }, [user]);

  /* ---- derived stats ---- */
  const stats = useMemo(() => {
    const active = orders.filter((o) => o.status && o.status !== "completed" && o.status !== "cancelled").length;
    const completed = orders.filter((o) => o.status === "completed").length;
    const totalAmount = orders
      .filter((o) => o.clientUid === user?.uid && o.status === "completed")
      .reduce((sum, o) => sum + (Number(o.price) || 0), 0);
    return { active, completed, totalAmount, totalOrders: orders.length };
  }, [orders, user]);

  const filteredOrders = useMemo(() => {
    if (orderFilter === "all") return orders;
    if (orderFilter === "active")
      return orders.filter(
        (o) => o.status && o.status !== "completed" && o.status !== "cancelled"
      );
    if (orderFilter === "completed")
      return orders.filter((o) => o.status === "completed");
    return orders;
  }, [orders, orderFilter]);

  const filteredConvs = useMemo(() => {
    const q = convSearch.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        (c.game || "").toLowerCase().includes(q) ||
        (c.lastMessage || "").toLowerCase().includes(q)
    );
  }, [conversations, convSearch]);

  const roleLabel = isCreator ? "Créateur" : isBooster ? "Boosteur" : "Client";
  const RoleIcon = isCreator ? Shield : isBooster ? Sparkles : Gamepad2;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10" data-testid="dashboard-page">
      {/* ====== HEADER ====== */}
      <header className="mb-12">
        <div className="font-mono-label text-[11px] text-brand tracking-widest mb-3">
          — Tableau de bord
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="min-w-0">
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-3 leading-[0.95]">
              {getGreeting()},{" "}
              <span className="text-brand">
                {profile?.displayName || user?.email?.split("@")[0]}
              </span>
              <span className="text-brand">.</span>
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span
                data-testid="role-badge"
                className="inline-flex items-center gap-2 bg-brand/5 border border-brand/30 px-3 py-1.5 rounded-sm"
              >
                <RoleIcon size={13} className="text-brand" />
                <span className="font-mono-label text-[10px] text-white tracking-widest">
                  {roleLabel.toUpperCase()}
                </span>
              </span>
              <span className="text-slate-500 text-sm">
                {new Date().toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </div>
          </div>

          {isBooster && (
            <Link
              to="/booster/create"
              data-testid="dashboard-create-offer"
              className="group inline-flex items-center gap-2 bg-brand hover:bg-brand-hover px-5 py-3 font-bold rounded-sm purple-glow transition-all hover:scale-[1.02] self-start"
            >
              <Sparkles size={16} />
              Gérer mes offres
              <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          )}
        </div>
      </header>

      {/* ====== STATS ====== */}
      <section
        className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10 mb-14"
        data-testid="dashboard-stats"
      >
        <StatCard
          testid="stat-total-orders"
          label="COMMANDES"
          value={stats.totalOrders}
          hint="Total"
          icon={ShoppingBag}
        />
        <StatCard
          testid="stat-active"
          label="EN COURS"
          value={stats.active}
          hint="Actives"
          icon={Clock}
        />
        <StatCard
          testid="stat-completed"
          label="TERMINÉES"
          value={stats.completed}
          hint="Livrées"
          icon={CheckCircle2}
        />
        <StatCard
          testid="stat-spent"
          label="VOLUME"
          value={`${stats.totalAmount}€`}
          hint="Cumulé"
          icon={TrendingUp}
        />
      </section>

      {/* ====== CONVERSATIONS ====== */}
      <section className="mb-14" data-testid="dashboard-conversations">
        <SectionHeading
          kicker="Messagerie"
          title="Mes conversations"
          icon={MessageSquare}
          right={
            conversations.length > 0 && (
              <div className="relative w-full sm:w-64">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  value={convSearch}
                  onChange={(e) => setConvSearch(e.target.value)}
                  placeholder="Rechercher…"
                  data-testid="conv-search"
                  className="w-full bg-ink-900 border border-white/10 pl-9 pr-3 py-2 text-sm rounded-sm focus:border-brand/50 focus:outline-none transition-colors placeholder:text-slate-600"
                />
              </div>
            )
          }
        />

        {filteredConvs.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={
              convSearch
                ? "Aucun résultat"
                : "Aucune conversation pour le moment"
            }
            hint={
              convSearch
                ? "Essaye un autre mot-clé."
                : "Tes échanges avec les boosteurs et clients apparaîtront ici."
            }
          />
        ) : (
          <div className="grid gap-px bg-white/10 border border-white/10">
            {filteredConvs.map((c) => (
              <Link
                key={c.id}
                to={`/chat/${c.id}`}
                data-testid={`conv-${c.id}`}
                className="group bg-ink-900 hover:bg-ink-800 transition-colors p-5 flex items-center gap-4"
              >
                <Avatar name={c.game || "?"} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono-label text-[10px] text-brand tracking-widest">
                      {c.type === "account_sale" ? "VENTE COMPTE" : "BOOSTING"}
                    </span>
                    <span className="text-slate-700">·</span>
                    <span className="font-mono-label text-[10px] text-slate-400 tracking-widest">
                      {c.game}
                    </span>
                  </div>
                  <div className="font-semibold truncate text-sm">
                    {c.lastMessage || (
                      <span className="text-slate-600 italic font-normal">
                        (aucun message)
                      </span>
                    )}
                  </div>
                </div>
                <div className="hidden sm:block text-right shrink-0">
                  <div className="font-mono-label text-[10px] text-slate-500">
                    {formatRelativeTime(c.updatedAt?.seconds)}
                  </div>
                </div>
                <ArrowUpRight
                  size={16}
                  className="text-slate-600 group-hover:text-brand group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all shrink-0"
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ====== ORDERS ====== */}
      <section data-testid="dashboard-orders">
        <SectionHeading
          kicker="Historique"
          title="Mes commandes"
          icon={ShoppingBag}
          right={
            orders.length > 0 && (
              <div
                className="inline-flex bg-ink-900 border border-white/10 p-0.5 rounded-sm"
                role="tablist"
              >
                {[
                  { id: "all", label: "Toutes", count: orders.length },
                  { id: "active", label: "En cours", count: stats.active },
                  { id: "completed", label: "Terminées", count: stats.completed },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setOrderFilter(t.id)}
                    data-testid={`order-filter-${t.id}`}
                    className={`font-mono-label text-[10px] tracking-widest px-3 py-2 rounded-sm transition-colors ${
                      orderFilter === t.id
                        ? "bg-brand/15 text-brand"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.label.toUpperCase()}
                    <span className="ml-1.5 opacity-60">{t.count}</span>
                  </button>
                ))}
              </div>
            )
          }
        />

        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title={
              orderFilter === "all"
                ? "Aucune commande encore"
                : "Rien à afficher ici"
            }
            hint={
              orderFilter === "all"
                ? "Découvre les offres des boosteurs ou les comptes en vente."
                : "Change de filtre pour voir d'autres commandes."
            }
            cta={
              orderFilter === "all" && (
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 bg-brand/10 border border-brand/30 hover:bg-brand/20 px-4 py-2 text-xs font-bold rounded-sm transition-colors"
                >
                  Explorer les offres
                  <ArrowUpRight size={14} />
                </Link>
              )
            }
          />
        ) : (
          <div className="grid gap-px bg-white/10 border border-white/10">
            {filteredOrders.map((o) => {
              const isClient = o.clientUid === user?.uid;
              return (
                <div
                  key={o.id}
                  data-testid={`order-${o.id}`}
                  className="group bg-ink-900 hover:bg-ink-800/60 transition-colors p-5 grid sm:grid-cols-12 gap-4 items-center"
                >
                  {/* Title block */}
                  <div className="sm:col-span-4 flex items-center gap-3 min-w-0">
                    <div className="shrink-0 w-1 self-stretch bg-brand/40 group-hover:bg-brand transition-colors" />
                    <div className="min-w-0">
                      <div className="font-mono-label text-[10px] text-brand tracking-widest mb-1">
                        {o.type === "account" ? "VENTE COMPTE" : "BOOSTING"} · {o.game}
                      </div>
                      <div className="font-semibold truncate">
                        {o.type === "account"
                          ? o.accountTitle
                          : `${o.rankFrom} → ${o.rankTo}${o.mode ? ` · ${o.mode}` : ""}`}
                      </div>
                      <div className="font-mono-label text-[10px] text-slate-500 mt-1">
                        {formatRelativeTime(o.createdAt?.seconds)}
                      </div>
                    </div>
                  </div>

                  {/* Parties */}
                  <div className="sm:col-span-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="min-w-0">
                      <div className="font-mono-label text-[10px] text-slate-500 tracking-widest mb-1">
                        CLIENT
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar name={o.clientName} size={24} />
                        <span className="truncate">{o.clientName}</span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="font-mono-label text-[10px] text-slate-500 tracking-widest mb-1">
                        BOOSTEUR
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar name={o.boosterName} size={24} />
                        <span className="truncate">{o.boosterName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price + status */}
                  <div className="sm:col-span-2">
                    <div className="font-display font-black text-xl text-brand tracking-tighter leading-none">
                      {Number(o.price) > 0 ? `${o.price}€` : "Gratuit"}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <StatusDot status={o.status} />
                      <span
                        className={`font-mono-label text-[10px] tracking-widest ${
                          o.status === "completed"
                            ? "text-emerald-400"
                            : o.status === "cancelled"
                            ? "text-rose-400"
                            : "text-amber-400"
                        }`}
                      >
                        {o.status?.toUpperCase()}
                      </span>
                    </div>
                    <div className="font-mono-label text-[9px] text-slate-600 mt-0.5">
                      {isClient ? "ACHAT" : "VENTE"}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="sm:col-span-2 flex justify-end">
                    {o.conversationId ? (
                      <Link
                        to={`/chat/${o.conversationId}`}
                        className="inline-flex items-center gap-2 bg-brand/10 border border-brand/30 hover:bg-brand/20 hover:border-brand/60 px-4 py-2 text-xs font-bold rounded-sm transition-all group/btn"
                        data-testid={`open-chat-${o.id}`}
                      >
                        Ouvrir
                        <ArrowUpRight
                          size={13}
                          className="group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform"
                        />
                      </Link>
                    ) : (
                      <span className="font-mono-label text-[10px] text-slate-600 tracking-widest">
                        —
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ====== BOOSTER BANNER ====== */}
      {isBooster && (
        <div
          className="mt-14 relative overflow-hidden border border-brand/30 bg-gradient-to-br from-brand/10 via-brand/5 to-transparent p-8 rounded-sm"
          data-testid="booster-banner"
        >
          <div className="absolute -right-12 -top-12 w-56 h-56 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex items-center justify-between flex-wrap gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-brand" />
                <span className="font-mono-label text-[10px] text-brand tracking-widest">
                  ESPACE BOOSTEUR
                </span>
              </div>
              <h3 className="font-display font-black text-2xl tracking-tighter mb-2">
                Optimise tes offres et gagne plus de clients.
              </h3>
              <p className="text-slate-400 text-sm">
                Mets à jour ton tarif, ton rang max et ta disponibilité pour rester visible.
              </p>
            </div>
            <Link
              to="/booster/create"
              className="group inline-flex items-center gap-2 bg-brand hover:bg-brand-hover px-5 py-3 font-bold rounded-sm purple-glow transition-all hover:scale-[1.02]"
            >
              Gérer mes offres
              <ArrowUpRight
                size={16}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
