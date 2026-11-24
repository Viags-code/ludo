import { Link, useParams } from 'react-router-dom';
import Icone from '../components/Icone';
import Carrousel from '../components/Carrousel';
import Introuvable from './Introuvable';
import { useDonnees } from '../donnees';
import { formatPrix, numeroInternational, useTitre } from '../format';

export default function Fiche() {
  const { id } = useParams();
  const { articles, site } = useDonnees();
  const article = articles?.find((a) => a.id === id);
  useTitre(article?.titre, site?.nom);

  if (articles === null) return <p className="vide">Chargement…</p>;
  if (!article) return <Introuvable />;

  const { titre, prix, vendu, bois, dimensions, description, photos } = article;
  const lienContact = `/contact?article=${encodeURIComponent(titre)}`;
  const telephone = site?.telephone ? numeroInternational(site.telephone) : '';
  const paragraphes = (description || '').split(/\n\s*\n/).filter((p) => p.trim());

  return (
    <>
      <main className="page">
        <div className="conteneur">
          <article className="fiche">
            <Carrousel key={article.id} photos={photos} titre={titre} graine={article.id}>
              <Link className="bouton-rond retour" to="/" aria-label="Retour aux réalisations">
                <Icone nom="retour" />
              </Link>
            </Carrousel>

            <div className="infos">
              <div className="entete-fiche">
                <span className={`statut${vendu ? ' vendu' : ''}`}>{vendu ? 'Vendu' : 'Disponible'}</span>
                <h1>{titre}</h1>
                <span className="prix">{formatPrix(prix)}</span>
              </div>
              {(bois || dimensions) && (
                <dl className="caracteristiques">
                  {bois && <div><dt>Bois</dt><dd>{bois}</dd></div>}
                  {dimensions && <div><dt>Dimensions</dt><dd>{dimensions}</dd></div>}
                </dl>
              )}
              {paragraphes.length > 0 && (
                <div className="description">
                  <h2>Description</h2>
                  {paragraphes.map((p, i) => <p key={i}>{p}</p>)}
                </div>
              )}
            </div>
          </article>
        </div>
      </main>

      <div className="barre-bas">
        <div className="conteneur">
          {telephone ? (
            <a className="bouton contour" href={`tel:${telephone}`}>Appeler</a>
          ) : (
            <Link className="bouton contour" to={lienContact}>Appeler</Link>
          )}
          <Link className="bouton plein large" to={lienContact}>
            {vendu ? 'Commander une pièce similaire' : 'Je suis intéressé'}
          </Link>
        </div>
      </div>
    </>
  );
}
