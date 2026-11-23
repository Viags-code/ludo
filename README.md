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

Les photos vont dans `public/uploads/`. Une page d'administration (`/admin`) permettra bientôt à Ludo de faire tout ça depuis son téléphone, sans toucher aux fichiers.

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
