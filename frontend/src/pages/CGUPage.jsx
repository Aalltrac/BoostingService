import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "objet", num: "01", title: "Objet" },
  { id: "independance", num: "02", title: "Indépendance des vendeurs et boosteurs" },
  { id: "responsabilite", num: "03", title: "Limitation de responsabilité" },
  { id: "incident", num: "04", title: "Procédure en cas d'incident" },
  { id: "identifiants", num: "05", title: "Identifiants de compte" },
  { id: "commissions", num: "06", title: "Commissions" },
  { id: "donnees", num: "07", title: "Données personnelles" },
  { id: "acceptation", num: "08", title: "Acceptation" },
];

const CGUPage = () => {
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-12">
      {/* Header */}
      <header className="mb-12 pb-10 border-b border-white/10">
        <div className="font-mono-label text-[11px] text-brand mb-3 tracking-widest">
          — Mentions légales
        </div>
        <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-6 text-white">
          Conditions d'utilisation
        </h1>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-slate-400">
          <span className="font-mono-label">Boosting Service</span>
          <span className="h-1 w-1 rounded-full bg-slate-600" />
          <span>Plateforme de mise en relation</span>
          <span className="h-1 w-1 rounded-full bg-slate-600" />
          <span>8 articles</span>
        </div>
      </header>

      <div className="grid lg:grid-cols-[220px_1fr] gap-12">
        {/* Sommaire sticky */}
        <aside className="hidden lg:block">
          <div className="sticky top-8">
            <div className="font-mono-label text-[11px] text-slate-500 mb-4 tracking-widest">
              SOMMAIRE
            </div>
            <nav className="space-y-1">
              {SECTIONS.map((s) => {
                const isActive = active === s.id;
                return (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    data-testid={`toc-link-${s.id}`}
                    className={`group flex items-baseline gap-3 py-1.5 text-[13px] leading-snug transition-colors border-l-2 pl-3 -ml-[2px] ${
                      isActive
                        ? "border-brand text-white"
                        : "border-transparent text-slate-500 hover:text-slate-200"
                    }`}
                  >
                    <span
                      className={`font-mono-label text-[10px] ${
                        isActive ? "text-brand" : "text-slate-600"
                      }`}
                    >
                      {s.num}
                    </span>
                    <span>{s.title}</span>
                  </a>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Contenu */}
        <main className="prose prose-invert max-w-none text-slate-300 leading-relaxed">
          <Section id="objet" num="01" title="Objet">
            <p>
              Boosting Service est une plateforme de mise en relation entre des joueurs (« clients ») et des prestataires
              indépendants (« boosteurs » et « vendeurs de comptes »). Boosting Service n'effectue ni n'exécute elle-même
              de service de boosting ni de vente de compte. Son rôle se limite à la mise à disposition d'un espace de
              communication entre les parties.
            </p>
          </Section>

          <Section id="independance" num="02" title="Indépendance des vendeurs et boosteurs">
            <p>
              <strong className="text-white">Chaque boosteur et chaque vendeur agit en tant que prestataire totalement indépendant.</strong>{" "}
              Boosting Service n'emploie aucun boosteur ni aucun vendeur, ne perçoit aucun paiement direct pour le compte
              des prestataires et n'est pas partie au contrat conclu entre le client et le prestataire.
            </p>
          </Section>

          <Section id="responsabilite" num="03" title="Limitation de responsabilité">
            <Callout variant="warning">
              <p>
                <strong className="text-white">Boosting Service ne peut être tenue responsable des arnaques, fraudes,
                impayés, comportements abusifs, retards, dégradations de comptes ou tout autre litige</strong> survenant
                entre un client et un prestataire. Cette responsabilité incombe exclusivement aux parties au contrat.
              </p>
            </Callout>
          </Section>

          <Section id="incident" num="04" title="Procédure en cas d'incident">
            <p>
              En cas de problème avec un prestataire (boosteur ou vendeur de compte), le client s'engage à{" "}
              <strong className="text-white">prévenir Boosting Service sans délai</strong> via le formulaire « Devenir
              boosteur » → discussion avec le créateur, ou via toute discussion ouverte avec l'administrateur. Boosting
              Service mettra en œuvre des moyens raisonnables pour rechercher une solution amiable.
            </p>
            <p>
              En cas d'arnaque avérée, le client devra <strong className="text-white">engager les voies de recours
              appropriées directement contre le prestataire fautif</strong> et ne pourra se retourner contre Boosting
              Service, dont le rôle se limite à la mise en relation.
            </p>
          </Section>

          <Section id="identifiants" num="05" title="Identifiants de compte">
            <p>
              Lorsqu'une commande de boosting est confirmée, le client transmet ses identifiants de jeu au prestataire via
              le chat sécurisé. Ces identifiants sont visibles par le prestataire concerné et l'administrateur de Boosting
              Service à des fins de médiation. Le client est responsable de modifier son mot de passe à l'issue de la
              prestation.
            </p>
          </Section>

          <Section id="commissions" num="06" title="Commissions">
            <p>
              Boosting Service applique une commission aux prestataires payants, calculée sur le prix de la commande :
            </p>

            <div className="not-prose my-6 overflow-hidden rounded-lg border border-white/10">
              <table className="w-full text-[14px]" data-testid="commissions-table">
                <thead>
                  <tr className="bg-white/[0.03] text-left">
                    <th className="font-mono-label text-[11px] text-slate-400 tracking-widest font-normal px-5 py-3">
                      Tranche
                    </th>
                    <th className="font-mono-label text-[11px] text-slate-400 tracking-widest font-normal px-5 py-3 text-right">
                      Commission
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    ["En dessous de 10 €", "5 %"],
                    ["Entre 10 € et 100 €", "10 %"],
                    ["Entre 100 € et 1 000 €", "15 %"],
                    ["Au-delà de 1 000 €", "20 %"],
                  ].map(([range, rate]) => (
                    <tr key={range} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 text-slate-300">{range}</td>
                      <td className="px-5 py-3 text-right">
                        <span className="font-display font-bold text-white">{rate}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p>
              Les boosteurs « gratuits » ne sont soumis à aucune commission ; ils peuvent toutefois proposer à leurs clients de leur faire un don via leurs propres liens.
            </p>
          </Section>

          <Section id="donnees" num="07" title="Données personnelles">
            <p>
              Les données collectées (email, pseudo, conversations) sont stockées chez Firebase (Google) à des fins de
              fonctionnement du service. Le client peut demander leur suppression en contactant l'administrateur.
            </p>
          </Section>

          <Section id="acceptation" num="08" title="Acceptation">
            <div className="not-prose mt-2 rounded-lg border border-brand/30 bg-brand/[0.06] px-5 py-4">
              <p className="text-slate-200 text-[15px] leading-relaxed m-0">
                L'utilisation de Boosting Service vaut <strong className="text-white">acceptation pleine et entière</strong> des présentes conditions.
              </p>
            </div>
          </Section>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="font-mono-label text-[11px] text-slate-500 tracking-widest">
              FIN DU DOCUMENT
            </div>
            <a
              href="#top"
              data-testid="back-to-top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="font-mono-label text-[11px] text-slate-400 hover:text-brand tracking-widest transition-colors"
            >
              ↑ RETOUR EN HAUT
            </a>
          </footer>
        </main>
      </div>
    </div>
  );
};

const Section = ({ id, num, title, children }) => (
  <section id={id} className="scroll-mt-8 pt-10 first:pt-0 pb-2">
    <div className="flex items-baseline gap-4 mb-5">
      <span className="font-mono-label text-[11px] text-brand tracking-widest">{num}</span>
      <h2 className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight m-0">
        {title}
      </h2>
    </div>
    <div className="space-y-4 text-[15px] pl-0 sm:pl-10">{children}</div>
  </section>
);

const Callout = ({ children, variant = "info" }) => {
  const styles = {
    info: "border-brand/30 bg-brand/[0.05]",
    warning: "border-amber-400/30 bg-amber-400/[0.04]",
  };
  return (
    <div className={`not-prose rounded-lg border ${styles[variant]} px-5 py-4`}>
      <div className="text-slate-200 text-[15px] leading-relaxed space-y-3">{children}</div>
    </div>
  );
};

export default CGUPage;
