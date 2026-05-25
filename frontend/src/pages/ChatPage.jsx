import { useEffect, useRef, useState } from "react";
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
import { CREATOR_UID, CREATOR_DONATION_LINKS, commissionRate, commissionLabel } from "../constants";
import { Send, CheckCircle2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

const ChatPage = () => {
  const { conversationId } = useParams();
  const { user, isCreator } = useAuth();
  const [conv, setConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [participants, setParticipants] = useState({});
  const [order, setOrder] = useState(null);
  const endRef = useRef(null);

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

      // Load order linked to this conversation
      const oq = query(collection(db, "orders"), where("conversationId", "==", conversationId));
      const os = await getDocs(oq);
      if (!os.empty) setOrder({ id: os.docs[0].id, ...os.docs[0].data() });
    })();
  }, [conv, conversationId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Permissions
  const allowed = conv && (conv.participants?.includes(user.uid) || isCreator);
  const isClient = conv?.clientUid === user?.uid;
  const isBooster = conv?.boosterUid === user?.uid;

  if (conv && !allowed)
    return (
      <div className="p-10 text-center">
        <ShieldAlert className="mx-auto mb-3 text-red-400" />
        <p className="text-slate-400">Vous n'avez pas accès à cette conversation.</p>
      </div>
    );

  const send = async (e) => {
    e?.preventDefault?.();
    if (!text.trim()) return;
    const value = text.trim();
    setText("");
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
          // Send booster donation links to client
          const bSnap = await getDoc(doc(db, "users", order.boosterUid));
          const bData = bSnap.data() || {};
          const links = bData.donationLinks || [];
          const linksTxt = links.length
            ? links.map((l) => `${l.label || "Lien"} : ${l.url}`).join("
")
            : "Aucun lien de donation renseigné.";
          await addDoc(collection(db, "conversations", conversationId, "messages"), {
            senderUid: "system",
            system: true,
            text: `Boost terminé !
Si tu veux soutenir ton boosteur, voici ses liens de donation :
${linksTxt}`,
            createdAt: serverTimestamp(),
          });
        } else {
          // Paid: send commission message to booster
          const price = Number(order.price) || 0;
          const rate = commissionRate(price);
          const com = (price * rate).toFixed(2);
          const linksTxt = CREATOR_DONATION_LINKS.map((l) => `${l.label} : ${l.url}`).join("
");
          await addDoc(collection(db, "conversations", conversationId, "messages"), {
            senderUid: "system",
            system: true,
            text: `Commande ${order.id} terminée.
Montant : ${price}€ — Commission ${commissionLabel(price)} = ${com}€
Merci de verser la commission via :
${linksTxt}`,
            createdAt: serverTimestamp(),
          });
        }
      } else if (order.type === "account") {
        const price = Number(order.price) || 0;
        const rate = commissionRate(price);
        const com = (price * rate).toFixed(2);
        const linksTxt = CREATOR_DONATION_LINKS.map((l) => `${l.label} : ${l.url}`).join("
");
        await addDoc(collection(db, "conversations", conversationId, "messages"), {
          senderUid: "system",
          system: true,
          text: `Vente terminée.
Montant : ${price}€ — Commission ${commissionLabel(price)} = ${com}€
Merci de verser la commission via :
${linksTxt}`,
          createdAt: serverTimestamp(),
        });
        // Mark listing sold
        if (order.accountId) {
          await updateDoc(doc(db, "accountListings", order.accountId), { sold: true });
        }
      }

      toast.success("Marqué comme terminé !");
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
      <Link to="/dashboard" className="font-mono-label text-[11px] text-slate-400 hover:text-white" data-testid="chat-back">
        ← Tableau de bord
      </Link>

      <div className="mt-4 border border-white/10 bg-ink-900 flex flex-col h-[78vh] rounded-sm">
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="font-mono-label text-[10px] text-brand">— {conv?.type === "account_sale" ? "Vente de compte" : "Boosting"} {conv?.game}</div>
            <div className="font-display font-bold text-base truncate">
              {Object.values(participants)
                .map((p) => p?.displayName)
                .filter(Boolean)
                .join(" ↔ ")}
            </div>
          </div>
          {order && order.status !== "completed" && isBooster && (
            <button
              onClick={markCompleted}
              data-testid="mark-completed-btn"
              className="bg-green-500/20 border border-green-500/40 hover:bg-green-500/30 text-green-300 px-3 py-2 text-xs font-bold rounded-sm inline-flex items-center gap-2"
            >
              <CheckCircle2 size={14} /> Marquer terminé
            </button>
          )}
          {order?.status === "completed" && (
            <span className="font-mono-label text-[10px] text-green-400 border border-green-500/40 bg-green-500/10 px-3 py-2 rounded-sm">
              TERMINÉ
            </span>
          )}
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3" data-testid="messages-list">
          {messages.map((m) => {
            if (m.system) {
              return (
                <div key={m.id} className="mx-auto max-w-md text-center">
                  <div className="inline-block bg-brand/10 border border-brand/30 px-4 py-3 rounded-sm text-xs text-slate-200 whitespace-pre-wrap text-left">
                    {m.text}
                  </div>
                </div>
              );
            }
            const mine = m.senderUid === user.uid;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-sm text-sm whitespace-pre-wrap ${
                    mine ? "bg-brand text-white" : "bg-ink-700 text-slate-100 border border-white/10"
                  }`}
                >
                  {!mine && <div className="text-[10px] opacity-60 mb-1 font-mono-label">{m.senderName || "User"}</div>}
                  {m.text}
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {/* INPUT */}
        <form onSubmit={send} className="border-t border-white/10 p-3 flex gap-2" data-testid="chat-input-form">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            data-testid="chat-input"
            placeholder={isCreator && !isClient && !isBooster ? "Mode lecture (créateur)" : "Écris ton message…"}
            disabled={isCreator && !isClient && !isBooster}
            className="flex-1 bg-ink-950 border border-white/10 focus:border-brand focus:outline-none px-3 py-2.5 text-sm rounded-sm"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            data-testid="chat-send-btn"
            className="bg-brand hover:bg-brand-hover px-4 py-2.5 rounded-sm disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
