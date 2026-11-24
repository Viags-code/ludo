import { useEffect, useRef, useState } from 'react';
import Icone from './Icone';

// Bouton qui ouvre une vidéo Facebook (reel) dans une fenêtre au-dessus du site.
// Le lecteur Facebook n'est chargé qu'à l'ouverture, pour garder le site rapide.
export default function Video({ lien }) {
  const [ouverte, setOuverte] = useState(false);
  const fenetre = useRef(null);
  const fermer = useRef(null);

  useEffect(() => {
    const el = fenetre.current;
    if (!el) return;
    if (ouverte && !el.open) {
      el.showModal();
      // Focus sur « Fermer » plutôt que dans le lecteur Facebook, pour que la touche Échap ferme la fenêtre.
      fermer.current?.focus();
    }
    if (!ouverte && el.open) el.close();
  }, [ouverte]);

  const lecteur = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(lien)}&show_text=false&autoplay=true&width=360`;

  return (
    <>
      <button type="button" className="bouton-rond" onClick={() => setOuverte(true)} aria-label="Voir la vidéo de l’atelier">
        <Icone nom="video" />
      </button>

      <dialog
        ref={fenetre}
        className="fenetre-video"
        onClose={() => setOuverte(false)}
        onClick={(e) => e.target === fenetre.current && setOuverte(false)}
        aria-label="Vidéo de l’atelier"
      >
        <div className="video-cadre">
          {ouverte && (
            <iframe
              src={lecteur}
              title="Vidéo de l’atelier de Ludo"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>
        <div className="video-pied">
          <a href={lien} target="_blank" rel="noopener">Voir sur Facebook</a>
          <button ref={fermer} type="button" className="bouton contour" onClick={() => setOuverte(false)}>Fermer</button>
        </div>
      </dialog>
    </>
  );
}
