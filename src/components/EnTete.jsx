import { Link } from 'react-router-dom';
import Icone from './Icone';
import Video from './Video';
import { useDonnees } from '../donnees';
import { numeroInternational } from '../format';

// En-tête fixe en haut de chaque page : logo, nom, bouton téléphone.
// Pour changer de logo, remplacer public/logo.svg (ou mettre logo.png et changer le src ci-dessous).
export default function EnTete() {
  const { site } = useDonnees();
  const telephone = site?.telephone ? numeroInternational(site.telephone) : '';
  const sousTitre = [site?.metier, site?.ville].filter(Boolean).join(', ');

  return (
    <header className="bandeau">
      <div className="conteneur bandeau-contenu">
        <Link className="marque" to="/">
          <img className="logo" src="/logo.svg" alt="" width="40" height="40" />
          <span className="marque-texte">
            <span className="nom">{site?.nom || 'Ludo Bois Planche'}</span>
            {sousTitre && <span className="sous-titre">{sousTitre}</span>}
          </span>
        </Link>
        <div className="bandeau-actions">
        {site?.video && <Video lien={site.video} />}
        {telephone ? (
          <a className="bouton-rond plein" href={`tel:${telephone}`} aria-label="Appeler Ludo"><Icone nom="tel" /></a>
        ) : (
          <Link className="bouton-rond plein" to="/contact" aria-label="Contacter Ludo"><Icone nom="tel" /></Link>
        )}
        </div>
      </div>
    </header>
  );
}
