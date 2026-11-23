import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Un article = un fichier Markdown dans src/content/articles/.
// Le texte sous l'en-tête est la description affichée sur la fiche.
const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    titre: z.string(),
    date: z.coerce.date(),
    // Laisser vide pour afficher « Sur devis ».
    prix: z.number().optional(),
    vendu: z.boolean().default(false),
    bois: z.string().optional(),
    dimensions: z.string().optional(),
    // Chemins des photos, la première sert de vignette (ex. /uploads/table.jpg).
    photos: z.array(z.string()).default([]),
  }),
});

export const collections = { articles };
