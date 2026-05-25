import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { GAMES, CREATOR_UID } from "../constants";
import { Sparkles, Tag, Crown } from "lucide-react";

const GamePage = () => {
  const { gameId } = useParams();
  const game = GAMES[gameId];
  const [offers, setOffers] = useState([]);
  const [listings, setListings] = useState([]);
  const [creatorUser, setCreatorUser] = useState(null);
  const [creatorOffer, setCreatorOffer] = useState(null);

  useEffect(() => {
    if (!game) return;
    const offersQ = query(collection(db, "boosterOffers"), where("game", "==", gameId));
    const u1 = onSnapshot(offersQ, (snap) => {
      setOffers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const listingsQ = query(collection(db, "accountListings"), where("game", "==", gameId));
    const u2 = onSnapshot(listingsQ, (snap) => {
      setListings(snap.docs.filter((d) => !d.data().sold).map((d) => ({ id: d.id, ...d.data() })));
    });

    // Load creator info for default offer
    getDoc(doc(db, "users", CREATOR_UID)).then((s) => {
      if (s.exists()) setCreatorUser(s.data());
    });
    return () => {
      u1();
      u2();
    };
  }, [gameId, game]);

  useEffect(() => {
    const found = offers.find((o) => o.uid === CREATOR_UID);
    setCreatorOffer(found || null);
  }, [offers]);

  if (!game) return <Navigate to="/games" replace />;

  // Boosting offers list: always include creator as default first if no offer of theirs exists
  const otherOffers = offers.filter((o) => o.uid !== CREATOR_UID);
  const listOffers = [];
  // Always show creator entry (with their offer if exists, else placeholder)
  listOffers.push({
    id: creatorOffer?.id || "default-creator",
    uid: CREATOR_UID,
    title: creatorOffer?.title || "Boosting officiel",
    description: creatorOffer?.description || "Offre par défaut — boosteur officiel de Boosting Service.",
    image: creatorOffer?.image || null,
    type: creatorOffer?.type || "free",
    isDefault: true,
    displayName: creatorUser?.displayName || "Créateur",
  });
  listOffers.push(...otherOffers.map((o) => ({ ...o, isDefault: false })));

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 lg:py-16">
      {/* HEADER */}
      <div className="mb-12">
        <Link to="/games" className="font-mono-label text-[11px] text-slate-400 hover:text-white" data-testid="back-to-games">
          ← Retour aux jeux
        </Link>
        <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mt-4">
          {game.name}
        </h1>
        <p className="text-slate-400 mt-2">{game.tagline}</p>
      </div>

      {/* BOOSTING OFFERS */}
      <section className="mb-20" data-testid="boosting-section">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="font-mono-label text-[11px] text-brand mb-2">— Offres boosting</div>
            <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight">Choisis ton boosteur</h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10">
          {listOffers.map((o) => (
            <Link
              key={o.id}
              to={`/order/boosting/${gameId}/${o.uid}`}
              data-testid={`offer-card-${o.uid}`}
              className="bg-ink-900 p-6 hover:bg-ink-800 transition-colors group relative"
            >
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 bg-ink-700 border border-brand/30 rounded-sm overflow-hidden flex-shrink-0">
                  {o.image ? (
                    <img src={o.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-brand">
                      <Sparkles size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-base truncate">{o.title}</h3>
                    {o.isDefault && (
                      <span className="font-mono-label text-[8px] bg-brand/20 text-brand px-2 py-0.5 rounded-sm">
                        DEFAULT
                      </span>
                    )}
                    {o.uid === CREATOR_UID && <Crown size={12} className="text-yellow-400" />}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">par {o.displayName || "Boosteur"}</div>
                  <p className="text-sm text-slate-400 mt-3 line-clamp-2">{o.description}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span
                      className={`font-mono-label text-[10px] px-2 py-1 rounded-sm border ${
                        o.type === "free"
                          ? "border-green-500/30 text-green-400 bg-green-500/10"
                          : "border-brand/30 text-brand bg-brand/10"
                      }`}
                    >
                      {o.type === "free" ? "GRATUIT · DON" : "PAYANT"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ACCOUNT LISTINGS */}
      <section data-testid="accounts-section">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="font-mono-label text-[11px] text-brand mb-2">— Vente de comptes</div>
            <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight">Comptes en vente</h2>
          </div>
        </div>
        {listings.length === 0 ? (
          <div className="border border-dashed border-white/10 p-12 text-center">
            <Tag size={24} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Aucun compte en vente pour le moment.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((l) => (
              <Link
                key={l.id}
                to={`/order/account/${l.id}`}
                data-testid={`listing-card-${l.id}`}
                className="block border border-white/10 hover:border-brand/40 transition-all rounded-sm overflow-hidden group"
              >
                <div className="aspect-video bg-ink-900 overflow-hidden">
                  {l.image ? (
                    <img src={l.image} alt={l.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                      <Tag size={40} />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display font-bold text-lg mb-1">{l.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-4">{l.description}</p>
                  {l.price && (
                    <div className="font-display font-black text-brand text-xl">{l.price}€</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default GamePage;
