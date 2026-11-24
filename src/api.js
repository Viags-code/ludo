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

const json = (action, corps) =>
  appel(action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corps ?? {}) });

export const api = {
  articles: () => appel('articles').then((d) => d.articles),
  site: () => appel('site').then((d) => d.site),
  session: () => appel('session'),
  connexion: (motDePasse) => json('connexion', { mot_de_passe: motDePasse }),
  deconnexion: () => json('deconnexion'),
  enregistrerArticle: (formulaire) => appel('article', { method: 'POST', body: formulaire }).then((d) => d.article),
  supprimerArticle: (id) => json('supprimer', { id }),
  enregistrerSite: (site) => json('site', site).then((d) => d.site),
  contact: (message) => json('contact', message),
};
