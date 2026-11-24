# Ludo Bois Planche

Site vitrine de Ludo, menuisier : ses réalisations en grille de photos, une fiche par réalisation et une page de contact. Ludo ajoute lui-même ses réalisations depuis son téléphone, sur `/admin`.

- **Site** : React + Vite (dossier `src/`), en HTML/CSS/JavaScript classiques.
- **Enregistrement** : un seul fichier PHP, `public/api/index.php`, qui fonctionne tel quel chez O2switch. Pas de base de données : les réalisations sont dans `api/donnees/articles.json` sur le serveur, les photos dans `uploads/`.

## Organisation du code

```
index.html               page de départ chargée par Vite
src/main.jsx             liste des pages (adresses du site)
src/pages/               Accueil, Fiche, Contact, Merci, Introuvable
src/pages/admin/         espace de Ludo : connexion, liste, éditeur, coordonnées
src/components/          petits éléments réutilisés (icônes, photo)
src/api.js               appels vers l'API PHP
src/donnees.jsx          chargement des réalisations et coordonnées
src/styles.css           toute la mise en forme
public/api/index.php     l'API : lecture, enregistrement, connexion, formulaire de contact
public/api/config.exemple.php   modèle du fichier de réglages (mot de passe, e-mails)
public/.htaccess         redirige toutes les adresses vers index.html (Apache)
```

## Travailler sur son ordinateur

Il faut [Node.js](https://nodejs.org) et PHP 8.1 ou plus récent.

```sh
npm install
cp public/api/config.exemple.php public/api/config.php   # puis choisir un mot de passe dedans
npm run api      # terminal 1 : l'API PHP sur http://localhost:8000
npm run dev      # terminal 2 : le site sur http://localhost:5173
```

Les réalisations ajoutées en local vont dans `public/api/donnees/` et `public/uploads/`, qui ne sont jamais envoyés sur GitHub.

## Mise en ligne chez O2switch

### La première fois

1. **PHP** : dans cPanel, « Sélecteur de version PHP », choisir PHP 8.2 ou plus récent.
2. **HTTPS** : dans cPanel, « Lets Encrypt™ SSL » (ou AutoSSL), activer le certificat pour le domaine.
3. **Adresse d'envoi** : dans cPanel, « Comptes de messagerie », créer par exemple `site@votre-domaine.fr`. Le formulaire de contact enverra les messages depuis cette adresse.
4. **Construire le site** sur l'ordinateur : `npm install` puis `npm run build`. Le résultat est le dossier `dist/`.
5. **Envoyer** tout le *contenu* de `dist/` dans `public_html/` (ou le dossier du domaine), avec le Gestionnaire de fichiers de cPanel ou en FTP (FileZilla). Les fichiers `.htaccess` sont cachés par défaut : penser à afficher les fichiers cachés pour vérifier qu'ils sont bien partis.
6. **Réglages** : dans `public_html/api/`, copier `config.exemple.php` sous le nom `config.php`, puis l'ouvrir et remplir :
   - `mot_de_passe` : le mot de passe de Ludo pour `/admin` ;
   - `email_contact` : l'adresse où Ludo reçoit les messages ;
   - `email_expediteur` : l'adresse créée à l'étape 3.
7. Aller sur `https://votre-domaine.fr/admin`, se connecter, puis remplir « Mes coordonnées » et ajouter les premières réalisations.

### Pour une mise à jour du code

Refaire `npm run build` et renvoyer le contenu de `dist/` en remplaçant les fichiers. **Ne jamais supprimer** sur le serveur :

- `api/config.php` (les réglages),
- `api/donnees/` (les réalisations et coordonnées),
- `uploads/` (les photos).

Ces trois éléments n'existent que sur le serveur. Les sauvegardes automatiques d'O2switch (JetBackup dans cPanel) les couvrent.

## Vidéo de présentation

Le bouton lecture de l'en-tête ouvre `public/video/atelier.mp4`, avec l'image d'aperçu `public/video/atelier.jpg`. Pour changer de vidéo, remplacer ces deux fichiers dans le projet (puis reconstruire et renvoyer), pas seulement sur le serveur, sinon la prochaine mise à jour remettrait l'ancienne. Une vidéo de téléphone se convertit en format léger pour le web avec :

```sh
ffmpeg -i video-du-telephone.mp4 -vf scale=720:-2 -c:v libx264 -crf 26 -preset slow -c:a aac -b:a 128k -movflags +faststart public/video/atelier.mp4
```

Ludo peut cacher ou réafficher le bouton dans « Mes coordonnées ».

## Sécurité, en bref

- `/admin` est protégé par le mot de passe de `config.php`. Après 10 essais ratés, la connexion est bloquée 15 minutes.
- Les fichiers de `api/donnees/` et `config.php` ne sont jamais lisibles depuis le navigateur.
- Les photos envoyées sont vérifiées, réduites à 1600 px et réenregistrées en JPEG, ce qui retire aussi les données GPS du téléphone.
- Le formulaire de contact accepte 5 messages par heure et par visiteur, et ignore les robots qui remplissent le champ caché.
