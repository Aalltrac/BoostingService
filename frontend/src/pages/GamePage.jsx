import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { GAMES, CREATOR_UID } from "../constants";
import { Sparkles, Tag, Crown, ArrowLeft, ArrowUpRight, ShieldCheck } from "lucide-react";

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
      <header className="mb-14 lg:mb-20" data-testid="game-header">
        <Link
          to="/games"
          className="font-mono-label text-[11px] text-slate-400 hover:text-white inline-flex items-center gap-1.5 group transition-colors"
          data-testid="back-to-games"
        >
          <ArrowLeft
            size={12}
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />
          Retour aux jeux
        </Link>

        <div className="mt-5 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 border-b border-white/10 pb-8">
          <div className="min-w-0">
            <div className="font-mono-label text-[11px] text-brand mb-3 tracking-widest">
              — Boosting Service
            </div>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter leading-[0.95]">
              {game.name}
            </h1>
            <p className="text-slate-400 mt-4 max-w-xl text-sm sm:text-base leading-relaxed">
              {game.tagline}
            </p>
          </div>

          <div className="flex items-center gap-6 text-right shrink-0">
            <div>
              <div className="font-mono-label text-[10px] text-slate-500 mb-1">OFFRES</div>
              <div className="font-display font-black text-2xl tabular-nums">
                {String(listOffers.length).padStart(2, "0")}
              </div>
            </div>
            <div className="h-10 w-px bg-white/10" aria-hidden="true" />
            <div>
              <div className="font-mono-label text-[10px] text-slate-500 mb-1">COMPTES</div>
              <div className="font-display font-black text-2xl tabular-nums">
                {String(listings.length).padStart(2, "0")}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* BOOSTING OFFERS */}
      <section className="mb-24" data-testid="boosting-section">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="font-mono-label text-[11px] text-brand mb-2 tracking-widest">
              — Offres boosting
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight">
              Choisis ton boosteur
            </h2>
            <p className="text-slate-500 text-sm mt-2 max-w-md">
              Des prestations vérifiées, livrées par des boosteurs expérimentés.
            </p>
          </div>
          <div className="font-mono-label text-[10px] text-slate-500 inline-flex items-center gap-2">
            <ShieldCheck size={12} className="text-brand" />
            Paiements sécurisés
          </div>
        </div>

        <div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10"
          data-testid="offers-grid"
        >
          {listOffers.map((o) => (
            <Link
              key={o.id}
              to={`/order/boosting/${gameId}/${o.uid}`}
              data-testid={`offer-card-${o.uid}`}
              className="bg-ink-900 p-6 hover:bg-ink-800 transition-colors duration-300 group relative flex flex-col"
            >
              {/* corner accent */}
              <div
                className="absolute top-0 right-0 w-8 h-8 border-t border-r border-brand/0 group-hover:border-brand/60 transition-colors duration-300"
                aria-hidden="true"
              />

              <div className="flex items-start gap-4">
                <div className="h-14 w-14 bg-ink-700 border border-brand/30 rounded-sm overflow-hidden flex-shrink-0 group-hover:border-brand/60 transition-colors duration-300">
                  {o.image ? (
                    <img
                      src={o.image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-brand">
                      <Sparkles size={20} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-base truncate">{o.title}</h3>
                    {o.uid === CREATOR_UID && (
                      <Crown size={12} className="text-yellow-400 shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    par <span className="text-slate-300">{o.displayName || "Boosteur"}</span>
                  </div>
                </div>

                <ArrowUpRight
                  size={16}
                  className="text-slate-600 group-hover:text-brand group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300 shrink-0"
                />
              </div>

              <p className="text-sm text-slate-400 mt-4 line-clamp-2 leading-relaxed">
                {o.description}
              </p>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                <span
                  className={`font-mono-label text-[10px] px-2 py-1 rounded-sm border ${
                    o.type === "free"
                      ? "border-green-500/30 text-green-400 bg-green-500/10"
                      : "border-brand/30 text-brand bg-brand/10"
                  }`}
                >
                  {o.type === "free" ? "GRATUIT · DON" : "PAYANT"}
                </span>
                {o.isDefault && (
                  <span className="font-mono-label text-[9px] tracking-widest text-slate-500">
                    DEFAULT
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ACCOUNT LISTINGS */}
      <section data-testid="accounts-section">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="font-mono-label text-[11px] text-brand mb-2 tracking-widest">
              — Vente de comptes
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight">
              Comptes en vente
            </h2>
            <p className="text-slate-500 text-sm mt-2 max-w-md">
              Comptes garantis, transfert sécurisé après paiement.
            </p>
          </div>
          {listings.length > 0 && (
            <div className="font-mono-label text-[10px] text-slate-500">
              {String(listings.length).padStart(2, "0")} disponible{listings.length > 1 ? "s" : ""}
            </div>
          )}
        </div>

        {listings.length === 0 ? (
          <div
            className="border border-dashed border-white/10 p-16 text-center"
            data-testid="listings-empty"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center border border-white/10 rounded-sm mb-4">
              <Tag size={20} className="text-slate-600" />
            </div>
            <p className="text-slate-400 text-sm font-medium">Aucun compte en vente</p>
            <p className="text-slate-600 text-xs mt-1">Repasse plus tard pour de nouvelles offres.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="listings-grid">
            {listings.map((l) => (
              <Link
                key={l.id}
                to={`/order/account/${l.id}`}
                data-testid={`listing-card-${l.id}`}
                className="block border border-white/10 hover:border-brand/40 transition-all duration-300 rounded-sm overflow-hidden group bg-ink-900 hover:-translate-y-1"
              >
                <div className="aspect-video bg-ink-800 overflow-hidden relative">
                  {l.image ? (
                    <img
                      src={l.image}
                      alt={l.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                      <Tag size={40} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display font-bold text-lg leading-tight">{l.title}</h3>
                    <ArrowUpRight
                      size={16}
                      className="text-slate-600 group-hover:text-brand group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300 shrink-0 mt-1"
                    />
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {l.description}
                  </p>
                  {l.price && (
                    <div className="mt-5 pt-4 border-t border-white/5 flex items-baseline justify-between">
                      <span className="font-mono-label text-[10px] text-slate-500">PRIX</span>
                      <div className="font-display font-black text-brand text-2xl tabular-nums">
                        {l.price}
                        <span className="text-base ml-0.5">€</span>
                      </div>
                    </div>
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
