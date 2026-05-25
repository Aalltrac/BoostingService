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
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { GAMES, ROCKET_LEAGUE_MODES, VALORANT_RANKS, ROCKET_LEAGUE_RANKS } from "../constants";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

const BoosterCreateOfferPage = () => {
  const { user, profile, isBooster } = useAuth();
  const navigate = useNavigate();
  const [kind, setKind] = useState("boosting"); // boosting or account
  const [game, setGame] = useState("rocket-league");

  // Boosting
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("free");
  const [pricePerRank, setPricePerRank] = useState(5);
  const [donationLinks, setDonationLinks] = useState([{ label: "PayPal", url: "" }]);
  const [maxRankPerMode, setMaxRankPerMode] = useState({});

  // Account
  const [accTitle, setAccTitle] = useState("");
  const [accImage, setAccImage] = useState("");
  const [accDesc, setAccDesc] = useState("");
  const [accPrice, setAccPrice] = useState(20);

  const [busy, setBusy] = useState(false);
  const [existing, setExisting] = useState(null);

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
        setImage(data.image || "");
        setDescription(data.description || "");
        setType(data.type || "free");
        setPricePerRank(data.pricePerRank || 5);
        setDonationLinks(data.donationLinks?.length ? data.donationLinks : [{ label: "PayPal", url: "" }]);
        setMaxRankPerMode(data.maxRankPerMode || {});
      } else {
        setExisting(null);
        setTitle("");
        setImage("");
        setDescription("");
      }
    })();
  }, [user, game, kind]);

  if (!isBooster) return <Navigate to="/games" replace />;

  const saveBoosting = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const cleanLinks = donationLinks.filter((l) => l.url?.trim());
      if (type === "free" && cleanLinks.length === 0) {
        toast.error("Au moins un lien de donation requis pour une offre gratuite.");
        setBusy(false);
        return;
      }
      const payload = {
        uid: user.uid,
        displayName: profile?.displayName || user.email,
        game,
        title: title.trim(),
        image: image.trim() || null,
        description: description.trim(),
        type,
        pricePerRank: type === "paid" ? Number(pricePerRank) : 0,
        donationLinks: cleanLinks,
        maxRankPerMode,
        updatedAt: serverTimestamp(),
      };
      if (existing) {
        await updateDoc(doc(db, "boosterOffers", existing.id), payload);
      } else {
        await addDoc(collection(db, "boosterOffers"), { ...payload, createdAt: serverTimestamp() });
      }
      // Save donation links on user profile too
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
        image: accImage.trim() || null,
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

  const currentRanks = GAMES[game].ranks;
  const currentModes = GAMES[game].modes;

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
          <Field label="Titre" testid="offer-title">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="offer-title"
              className="input-base"
              placeholder={`Boost ${GAMES[game].name} pro`}
            />
          </Field>
          <Field label="Image (URL)" testid="offer-image">
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              data-testid="offer-image"
              className="input-base"
              placeholder="https://…"
            />
          </Field>
          <Field label="Description" testid="offer-description">
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="offer-description"
              className="input-base"
            />
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

          {type === "paid" && (
            <Field label="Prix par division (€)" testid="offer-price">
              <input
                type="number"
                min={0}
                step={0.5}
                required
                value={pricePerRank}
                onChange={(e) => setPricePerRank(e.target.value)}
                data-testid="offer-price"
                className="input-base"
              />
            </Field>
          )}

          {type === "free" && (
            <div>
              <label className="font-mono-label text-[10px] text-slate-400 block mb-2">
                Liens de donation (PayPal, Stripe, Ko-fi…)
              </label>
              <div className="space-y-2">
                {donationLinks.map((l, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      placeholder="Label"
                      value={l.label}
                      onChange={(e) => {
                        const next = [...donationLinks];
                        next[i].label = e.target.value;
                        setDonationLinks(next);
                      }}
                      data-testid={`donation-label-${i}`}
                      className="input-base w-1/3"
                    />
                    <input
                      placeholder="URL"
                      value={l.url}
                      onChange={(e) => {
                        const next = [...donationLinks];
                        next[i].url = e.target.value;
                        setDonationLinks(next);
                      }}
                      data-testid={`donation-url-${i}`}
                      className="input-base flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => setDonationLinks(donationLinks.filter((_, idx) => idx !== i))}
                      className="border border-white/10 hover:border-red-500/40 px-3 rounded-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setDonationLinks([...donationLinks, { label: "", url: "" }])}
                  data-testid="add-donation-link"
                  className="inline-flex items-center gap-1 text-sm text-brand hover:text-brand-hover"
                >
                  <Plus size={14} /> Ajouter un lien
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="font-mono-label text-[10px] text-slate-400 block mb-2">
              Rank maximum {currentModes.length ? "par mode" : ""}
            </label>
            {currentModes.length === 0 ? (
              <select
                value={maxRankPerMode["default"] || ""}
                onChange={(e) => setMaxRankPerMode({ default: e.target.value })}
                data-testid="max-rank-default"
                className="input-base"
              >
                <option value="">Aucune limite</option>
                {currentRanks.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {currentModes.map((m) => (
                  <div key={m}>
                    <div className="text-xs text-slate-500 mb-1">{m}</div>
                    <select
                      value={maxRankPerMode[m] || ""}
                      onChange={(e) => setMaxRankPerMode({ ...maxRankPerMode, [m]: e.target.value })}
                      data-testid={`max-rank-${m}`}
                      className="input-base text-xs"
                    >
                      <option value="">Aucune limite</option>
                      {currentRanks.map((r) => (
                        <option key={r}>{r}</option>
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

          <style>{`.input-base{width:100%;background:#050507;border:1px solid rgba(255,255,255,0.1);padding:.7rem .85rem;font-size:.85rem;border-radius:2px;outline:none;color:#fff}.input-base:focus{border-color:#9D4CDD}`}</style>
        </form>
      ) : (
        <form onSubmit={saveAccount} className="space-y-5 border border-white/10 bg-ink-900 p-6 rounded-sm" data-testid="account-offer-form">
          <Field label="Titre">
            <input required value={accTitle} onChange={(e) => setAccTitle(e.target.value)} className="input-base" data-testid="acc-title" />
          </Field>
          <Field label="Image (URL)">
            <input value={accImage} onChange={(e) => setAccImage(e.target.value)} className="input-base" data-testid="acc-image" />
          </Field>
          <Field label="Description">
            <textarea required rows={4} value={accDesc} onChange={(e) => setAccDesc(e.target.value)} className="input-base" data-testid="acc-desc" />
          </Field>
          <Field label="Prix (€)">
            <input
              type="number"
              min={0}
              required
              value={accPrice}
              onChange={(e) => setAccPrice(e.target.value)}
              className="input-base"
              data-testid="acc-price"
            />
          </Field>
          <button
            type="submit"
            disabled={busy}
            data-testid="save-account-btn"
            className="w-full bg-brand hover:bg-brand-hover py-3 font-bold rounded-sm purple-glow disabled:opacity-50"
          >
            {busy ? "Enregistrement…" : "Mettre en vente"}
          </button>
          <style>{`.input-base{width:100%;background:#050507;border:1px solid rgba(255,255,255,0.1);padding:.7rem .85rem;font-size:.85rem;border-radius:2px;outline:none;color:#fff}.input-base:focus{border-color:#9D4CDD}`}</style>
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
