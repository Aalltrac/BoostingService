import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { GAMES, CREATOR_UID } from "../constants";
import { toast } from "sonner";
import {
  Gamepad2,
  HandCoins,
  Wallet,
  Link2,
  MessageSquareText,
  ShieldCheck,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";

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

  const typeOptions = [
    {
      v: "free",
      l: "Gratuit (don)",
      desc: "Tu boostes par passion, sans rémunération.",
      icon: HandCoins,
    },
    {
      v: "paid",
      l: "Payant",
      desc: "Tu factures tes prestations de boosting.",
      icon: Wallet,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="font-mono-label text-[11px] text-brand mb-3 tracking-widest">
          — Candidature
        </div>
        <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tighter mb-4">
          Devenir boosteur
        </h1>
        <p className="text-slate-400 max-w-xl leading-relaxed">
          Remplis ce formulaire. Une discussion s'ouvrira avec le créateur
          pour valider ta candidature.
        </p>

        {/* Trust strip */}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-brand" />
            Validation par le créateur
          </span>
          <span className="inline-flex items-center gap-2">
            <MessageSquareText className="h-3.5 w-3.5 text-brand" />
            Réponse via chat privé
          </span>
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-brand" />
            Aucun engagement
          </span>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="border border-white/10 bg-ink-900 rounded-sm divide-y divide-white/10"
        data-testid="become-booster-form"
      >
        {/* Step 1 — Game */}
        <section className="p-6 lg:p-8">
          <div className="flex items-start gap-4 mb-5">
            <div className="font-mono-label text-[10px] text-brand border border-brand/40 bg-brand/10 px-2 py-1 rounded-sm">
              01
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Gamepad2 className="h-4 w-4 text-slate-300" />
                Sur quel jeu ?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Choisis le jeu sur lequel tu souhaites booster.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {Object.values(GAMES).map((g) => {
              const active = game === g.id;
              return (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => setGame(g.id)}
                  data-testid={`become-game-${g.id}`}
                  className={`group relative p-3 text-sm font-semibold border rounded-sm transition-colors text-left ${
                    active
                      ? "border-brand bg-brand/20"
                      : "border-white/10 hover:border-brand/40 hover:bg-white/[0.02]"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span>{g.name}</span>
                    {active && (
                      <CheckCircle2 className="h-4 w-4 text-brand" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2 — Type */}
        <section className="p-6 lg:p-8">
          <div className="flex items-start gap-4 mb-5">
            <div className="font-mono-label text-[10px] text-brand border border-brand/40 bg-brand/10 px-2 py-1 rounded-sm">
              02
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold">Type de boosting</h2>
              <p className="text-xs text-slate-500 mt-1">
                Précise si ton boost est gratuit ou rémunéré.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {typeOptions.map((opt) => {
              const Icon = opt.icon;
              const active = type === opt.v;
              return (
                <button
                  type="button"
                  key={opt.v}
                  onClick={() => setType(opt.v)}
                  data-testid={`become-type-${opt.v}`}
                  className={`p-4 text-left border rounded-sm transition-colors ${
                    active
                      ? "border-brand bg-brand/20"
                      : "border-white/10 hover:border-brand/40 hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon
                      className={`h-4 w-4 ${
                        active ? "text-brand" : "text-slate-400"
                      }`}
                    />
                    {active && (
                      <CheckCircle2 className="h-4 w-4 text-brand" />
                    )}
                  </div>
                  <div className="text-sm font-semibold">{opt.l}</div>
                  <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                    {opt.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 3 — Tracker */}
        <section className="p-6 lg:p-8">
          <div className="flex items-start gap-4 mb-5">
            <div className="font-mono-label text-[10px] text-brand border border-brand/40 bg-brand/10 px-2 py-1 rounded-sm">
              03
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold">
                Possèdes-tu un tracker ?{" "}
                <span className="text-slate-500 font-normal">
                  (optionnel)
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Colle le lien de ton profil tracker pour prouver ton niveau.
              </p>
            </div>
          </div>

          <div className="relative">
            <Link2 className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={tracker}
              onChange={(e) => setTracker(e.target.value)}
              data-testid="become-tracker-input"
              placeholder="https://tracker.gg/..."
              className="w-full bg-ink-950 border border-white/10 focus:border-brand focus:outline-none pl-10 pr-3 py-3 text-sm rounded-sm transition-colors"
            />
          </div>
        </section>

        {/* Step 4 — Message */}
        <section className="p-6 lg:p-8">
          <div className="flex items-start gap-4 mb-5">
            <div className="font-mono-label text-[10px] text-brand border border-brand/40 bg-brand/10 px-2 py-1 rounded-sm">
              04
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold">
                Message{" "}
                <span className="text-slate-500 font-normal">
                  (optionnel)
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Parle de ton expérience, ton rank, tes disponibilités.
              </p>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              data-testid="become-extra-input"
              rows={5}
              maxLength={500}
              placeholder="Parle de ton expérience…"
              className="w-full bg-ink-950 border border-white/10 focus:border-brand focus:outline-none px-3 py-3 text-sm rounded-sm transition-colors resize-none"
            />
            <div className="text-[10px] text-slate-500 text-right mt-1 font-mono-label">
              {extra.length}/500
            </div>
          </div>
        </section>

        {/* Footer / Submit */}
        <section className="p-6 lg:p-8 bg-ink-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
            En envoyant ta candidature, tu acceptes qu'une discussion soit
            ouverte avec le créateur pour échanger sur ton profil.
          </p>
          <button
            type="submit"
            disabled={busy}
            data-testid="become-submit"
            className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover px-6 py-3 font-bold text-sm rounded-sm purple-glow disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Envoi…
              </>
            ) : (
              <>
                Envoyer ma candidature
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </section>
      </form>
    </div>
  );
};

export default BecomeBoosterPage;
