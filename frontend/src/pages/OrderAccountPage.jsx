import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, addDoc, collection, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { toast } from "sonner";

const OrderAccountPage = () => {
  const { listingId } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await getDoc(doc(db, "accountListings", listingId));
      if (s.exists()) {
        const data = { id: s.id, ...s.data() };
        setListing(data);
        const u = await getDoc(doc(db, "users", data.uid));
        if (u.exists()) setSeller(u.data());
      }
    })();
  }, [listingId]);

  const buy = async () => {
    setBusy(true);
    try {
      const convRef = await addDoc(collection(db, "conversations"), {
        participants: [user.uid, listing.uid],
        clientUid: user.uid,
        boosterUid: listing.uid,
        game: listing.game,
        type: "account_sale",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: "Demande d'achat compte",
      });
      const orderRef = await addDoc(collection(db, "orders"), {
        clientUid: user.uid,
        clientName: profile?.displayName || user.email,
        boosterUid: listing.uid,
        boosterName: seller?.displayName || "Vendeur",
        game: listing.game,
        type: "account",
        accountId: listing.id,
        accountTitle: listing.title,
        price: Number(listing.price) || 0,
        status: "pending",
        conversationId: convRef.id,
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, "conversations", convRef.id, "messages"), {
        senderUid: "system",
        text: `Demande d'achat du compte « ${listing.title} »
Prix : ${listing.price}€
Le client souhaite finaliser l'achat. Échange en direct ci-dessous.`,
        system: true,
        createdAt: serverTimestamp(),
        orderId: orderRef.id,
      });
      toast.success("Discussion créée avec le vendeur !");
      navigate(`/chat/${convRef.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!listing) return <div className="p-10 text-center text-slate-400">Chargement…</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-10">
      <Link to={`/games/${listing.game}`} className="font-mono-label text-[11px] text-slate-400 hover:text-white" data-testid="account-back">
        ← Retour
      </Link>
      <div className="grid md:grid-cols-2 gap-8 mt-6 border border-white/10 bg-ink-900 p-6 lg:p-8">
        <div className="aspect-video bg-ink-700 overflow-hidden rounded-sm">
          {listing.image ? (
            <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" />
          )}
        </div>
        <div>
          <div className="font-mono-label text-[10px] text-brand mb-2">— Vente de compte</div>
          <h1 className="font-display font-black text-3xl tracking-tighter mb-2">{listing.title}</h1>
          <div className="text-xs text-slate-500 mb-4">par {seller?.displayName || "Vendeur"}</div>
          <p className="text-slate-300 text-sm leading-relaxed mb-6 whitespace-pre-wrap">{listing.description}</p>
          <div className="font-display font-black text-4xl text-brand mb-6">{listing.price}€</div>
          <button
            onClick={buy}
            disabled={busy || user?.uid === listing.uid}
            data-testid="buy-account-btn"
            className="w-full bg-brand hover:bg-brand-hover py-3 font-bold rounded-sm purple-glow disabled:opacity-40"
          >
            {user?.uid === listing.uid ? "C'est votre annonce" : busy ? "..." : "Contacter le vendeur"}
          </button>
          <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
            Boosting Service met en relation l'acheteur et le vendeur. Chaque vendeur est indépendant — voir CGU.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderAccountPage;
