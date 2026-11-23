# Ludo Bois Planche

Site vitrine de Ludo, menuisier : ses réalisations en grille de photos, une fiche par article et une page de contact. Pensé d'abord pour le téléphone.

## Ajouter ou modifier un article

Chaque article est un fichier dans `src/content/articles/`, par exemple `table-chene.md` :

```markdown
---
titre: "Table basse en chêne"
date: 2026-11-23
prix: 350          # à retirer pour afficher « Sur devis »
vendu: false
bois: "Chêne massif"
dimensions: "120 × 60 × 45 cm"
photos:
  - /uploads/table-chene-1.jpg   # la première sert de vignette
  - /uploads/table-chene-2.jpg
---
La description affichée sur la fiche.
```

Les photos vont dans `public/uploads/`.

## Espace Ludo (`/admin`)

Ludo ajoute, modifie ou marque comme vendu ses articles depuis son téléphone à l'adresse `https://<le-site>/admin`. Il y modifie aussi ses coordonnées. L'éditeur est [Sveltia CMS](https://github.com/sveltia/sveltia-cms), configuré dans `public/admin/config.yml`. Chaque « Publier » enregistre le fichier dans ce dépôt, puis Netlify remet le site en ligne en une minute environ.

Mise en place, une seule fois, après la première mise en ligne sur Netlify :

1. **Créer une application OAuth GitHub** : GitHub › Settings › Developer settings › OAuth Apps › New OAuth App. *Homepage URL* : l'adresse du site. *Authorization callback URL* : `https://api.netlify.com/auth/done`. Noter le *Client ID* et générer un *Client secret*.
2. **Brancher GitHub sur Netlify** : dans le site Netlify, Site configuration › Access & security › OAuth › Install provider › GitHub, puis coller le Client ID et le secret.
3. **Donner accès à Ludo** : il crée un compte GitHub gratuit, puis on l'invite sur ce dépôt (Settings › Collaborators). Ensuite il se connecte sur `/admin` avec « Sign In with GitHub ».

## Coordonnées

Le nom, la ville, le téléphone, WhatsApp et le lien Facebook sont dans `src/data/site.json`. Les boutons « Appeler » et « WhatsApp » n'apparaissent que si le numéro est rempli.

## Travailler sur le site

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # génère le site dans dist/
```

## Hébergement

Prévu pour Netlify (`netlify.toml`). Le formulaire de contact utilise Netlify Forms : les messages arrivent dans le tableau de bord Netlify et peuvent être transférés par e-mail.
