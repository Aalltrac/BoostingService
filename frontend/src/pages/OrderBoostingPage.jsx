import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { GAMES, getFullRanks, getRankTransitions } from "../constants";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  KeyRound,
  AlertTriangle,
  Check,
  Shield,
  Gift,
  Sparkles,
  Gamepad2,
  TrendingUp,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import RatingDisplay from "../components/RatingDisplay";

const OrderBoostingPage = () => {
  const { gameId, boosterUid } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const game = GAMES[gameId];
  const ranks = useMemo(() => (game ? getFullRanks(gameId) : []), [game, gameId]);
  const transitions = useMemo(
    () => (game ? getRankTransitions(gameId) : []),
    [game, gameId]
  );

  const [step, setStep] = useState(1);
  const [mode, setMode] = useState(game?.modes[0] || "default");
  const [rankFrom, setRankFrom] = useState(0);
  const [rankTo, setRankTo] = useState(1);
  const [accEmail, setAccEmail] = useState("");
  const [accPassword, setAccPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const [boosterUser, setBoosterUser] = useState(null);
  const [boosterOffer, setBoosterOffer] = useState(null);

  useEffect(() => {
    (async () => {
      const u = await getDoc(doc(db, "users", boosterUid));
      if (u.exists()) setBoosterUser(u.data());
      const offerQ = query(
        collection(db, "boosterOffers"),
        where("game", "==", gameId),
        where("uid", "==", boosterUid)
      );
      const snap = await getDocs(offerQ);
      if (!snap.empty)
        setBoosterOffer({ id: snap.docs[0].id, ...snap.docs[0].data() });
    })();
  }, [boosterUid, gameId]);

  const isPaid = boosterOffer?.type === "paid";
  const priceTableForMode = useMemo(
    () => boosterOffer?.priceTable?.[game?.modes.length ? mode : "default"] || {},
    [boosterOffer, game, mode]
  );

  const { totalPrice, missingTransitions } = useMemo(() => {
    if (!isPaid) return { totalPrice: 0, missingTransitions: [] };
    let total = 0;
    const missing = [];
    for (let i = rankFrom; i < rankTo; i++) {
      const t = transitions.find((tr) => tr.fromIndex === i);
      if (!t) continue;
      const p = priceTableForMode[t.key];
      if (p === undefined || p === "" || p === null) {
        missing.push(t.key);
      } else {
        total += Number(p) || 0;
      }
    }
    return { totalPrice: total, missingTransitions: missing };
  }, [isPaid, rankFrom, rankTo, priceTableForMode, transitions]);

  const maxRankLabel =
    boosterOffer?.maxRankPerMode?.[game?.modes.length ? mode : "default"];
  const maxRankIndex = maxRankLabel
    ? ranks.findIndex((r) => r.label === maxRankLabel)
    : -1;
  const exceedsMax = maxRankIndex >= 0 && rankTo > maxRankIndex;

  const placeOrder = async (e) => {
    e?.preventDefault?.();
    if (isPaid && missingTransitions.length > 0) {
      toast.error("Certaines transitions ne sont pas proposées par ce boosteur.");
      return;
    }
    if (exceedsMax) {
      toast.error(`Ce boosteur ne dépasse pas ${maxRankLabel}.`);
      return;
    }
    setBusy(true);
    try {
      const convRef = await addDoc(collection(db, "conversations"), {
        participants: [user.uid, boosterUid],
        clientUid: user.uid,
        boosterUid: boosterUid,
        game: gameId,
        type: "boosting",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: "Commande créée",
      });

      const orderRef = await addDoc(collection(db, "orders"), {
        clientUid: user.uid,
        clientName: profile?.displayName || user.email,
        boosterUid: boosterUid,
        boosterName: boosterUser?.displayName || "Boosteur",
        game: gameId,
        mode: game.modes.length ? mode : null,
        rankFrom: ranks[rankFrom].label,
        rankTo: ranks[rankTo].label,
        price: totalPrice,
        type: "boosting",
        offerType: boosterOffer?.type || "free",
        status: "pending",
        credentials: { email: accEmail, password: accPassword },
        conversationId: convRef.id,
        boostStatus: { connected: false, currentRank: ranks[rankFrom].label },
        createdAt: serverTimestamp(),
      });

      const summary = `Nouvelle commande de boosting !
Jeu : ${game.name}${game.modes.length ? `
Mode : ${mode}` : ""}
Rank actuel : ${ranks[rankFrom].label}
Rank souhaité : ${ranks[rankTo].label}
Prix : ${isPaid ? `${totalPrice}€` : "Gratuit (don)"}

Identifiants du compte :
Email : ${accEmail}
Mot de passe : ${accPassword}`;

      await addDoc(collection(db, "conversations", convRef.id, "messages"), {
        senderUid: "system",
        text: summary,
        system: true,
        createdAt: serverTimestamp(),
        orderId: orderRef.id,
      });

      toast.success("Commande envoyée au boosteur !");
      navigate(`/chat/${convRef.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Erreur : " + err.message);
    } finally {
      setBusy(false);
    }
  };

  const steps = ["Configuration", "Identifiants", "Confirmation"];

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      {/* Top nav */}
      <div className="border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <Link
            to={`/games/${gameId}`}
            data-testid="back-link"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à {game?.name}
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-brand mb-3">
              <Gamepad2 className="w-3.5 h-3.5" />
              {game?.name}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Commande de boost
            </h1>
            <p className="text-slate-400 mt-3 text-sm">
              Boosteur sélectionné :{" "}
              <span className="text-white font-semibold">
                {boosterUser?.displayName || "..."}
              </span>
            </p>
          </div>

          {boosterOffer?.type === "free" && (
            <div
              data-testid="free-badge"
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-bold uppercase tracking-wider rounded-sm self-start"
            >
              <Gift className="w-3.5 h-3.5" />
              Gratuit · Don
            </div>
          )}
        </div>

        {/* ─────────── OFFER PRESENTATION (image + description) ─────────── */}
        {boosterOffer && (
          <div
            data-testid="offer-presentation"
            className="grid md:grid-cols-5 gap-6 mb-10"
          >
            <div className="md:col-span-3">
              <div className="relative aspect-video bg-ink-700 overflow-hidden rounded-sm border border-white/10">
                {boosterOffer.image ? (
                  <img
                    src={boosterOffer.image}
                    alt={boosterOffer.title}
                    className="w-full h-full object-cover"
                    data-testid="offer-image"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-ink-900/90 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-sm">
                  <span className="font-mono-label text-[10px] text-brand">
                    — Offre boosting
                  </span>
                </div>
              </div>

              {boosterOffer.description && (
                <div className="mt-6 border border-white/10 bg-ink-900 p-6 rounded-sm">
                  <div className="font-mono-label text-[10px] text-slate-500 mb-3 flex items-center gap-2">
                    <FileText className="w-3 h-3" />— Description
                  </div>
                  <h2
                    data-testid="offer-title"
                    className="font-display font-bold text-lg mb-2"
                  >
                    {boosterOffer.title}
                  </h2>
                  <p
                    data-testid="offer-description"
                    className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap"
                  >
                    {boosterOffer.description}
                  </p>
                </div>
              )}
            </div>

            <aside className="md:col-span-2">
              <div className="border border-white/10 bg-ink-900 p-6 rounded-sm">
                <RatingDisplay boosterUid={boosterUid} />
              </div>
            </aside>
          </div>
        )}

        {/* Stepper */}
        <div className="mb-10">
          <div className="grid grid-cols-3 gap-3">
            {steps.map((s, i) => {
              const idx = i + 1;
              const done = step > idx;
              const active = step === idx;
              return (
                <div
                  key={s}
                  data-testid={`step-indicator-${idx}`}
                  className={`relative border rounded-sm p-4 transition-all ${
                    active
                      ? "border-brand bg-brand/10"
                      : done
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 flex items-center justify-center rounded-sm text-xs font-bold ${
                        active
                          ? "bg-brand text-white"
                          : done
                          ? "bg-emerald-500 text-white"
                          : "bg-white/10 text-slate-400"
                      }`}
                    >
                      {done ? <Check className="w-4 h-4" /> : idx}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-slate-500">
                        Étape {idx}
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          active || done ? "text-white" : "text-slate-400"
                        }`}
                      >
                        {s}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {step === 1 && (
              <Card>
                <CardHeader
                  icon={<TrendingUp className="w-4 h-4" />}
                  title="Configure ton boost"
                  subtitle="Sélectionne le mode et les rangs souhaités."
                />

                <div className="p-6 space-y-7">
                  {game?.modes.length > 0 && (
                    <div>
                      <Label>Mode de jeu</Label>
                      <div className="flex flex-wrap gap-2">
                        {game.modes.map((m) => (
                          <button
                            key={m}
                            onClick={() => setMode(m)}
                            data-testid={`mode-${m}`}
                            className={`px-4 py-2 text-sm font-semibold border rounded-sm transition-all ${
                              mode === m
                                ? "border-brand bg-brand/20 text-white"
                                : "border-white/10 hover:border-brand/40 text-slate-300 hover:text-white"
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <Label>Rank actuel</Label>
                      <Select
                        value={rankFrom}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setRankFrom(v);
                          if (rankTo <= v)
                            setRankTo(Math.min(v + 1, ranks.length - 1));
                        }}
                        data-testid="rank-from-select"
                      >
                        {ranks.map((r) => (
                          <option key={r.label} value={r.index}>
                            {r.label}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div>
                      <Label>Rank souhaité</Label>
                      <Select
                        value={rankTo}
                        onChange={(e) => setRankTo(Number(e.target.value))}
                        data-testid="rank-to-select"
                      >
                        {ranks
                          .filter((r) => r.index > rankFrom)
                          .map((r) => (
                            <option key={r.label} value={r.index}>
                              {r.label}
                            </option>
                          ))}
                      </Select>
                    </div>
                  </div>

                  <div className="border border-white/10 bg-white/[0.02] rounded-sm p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                          Départ
                        </div>
                        <div className="text-sm font-semibold truncate">
                          {ranks[rankFrom]?.label}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-brand shrink-0" />
                      <div className="flex-1 min-w-0 text-right">
                        <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                          Objectif
                        </div>
                        <div className="text-sm font-semibold truncate">
                          {ranks[rankTo]?.label}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isPaid && (
                    <div>
                      <Label>Détail du calcul</Label>
                      <div className="border border-white/10 rounded-sm divide-y divide-white/5">
                        {Array.from({ length: rankTo - rankFrom }).map((_, k) => {
                          const t = transitions.find(
                            (tr) => tr.fromIndex === rankFrom + k
                          );
                          if (!t) return null;
                          const p = priceTableForMode[t.key];
                          const has = p !== undefined && p !== "" && p !== null;
                          return (
                            <div
                              key={t.key}
                              className="flex items-center justify-between px-4 py-3 text-sm"
                            >
                              <span className="text-slate-300">{t.key}</span>
                              <span
                                className={`font-semibold ${
                                  has ? "text-white" : "text-rose-400"
                                }`}
                              >
                                {has ? `${p}€` : "indisponible"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(exceedsMax || missingTransitions.length > 0) && (
                    <div
                      data-testid="warning-banner"
                      className="border border-amber-500/30 bg-amber-500/10 text-amber-200 rounded-sm p-4 flex gap-3"
                    >
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                      <div className="text-sm space-y-1">
                        {exceedsMax && (
                          <p>
                            Ce boosteur ne dépasse pas{" "}
                            <strong className="text-white">{maxRankLabel}</strong> sur ce mode.
                          </p>
                        )}
                        {missingTransitions.length > 0 && (
                          <p>
                            Certaines transitions ne sont pas proposées par ce boosteur.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-white/5 px-6 py-5 flex items-center justify-end">
                  <button
                    onClick={() => setStep(2)}
                    disabled={
                      rankFrom >= rankTo ||
                      exceedsMax ||
                      (isPaid && missingTransitions.length > 0)
                    }
                    data-testid="step-1-next"
                    className="bg-brand hover:bg-brand-hover px-6 py-3 font-bold rounded-sm purple-glow disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2 transition-all"
                  >
                    Suivant
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader
                  icon={<Lock className="w-4 h-4" />}
                  title="Identifiants requis"
                  subtitle="Transmis uniquement au boosteur via le chat sécurisé. Le créateur conserve un accès en cas de litige."
                />

                <div className="p-6 space-y-5">
                  <div>
                    <Label icon={<Mail className="w-3.5 h-3.5" />}>Email du compte</Label>
                    <input
                      type="email"
                      value={accEmail}
                      onChange={(e) => setAccEmail(e.target.value)}
                      data-testid="account-email-input"
                      placeholder="email@exemple.com"
                      className="w-full bg-ink-950 border border-white/10 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 px-3 py-3 text-sm rounded-sm transition-all"
                    />
                  </div>

                  <div>
                    <Label icon={<KeyRound className="w-3.5 h-3.5" />}>Mot de passe du compte</Label>
                    <input
                      type="password"
                      value={accPassword}
                      onChange={(e) => setAccPassword(e.target.value)}
                      data-testid="account-password-input"
                      placeholder="••••••••"
                      className="w-full bg-ink-950 border border-white/10 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 px-3 py-3 text-sm rounded-sm transition-all"
                    />
                  </div>

                  <div className="flex gap-3 items-start text-xs text-slate-400 border border-white/5 bg-white/[0.02] rounded-sm p-3">
                    <Shield className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <span>
                      Tes identifiants sont chiffrés et ne sont visibles que par ton boosteur et le créateur de la plateforme.
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/5 px-6 py-5 flex items-center justify-between">
                  <button
                    onClick={() => setStep(1)}
                    data-testid="step-2-back"
                    className="px-4 py-2 text-sm text-slate-400 hover:text-white inline-flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Précédent
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!accEmail || !accPassword}
                    data-testid="step-2-next"
                    className="bg-brand hover:bg-brand-hover px-6 py-3 font-bold rounded-sm purple-glow disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2 transition-all"
                  >
                    Suivant
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <CardHeader
                  icon={<Sparkles className="w-4 h-4" />}
                  title="Récapitulatif"
                  subtitle="Vérifie ta commande avant de l'envoyer au boosteur."
                />

                <div className="p-6">
                  <div className="border border-white/10 rounded-sm divide-y divide-white/5">
                    <Item k="Jeu" v={game?.name} />
                    {game?.modes.length > 0 && <Item k="Mode" v={mode} />}
                    <Item k="Rank actuel" v={ranks[rankFrom]?.label} />
                    <Item k="Rank souhaité" v={ranks[rankTo]?.label} />
                    <Item k="Boosteur" v={boosterUser?.displayName || "Boosteur"} />
                    <Item k="Email du compte" v={accEmail} mono />
                    <Item
                      k="Mot de passe"
                      v={"•".repeat(Math.min(accPassword.length, 12))}
                      mono
                    />
                    <Item
                      k="Prix total"
                      v={isPaid ? `${totalPrice}€` : "Gratuit"}
                      accent
                    />
                  </div>
                </div>

                <div className="border-t border-white/5 px-6 py-5 flex items-center justify-between">
                  <button
                    onClick={() => setStep(2)}
                    data-testid="step-3-back"
                    className="px-4 py-2 text-sm text-slate-400 hover:text-white inline-flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Précédent
                  </button>
                  <button
                    onClick={placeOrder}
                    disabled={busy}
                    data-testid="confirm-order-btn"
                    className="bg-brand hover:bg-brand-hover px-6 py-3 font-bold rounded-sm purple-glow disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2 transition-all"
                  >
                    {busy ? "Envoi…" : "Confirmer la commande"}
                    {!busy && <Check className="w-4 h-4" />}
                  </button>
                </div>
              </Card>
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <Card>
                <div className="p-5">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">
                    Résumé
                  </div>

                  <div className="space-y-3 text-sm">
                    <SummaryRow label="Jeu" value={game?.name} />
                    {game?.modes.length > 0 && (
                      <SummaryRow label="Mode" value={mode} />
                    )}
                    <SummaryRow label="Départ" value={ranks[rankFrom]?.label} />
                    <SummaryRow label="Objectif" value={ranks[rankTo]?.label} />
                  </div>

                  <div className="border-t border-white/5 mt-5 pt-5 flex items-end justify-between">
                    <span className="text-xs uppercase tracking-widest text-slate-500">
                      Prix total
                    </span>
                    <span
                      data-testid="total-price"
                      className="text-3xl font-bold text-brand"
                    >
                      {!isPaid ? "Gratuit" : `${totalPrice}€`}
                    </span>
                  </div>
                </div>
              </Card>

              <div className="flex items-start gap-3 text-xs text-slate-400 px-1">
                <Shield className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <span>
                  Paiement sécurisé. Aucun débit avant l'acceptation par le boosteur.
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const Card = ({ children }) => (
  <div className="bg-white/[0.02] border border-white/10 rounded-sm overflow-hidden">
    {children}
  </div>
);

const CardHeader = ({ icon, title, subtitle }) => (
  <div className="border-b border-white/5 px-6 py-5">
    <div className="flex items-center gap-2 text-brand text-xs uppercase tracking-widest mb-2">
      {icon}
      <span>Étape</span>
    </div>
    <h2 className="text-xl font-bold">{title}</h2>
    {subtitle && (
      <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{subtitle}</p>
    )}
  </div>
);

const Label = ({ children, icon }) => (
  <label className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-slate-400 mb-2">
    {icon}
    {children}
  </label>
);

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full bg-ink-950 border border-white/10 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 px-3 py-3 text-sm rounded-sm transition-all"
  >
    {children}
  </select>
);

const SummaryRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-slate-500">{label}</span>
    <span className="text-white font-medium text-right truncate">{value}</span>
  </div>
);

const Item = ({ k, v, accent, mono }) => (
  <div className="flex items-center justify-between gap-4 px-4 py-3">
    <span className="text-xs uppercase tracking-widest text-slate-500">{k}</span>
    <span
      className={`text-sm text-right truncate ${
        accent ? "text-brand font-bold text-base" : "text-white font-medium"
      } ${mono ? "font-mono" : ""}`}
    >
      {v}
    </span>
  </div>
);

export default OrderBoostingPage;
