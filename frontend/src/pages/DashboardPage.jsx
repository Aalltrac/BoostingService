import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { MessageSquare, ShoppingBag, Sparkles, ExternalLink } from "lucide-react";

const DashboardPage = () => {
  const { user, profile, isBooster, isCreator } = useAuth();
  const [orders, setOrders] = useState([]);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!user) return;
    // Orders where I'm client or booster
    const q1 = query(collection(db, "orders"), where("clientUid", "==", user.uid));
    const q2 = query(collection(db, "orders"), where("boosterUid", "==", user.uid));
    const all = new Map();
    const merge = (snap) => {
      snap.docs.forEach((d) => all.set(d.id, { id: d.id, ...d.data() }));
      setOrders(Array.from(all.values()).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    };
    const u1 = onSnapshot(q1, merge);
    const u2 = onSnapshot(q2, merge);

    const cq = query(collection(db, "conversations"), where("participants", "array-contains", user.uid));
    const u3 = onSnapshot(cq, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
      setConversations(list);
    });

    return () => {
      u1();
      u2();
      u3();
    };
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
      <div className="font-mono-label text-[11px] text-brand mb-2">— Tableau de bord</div>
      <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tighter mb-2">
        Salut, <span className="text-brand">{profile?.displayName || user?.email}</span>
      </h1>
      <p className="text-slate-400 mb-10">
        Statut :{" "}
        <span className="text-white">
          {isCreator ? "Créateur (admin)" : isBooster ? "Boosteur" : "Client"}
        </span>
      </p>

      {/* CONVERSATIONS */}
      <section className="mb-12" data-testid="dashboard-conversations">
        <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
          <MessageSquare size={18} className="text-brand" /> Mes conversations
        </h2>
        {conversations.length === 0 ? (
          <div className="border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">
            Aucune conversation pour le moment.
          </div>
        ) : (
          <div className="grid gap-px bg-white/10 border border-white/10">
            {conversations.map((c) => (
              <Link
                key={c.id}
                to={`/chat/${c.id}`}
                data-testid={`conv-${c.id}`}
                className="bg-ink-900 hover:bg-ink-800 transition-colors p-5 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="font-mono-label text-[10px] text-brand mb-1">
                    {c.type === "account_sale" ? "VENTE COMPTE" : "BOOSTING"} · {c.game}
                  </div>
                  <div className="font-semibold truncate">{c.lastMessage || "(aucun message)"}</div>
                </div>
                <ExternalLink size={14} className="text-slate-500" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ORDERS */}
      <section data-testid="dashboard-orders">
        <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
          <ShoppingBag size={18} className="text-brand" /> Mes commandes
        </h2>
        {orders.length === 0 ? (
          <div className="border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">
            Aucune commande encore.
          </div>
        ) : (
          <div className="grid gap-px bg-white/10 border border-white/10">
            {orders.map((o) => (
              <div key={o.id} className="bg-ink-900 p-5 grid sm:grid-cols-5 gap-4 items-center">
                <div className="sm:col-span-2">
                  <div className="font-mono-label text-[10px] text-brand">
                    {o.type === "account" ? "VENTE COMPTE" : "BOOSTING"} · {o.game}
                  </div>
                  <div className="font-semibold mt-1">
                    {o.type === "account" ? o.accountTitle : `${o.rankFrom} → ${o.rankTo}${o.mode ? ` · ${o.mode}` : ""}`}
                  </div>
                </div>
                <div className="text-sm">
                  <div className="text-slate-500 text-[10px] font-mono-label">CLIENT</div>
                  <div>{o.clientName}</div>
                </div>
                <div className="text-sm">
                  <div className="text-slate-500 text-[10px] font-mono-label">BOOSTEUR</div>
                  <div>{o.boosterName}</div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-display font-black text-lg text-brand">
                      {Number(o.price) > 0 ? `${o.price}€` : "Gratuit"}
                    </div>
                    <div className={`font-mono-label text-[10px] ${o.status === "completed" ? "text-green-400" : "text-yellow-400"}`}>
                      {o.status?.toUpperCase()}
                    </div>
                  </div>
                  {o.conversationId && (
                    <Link
                      to={`/chat/${o.conversationId}`}
                      className="bg-brand/10 border border-brand/30 hover:bg-brand/20 px-3 py-2 text-xs font-bold rounded-sm"
                      data-testid={`open-chat-${o.id}`}
                    >
                      Ouvrir
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {isBooster && (
        <div className="mt-10 border border-brand/30 bg-brand/5 p-6 rounded-sm flex items-center justify-between flex-wrap gap-4">
          <div>
            <Sparkles size={18} className="text-brand mb-2" />
            <h3 className="font-display font-bold">Tu es boosteur</h3>
            <p className="text-slate-400 text-sm">Crée ou modifie ton offre dans ton jeu de prédilection.</p>
          </div>
          <Link
            to="/booster/create"
            data-testid="dashboard-create-offer"
            className="bg-brand hover:bg-brand-hover px-5 py-3 font-bold rounded-sm purple-glow"
          >
            Gérer mes offres
          </Link>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
