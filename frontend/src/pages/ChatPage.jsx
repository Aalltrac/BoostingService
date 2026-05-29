import { useEffect, useMemo, useRef, useState } from \"react\";
import { useParams, Link } from \"react-router-dom\";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from \"firebase/firestore\";
import { db } from \"../firebase\";
import { useAuth } from \"../AuthContext\";
import {
  CREATOR_DONATION_LINKS,
  commissionRate,
  commissionLabel,
} from \"../constants\";
import {
  Send,
  CheckCircle2,
  ShieldAlert,
  ArrowLeft,
  Lock,
  Eye,
  ImagePlus,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
} from \"lucide-react\";
import { toast } from \"sonner\";
import { fileToCompressedBase64 } from \"../components/ImageUpload\";
import RatingModal from \"../components/RatingModal\";
import BoostStatusPanel from \"../components/BoostStatusPanel\";

const MAX_IMAGES_PER_MESSAGE = 10;
const MAX_FILE_MB = 10;

const ChatPage = () => {
  const { conversationId } = useParams();
  const { user, isCreator } = useAuth();
  const [conv, setConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState(\"\");
  const [participants, setParticipants] = useState({});
  const [order, setOrder] = useState(null);
  const [sending, setSending] = useState(false);
  const [pendingImages, setPendingImages] = useState([]); // base64[] staged
  const [uploading, setUploading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [lightbox, setLightbox] = useState({ images: [], idx: 0 });
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const unsubConv = onSnapshot(doc(db, \"conversations\", conversationId), (s) => {
      if (s.exists()) setConv({ id: s.id, ...s.data() });
    });
    const q = query(
      collection(db, \"conversations\", conversationId, \"messages\"),
      orderBy(\"createdAt\", \"asc\")
    );
    const unsubMsg = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => {
      unsubConv();
      unsubMsg();
    };
  }, [conversationId]);

  // Load participant profiles
  useEffect(() => {
    if (!conv) return;
    (async () => {
      const map = {};
      for (const uid of conv.participants || []) {
        const s = await getDoc(doc(db, \"users\", uid));
        if (s.exists()) map[uid] = s.data();
      }
      setParticipants(map);
    })();
  }, [conv]);

  /**
   * Resolve the order id WITHOUT a collection query.
   * Firestore security rules are not filters: a query that only filters on
   * `conversationId` is rejected because the rules depend on clientUid/boosterUid.
   * We therefore read the order by its id directly (allowed by the rules).
   * The id is stored on the conversation (when available) or on the first
   * system message created with the order — both are backward compatible.
   */
  const orderId = useMemo(() => {
    if (conv?.orderId) return conv.orderId;
    const m = messages.find((x) => x.orderId);
    return m?.orderId || null;
  }, [conv?.orderId, messages]);

  // Subscribe to the order document directly (rule-compliant single-doc read)
  useEffect(() => {
    if (!orderId) return;
    const unsub = onSnapshot(doc(db, \"orders\", orderId), (s) => {
      if (s.exists()) setOrder({ id: s.id, ...s.data() });
    });
    return () => unsub();
  }, [orderId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: \"smooth\" });
  }, [messages]);

  const allowed = conv && (conv.participants?.includes(user.uid) || isCreator);
  const isClient = conv?.clientUid === user?.uid;
  const isBooster = conv?.boosterUid === user?.uid;
  const readOnly = isCreator && !isClient && !isBooster;

  useEffect(() => {
    if (!order) return;
    if (order.status === \"completed\" && isClient && !order.rating) {
      setShowRatingModal(true);
    }
  }, [order?.status, order?.rating, isClient]); // eslint-disable-line

  const grouped = useMemo(() => {
    const groups = [];
    let currentKey = null;
    for (const m of messages) {
      const d = m.createdAt?.toDate?.() || null;
      const key = d
        ? d.toLocaleDateString(\"fr-FR\", {
            weekday: \"long\",
            day: \"numeric\",
            month: \"long\",
          })
        : \"—\";
      if (key !== currentKey) {
        groups.push({ type: \"date\", key, label: key });
        currentKey = key;
      }
      groups.push({ type: \"msg\", data: m });
    }
    return groups;
  }, [messages]);

  if (conv && !allowed)
    return (
      <div className=\"min-h-screen bg-ink-950 text-white/90 flex items-center justify-center p-6\">
        <div
          data-testid=\"chat-forbidden\"
          className=\"max-w-md w-full border border-white/10 bg-white/[0.02] rounded-sm p-8 text-center\"
        >
          <div className=\"mx-auto mb-4 h-12 w-12 rounded-sm border border-white/10 flex items-center justify-center\">
            <ShieldAlert className=\"h-6 w-6 text-white/70\" />
          </div>
          <h2 className=\"text-base font-medium tracking-tight\">Accès refusé</h2>
          <p className=\"mt-2 text-sm text-white/60\">
            Vous n'avez pas accès à cette conversation.
          </p>
          <Link
            to=\"/dashboard\"
            className=\"inline-flex items-center gap-2 mt-6 text-sm text-brand hover:underline underline-offset-4\"
          >
            <ArrowLeft className=\"h-4 w-4\" />
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );

  const handlePickImage = () => fileRef.current?.click();

  const handleFiles = async (filesList) => {
    if (!filesList || filesList.length === 0) return;
    const remaining = MAX_IMAGES_PER_MESSAGE - pendingImages.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_IMAGES_PER_MESSAGE} images par message.`);
      return;
    }
    const files = Array.from(filesList).slice(0, remaining);
    setUploading(true);
    try {
      const next = [...pendingImages];
      for (const file of files) {
        if (!file.type.startsWith(\"image/\")) {
          toast.error(\"Format invalide ignoré.\");
          continue;
        }
        if (file.size > MAX_FILE_MB * 1024 * 1024) {
          toast.error(`Image > ${MAX_FILE_MB} Mo ignorée.`);
          continue;
        }
        const b64 = await fileToCompressedBase64(file, 1200, 0.78);
        next.push(b64);
      }
      setPendingImages(next.slice(0, MAX_IMAGES_PER_MESSAGE));
    } catch (e) {
      toast.error(\"Erreur de lecture d'une image.\");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = \"\";
    }
  };

  const removePending = (i) =>
    setPendingImages((arr) => arr.filter((_, k) => k !== i));

  const send = async (e) => {
    e?.preventDefault?.();
    const value = text.trim();
    if ((!value && pendingImages.length === 0) || sending) return;
    setText(\"\");
    const imgs = pendingImages;
    setPendingImages([]);
    setSending(true);
    try {
      await addDoc(collection(db, \"conversations\", conversationId, \"messages\"), {
        senderUid: user.uid,
        senderName: participants[user.uid]?.displayName || user.email,
        text: value,
        // Backward-compat: keep first as `image`
        image: imgs[0] || null,
        images: imgs,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, \"conversations\", conversationId), {
        lastMessage: imgs.length
          ? value
            ? value.slice(0, 80)
            : `📷 ${imgs.length} image${imgs.length > 1 ? \"s\" : \"\"}`
          : value.slice(0, 80),
        updatedAt: serverTimestamp(),
      });
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const markCompleted = async () => {
    if (!order) return;
    try {
      await updateDoc(doc(db, \"orders\", order.id), {
        status: \"completed\",
        completedAt: serverTimestamp(),
      });

      if (order.type === \"boosting\") {
        if (order.offerType === \"free\") {
          const bSnap = await getDoc(doc(db, \"users\", order.boosterUid));
          const bData = bSnap.data() || {};
          const links = bData.donationLinks || [];
          const linksTxt = links.length
            ? links.map((l) => `${l.label || \"Lien\"} : ${l.url}`).join(\"\")
            : \"Aucun lien de donation renseigné.\";
          await addDoc(
            collection(db, \"conversations\", conversationId, \"messages\"),
            {
              senderUid: \"system\",
              system: true,
              text: `Boost terminé !
Si tu veux soutenir ton boosteur, voici ses liens de donation :
${linksTxt}

N'oublie pas de laisser un avis pour ton boosteur ⭐`,
              createdAt: serverTimestamp(),
            }
          );
        } else {
          const price = Number(order.price) || 0;
          const rate = commissionRate(price);
          const com = (price * rate).toFixed(2);
          const linksTxt = CREATOR_DONATION_LINKS.map(
            (l) => `${l.label} : ${l.url}`
          ).join(\"\");
          await addDoc(
            collection(db, \"conversations\", conversationId, \"messages\"),
            {
              senderUid: \"system\",
              system: true,
              text: `Commande ${order.id} terminée.
Montant : ${price}€ — Commission ${commissionLabel(price)} = ${com}€
Merci de verser la commission via :
${linksTxt}

N'oublie pas de laisser un avis pour ton boosteur ⭐`,
              createdAt: serverTimestamp(),
            }
          );
        }
      } else if (order.type === \"account\") {
        const price = Number(order.price) || 0;
        const rate = commissionRate(price);
        const com = (price * rate).toFixed(2);
        const linksTxt = CREATOR_DONATION_LINKS.map(
          (l) => `${l.label} : ${l.url}`
        ).join(\"\");
        await addDoc(
          collection(db, \"conversations\", conversationId, \"messages\"),
          {
            senderUid: \"system\",
            system: true,
            text: `Vente terminée.
Montant : ${price}€ — Commission ${commissionLabel(price)} = ${com}€
Merci de verser la commission via :
${linksTxt}

N'oublie pas de laisser un avis pour ton vendeur ⭐`,
            createdAt: serverTimestamp(),
          }
        );
        if (order.accountId) {
          await updateDoc(doc(db, \"accountListings\", order.accountId), {
            sold: true,
          });
        }
      }

      toast.success(\"Marqué comme terminé !\");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const peopleLine = Object.values(participants)
    .map((p) => p?.displayName)
    .filter(Boolean)
    .join(\" ↔ \");

  const initialsFor = (uid) => {
    const name =
      participants[uid]?.displayName || participants[uid]?.email || \"?\";
    return name
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join(\"\");
  };

  const openLightbox = (images, idx) => setLightbox({ images, idx });
  const closeLightbox = () => setLightbox({ images: [], idx: 0 });
  const lightboxPrev = (e) => {
    e?.stopPropagation?.();
    setLightbox((lb) => ({
      ...lb,
      idx: (lb.idx - 1 + lb.images.length) % lb.images.length,
    }));
  };
  const lightboxNext = (e) => {
    e?.stopPropagation?.();
    setLightbox((lb) => ({
      ...lb,
      idx: (lb.idx + 1) % lb.images.length,
    }));
  };

  return (
    <div className=\"min-h-screen bg-ink-950 text-white/90 flex flex-col\">
      <header
        data-testid=\"chat-header\"
        className=\"sticky top-0 z-10 border-b border-white/10 bg-ink-950/85 backdrop-blur supports-[backdrop-filter]:bg-ink-950/70\"
      >
        <div className=\"mx-auto max-w-3xl px-4 sm:px-6 py-4\">
          <Link
            to=\"/dashboard\"
            data-testid=\"back-to-dashboard\"
            className=\"inline-flex items-center gap-1.5 text-xs text-white/55 hover:text-white/90 transition-colors\"
          >
            <ArrowLeft className=\"h-3.5 w-3.5\" />
            Tableau de bord
          </Link>

          <div className=\"mt-3 flex items-start justify-between gap-4\">
            <div className=\"min-w-0\">
              <div className=\"flex items-center gap-2\">
                <span className=\"inline-block h-1.5 w-1.5 rounded-full bg-brand\" />
                <span className=\"text-[11px] uppercase tracking-[0.14em] text-white/45\">
                  {conv?.type === \"account_sale\" ? \"Vente de compte\" : \"Boosting\"}
                </span>
              </div>
              <h1
                data-testid=\"chat-title\"
                className=\"mt-1 text-lg sm:text-xl font-medium tracking-tight truncate\"
              >
                {conv?.game || \"Conversation\"}
              </h1>
              {peopleLine && (
                <p className=\"mt-0.5 text-xs text-white/50 truncate\">
                  {peopleLine}
                </p>
              )}
            </div>

            <div className=\"shrink-0 flex items-center gap-2\">
              {readOnly && (
                <span
                  data-testid=\"readonly-badge\"
                  className=\"inline-flex items-center gap-1.5 border border-white/10 text-white/60 px-2.5 py-1 text-[11px] rounded-sm\"
                >
                  <Eye className=\"h-3 w-3\" />
                  Lecture
                </span>
              )}
              {order && order.status !== \"completed\" && isBooster && (
                <button
                  type=\"button\"
                  onClick={markCompleted}
                  data-testid=\"mark-completed-btn\"
                  className=\"inline-flex items-center gap-1.5 bg-brand text-ink-950 hover:bg-brand/90 active:bg-brand/80 transition-colors px-3 py-1.5 text-xs font-medium rounded-sm\"
                >
                  <CheckCircle2 className=\"h-3.5 w-3.5\" />
                  Marquer terminé
                </button>
              )}
              {order?.status === \"completed\" && (
                <span
                  data-testid=\"completed-badge\"
                  className=\"inline-flex items-center gap-1.5 border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 px-2.5 py-1 text-[11px] uppercase tracking-wider rounded-sm\"
                >
                  <CheckCircle2 className=\"h-3 w-3\" />
                  Terminé
                </span>
              )}
              {order?.status === \"completed\" && isClient && !order.rating && (
                <button
                  type=\"button\"
                  onClick={() => setShowRatingModal(true)}
                  data-testid=\"open-rating-btn\"
                  className=\"inline-flex items-center gap-1.5 border border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 transition-colors px-3 py-1.5 text-xs font-medium rounded-sm\"
                >
                  <Star className=\"h-3.5 w-3.5\" />
                  Laisser un avis
                </button>
              )}
            </div>
          </div>

          {order && order.type === \"boosting\" && order.status !== \"completed\" && (
            <div className=\"mt-4\">
              <BoostStatusPanel
                order={order}
                conversationId={conversationId}
                isBooster={isBooster}
                isClient={isClient}
              />
            </div>
          )}
        </div>
      </header>

      <main data-testid=\"chat-messages\" className=\"flex-1 overflow-y-auto\">
        <div className=\"mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-1.5\">
          {grouped.length === 0 && (
            <div className=\"py-16 text-center text-sm text-white/40\">
              Aucun message pour l'instant. Lance la conversation ci-dessous.
            </div>
          )}

          {grouped.map((item, i) => {
            if (item.type === \"date\") {
              return (
                <div
                  key={`d-${i}-${item.key}`}
                  className=\"flex items-center gap-3 py-4\"
                >
                  <span className=\"h-px flex-1 bg-white/10\" />
                  <span className=\"text-[10px] uppercase tracking-[0.18em] text-white/40\">
                    {item.label}
                  </span>
                  <span className=\"h-px flex-1 bg-white/10\" />
                </div>
              );
            }

            const m = item.data;

            if (m.system) {
              return (
                <div
                  key={m.id}
                  data-testid=\"system-message\"
                  className=\"mx-auto my-3 max-w-xl border border-white/10 bg-white/[0.03] text-white/75 text-[13px] leading-relaxed px-4 py-3 rounded-sm whitespace-pre-line\"
                >
                  <div className=\"flex items-center gap-1.5 mb-1.5 text-[10px] uppercase tracking-wider text-white/45\">
                    <Lock className=\"h-3 w-3\" />
                    Message système
                  </div>
                  {m.text}
                </div>
              );
            }

            const mine = m.senderUid === user.uid;
            const time =
              m.createdAt?.toDate?.().toLocaleTimeString(\"fr-FR\", {
                hour: \"2-digit\",
                minute: \"2-digit\",
              }) || \"\";

            const msgImages =
              Array.isArray(m.images) && m.images.length > 0
                ? m.images
                : m.image
                ? [m.image]
                : [];

            return (
              <div
                key={m.id}
                data-testid={mine ? \"msg-mine\" : \"msg-other\"}
                className={`flex items-end gap-2 ${
                  mine ? \"justify-end\" : \"justify-start\"
                }`}
              >
                {!mine && (
                  <div className=\"h-7 w-7 shrink-0 rounded-sm border border-white/10 bg-white/[0.04] text-[10px] flex items-center justify-center text-white/60\">
                    {initialsFor(m.senderUid) || \"?\"}
                  </div>
                )}

                <div
                  className={`group max-w-[78%] sm:max-w-[70%] px-3.5 py-2 rounded-sm text-sm leading-relaxed whitespace-pre-line transition-colors ${
                    mine
                      ? \"bg-brand text-ink-950\"
                      : \"bg-white/[0.04] border border-white/10 text-white/90\"
                  }`}
                >
                  {!mine && (
                    <div className=\"text-[10px] font-medium uppercase tracking-wider text-white/50 mb-1\">
                      {m.senderName || \"User\"}
                    </div>
                  )}
                  {msgImages.length > 0 && (
                    <MessageImages
                      images={msgImages}
                      onOpen={(idx) => openLightbox(msgImages, idx)}
                      mine={mine}
                    />
                  )}
                  {m.text && <div>{m.text}</div>}
                  {time && (
                    <div
                      className={`mt-1 text-[10px] tabular-nums ${
                        mine ? \"text-ink-950/60\" : \"text-white/40\"
                      }`}
                    >
                      {time}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      </main>

      <footer className=\"sticky bottom-0 border-t border-white/10 bg-ink-950/85 backdrop-blur supports-[backdrop-filter]:bg-ink-950/70\">
        <form
          onSubmit={send}
          data-testid=\"chat-form\"
          className=\"mx-auto max-w-3xl px-4 sm:px-6 py-3.5\"
        >
          {pendingImages.length > 0 && (
            <div
              data-testid=\"image-previews\"
              className=\"flex flex-wrap gap-2 mb-2\"
            >
              {pendingImages.map((src, i) => (
                <div
                  key={i}
                  className=\"relative border border-white/10 rounded-sm overflow-hidden bg-white/[0.02]\"
                  data-testid={`image-preview-${i}`}
                >
                  <img
                    src={src}
                    alt={`Aperçu ${i + 1}`}
                    className=\"h-20 w-20 object-cover\"
                  />
                  <button
                    type=\"button\"
                    onClick={() => removePending(i)}
                    data-testid={`remove-pending-image-${i}`}
                    className=\"absolute top-1 right-1 bg-ink-950/90 border border-white/20 hover:border-red-500/50 p-0.5 rounded-sm\"
                    aria-label=\"Retirer\"
                  >
                    <X className=\"h-3 w-3\" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div
            className={`flex items-center gap-2 border rounded-sm px-2 transition-colors ${
              readOnly
                ? \"border-white/5 bg-white/[0.02]\"
                : \"border-white/10 bg-ink-950 focus-within:border-brand\"
            }`}
          >
            <button
              type=\"button\"
              onClick={handlePickImage}
              disabled={
                readOnly ||
                uploading ||
                pendingImages.length >= MAX_IMAGES_PER_MESSAGE
              }
              data-testid=\"chat-attach-btn\"
              aria-label=\"Joindre des images\"
              className=\"p-2 text-slate-400 hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed transition-colors\"
            >
              <ImagePlus className=\"h-4 w-4\" />
            </button>
            <input
              ref={fileRef}
              type=\"file\"
              accept=\"image/*\"
              multiple
              className=\"hidden\"
              onChange={(e) => handleFiles(e.target.files)}
              data-testid=\"chat-image-input\"
            />
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              data-testid=\"chat-input\"
              placeholder={
                uploading
                  ? \"Compression des images…\"
                  : readOnly
                  ? \"Mode lecture (créateur)\"
                  : \"Écris ton message…\"
              }
              disabled={readOnly}
              className=\"flex-1 bg-transparent focus:outline-none px-2 py-2.5 text-sm placeholder:text-white/35 disabled:cursor-not-allowed\"
            />
            <button
              type=\"submit\"
              disabled={
                readOnly || (!text.trim() && pendingImages.length === 0) || sending
              }
              data-testid=\"chat-send-btn\"
              aria-label=\"Envoyer\"
              className=\"inline-flex items-center gap-1.5 bg-brand text-ink-950 hover:bg-brand/90 active:bg-brand/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-3 py-2 text-xs font-medium rounded-sm\"
            >
              <Send className=\"h-3.5 w-3.5\" />
              <span className=\"hidden sm:inline\">Envoyer</span>
            </button>
          </div>
          <p className=\"mt-2 text-[10px] text-white/35 px-1\">
            Entrée pour envoyer · Jusqu'à {MAX_IMAGES_PER_MESSAGE} images / message
            · {MAX_FILE_MB} Mo max par image (auto-compressées).
          </p>
        </form>
      </footer>

      {lightbox.images.length > 0 && (
        <div
          data-testid=\"image-lightbox\"
          onClick={closeLightbox}
          className=\"fixed inset-0 z-50 bg-black/92 flex items-center justify-center p-4 cursor-zoom-out\"
        >
          <img
            src={lightbox.images[lightbox.idx]}
            alt=\"Pièce jointe\"
            className=\"max-h-[92vh] max-w-[92vw] object-contain\"
          />
          {lightbox.images.length > 1 && (
            <>
              <button
                type=\"button\"
                onClick={lightboxPrev}
                className=\"absolute top-1/2 left-4 -translate-y-1/2 p-2 bg-ink-950/80 border border-white/20 rounded-sm text-white\"
                aria-label=\"Précédente\"
                data-testid=\"lightbox-prev\"
              >
                <ChevronLeft className=\"h-5 w-5\" />
              </button>
              <button
                type=\"button\"
                onClick={lightboxNext}
                className=\"absolute top-1/2 right-4 -translate-y-1/2 p-2 bg-ink-950/80 border border-white/20 rounded-sm text-white\"
                aria-label=\"Suivante\"
                data-testid=\"lightbox-next\"
              >
                <ChevronRight className=\"h-5 w-5\" />
              </button>
              <div className=\"absolute bottom-4 left-1/2 -translate-x-1/2 bg-ink-950/80 border border-white/20 px-3 py-1 text-xs text-white/80 rounded-sm font-mono-label\">
                {lightbox.idx + 1} / {lightbox.images.length}
              </div>
            </>
          )}
          <button
            type=\"button\"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            className=\"absolute top-4 right-4 p-2 bg-ink-950/80 border border-white/20 rounded-sm text-white\"
            aria-label=\"Fermer\"
          >
            <X className=\"h-4 w-4\" />
          </button>
        </div>
      )}

      {showRatingModal && order && (
        <RatingModal
          order={order}
          conversationId={conversationId}
          onClose={() => setShowRatingModal(false)}
          onSubmitted={() => setShowRatingModal(false)}
        />
      )}
    </div>
  );
};

const MessageImages = ({ images, onOpen, mine }) => {
  if (images.length === 1) {
    return (
      <button
        type=\"button\"
        onClick={() => onOpen(0)}
        data-testid=\"msg-image\"
        className=\"block mb-1.5 rounded-sm overflow-hidden border border-black/10 hover:opacity-90 transition-opacity\"
      >
        <img
          src={images[0]}
          alt=\"Pièce jointe\"
          className=\"max-h-80 max-w-full object-cover\"
        />
      </button>
    );
  }
  // Grid layout for multiple images
  const cols = images.length === 2 ? \"grid-cols-2\" : \"grid-cols-3\";
  return (
    <div
      data-testid=\"msg-images-grid\"
      className={`grid ${cols} gap-1 mb-1.5 max-w-[320px]`}
    >
      {images.slice(0, 9).map((src, i) => {
        const extra = i === 8 && images.length > 9 ? images.length - 9 : 0;
        return (
          <button
            key={i}
            type=\"button\"
            onClick={() => onOpen(i)}
            data-testid={`msg-image-${i}`}
            className={`relative aspect-square rounded-sm overflow-hidden border ${
              mine ? \"border-black/10\" : \"border-white/10\"
            } hover:opacity-90 transition-opacity`}
          >
            <img
              src={src}
              alt={`Pièce jointe ${i + 1}`}
              className=\"w-full h-full object-cover\"
            />
            {extra > 0 && (
              <div className=\"absolute inset-0 bg-black/60 flex items-center justify-center text-white text-sm font-bold\">
                +{extra}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ChatPage;
