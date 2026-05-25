import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, getDoc, setDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Trash2, UserPlus, MessageSquareText, Crown } from "lucide-react";
import { CREATOR_UID } from "../constants";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [newUid, setNewUid] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const u1 = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const u2 = onSnapshot(query(collection(db, "conversations")), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
      setConversations(list);
    });
    return () => {
      u1();
      u2();
    };
  }, []);

  const boosters = users.filter((u) => u.isBooster);

  const addBooster = async () => {
    if (!newUid.trim()) return;
    setBusy(true);
    try {
      const ref = doc(db, "users", newUid.trim());
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        toast.error("Aucun utilisateur trouvé avec cet UID.");
        setBusy(false);
        return;
      }
      await updateDoc(ref, { isBooster: true, promotedAt: serverTimestamp() });
      toast.success("Boosteur ajouté !");
      setNewUid("");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const removeBooster = async (uid) => {
    if (uid === CREATOR_UID) {
      toast.error("Le créateur ne peut pas être retiré.");
      return;
    }
    try {
      await updateDoc(doc(db, "users", uid), { isBooster: false });
      toast.success("Boosteur retiré.");
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
      <div className="font-mono-label text-[11px] text-yellow-400 mb-2">— Panneau créateur</div>
      <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tighter mb-2 flex items-center gap-3">
        <Crown className="text-yellow-400" /> Admin
      </h1>
      <p className="text-slate-400 mb-10">Gestion des boosteurs et accès à toutes les conversations.</p>

      <section className="mb-12" data-testid="admin-add-booster">
        <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
          <UserPlus size={18} className="text-brand" /> Ajouter un boosteur
        </h2>
        <div className="flex gap-2 mb-6">
          <input
            value={newUid}
            onChange={(e) => setNewUid(e.target.value)}
            placeholder="UID Firebase de l'utilisateur"
            data-testid="new-booster-uid-input"
            className="flex-1 bg-ink-950 border border-white/10 focus:border-brand focus:outline-none px-3 py-3 text-sm rounded-sm"
          />
          <button
            onClick={addBooster}
            disabled={busy}
            data-testid="add-booster-btn"
            className="bg-brand hover:bg-brand-hover px-5 py-3 font-bold rounded-sm purple-glow disabled:opacity-50"
          >
            Promouvoir
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10">
          {boosters.map((b) => (
            <div key={b.id} className="bg-ink-900 p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold truncate flex items-center gap-2">
                  {b.uid === CREATOR_UID && <Crown size={12} className="text-yellow-400" />}
                  {b.displayName || b.email}
                </div>
                <div className="text-[10px] text-slate-500 truncate font-mono-label">{b.uid}</div>
              </div>
              {b.uid !== CREATOR_UID && (
                <button
                  onClick={() => removeBooster(b.uid)}
                  data-testid={`remove-booster-${b.uid}`}
                  className="border border-red-500/30 hover:bg-red-500/10 text-red-400 p-2 rounded-sm"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section data-testid="admin-conversations">
        <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
          <MessageSquareText size={18} className="text-brand" /> Toutes les conversations
        </h2>
        <div className="grid gap-px bg-white/10 border border-white/10">
          {conversations.map((c) => (
            <Link
              key={c.id}
              to={`/chat/${c.id}`}
              data-testid={`admin-conv-${c.id}`}
              className="bg-ink-900 hover:bg-ink-800 transition-colors p-4"
            >
              <div className="font-mono-label text-[10px] text-brand">
                {c.type || "conv"} · {c.game || "—"}
              </div>
              <div className="font-semibold mt-1 truncate">{c.lastMessage}</div>
              <div className="text-[10px] text-slate-500 mt-1 font-mono-label">
                {(c.participants || []).join(" · ")}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminPage;
