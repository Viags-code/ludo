// Petites fonctions pour parler à l'API PHP (public/api/index.php).

async function appel(action, options = {}) {
  const reponse = await fetch(`/api/index.php?action=${action}`, {
    credentials: 'same-origin',
    ...options,
    headers: { 'X-Requested-With': 'ludo', ...(options.headers || {}) },
  });
  let donnees = {};
  try {
    donnees = await reponse.json();
  } catch {
    // réponse vide ou non JSON
  }
  if (!reponse.ok) throw new Error(donnees.erreur || 'Le serveur ne répond pas. Réessayez.');
  return donnees;
}

// Envoi de fichiers avec suivi de la progression (utile pour les vidéos en 4G).
function envoyerAvecProgression(action, formulaire, surProgression) {
  return new Promise((resoudre, rejeter) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/index.php?action=${action}`);
    xhr.setRequestHeader('X-Requested-With', 'ludo');
    xhr.upload.onprogress = (e) => e.lengthComputable && surProgression?.(Math.round((e.loaded / e.total) * 100));
    xhr.onerror = () => rejeter(new Error('Connexion perdue pendant l’envoi. Réessayez.'));
    xhr.onload = () => {
      let donnees = {};
      try {
        donnees = JSON.parse(xhr.responseText);
      } catch {
        // réponse vide ou non JSON
      }
      if (xhr.status >= 200 && xhr.status < 300) resoudre(donnees);
      else rejeter(new Error(donnees.erreur || (xhr.status === 413 ? 'Envoi trop lourd pour le serveur.' : 'Le serveur ne répond pas. Réessayez.')));
    };
    xhr.send(formulaire);
  });
}

const json = (action, corps) =>
  appel(action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corps ?? {}) });

export const api = {
  articles: () => appel('articles').then((d) => d.articles),
  site: () => appel('site').then((d) => d.site),
  session: () => appel('session'),
  connexion: (motDePasse) => json('connexion', { mot_de_passe: motDePasse }),
  deconnexion: () => json('deconnexion'),
  enregistrerArticle: (formulaire, surProgression) => envoyerAvecProgression('article', formulaire, surProgression).then((d) => d.article),
  supprimerArticle: (id) => json('supprimer', { id }),
  enregistrerSite: (site) => json('site', site).then((d) => d.site),
  contact: (message) => json('contact', message),
};
