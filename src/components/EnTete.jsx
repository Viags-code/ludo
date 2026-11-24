import { Link } from 'react-router-dom';
import Menu from './Menu';
import { useDonnees } from '../donnees';

// En-tête fixe en haut de chaque page : logo, nom, menu ☰.
// Pour changer de logo, remplacer public/logo.svg (ou mettre logo.png et changer le src ci-dessous).
export default function EnTete() {
  const { site } = useDonnees();
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
        <Menu site={site} />
      </div>
    </header>
  );
}
