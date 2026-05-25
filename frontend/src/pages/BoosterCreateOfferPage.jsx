import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { GAMES, getFullRanks, getRankTransitions } from "../constants";
import { toast } from "sonner";
import { Trash2, Plus, ChevronDown, ChevronRight } from "lucide-react";
import ImageUpload from "../components/ImageUpload";

const BoosterCreateOfferPage = () => {
  const { user, profile, isBooster } = useAuth();
  const navigate = useNavigate();
  const [kind, setKind] = useState("boosting");
  const [game, setGame] = useState("rocket-league");

  const [title, setTitle] = useState("");
  const [imageB64, setImageB64] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("free");
  const [donationLinks, setDonationLinks] = useState([{ label: "PayPal", url: "" }]);
  const [maxRankPerMode, setMaxRankPerMode] = useState({});
  const [priceTable, setPriceTable] = useState({});
  const [openMode, setOpenMode] = useState(null);
  const [bulkValue, setBulkValue] = useState({});

  const [accTitle, setAccTitle] = useState("");
  const [accImageB64, setAccImageB64] = useState("");
  const [accDesc, setAccDesc] = useState("");
  const [accPrice, setAccPrice] = useState(20);

  const [busy, setBusy] = useState(false);
  const [existing, setExisting] = useState(null);

  const fullRanks = getFullRanks(game);
  const transitions = getRankTransitions(game);
  const modes = GAMES[game].modes.length ? GAMES[game].modes : ["default"];

  useEffect(() => {
    if (!user || kind !== "boosting") return;
    (async () => {
      const q = query(
        collection(db, "boosterOffers"),
        where("uid", "==", user.uid),
        where("game", "==", game)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        const data = d.data();
        setExisting({ id: d.id, ...data });
        setTitle(data.title || "");
        setImageB64(data.image || "");
        setDescription(data.description || "");
        setType(data.type || "free");
        setDonationLinks(data.donationLinks?.length ? data.donationLinks : [{ label: "PayPal", url: "" }]);
        setMaxRankPerMode(data.maxRankPerMode || {});
        setPriceTable(data.priceTable || {});
      } else {
        setExisting(null);
        setTitle("");
        setImageB64("");
        setDescription("");
        setPriceTable({});
        setMaxRankPerMode({});
      }
      setOpenMode(modes[0]);
    })();
  }, [user, game, kind]); // eslint-disable-line

  if (!isBooster) return <Navigate to="/games" replace />;

  const setPrice = (mode, transitionKey, val) => {
    setPriceTable((prev) => ({
      ...prev,
      [mode]: { ...(prev[mode] || {}), [transitionKey]: val === "" ? "" : Number(val) },
    }));
  };

  const bulkApply = (mode) => {
    const v = Number(bulkValue[mode]);
    if (isNaN(v)) return;
    const next = {};
    transitions.forEach((t) => (next[t.key] = v));
    setPriceTable((prev) => ({ ...prev, [mode]: next }));
    toast.success(`Prix uniforme appliqué (${v}€) sur ${mode === "default" ? "Valorant" : mode}.`);
  };

  const saveBoosting = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const cleanLinks = donationLinks.filter((l) => l.url?.trim());
      if (type === "free" && cleanLinks.length === 0) {
        toast.error("Au moins un lien de donation est requis pour une offre gratuite.");
        setBusy(false);
        return;
      }
      const payload = {
        uid: user.uid,
        displayName: profile?.displayName || user.email,
        game,
        title: title.trim(),
        image: imageB64 || null,
        description: description.trim(),
        type,
        priceTable: type === "paid" ? priceTable : {},
        donationLinks: cleanLinks,
        maxRankPerMode,
        updatedAt: serverTimestamp(),
      };
      if (existing) {
        await updateDoc(doc(db, "boosterOffers", existing.id), payload);
      } else {
        await addDoc(collection(db, "boosterOffers"), { ...payload, createdAt: serverTimestamp() });
      }
      await updateDoc(doc(db, "users", user.uid), { donationLinks: cleanLinks });
      toast.success("Offre enregistrée !");
      navigate(`/games/${game}`);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const saveAccount = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await addDoc(collection(db, "accountListings"), {
        uid: user.uid,
        sellerName: profile?.displayName || user.email,
        game,
        title: accTitle.trim(),
        image: accImageB64 || null,
        description: accDesc.trim(),
        price: Number(accPrice),
        sold: false,
        createdAt: serverTimestamp(),
      });
      toast.success("Compte mis en vente !");
      navigate(`/games/${game}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-10">
      <div className="font-mono-label text-[11px] text-brand mb-2">— Espace boosteur</div>
      <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tighter mb-2">Créer une offre</h1>
      <p className="text-slate-400 mb-8">Configure ton offre. Tu peux la modifier à tout moment.</p>

      <div className="grid grid-cols-2 gap-2 mb-6">
        {[
          { v: "boosting", l: "Offre boosting" },
          { v: "account", l: "Vendre un compte" },
        ].map((k) => (
          <button
            key={k.v}
            onClick={() => setKind(k.v)}
            data-testid={`kind-${k.v}`}
            className={`p-3 font-semibold text-sm border rounded-sm transition-colors ${
              kind === k.v ? "border-brand bg-brand/20" : "border-white/10 hover:border-brand/40"
            }`}
          >
            {k.l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6">
        {Object.values(GAMES).map((g) => (
          <button
            key={g.id}
            onClick={() => setGame(g.id)}
            data-testid={`offer-game-${g.id}`}
            className={`p-3 font-semibold text-sm border rounded-sm transition-colors ${
              game === g.id ? "border-brand bg-brand/20" : "border-white/10 hover:border-brand/40"
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {kind === "boosting" ? (
        <form onSubmit={saveBoosting} className="space-y-5 border border-white/10 bg-ink-900 p-6 rounded-sm" data-testid="boosting-offer-form">
          {existing && (
            <div className="font-mono-label text-[10px] text-green-400 bg-green-500/10 border border-green-500/30 px-3 py-2 rounded-sm">
              ÉDITION D'UNE OFFRE EXISTANTE
            </div>
          )}
          <Field label="Titre">
            <input required value={title} onChange={(e) => setTitle(e.target.value)} data-testid="offer-title" className="input-base" placeholder={`Boost ${GAMES[game].name} pro`} />
          </Field>
          <ImageUpload label="Image de l'offre" value={imageB64} onChange={setImageB64} testid="offer-image" />
          <Field label="Description">
            <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} data-testid="offer-description" className="input-base" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            {["free", "paid"].map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setType(t)}
                data-testid={`offer-type-${t}`}
                className={`p-3 text-sm font-semibold border rounded-sm transition-colors ${
                  type === t ? "border-brand bg-brand/20" : "border-white/10 hover:border-brand/40"
                }`}
              >
                {t === "free" ? "Gratuit (don)" : "Payant"}
              </button>
            ))}
          </div>

          {type === "free" && (
            <div>
              <label className="font-mono-label text-[10px] text-slate-400 block mb-2">
                Liens de donation (PayPal, Stripe, Ko-fi…)
              </label>
              <div className="space-y-2">
                {donationLinks.map((l, i) => (
                  <div key={i} className="flex gap-2">
                    <input placeholder="Label" value={l.label} onChange={(e) => { const n = [...donationLinks]; n[i].label = e.target.value; setDonationLinks(n); }} data-testid={`donation-label-${i}`} className="input-base w-1/3" />
                    <input placeholder="URL" value={l.url} onChange={(e) => { const n = [...donationLinks]; n[i].url = e.target.value; setDonationLinks(n); }} data-testid={`donation-url-${i}`} className="input-base flex-1" />
                    <button type="button" onClick={() => setDonationLinks(donationLinks.filter((_, idx) => idx !== i))} className="border border-white/10 hover:border-red-500/40 px-3 rounded-sm">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => setDonationLinks([...donationLinks, { label: "", url: "" }])} data-testid="add-donation-link" className="inline-flex items-center gap-1 text-sm text-brand hover:text-brand-hover">
                  <Plus size={14} /> Ajouter un lien
                </button>
              </div>
            </div>
          )}

          {type === "paid" && (
            <div>
              <label className="font-mono-label text-[10px] text-slate-400 block mb-3">
                Prix par transition de rank {modes.length > 1 ? "(par mode)" : ""}
              </label>
              <div className="border border-white/10 rounded-sm overflow-hidden">
                {modes.map((m) => (
                  <div key={m} className="border-b border-white/10 last:border-b-0">
                    <button
                      type="button"
                      onClick={() => setOpenMode(openMode === m ? null : m)}
                      data-testid={`toggle-mode-${m}`}
                      className="w-full p-3 flex items-center justify-between bg-ink-950 hover:bg-ink-800 transition-colors text-sm font-semibold"
                    >
                      <span>{m === "default" ? GAMES[game].name : m}</span>
                      {openMode === m ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    {openMode === m && (
                      <div className="bg-ink-950/50 p-4 space-y-3">
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <label className="font-mono-label text-[10px] text-slate-500 block mb-1">Remplir tous les prix avec</label>
                            <input
                              type="number"
                              min={0}
                              step={0.5}
                              value={bulkValue[m] || ""}
                              onChange={(e) => setBulkValue({ ...bulkValue, [m]: e.target.value })}
                              data-testid={`bulk-input-${m}`}
                              className="input-base"
                              placeholder="ex: 5"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => bulkApply(m)}
                            data-testid={`bulk-apply-${m}`}
                            className="border border-brand/40 hover:bg-brand/20 px-4 py-2 text-xs font-bold rounded-sm whitespace-nowrap"
                          >
                            Appliquer
                          </button>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-2">
                          {transitions.map((t) => (
                            <div key={t.key} className="flex items-center gap-2">
                              <div className="text-[11px] text-slate-400 flex-1 font-mono-label">{t.key}</div>
                              <input
                                type="number"
                                min={0}
                                step={0.5}
                                value={priceTable[m]?.[t.key] ?? ""}
                                onChange={(e) => setPrice(m, t.key, e.target.value)}
                                data-testid={`price-${m}-${t.key}`}
                                className="input-base w-20 text-xs"
                                placeholder="0"
                              />
                              <span className="text-[10px] text-slate-500">€</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Astuce : laisse vide pour les transitions que tu ne veux pas booster (elles seront indisponibles).
              </p>
            </div>
          )}

          <div>
            <label className="font-mono-label text-[10px] text-slate-400 block mb-2">
              Rank maximum {modes.length > 1 ? "par mode" : ""}
            </label>
            {modes.length === 1 && modes[0] === "default" ? (
              <select
                value={maxRankPerMode["default"] || ""}
                onChange={(e) => setMaxRankPerMode({ default: e.target.value })}
                data-testid="max-rank-default"
                className="input-base"
              >
                <option value="">Aucune limite</option>
                {fullRanks.map((r) => (
                  <option key={r.label}>{r.label}</option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {modes.map((m) => (
                  <div key={m}>
                    <div className="text-xs text-slate-500 mb-1">{m}</div>
                    <select
                      value={maxRankPerMode[m] || ""}
                      onChange={(e) => setMaxRankPerMode({ ...maxRankPerMode, [m]: e.target.value })}
                      data-testid={`max-rank-${m}`}
                      className="input-base text-xs"
                    >
                      <option value="">Aucune limite</option>
                      {fullRanks.map((r) => (
                        <option key={r.label}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={busy}
            data-testid="save-offer-btn"
            className="w-full bg-brand hover:bg-brand-hover py-3 font-bold rounded-sm purple-glow disabled:opacity-50"
          >
            {busy ? "Enregistrement…" : existing ? "Mettre à jour l'offre" : "Créer l'offre"}
          </button>

          <style>{`.input-base{width:100%;background:#050507;border:1px solid rgba(255,255,255,0.1);padding:.55rem .85rem;font-size:.85rem;border-radius:2px;outline:none;color:#fff}.input-base:focus{border-color:#9D4CDD}`}</style>
        </form>
      ) : (
        <form onSubmit={saveAccount} className="space-y-5 border border-white/10 bg-ink-900 p-6 rounded-sm" data-testid="account-offer-form">
          <Field label="Titre">
            <input required value={accTitle} onChange={(e) => setAccTitle(e.target.value)} className="input-base" data-testid="acc-title" />
          </Field>
          <ImageUpload label="Image du compte" value={accImageB64} onChange={setAccImageB64} testid="acc-image" />
          <Field label="Description">
            <textarea required rows={4} value={accDesc} onChange={(e) => setAccDesc(e.target.value)} className="input-base" data-testid="acc-desc" />
          </Field>
          <Field label="Prix (€)">
            <input type="number" min={0} required value={accPrice} onChange={(e) => setAccPrice(e.target.value)} className="input-base" data-testid="acc-price" />
          </Field>
          <button type="submit" disabled={busy} data-testid="save-account-btn" className="w-full bg-brand hover:bg-brand-hover py-3 font-bold rounded-sm purple-glow disabled:opacity-50">
            {busy ? "Enregistrement…" : "Mettre en vente"}
          </button>
          <style>{`.input-base{width:100%;background:#050507;border:1px solid rgba(255,255,255,0.1);padding:.55rem .85rem;font-size:.85rem;border-radius:2px;outline:none;color:#fff}.input-base:focus{border-color:#9D4CDD}`}</style>
        </form>
      )}
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="font-mono-label text-[10px] text-slate-400 block mb-2">{label}</label>
    {children}
  </div>
);

export default BoosterCreateOfferPage;
