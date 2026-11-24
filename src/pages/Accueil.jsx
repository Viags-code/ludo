import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icone from '../components/Icone';
import Photo from '../components/Photo';
import { useDonnees } from '../donnees';
import { formatPrix, useTitre } from '../format';

const filtres = [
  { id: 'tout', label: 'Tout' },
  { id: 'dispo', label: 'Disponibles' },
  { id: 'vendu', label: 'Vendus' },
];

export default function Accueil() {
  const { articles, site, erreur } = useDonnees();
  const [filtre, setFiltre] = useState('tout');
  useTitre(null, site?.nom);

  const visibles = (articles ?? []).filter(
    (a) => filtre === 'tout' || (filtre === 'vendu' ? a.vendu : !a.vendu)
  );

  return (
    <>
      <main className="page">
        <div className="conteneur">
          <header className="entete">
            <div>
              <Link className="nom" to="/">{site?.nom ?? 'Ludo Bois Planche'}</Link>
              <span className="sous-titre">
                {[site?.metier, site?.ville].filter(Boolean).join(', ')}
              </span>
            </div>
            <Link className="bouton-rond plein" to="/contact" aria-label="Contacter Ludo">
              <Icone nom="tel" />
            </Link>
          </header>

          <div className="filtres" role="group" aria-label="Filtrer les réalisations">
            {filtres.map((f) => (
              <button key={f.id} className="filtre" type="button" aria-pressed={filtre === f.id} onClick={() => setFiltre(f.id)}>
                {f.label}
              </button>
            ))}
          </div>

          {erreur && <p className="alerte">{erreur}</p>}
          {articles === null && <p className="vide">Chargement…</p>}
          {articles?.length === 0 && !erreur && <p className="vide">Les premières réalisations arrivent bientôt.</p>}
          {articles?.length > 0 && visibles.length === 0 && <p className="vide">Aucune réalisation dans cette catégorie.</p>}

          <div className="grille">
            {visibles.map((article, i) => (
              <Link className="carte" key={article.id} to={`/articles/${article.id}`}>
                <div className="vignette">
                  <Photo src={article.photos[0]} alt={article.titre} graine={article.id} chargement={i < 4 ? 'eager' : 'lazy'} />
                  {article.vendu && <span className="etiquette">Vendu</span>}
                </div>
                <div>
                  <div className="prix">{formatPrix(article.prix)}</div>
                  <div className="titre">{article.titre}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <div className="barre-bas">
        <div className="conteneur">
          <Link className="bouton plein" to="/contact">Une question ? Contacter Ludo</Link>
        </div>
      </div>
    </>
  );
}
