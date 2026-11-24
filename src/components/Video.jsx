import { useEffect, useRef, useState } from 'react';
import Icone from './Icone';

// Vidéo de présentation, hébergée avec le site (public/video/atelier.mp4).
// Pour la changer : remplacer ce fichier (MP4 en H.264, idéalement moins de 10 Mo)
// et l'image d'aperçu atelier.jpg.
const VIDEO = '/video/atelier.mp4';
const APERCU = '/video/atelier.jpg';

// Bouton de l'en-tête qui ouvre la vidéo dans une fenêtre au-dessus du site.
export default function Video() {
  const [ouverte, setOuverte] = useState(false);
  const fenetre = useRef(null);
  const lecteur = useRef(null);

  useEffect(() => {
    const el = fenetre.current;
    if (!el) return;
    if (ouverte && !el.open) {
      el.showModal();
      lecteur.current?.play().catch(() => {
        // Lecture automatique refusée par le navigateur : le visiteur appuie sur lecture.
      });
    }
    if (!ouverte) {
      lecteur.current?.pause();
      if (el.open) el.close();
    }
  }, [ouverte]);

  return (
    <>
      <button type="button" className="bouton-rond" onClick={() => setOuverte(true)} aria-label="Voir la vidéo de présentation">
        <Icone nom="video" />
      </button>

      <dialog
        ref={fenetre}
        className="fenetre-video"
        onClose={() => setOuverte(false)}
        onClick={(e) => e.target === fenetre.current && setOuverte(false)}
        aria-label="Vidéo de présentation"
      >
        <div className="video-cadre">
          {ouverte && (
            <video ref={lecteur} src={VIDEO} poster={APERCU} controls playsInline preload="metadata">
              Votre navigateur ne peut pas lire cette vidéo.
            </video>
          )}
        </div>
        <div className="video-pied">
          <button type="button" className="bouton contour" onClick={() => setOuverte(false)}>Fermer</button>
        </div>
      </dialog>
    </>
  );
}
