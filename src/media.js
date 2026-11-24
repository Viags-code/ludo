// Une réalisation contient des photos et/ou des vidéos (même liste, dans l'ordre choisi par Ludo).
export const estVideo = (url = '') => /\.(mp4|mov|webm)$/i.test(url);

// Image d'aperçu d'une vidéo : même nom, en .jpg (fabriquée à l'envoi).
export const apercuVideo = (url = '') => url.replace(/\.(mp4|mov|webm)$/i, '.jpg');

// Image à montrer en vignette pour un média (photo ou aperçu de vidéo).
export const vignette = (url) => (estVideo(url) ? apercuVideo(url) : url);
