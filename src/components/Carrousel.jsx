import { useEffect, useRef, useState } from 'react';
import Icone from './Icone';
import Photo from './Photo';
import { apercuVideo, estVideo } from '../media';

// Carrousel de photos : on glisse au doigt sur téléphone, flèches et miniatures
// sur ordinateur, flèches du clavier quand le carrousel a le focus.
export default function Carrousel({ photos, titre, graine, children }) {
  const [active, setActive] = useState(0);
  const piste = useRef(null);
  const plusieurs = photos.length > 1;

  // Met en pause une vidéo dès qu'on passe à un autre média.
  useEffect(() => {
    piste.current?.querySelectorAll('video').forEach((v) => {
      if (v.dataset.index !== String(active)) v.pause();
    });
  }, [active]);

  const allerA = (index) => {
    const el = piste.current;
    if (!el) return;
    const cible = Math.max(0, Math.min(photos.length - 1, index));
    el.scrollTo({ left: cible * el.clientWidth, behavior: 'smooth' });
    setActive(cible);
  };

  const surDefilement = () => {
    const el = piste.current;
    if (el) setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  const surTouche = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); allerA(active - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); allerA(active + 1); }
  };

  return (
    <div className="carrousel">
      <div className={`carrousel-cadre${estVideo(photos[active]) ? ' sur-video' : ''}`}>
        <div
          className="galerie-defile"
          ref={piste}
          onScroll={surDefilement}
          onKeyDown={surTouche}
          tabIndex={0}
          role="region"
          aria-roledescription="carrousel"
          aria-label={`Photos de ${titre}`}
        >
          {photos.length === 0 ? (
            <div><Photo alt={titre} graine={graine} chargement="eager" /></div>
          ) : (
            photos.map((src, i) => (
              <div key={src} aria-roledescription={estVideo(src) ? 'vidéo' : 'photo'} aria-label={`${i + 1} sur ${photos.length}`}>
                {estVideo(src) ? (
                  <video src={src} poster={apercuVideo(src)} data-index={i} controls playsInline preload="metadata">
                    Votre navigateur ne peut pas lire cette vidéo.
                  </video>
                ) : (
                  <Photo src={src} alt={`${titre}, photo ${i + 1}`} graine={graine} chargement={i === 0 ? 'eager' : 'lazy'} />
                )}
              </div>
            ))
          )}
        </div>

        {children}

        {plusieurs && (
          <>
            <button type="button" className="fleche gauche" onClick={() => allerA(active - 1)} disabled={active === 0} aria-label="Précédent">
              <Icone nom="gauche" />
            </button>
            <button type="button" className="fleche droite" onClick={() => allerA(active + 1)} disabled={active === photos.length - 1} aria-label="Suivant">
              <Icone nom="droite" />
            </button>
            <div className="points" aria-hidden="true">
              {photos.map((src, i) => <span key={src} className={i === active ? 'actif' : ''} />)}
            </div>
            <span className="compteur" aria-live="polite">{active + 1} / {photos.length}</span>
          </>
        )}
      </div>

      {plusieurs && (
        <div className="miniatures" role="group" aria-label="Choisir une photo">
          {photos.map((src, i) => (
            <button key={src} type="button" className={i === active ? 'actif' : ''} onClick={() => allerA(i)} aria-label={`Voir ${estVideo(src) ? 'la vidéo' : 'la photo'} ${i + 1}`} aria-current={i === active}>
              <Photo src={src} alt="" graine={graine} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
