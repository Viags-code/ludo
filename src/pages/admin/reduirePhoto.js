// Réduit une photo du téléphone (souvent 4 à 10 Mo) avant l'envoi :
// plus rapide sur la 4G, et le serveur la retravaille ensuite de toute façon.
const COTE_MAX = 2000;

export async function reduirePhoto(fichier) {
  try {
    const image = await createImageBitmap(fichier, { imageOrientation: 'from-image' });
    const ratio = Math.min(1, COTE_MAX / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.width * ratio);
    canvas.height = Math.round(image.height * ratio);
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
    image.close?.();
    const blob = await new Promise((ok) => canvas.toBlob(ok, 'image/jpeg', 0.85));
    return blob ? new File([blob], 'photo.jpg', { type: 'image/jpeg' }) : fichier;
  } catch {
    // Format que le navigateur ne sait pas lire (ex. HEIC) : on envoie tel quel.
    return fichier;
  }
}

// Fabrique l'image d'aperçu d'une vidéo (une image prise à 0,5 s).
// Renvoie null si le navigateur ne sait pas lire la vidéo : elle risque alors
// de ne pas s'afficher chez tous les visiteurs non plus.
export function apercuDeVideo(fichier) {
  return new Promise((resoudre) => {
    const url = URL.createObjectURL(fichier);
    const video = document.createElement('video');
    let fini = false;
    const terminer = (resultat) => {
      if (fini) return;
      fini = true;
      URL.revokeObjectURL(url);
      resoudre(resultat);
    };
    setTimeout(() => terminer(null), 15000);
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.onerror = () => terminer(null);
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(0.5, (video.duration || 1) / 2);
    };
    video.onseeked = () => {
      if (!video.videoWidth) return terminer(null);
      const ratio = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(video.videoWidth * ratio);
      canvas.height = Math.round(video.videoHeight * ratio);
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => terminer(blob ? new File([blob], 'apercu.jpg', { type: 'image/jpeg' }) : null), 'image/jpeg', 0.82);
    };
    video.src = url;
  });
}
