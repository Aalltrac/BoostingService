import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Star, MessageCircle } from "lucide-react";

/**
 * Displays average rating + recent reviews for a given booster/seller uid.
 * Reads all completed orders with `rating` for this user and aggregates.
 */
const RatingDisplay = ({ boosterUid, compact = false, max = 5 }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!boosterUid) return;
    const q = query(
      collection(db, "orders"),
      where("boosterUid", "==", boosterUid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((o) => o.rating && typeof o.rating.stars === "number")
        .sort(
          (a, b) =>
            (b.rating.ratedAt?.seconds || 0) - (a.rating.ratedAt?.seconds || 0)
        );
      setReviews(list);
      setLoading(false);
    });
    return unsub;
  }, [boosterUid]);

  const total = reviews.length;
  const avg =
    total > 0
      ? reviews.reduce((s, r) => s + (r.rating.stars || 0), 0) / total
      : 0;

  const Stars = ({ value, size = 14 }) => (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={
            n <= Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "text-slate-600"
          }
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div
        data-testid="rating-loading"
        className="font-mono-label text-[10px] text-slate-600"
      >
        Chargement des avis…
      </div>
    );
  }

  if (compact) {
    return (
      <div
        data-testid="rating-compact"
        className="inline-flex items-center gap-1.5"
      >
        <Stars value={avg} size={12} />
        <span className="font-mono-label text-[10px] text-slate-400">
          {total > 0 ? `${avg.toFixed(1)} · ${total}` : "Aucun avis"}
        </span>
      </div>
    );
  }

  return (
    <div data-testid="rating-display" className="space-y-4">
      <div className="flex items-end justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="font-mono-label text-[10px] text-slate-500 tracking-widest mb-1">
            — Avis clients
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-black text-3xl text-brand tracking-tighter">
              {total > 0 ? avg.toFixed(1) : "—"}
            </span>
            <span className="text-xs text-slate-500">/5</span>
          </div>
          <Stars value={avg} />
        </div>
        <div className="text-right">
          <div className="font-mono-label text-[10px] text-slate-500">
            {total} avis
          </div>
        </div>
      </div>

      {total === 0 ? (
        <div className="text-xs text-slate-500 italic py-4 text-center border border-dashed border-white/10 rounded-sm">
          Aucun avis pour le moment.
        </div>
      ) : (
        <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {reviews.slice(0, max).map((o) => (
            <li
              key={o.id}
              data-testid={`review-${o.id}`}
              className="border border-white/10 bg-white/[0.02] rounded-sm p-3"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <Stars value={o.rating.stars} size={12} />
                <span className="font-mono-label text-[9px] text-slate-500 truncate">
                  {o.clientName || "Client"}
                </span>
              </div>
              {o.rating.comment ? (
                <p className="text-xs text-slate-300 leading-relaxed flex gap-2">
                  <MessageCircle
                    size={11}
                    className="text-brand mt-0.5 shrink-0"
                  />
                  <span className="break-words">{o.rating.comment}</span>
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Pas de commentaire.
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RatingDisplay;
