import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
  getDocs,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import {
  CREATOR_UID,
  CREATOR_DONATION_LINKS,
  commissionRate,
  commissionLabel,
} from "../constants";
import {
  Send,
  CheckCircle2,
  ShieldAlert,
  ArrowLeft,
  Lock,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

/**
 * ChatPage — refonte visuelle.
 * - Même DA : fond `ink-950`, accent `brand`, coins discrets (`rounded-sm`),
 *   bordures `white/10`, sobre & pro.
 * - Aucune modification de la logique métier ni des appels Firestore.
 * - Améliorations : hiérarchie typographique, bulles plus lisibles,
 *   en-tête plus aéré, séparateurs subtils par date, états clairs,
 *   barre d'envoi raffinée, micro-interactions.
 */
const ChatPage = () => {
  const { conversationId } = useParams();
  const { user, isCreator } = useAuth();
  const [conv, setConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [participants, setParticipants] = useState({});
  const [order, setOrder] = useState(null);
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const unsubConv = onSnapshot(doc(db, "conversations", conversationId), (s) => {
      if (s.exists()) setConv({ id: s.id, ...s.data() });
    });
    const q = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsubMsg = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => {
      unsubConv();
      unsubMsg();
    };
  }, [conversationId]);

  useEffect(() => {
    if (!conv) return;
    (async () => {
      const map = {};
      for (const uid of conv.participants || []) {
        const s = await getDoc(doc(db, "users", uid));
        if (s.exists()) map[uid] = s.data();
      }
      setParticipants(map);

      const oq = query(
        collection(db, "orders"),
        where("conversationId", "==", conversationId)
      );
      const os = await getDocs(oq);
      if (!os.empty) setOrder({ id: os.docs[0].id, ...os.docs[0].data() });
    })();
  }, [conv, conversationId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const allowed = conv && (conv.participants?.includes(user.uid) || isCreator);
  const isClient = conv?.clientUid === user?.uid;
  const isBooster = conv?.boosterUid === user?.uid;
  const readOnly = isCreator && !isClient && !isBooster;

  // Regroupement par date pour les séparateurs
  const grouped = useMemo(() => {
    const groups = [];
    let currentKey = null;
    for (const m of messages) {
      const d = m.createdAt?.toDate?.() || null;
      const key = d
        ? d.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })
        : "—";
      if (key !== currentKey) {
        groups.push({ type: "date", key, label: key });
        currentKey = key;
      }
      groups.push({ type: "msg", data: m });
    }
    return groups;
  }, [messages]);

  if (conv && !allowed)
    return (
      <div className="min-h-screen bg-ink-950 text-white/90 flex items-center justify-center p-6">
        <div
          data-testid="chat-forbidden"
          className="max-w-md w-full border border-white/10 bg-white/[0.02] rounded-sm p-8 text-center"
        >
          <div className="mx-auto mb-4 h-12 w-12 rounded-sm border border-white/10 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-white/70" />
          </div>
          <h2 className="text-base font-medium tracking-tight">Accès refusé</h2>
          <p className="mt-2 text-sm text-white/60">
            Vous n'avez pas accès à cette conversation.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 mt-6 text-sm text-brand hover:underline underline-offset-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );

  const send = async (e) => {
    e?.preventDefault?.();
    if (!text.trim() || sending) return;
    const value = text.trim();
    setText("");
    setSending(true);
    try {
      await addDoc(collection(db, "conversations", conversationId, "messages"), {
        senderUid: user.uid,
        senderName: participants[user.uid]?.displayName || user.email,
        text: value,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "conversations", conversationId), {
        lastMessage: value.slice(0, 80),
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
      await updateDoc(doc(db, "orders", order.id), {
        status: "completed",
        completedAt: serverTimestamp(),
      });

      if (order.type === "boosting") {
        if (order.offerType === "free") {
          const bSnap = await getDoc(doc(db, "users", order.boosterUid));
          const bData = bSnap.data() || {};
          const links = bData.donationLinks || [];
          const linksTxt = links.length
            ? links.map((l) => `${l.label || "Lien"} : ${l.url}`).join("
")
            : "Aucun lien de donation renseigné.";
          await addDoc(
            collection(db, "conversations", conversationId, "messages"),
            {
              senderUid: "system",
              system: true,
              text: `Boost terminé !
Si tu veux soutenir ton boosteur, voici ses liens de donation :
${linksTxt}`,
              createdAt: serverTimestamp(),
            }
          );
        } else {
          const price = Number(order.price) || 0;
          const rate = commissionRate(price);
          const com = (price * rate).toFixed(2);
          const linksTxt = CREATOR_DONATION_LINKS.map(
            (l) => `${l.label} : ${l.url}`
          ).join("
");
          await addDoc(
            collection(db, "conversations", conversationId, "messages"),
            {
              senderUid: "system",
              system: true,
              text: `Commande ${order.id} terminée.
Montant : ${price}€ — Commission ${commissionLabel(
                price
              )} = ${com}€
Merci de verser la commission via :
${linksTxt}`,
              createdAt: serverTimestamp(),
            }
          );
        }
      } else if (order.type === "account") {
        const price = Number(order.price) || 0;
        const rate = commissionRate(price);
        const com = (price * rate).toFixed(2);
        const linksTxt = CREATOR_DONATION_LINKS.map(
          (l) => `${l.label} : ${l.url}`
        ).join("
");
        await addDoc(
          collection(db, "conversations", conversationId, "messages"),
          {
            senderUid: "system",
            system: true,
            text: `Vente terminée.
Montant : ${price}€ — Commission ${commissionLabel(
              price
            )} = ${com}€
Merci de verser la commission via :
${linksTxt}`,
            createdAt: serverTimestamp(),
          }
        );
        if (order.accountId) {
          await updateDoc(doc(db, "accountListings", order.accountId), {
            sold: true,
          });
        }
      }

      toast.success("Marqué comme terminé !");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const title =
    (conv?.type === "account_sale" ? "Vente de compte" : "Boosting") +
    (conv?.game ? ` — ${conv.game}` : "");

  const peopleLine = Object.values(participants)
    .map((p) => p?.displayName)
    .filter(Boolean)
    .join(" ↔ ");

  const initialsFor = (uid) => {
    const name =
      participants[uid]?.displayName || participants[uid]?.email || "?";
    return name
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("");
  };

  return (
    <div className="min-h-screen bg-ink-950 text-white/90 flex flex-col">
      {/* Header */}
      <header
        data-testid="chat-header"
        className="sticky top-0 z-10 border-b border-white/10 bg-ink-950/85 backdrop-blur supports-[backdrop-filter]:bg-ink-950/70"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-4">
          <Link
            to="/dashboard"
            data-testid="back-to-dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-white/55 hover:text-white/90 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tableau de bord
          </Link>

          <div className="mt-3 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand" />
                <span className="text-[11px] uppercase tracking-[0.14em] text-white/45">
                  {conv?.type === "account_sale" ? "Vente de compte" : "Boosting"}
                </span>
              </div>
              <h1
                data-testid="chat-title"
                className="mt-1 text-lg sm:text-xl font-medium tracking-tight truncate"
              >
                {conv?.game || "Conversation"}
              </h1>
              {peopleLine && (
                <p className="mt-0.5 text-xs text-white/50 truncate">
                  {peopleLine}
                </p>
              )}
            </div>

            <div className="shrink-0 flex items-center gap-2">
              {readOnly && (
                <span
                  data-testid="readonly-badge"
                  className="inline-flex items-center gap-1.5 border border-white/10 text-white/60 px-2.5 py-1 text-[11px] rounded-sm"
                >
                  <Eye className="h-3 w-3" />
                  Lecture
                </span>
              )}
              {order && order.status !== "completed" && isBooster && (
                <button
                  type="button"
                  onClick={markCompleted}
                  data-testid="mark-completed-btn"
                  className="inline-flex items-center gap-1.5 bg-brand text-ink-950 hover:bg-brand/90 active:bg-brand/80 transition-colors px-3 py-1.5 text-xs font-medium rounded-sm"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Marquer terminé
                </button>
              )}
              {order?.status === "completed" && (
                <span
                  data-testid="completed-badge"
                  className="inline-flex items-center gap-1.5 border border-emerald-400/30 bg-emerald-400/10 text-emerald-300 px-2.5 py-1 text-[11px] uppercase tracking-wider rounded-sm"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Terminé
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main
        data-testid="chat-messages"
        className="flex-1 overflow-y-auto"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-1.5">
          {grouped.length === 0 && (
            <div className="py-16 text-center text-sm text-white/40">
              Aucun message pour l'instant. Lance la conversation ci-dessous.
            </div>
          )}

          {grouped.map((item, i) => {
            if (item.type === "date") {
              return (
                <div
                  key={`d-${i}-${item.key}`}
                  className="flex items-center gap-3 py-4"
                >
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                    {item.label}
                  </span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>
              );
            }

            const m = item.data;

            if (m.system) {
              return (
                <div
                  key={m.id}
                  data-testid="system-message"
                  className="mx-auto my-3 max-w-xl border border-white/10 bg-white/[0.03] text-white/75 text-[13px] leading-relaxed px-4 py-3 rounded-sm whitespace-pre-line"
                >
                  <div className="flex items-center gap-1.5 mb-1.5 text-[10px] uppercase tracking-wider text-white/45">
                    <Lock className="h-3 w-3" />
                    Message système
                  </div>
                  {m.text}
                </div>
              );
            }

            const mine = m.senderUid === user.uid;
            const time =
              m.createdAt?.toDate?.().toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              }) || "";

            return (
              <div
                key={m.id}
                data-testid={mine ? "msg-mine" : "msg-other"}
                className={`flex items-end gap-2 ${
                  mine ? "justify-end" : "justify-start"
                }`}
              >
                {!mine && (
                  <div className="h-7 w-7 shrink-0 rounded-sm border border-white/10 bg-white/[0.04] text-[10px] flex items-center justify-center text-white/60">
                    {initialsFor(m.senderUid) || "?"}
                  </div>
                )}

                <div
                  className={`group max-w-[78%] sm:max-w-[70%] px-3.5 py-2 rounded-sm text-sm leading-relaxed whitespace-pre-line transition-colors ${
                    mine
                      ? "bg-brand text-ink-950"
                      : "bg-white/[0.04] border border-white/10 text-white/90"
                  }`}
                >
                  {!mine && (
                    <div className="text-[10px] font-medium uppercase tracking-wider text-white/50 mb-1">
                      {m.senderName || "User"}
                    </div>
                  )}
                  <div>{m.text}</div>
                  {time && (
                    <div
                      className={`mt-1 text-[10px] tabular-nums ${
                        mine ? "text-ink-950/60" : "text-white/40"
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

      {/* Composer */}
      <footer className="sticky bottom-0 border-t border-white/10 bg-ink-950/85 backdrop-blur supports-[backdrop-filter]:bg-ink-950/70">
        <form
          onSubmit={send}
          data-testid="chat-form"
          className="mx-auto max-w-3xl px-4 sm:px-6 py-3.5"
        >
          <div
            className={`flex items-center gap-2 border rounded-sm px-2 transition-colors ${
              readOnly
                ? "border-white/5 bg-white/[0.02]"
                : "border-white/10 bg-ink-950 focus-within:border-brand"
            }`}
          >
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              data-testid="chat-input"
              placeholder={
                readOnly ? "Mode lecture (créateur)" : "Écris ton message…"
              }
              disabled={readOnly}
              className="flex-1 bg-transparent focus:outline-none px-2 py-2.5 text-sm placeholder:text-white/35 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={readOnly || !text.trim() || sending}
              data-testid="chat-send-btn"
              aria-label="Envoyer"
              className="inline-flex items-center gap-1.5 bg-brand text-ink-950 hover:bg-brand/90 active:bg-brand/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-3 py-2 text-xs font-medium rounded-sm"
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Envoyer</span>
            </button>
          </div>
          <p className="mt-2 text-[10px] text-white/35 px-1">
            Entrée pour envoyer · Les messages sont conservés dans la conversation.
          </p>
        </form>
      </footer>
    </div>
  );
};

export default ChatPage;
