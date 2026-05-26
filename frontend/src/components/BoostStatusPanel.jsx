import { useEffect, useState } from "react";
import { doc, updateDoc, serverTimestamp, addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import { Wifi, WifiOff, TrendingUp, Save, RefreshCw } from "lucide-react";
import { toast } from "sonner";

/**
 * Live status panel.
 * - Booster mode: form to update connected state + current rank, posts a system message on update.
 * - Client mode: read-only display.
 */
const BoostStatusPanel = ({ order, conversationId, isBooster, isClient }) => {
  const status = order?.boostStatus || {};
  const [connected, setConnected] = useState(!!status.connected);
  const [currentRank, setCurrentRank] = useState(status.currentRank || "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setConnected(!!order?.boostStatus?.connected);
    setCurrentRank(order?.boostStatus?.currentRank || "");
  }, [order?.boostStatus?.connected, order?.boostStatus?.currentRank]);

  const updatedAt = status.updatedAt?.toDate?.();

  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const payload = {
        boostStatus: {
          connected,
          currentRank: currentRank.trim(),
          updatedAt: serverTimestamp(),
        },
      };
      await updateDoc(doc(db, "orders", order.id), payload);

      // Post a system message so the client sees the update in chat
      const parts = [];
      parts.push(
        connected
          ? "Le boosteur est CONNECTÉ au compte."
          : "Le boosteur s'est DÉCONNECTÉ du compte."
      );
      if (currentRank.trim()) {
        parts.push(`Rank actuel : ${currentRank.trim()}.`);
      }
      if (conversationId) {
        await addDoc(
          collection(db, "conversations", conversationId, "messages"),
          {
            senderUid: "system",
            system: true,
            text: parts.join(""),
            createdAt: serverTimestamp(),
          }
        );
      }
      toast.success("Statut mis à jour.");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!order || order.type !== "boosting" || order.status === "completed") {
    return null;
  }

  const dotColor = status.connected
    ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]"
    : "bg-slate-500";

  return (
    <div
      data-testid="boost-status-panel"
      className="border border-brand/30 bg-gradient-to-br from-brand/8 via-brand/3 to-transparent rounded-sm p-4"
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${dotColor}`} />
          <span className="font-mono-label text-[10px] text-brand tracking-widest">
            — Suivi en direct
          </span>
        </div>
        {updatedAt && (
          <span className="font-mono-label text-[9px] text-slate-500">
            MAJ {updatedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>

      {isBooster ? (
        <>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              type="button"
              onClick={() => setConnected(true)}
              data-testid="status-connected-btn"
              className={`p-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold border rounded-sm transition-colors ${
                connected
                  ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-300"
                  : "border-white/10 text-slate-400 hover:border-emerald-400/30"
              }`}
            >
              <Wifi size={14} />
              Connecté
            </button>
            <button
              type="button"
              onClick={() => setConnected(false)}
              data-testid="status-disconnected-btn"
              className={`p-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold border rounded-sm transition-colors ${
                !connected
                  ? "border-slate-400/60 bg-slate-400/15 text-slate-200"
                  : "border-white/10 text-slate-400 hover:border-slate-400/30"
              }`}
            >
              <WifiOff size={14} />
              Déconnecté
            </button>
          </div>

          <div className="mb-3">
            <label className="font-mono-label text-[10px] text-slate-400 block mb-1.5 flex items-center gap-1.5">
              <TrendingUp size={11} className="text-brand" />
              Rank actuel
            </label>
            <input
              value={currentRank}
              onChange={(e) => setCurrentRank(e.target.value)}
              data-testid="current-rank-input"
              placeholder="ex: Or III · 45 LP"
              maxLength={60}
              className="w-full bg-ink-950 border border-white/10 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 px-3 py-2 text-sm rounded-sm placeholder:text-slate-600"
            />
          </div>

          <button
            type="button"
            onClick={save}
            disabled={busy}
            data-testid="save-status-btn"
            className="w-full inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover py-2.5 font-bold text-xs rounded-sm disabled:opacity-50 transition-colors"
          >
            {busy ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
            {busy ? "Mise à jour…" : "Mettre à jour le statut"}
          </button>
        </>
      ) : (
        <div className="space-y-2.5" data-testid="status-readonly">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 text-xs">Statut boosteur</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold border rounded-sm ${
                status.connected
                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                  : "border-white/10 bg-white/[0.04] text-slate-300"
              }`}
            >
              {status.connected ? <Wifi size={11} /> : <WifiOff size={11} />}
              {status.connected ? "En jeu" : "Hors-ligne"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 text-xs">Rank actuel</span>
            <span className="text-white font-semibold text-xs">
              {status.currentRank || "—"}
            </span>
          </div>
          {!status.updatedAt && (
            <p className="font-mono-label text-[10px] text-slate-500 italic">
              En attente d'informations du boosteur…
            </p>
          )}
        </div>
      )}

      {!isBooster && !isClient && (
        <p className="font-mono-label text-[9px] text-slate-500 mt-3">
          Vue créateur — informations en lecture seule.
        </p>
      )}
    </div>
  );
};

export default BoostStatusPanel;
