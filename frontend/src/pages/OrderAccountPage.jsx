import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, addDoc, collection, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { toast } from "sonner";
import { ShieldCheck, Zap, Lock, MessageSquare, ChevronRight } from "lucide-react";

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

  if (!listing) {
    return (
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-3 w-24 bg-white/5 rounded-sm" />
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-3 aspect-video bg-white/5 rounded-sm" />
            <div className="md:col-span-2 space-y-4">
              <div className="h-3 w-20 bg-white/5 rounded-sm" />
              <div className="h-8 w-3/4 bg-white/5 rounded-sm" />
              <div className="h-3 w-1/2 bg-white/5 rounded-sm" />
              <div className="h-24 w-full bg-white/5 rounded-sm" />
              <div className="h-12 w-full bg-white/5 rounded-sm" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user?.uid === listing.uid;
  const sellerName = seller?.displayName || "Vendeur";
  const sellerInitial = sellerName.charAt(0).toUpperCase();

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav
        className="font-mono-label text-[11px] text-slate-400 flex items-center gap-2 mb-8"
        data-testid="account-breadcrumb"
      >
        <Link
          to={`/games/${listing.game}`}
          className="hover:text-white transition-colors"
          data-testid="account-back"
        >
          ← {listing.game}
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-slate-500 truncate max-w-[200px]">{listing.title}</span>
      </nav>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Image */}
        <div className="md:col-span-3">
          <div className="relative aspect-video bg-ink-700 overflow-hidden rounded-sm border border-white/10">
            {listing.image ? (
              <img
                src={listing.image}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-mono-label text-[11px] text-slate-600">— Aucune image</span>
              </div>
            )}
            <div className="absolute top-3 left-3 bg-ink-900/90 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-sm">
              <span className="font-mono-label text-[10px] text-brand">— Vente de compte</span>
            </div>
          </div>

          {/* Description bloc */}
          <div className="mt-6 border border-white/10 bg-ink-900 p-6 rounded-sm">
            <div className="font-mono-label text-[10px] text-slate-500 mb-3">— Description</div>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>
        </div>

        {/* Sidebar achat */}
        <aside className="md:col-span-2">
          <div className="md:sticky md:top-6 border border-white/10 bg-ink-900 p-6 lg:p-7 rounded-sm">
            <div className="font-mono-label text-[10px] text-slate-500 mb-3">— Annonce</div>
            <h1 className="font-display font-black text-2xl lg:text-3xl tracking-tighter leading-[1.05] mb-4">
              {listing.title}
            </h1>

            {/* Vendeur */}
            <div className="flex items-center gap-3 pb-5 mb-5 border-b border-white/10">
              <div className="w-9 h-9 rounded-sm bg-brand/15 border border-brand/30 flex items-center justify-center">
                <span className="font-display font-black text-sm text-brand">{sellerInitial}</span>
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-slate-500 font-mono-label">— Vendeur</div>
                <div className="text-sm text-slate-200 truncate">{sellerName}</div>
              </div>
            </div>

            {/* Prix */}
            <div className="mb-5">
              <div className="font-mono-label text-[10px] text-slate-500 mb-1">— Prix total</div>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-black text-4xl lg:text-5xl text-brand tracking-tighter">
                  {listing.price}€
                </span>
                <span className="text-[11px] text-slate-500">TTC</span>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={buy}
              disabled={busy || isOwner}
              data-testid="buy-account-btn"
              className="group w-full bg-brand hover:bg-brand-hover py-3.5 font-bold text-sm rounded-sm purple-glow disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isOwner ? (
                "C'est votre annonce"
              ) : busy ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Création…
                </span>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  Contacter le vendeur
                </>
              )}
            </button>

            {/* Réassurance */}
            <ul className="mt-6 space-y-3" data-testid="trust-list">
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-slate-200 font-medium">Mise en relation sécurisée</div>
                  <div className="text-[11px] text-slate-500">Discussion privée avec le vendeur</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-slate-200 font-medium">Réponse rapide</div>
                  <div className="text-[11px] text-slate-500">Le vendeur est notifié immédiatement</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Lock className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-slate-200 font-medium">Aucun paiement engagé</div>
                  <div className="text-[11px] text-slate-500">Vous discutez avant de finaliser</div>
                </div>
              </li>
            </ul>

            <p className="text-[11px] text-slate-500 mt-6 leading-relaxed pt-5 border-t border-white/10">
              Boosting Service met en relation l'acheteur et le vendeur. Chaque vendeur est
              indépendant —{" "}
              <Link to="/cgu" className="text-slate-400 hover:text-white underline underline-offset-2">
                voir CGU
              </Link>
              .
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default OrderAccountPage;
