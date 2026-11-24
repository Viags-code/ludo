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
