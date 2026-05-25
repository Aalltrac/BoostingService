import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { GAMES, CREATOR_UID } from "../constants";
import { toast } from "sonner";

const BecomeBoosterPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [game, setGame] = useState("rocket-league");
  const [type, setType] = useState("free");
  const [tracker, setTracker] = useState("");
  const [extra, setExtra] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      // Create conversation with creator
      const convRef = await addDoc(collection(db, "conversations"), {
        participants: [user.uid, CREATOR_UID],
        clientUid: user.uid,
        boosterUid: CREATOR_UID,
        type: "become_booster",
        game,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: "Candidature boosteur",
      });

      await addDoc(collection(db, "becomeBoosterRequests"), {
        uid: user.uid,
        displayName: profile?.displayName || user.email,
        game,
        type,
        tracker,
        extra,
        conversationId: convRef.id,
        createdAt: serverTimestamp(),
      });

      const text = `Candidature boosteur — ${profile?.displayName || user.email}
Jeu : ${GAMES[game].name}
Type : ${type === "free" ? "Gratuit (don)" : "Payant"}
Tracker : ${tracker || "(non fourni)"}
${extra ? `
Message :
${extra}` : ""}`;

      await addDoc(collection(db, "conversations", convRef.id, "messages"), {
        senderUid: "system",
        text,
        system: true,
        createdAt: serverTimestamp(),
      });

      toast.success("Candidature envoyée au créateur !");
      navigate(`/chat/${convRef.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-8 py-12">
      <div className="font-mono-label text-[11px] text-brand mb-2">— Candidature</div>
      <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tighter mb-4">Devenir boosteur</h1>
      <p className="text-slate-400 mb-10">
        Remplis ce formulaire. Une discussion s'ouvrira avec le créateur pour valider ta candidature.
      </p>

      <form onSubmit={submit} className="space-y-6 border border-white/10 bg-ink-900 p-6 lg:p-8 rounded-sm" data-testid="become-booster-form">
        <div>
          <label className="font-mono-label text-[10px] text-slate-400 block mb-3">Sur quel jeu ?</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(GAMES).map((g) => (
              <button
                type="button"
                key={g.id}
                onClick={() => setGame(g.id)}
                data-testid={`become-game-${g.id}`}
                className={`p-3 text-sm font-semibold border rounded-sm transition-colors ${
                  game === g.id ? "border-brand bg-brand/20" : "border-white/10 hover:border-brand/40"
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="font-mono-label text-[10px] text-slate-400 block mb-3">Type de boosting</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: "free", l: "Gratuit (don)" },
              { v: "paid", l: "Payant" },
            ].map((opt) => (
              <button
                type="button"
                key={opt.v}
                onClick={() => setType(opt.v)}
                data-testid={`become-type-${opt.v}`}
                className={`p-3 text-sm font-semibold border rounded-sm transition-colors ${
                  type === opt.v ? "border-brand bg-brand/20" : "border-white/10 hover:border-brand/40"
                }`}
              >
                {opt.l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="font-mono-label text-[10px] text-slate-400 block mb-2">Possèdes-tu un tracker ? (lien)</label>
          <input
            type="text"
            value={tracker}
            onChange={(e) => setTracker(e.target.value)}
            data-testid="become-tracker-input"
            placeholder="https://tracker.gg/..."
            className="w-full bg-ink-950 border border-white/10 focus:border-brand focus:outline-none px-3 py-3 text-sm rounded-sm"
          />
        </div>

        <div>
          <label className="font-mono-label text-[10px] text-slate-400 block mb-2">Message (optionnel)</label>
          <textarea
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            data-testid="become-extra-input"
            rows={4}
            placeholder="Parle de ton expérience…"
            className="w-full bg-ink-950 border border-white/10 focus:border-brand focus:outline-none px-3 py-3 text-sm rounded-sm"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          data-testid="become-submit"
          className="w-full bg-brand hover:bg-brand-hover py-3 font-bold rounded-sm purple-glow disabled:opacity-50"
        >
          {busy ? "Envoi…" : "Envoyer ma candidature"}
        </button>
      </form>
    </div>
  );
};

export default BecomeBoosterPage;
