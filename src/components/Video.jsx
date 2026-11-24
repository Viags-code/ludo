import { useEffect, useRef } from 'react';

// Vidéo de présentation, hébergée avec le site (public/video/atelier.mp4).
// Pour la changer : remplacer ce fichier (MP4 en H.264, idéalement moins de 10 Mo)
// et l'image d'aperçu atelier.jpg.
const VIDEO = '/video/atelier.mp4';
const APERCU = '/video/atelier.jpg';

// Fenêtre qui affiche la vidéo au-dessus du site. Ouverte depuis le menu.
export default function FenetreVideo({ ouverte, onFermer }) {
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
    <dialog
      ref={fenetre}
      className="fenetre-video"
      onClose={onFermer}
      onClick={(e) => e.target === fenetre.current && onFermer()}
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
        <button type="button" className="bouton contour" onClick={onFermer}>Fermer</button>
      </div>
    </dialog>
  );
}
