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
import { ArrowRight, Lock, Mail, KeyRound, AlertTriangle } from "lucide-react";

const OrderBoostingPage = () => {
  const { gameId, boosterUid } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const game = GAMES[gameId];
  const ranks = useMemo(() => (game ? getFullRanks(gameId) : []), [game, gameId]);
  const transitions = useMemo(() => (game ? getRankTransitions(gameId) : []), [game, gameId]);

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
      if (!snap.empty) setBoosterOffer({ id: snap.docs[0].id, ...snap.docs[0].data() });
    })();
  }, [boosterUid, gameId]);

  const isPaid = boosterOffer?.type === "paid";
  const priceTableForMode = useMemo(
    () => boosterOffer?.priceTable?.[game?.modes.length ? mode : \"default\"] || {},
    [boosterOffer, game, mode]
  );
  // Compute total by summing transition prices from rankFrom..rankTo - 1
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

  // Check max rank constraint
  const maxRankLabel =
      boosterOffer?.maxRankPerMode?.[game?.modes.length ? mode : \"default\"];
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

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-10">
      <Link to={`/games/${gameId}`} className="font-mono-label text-[11px] text-slate-400 hover:text-white" data-testid="order-back">
        ← Retour à {game.name}
      </Link>

      <h1 className="font-display font-black text-3xl sm:text-5xl tracking-tighter mt-4 mb-2">
        Commande de <span className="text-brand">boost</span>
      </h1>
      <p className="text-slate-400 mb-10">
        Boosteur sélectionné :{" "}
        <span className="text-white font-semibold">{boosterUser?.displayName || "..."}</span>
        {boosterOffer?.type === "free" && (
          <span className="ml-2 font-mono-label text-[10px] text-green-400">GRATUIT · DON</span>
        )}
      </p>

      {/* STEPS */}
      <div className="grid grid-cols-3 gap-2 mb-10">
        {["Configuration", "Identifiants", "Confirmation"].map((s, i) => (
          <div
            key={i}
            className={`p-3 border ${step === i + 1 ? "border-brand bg-brand/10" : "border-white/10"} rounded-sm`}
          >
            <div className="font-mono-label text-[10px] text-brand">— Étape {i + 1}</div>
            <div className="text-sm font-semibold mt-1">{s}</div>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="border border-white/10 bg-ink-900 p-6 lg:p-10 space-y-6">
          {game.modes.length > 0 && (
            <div>
              <label className="font-mono-label text-[10px] text-slate-400 block mb-3">Mode de jeu</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {game.modes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    data-testid={`mode-${m}`}
                    className={`px-3 py-2 text-sm font-semibold border rounded-sm transition-colors ${
                      mode === m ? "border-brand bg-brand/20 text-white" : "border-white/10 hover:border-brand/40 text-slate-300"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="font-mono-label text-[10px] text-slate-400 block mb-3">Rank actuel</label>
              <select
                value={rankFrom}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setRankFrom(v);
                  if (rankTo <= v) setRankTo(Math.min(v + 1, ranks.length - 1));
                }}
                data-testid="rank-from-select"
                className="w-full bg-ink-950 border border-white/10 focus:border-brand focus:outline-none px-3 py-3 text-sm rounded-sm"
              >
                {ranks.map((r) => (
                  <option key={r.label} value={r.index}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-mono-label text-[10px] text-slate-400 block mb-3">Rank souhaité</label>
              <select
                value={rankTo}
                onChange={(e) => setRankTo(Number(e.target.value))}
                data-testid="rank-to-select"
                className="w-full bg-ink-950 border border-white/10 focus:border-brand focus:outline-none px-3 py-3 text-sm rounded-sm"
              >
                {ranks.filter((r) => r.index > rankFrom).map((r) => (
                  <option key={r.label} value={r.index}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          {isPaid && (
            <div className="border border-white/5 bg-ink-950 p-4 rounded-sm">
              <div className="font-mono-label text-[10px] text-slate-500 mb-3">Détail du calcul</div>
              <div className="space-y-1 text-xs max-h-40 overflow-y-auto">
                {Array.from({ length: rankTo - rankFrom }).map((_, k) => {
                  const t = transitions.find((tr) => tr.fromIndex === rankFrom + k);
                  if (!t) return null;
                  const p = priceTableForMode[t.key];
                  const has = p !== undefined && p !== "" && p !== null;
                  return (
                    <div key={t.key} className={`flex justify-between ${has ? "text-slate-300" : "text-red-400"}`}>
                      <span>{t.key}</span>
                      <span className="font-semibold">{has ? `${p}€` : "indisponible"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(exceedsMax || missingTransitions.length > 0) && (
            <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/30 p-3 rounded-sm text-xs text-red-300">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              <div>
                {exceedsMax && <>Ce boosteur ne dépasse pas <b>{maxRankLabel}</b> sur ce mode. </>}
                {missingTransitions.length > 0 && <>Certaines transitions ne sont pas proposées par ce boosteur.</>}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div>
              <div className="font-mono-label text-[10px] text-slate-500">Prix total</div>
              <div className="font-display font-black text-3xl text-brand mt-1">
                {!isPaid ? "Gratuit" : `${totalPrice}€`}
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={rankFrom >= rankTo || exceedsMax || (isPaid && missingTransitions.length > 0)}
              data-testid="step-1-next"
              className="bg-brand hover:bg-brand-hover px-6 py-3 font-bold rounded-sm purple-glow disabled:opacity-40 inline-flex items-center gap-2"
            >
              Suivant <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="border border-white/10 bg-ink-900 p-6 lg:p-10 space-y-6">
          <div className="flex items-start gap-3 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-sm">
            <Lock size={18} className="text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-sm">Identifiants requis</div>
              <p className="text-xs text-slate-400 mt-1">
                Tes identifiants seront transmis uniquement au boosteur via le chat sécurisé. Le créateur conserve un accès en cas de litige.
              </p>
            </div>
          </div>
          <div>
            <label className="font-mono-label text-[10px] text-slate-400 block mb-2">
              <Mail size={11} className="inline mr-1" /> Email du compte
            </label>
            <input type="text" required value={accEmail} onChange={(e) => setAccEmail(e.target.value)} data-testid="account-email-input" className="w-full bg-ink-950 border border-white/10 focus:border-brand focus:outline-none px-3 py-3 text-sm rounded-sm" />
          </div>
          <div>
            <label className="font-mono-label text-[10px] text-slate-400 block mb-2">
              <KeyRound size={11} className="inline mr-1" /> Mot de passe du compte
            </label>
            <input type="text" required value={accPassword} onChange={(e) => setAccPassword(e.target.value)} data-testid="account-password-input" className="w-full bg-ink-950 border border-white/10 focus:border-brand focus:outline-none px-3 py-3 text-sm rounded-sm" />
          </div>
          <div className="flex justify-between pt-4 border-t border-white/5">
            <button onClick={() => setStep(1)} className="px-4 py-2 text-sm text-slate-400 hover:text-white" data-testid="step-2-back">← Précédent</button>
            <button onClick={() => setStep(3)} disabled={!accEmail || !accPassword} data-testid="step-2-next" className="bg-brand hover:bg-brand-hover px-6 py-3 font-bold rounded-sm purple-glow disabled:opacity-40 inline-flex items-center gap-2">
              Suivant <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="border border-white/10 bg-ink-900 p-6 lg:p-10 space-y-4">
          <h2 className="font-display font-bold text-xl mb-4">Récapitulatif</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Item k="Jeu" v={game.name} />
            {game.modes.length > 0 && <Item k="Mode" v={mode} />}
            <Item k="Rank actuel" v={ranks[rankFrom].label} />
            <Item k="Rank souhaité" v={ranks[rankTo].label} />
            <Item k="Boosteur" v={boosterUser?.displayName || "..."} />
            <Item k="Prix" v={!isPaid ? "Gratuit (don)" : `${totalPrice}€`} accent />
          </div>
          <div className="flex justify-between pt-6 border-t border-white/5">
            <button onClick={() => setStep(2)} className="px-4 py-2 text-sm text-slate-400 hover:text-white" data-testid="step-3-back">← Précédent</button>
            <button onClick={placeOrder} disabled={busy} data-testid="confirm-order-btn" className="bg-brand hover:bg-brand-hover px-8 py-3 font-bold rounded-sm purple-glow disabled:opacity-50">
              {busy ? "Envoi…" : "Confirmer la commande"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Item = ({ k, v, accent }) => (
  <div className="border border-white/5 p-4 rounded-sm">
    <div className="font-mono-label text-[10px] text-slate-500">{k}</div>
    <div className={`text-base mt-1 ${accent ? "font-display font-black text-brand text-2xl" : "font-semibold"}`}>{v}</div>
  </div>
);

export default OrderBoostingPage;
