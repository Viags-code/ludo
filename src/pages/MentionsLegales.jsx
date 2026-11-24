import { Link } from 'react-router-dom';
import { useDonnees } from '../donnees';
import { useTitre } from '../format';

const aCompleter = <em className="a-completer">à compléter dans l'espace Ludo</em>;

// Mentions légales obligatoires (loi pour la confiance dans l'économie numérique, art. 6).
// Les informations de l'entreprise se remplissent dans /admin › Mes coordonnées.
// Coordonnées de l'hébergeur à vérifier sur https://www.o2switch.fr/mentions-legales/ avant la mise en ligne.
export default function MentionsLegales() {
  const { site } = useDonnees();
  useTitre('Mentions légales', site?.nom);
  const s = site || {};

  return (
    <main className="conteneur texte-legal">
      <h1>Mentions légales</h1>

      <section>
        <h2>Éditeur du site</h2>
        <p>
          {s.entreprise || s.nom || aCompleter}<br />
          Forme juridique : {s.statut || aCompleter}<br />
          SIRET : {s.siret || aCompleter}<br />
          Adresse : {s.adresse || aCompleter}<br />
          Téléphone : {s.telephone || aCompleter}<br />
          E-mail : {s.email ? <a href={`mailto:${s.email}`}>{s.email}</a> : aCompleter}
        </p>
        <p>Directeur de la publication : {s.entreprise || s.nom || aCompleter}</p>
      </section>

      <section>
        <h2>Hébergement</h2>
        <p>
          o2switch<br />
          222-224 boulevard Gustave Flaubert, 63000 Clermont-Ferrand, France<br />
          Téléphone : 04 44 44 60 40 · <a href="https://www.o2switch.fr" rel="noopener">www.o2switch.fr</a>
        </p>
      </section>

      <section>
        <h2>Données personnelles</h2>
        <p>
          Les informations envoyées avec le formulaire de contact (nom, téléphone ou e-mail, message) servent
          uniquement à vous répondre. Elles sont transmises par e-mail à {s.entreprise || s.nom || 'l’entreprise'}, ne sont
          ni vendues ni partagées, et ne sont pas conservées sur le site.
        </p>
        <p>
          Conformément au RGPD, vous pouvez demander l'accès, la correction ou la suppression de vos données
          en écrivant {s.email ? <>à <a href={`mailto:${s.email}`}>{s.email}</a></> : 'via la page contact'}.
          Vous pouvez aussi saisir la CNIL (<a href="https://www.cnil.fr" rel="noopener">www.cnil.fr</a>).
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          Ce site n'utilise aucun cookie de mesure d'audience ni de publicité. Seul un cookie technique,
          nécessaire à la connexion de l'espace de gestion, est déposé, et uniquement pour l'administrateur.
        </p>
      </section>

      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          Les photos, textes et vidéos de ce site appartiennent à {s.entreprise || s.nom || 'l’entreprise'}. Toute
          reproduction sans autorisation est interdite.
        </p>
      </section>

      <Link className="bouton plein" to="/">Retour aux réalisations</Link>
    </main>
  );
}
