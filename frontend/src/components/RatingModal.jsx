import { useState } from "react";
import { doc, updateDoc, serverTimestamp, addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import { Star, X, Send } from "lucide-react";
import { toast } from "sonner";

/**
 * Modal asking the client to rate the booster after order completion.
 * Writes rating onto the order doc and posts a system message into the conversation.
 */
const RatingModal = ({ order, conversationId, onClose, onSubmitted }) => {
  const [stars, setStars] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy || stars < 1) return;
    setBusy(true);
    try {
      const payload = {
        stars: Number(stars),
        comment: comment.trim(),
        ratedAt: serverTimestamp(),
        ratedBy: order.clientUid,
      };
      await updateDoc(doc(db, "orders", order.id), { rating: payload });

      await addDoc(collection(db, "reviews"), {
          boosterUid: order.boosterUid,
          clientUid: order.clientUid,
          clientName: order.clientName || "Client",
          orderId: order.id,
          stars: Number(stars),
          comment: comment.trim(),
          ratedAt: serverTimestamp(),
      });

      if (conversationId) {
        await addDoc(
          collection(db, "conversations", conversationId, "messages"),
          {
            senderUid: "system",
            system: true,
            text: `Le client a laissé un avis : ${stars}/5 ★${
              comment.trim() ? `
« ${comment.trim()} »` : ""
            }`,
            createdAt: serverTimestamp(),
          }
        );
      }

      toast.success("Merci pour ton avis !");
      onSubmitted?.();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      data-testid="rating-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-ink-900 border border-brand/30 rounded-sm p-6 shadow-2xl"
      >
        <button
          onClick={onClose}
          data-testid="rating-modal-close"
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1.5 border border-white/10 rounded-sm"
          aria-label="Fermer"
        >
          <X size={14} />
        </button>

        <div className="font-mono-label text-[10px] text-brand tracking-widest mb-2">
          — Évaluation
        </div>
        <h3 className="font-display font-black text-2xl tracking-tighter mb-2">
          Note ton boosteur
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          Comment s'est passée la prestation avec{" "}
          <span className="text-white font-semibold">
            {order.boosterName || "ton boosteur"}
          </span>{" "}
          ?
        </p>

        <div className="flex items-center justify-center gap-1.5 mb-6">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setStars(n)}
              data-testid={`star-${n}`}
              className="p-1 transition-transform hover:scale-110"
              aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
            >
              <Star
                size={36}
                className={
                  n <= (hover || stars)
                    ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                    : "text-slate-600"
                }
              />
            </button>
          ))}
        </div>

        <div className="text-center font-mono-label text-[10px] text-slate-500 mb-4">
          {stars}/5
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          data-testid="rating-comment"
          rows={4}
          maxLength={500}
          placeholder="Partage ton expérience (facultatif)…"
          className="w-full bg-ink-950 border border-white/10 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 px-3 py-2.5 text-sm rounded-sm placeholder:text-slate-600 mb-2"
        />
        <div className="text-right font-mono-label text-[9px] text-slate-600 mb-4">
          {comment.length}/500
        </div>

        <button
          onClick={submit}
          disabled={busy || stars < 1}
          data-testid="submit-rating"
          className="w-full inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover py-3 font-bold rounded-sm purple-glow disabled:opacity-50 transition-colors"
        >
          <Send size={14} />
          {busy ? "Envoi…" : "Envoyer mon avis"}
        </button>
      </div>
    </div>
  );
};

export default RatingModal;
