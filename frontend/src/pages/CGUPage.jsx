const CGUPage = () => (
  <div className="max-w-3xl mx-auto px-4 lg:px-8 py-12">
    <div className="font-mono-label text-[11px] text-brand mb-2">— Mentions légales</div>
    <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tighter mb-10">Conditions d'utilisation</h1>

    <div className="prose prose-invert max-w-none space-y-8 text-slate-300 leading-relaxed">
      <Section title="1. Objet">
        <p>
          Boosting Service est une plateforme de mise en relation entre des joueurs (« clients ») et des prestataires
          indépendants (« boosteurs » et « vendeurs de comptes »). Boosting Service n'effectue ni n'exécute elle-même
          de service de boosting ni de vente de compte. Son rôle se limite à la mise à disposition d'un espace de
          communication entre les parties.
        </p>
      </Section>

      <Section title="2. Indépendance des vendeurs et boosteurs">
        <p>
          <strong className="text-white">Chaque boosteur et chaque vendeur agit en tant que prestataire totalement indépendant.</strong>{" "}
          Boosting Service n'emploie aucun boosteur ni aucun vendeur, ne perçoit aucun paiement direct pour le compte
          des prestataires et n'est pas partie au contrat conclu entre le client et le prestataire.
        </p>
      </Section>

      <Section title="3. Limitation de responsabilité">
        <p>
          <strong className="text-white">Boosting Service ne peut être tenue responsable des arnaques, fraudes,
          impayés, comportements abusifs, retards, dégradations de comptes ou tout autre litige</strong> survenant
          entre un client et un prestataire. Cette responsabilité incombe exclusivement aux parties au contrat.
        </p>
      </Section>

      <Section title="4. Procédure en cas d'incident">
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

      <Section title="5. Identifiants de compte">
        <p>
          Lorsqu'une commande de boosting est confirmée, le client transmet ses identifiants de jeu au prestataire via
          le chat sécurisé. Ces identifiants sont visibles par le prestataire concerné et l'administrateur de Boosting
          Service à des fins de médiation. Le client est responsable de modifier son mot de passe à l'issue de la
          prestation.
        </p>
      </Section>

      <Section title="6. Commissions">
        <p>
          Boosting Service applique une commission aux prestataires payants, calculée sur le prix de la commande :
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>5 % en dessous de 10 €</li>
          <li>10 % entre 10 € et 100 €</li>
          <li>15 % entre 100 € et 1 000 €</li>
          <li>20 % au-delà de 1 000 €</li>
        </ul>
        <p>
          Les boosteurs « gratuits » ne sont soumis à aucune commission ; ils peuvent toutefois proposer à leurs clients de leur faire un don via leurs propres liens.
        </p>
      </Section>

      <Section title="7. Données personnelles">
        <p>
          Les données collectées (email, pseudo, conversations) sont stockées chez Firebase (Google) à des fins de
          fonctionnement du service. Le client peut demander leur suppression en contactant l'administrateur.
        </p>
      </Section>

      <Section title="8. Acceptation">
        <p>
          L'utilisation de Boosting Service vaut acceptation pleine et entière des présentes conditions.
        </p>
      </Section>
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <section>
    <h2 className="font-display font-bold text-xl text-white mb-3">{title}</h2>
    <div className="space-y-3 text-[15px]">{children}</div>
  </section>
);

export default CGUPage;
