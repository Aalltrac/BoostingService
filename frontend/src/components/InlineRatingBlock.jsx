import { useState } from "react";
import { doc, updateDoc, serverTimestamp, addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import { Star, Send, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";

/**
 * InlineRatingBlock — affiché directement dans le flux de la conversation
 * après la fin du boost, côté client uniquement.
 */
const InlineRatingBlock = ({ order, conversationId, onSubmitted }) => {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
              comment.trim() ? `\n« ${comment.trim()} »` : ""
            }`,
            createdAt: serverTimestamp(),
          }
        );
      }

      toast.success("Merci pour ton avis !");
      setSubmitted(true);
      onSubmitted?.();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (submitted) return null;

  const labels = ["", "Mauvais", "Passable", "Bien", "Très bien", "Excellent"];
  const displayed = hover || stars;

  return (
    <div
      data-testid="inline-rating-block"
      className="mx-auto my-4 w-full max-w-sm"
    >
      <div className="relative border border-brand/40 bg-gradient-to-br from-brand/10 via-ink-900 to-ink-900 rounded-sm overflow-hidden shadow-[0_0_30px_rgba(157,76,221,0.12)]">
        {/* Accent line top */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/80 to-transparent" />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-sm bg-brand/20 border border-brand/30 flex items-center justify-center shrink-0">
              <Sparkles size={13} className="text-brand" />
            </div>
            <div>
              <div className="font-mono-label text-[10px] text-brand tracking-widest">
                — Note le boost
              </div>
              <div className="text-xs text-slate-300 font-semibold">
                {order.boosterName || "ton boosteur"} a terminé ta commande
              </div>
            </div>
          </div>

          {/* Stars */}
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setStars(n)}
                data-testid={`inline-star-${n}`}
                className="p-0.5 transition-all hover:scale-110 active:scale-95"
                aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
              >
                <Star
                  size={32}
                  className={`transition-all duration-150 ${
                    n <= displayed
                      ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                      : "text-white/20 hover:text-white/40"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Star label */}
          <div className="text-center mb-4 h-4">
            {displayed > 0 && (
              <span className="font-mono-label text-[11px] text-amber-400 tracking-widest">
                {labels[displayed]}
              </span>
            )}
          </div>

          {/* Comment */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            data-testid="inline-rating-comment"
            rows={3}
            maxLength={500}
            placeholder="Partage ton expérience (facultatif)…"
            className="w-full bg-ink-950/80 border border-white/10 focus:border-brand/60 focus:outline-none focus:ring-1 focus:ring-brand/20 px-3 py-2 text-xs rounded-sm placeholder:text-slate-600 resize-none transition-colors mb-1"
          />
          <div className="text-right font-mono-label text-[9px] text-slate-600 mb-4">
            {comment.length}/500
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={submit}
            disabled={busy || stars < 1}
            data-testid="inline-submit-rating"
            className="w-full inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all py-2.5 font-bold text-xs rounded-sm purple-glow active:scale-[0.98]"
          >
            {busy ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Envoi…
              </>
            ) : (
              <>
                <Send size={13} />
                Envoyer mon avis
              </>
            )}
          </button>

          {stars === 0 && (
            <p className="text-center font-mono-label text-[10px] text-slate-600 mt-2">
              Clique sur une étoile pour noter
            </p>
          )}
        </div>

        {/* Bottom accent */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
      </div>
    </div>
  );
};

export default InlineRatingBlock;
