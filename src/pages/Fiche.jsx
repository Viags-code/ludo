import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icone from '../components/Icone';
import Photo from '../components/Photo';
import Introuvable from './Introuvable';
import { useDonnees } from '../donnees';
import { formatPrix, numeroInternational, useTitre } from '../format';

export default function Fiche() {
  const { id } = useParams();
  const { articles, site } = useDonnees();
  const [photoActive, setPhotoActive] = useState(0);
  const defile = useRef(null);
  const article = articles?.find((a) => a.id === id);
  useTitre(article?.titre, site?.nom);

  if (articles === null) return <p className="vide">Chargement…</p>;
  if (!article) return <Introuvable />;

  const { titre, prix, vendu, bois, dimensions, description, photos } = article;
  const lienContact = `/contact?article=${encodeURIComponent(titre)}`;
  const telephone = site?.telephone ? numeroInternational(site.telephone) : '';
  const paragraphes = (description || '').split(/\n\s*\n/).filter((p) => p.trim());

  const surDefilement = () => {
    const el = defile.current;
    if (el) setPhotoActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <>
      <main className="page">
        <div className="conteneur">
          <article className="fiche">
            <div className="galerie">
              <div className="galerie-defile" ref={defile} onScroll={surDefilement} tabIndex={0} aria-label="Photos">
                {photos.length === 0 ? (
                  <div><Photo alt={titre} graine={article.id} chargement="eager" /></div>
                ) : (
                  photos.map((src, i) => (
                    <div key={src}>
                      <Photo src={src} alt={`${titre}, photo ${i + 1}`} graine={article.id} chargement={i === 0 ? 'eager' : 'lazy'} />
                    </div>
                  ))
                )}
              </div>
              <Link className="bouton-rond retour" to="/" aria-label="Retour aux réalisations">
                <Icone nom="retour" />
              </Link>
              {photos.length > 1 && (
                <span className="compteur" aria-live="polite">{photoActive + 1} / {photos.length}</span>
              )}
            </div>

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
