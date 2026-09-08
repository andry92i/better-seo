# Better SEO — interfaces

## Pages

- / : landing page, présentation du produit, démonstration et FAQ.
- /login et /signup : formulaires reliés au client Better Auth.
- /onboarding : questionnaire de personnalisation et préparation de la démo.
- /dashboard : synthèse de démonstration.
- /dashboard/keywords : recherche, filtre d’intention, tri par position et demande IA préremplie.
- /dashboard/competitors : exemples comparatifs et liste de domaines stockée dans le navigateur.
- /dashboard/audit : priorités filtrables et détails des corrections.
- /dashboard/content : tableau éditorial avec déplacement entre colonnes.
- /dashboard/backlinks : profil de liens illustratif.
- /dashboard/local : checklist de préparation locale.
- /dashboard/reports : export d’un exemple en MD, DOCX et XLSX.
- /dashboard/integrations : état explicite des connecteurs et préparation requise.
- /dashboard/settings : URL, rôle, questionnaire et thème clair/sombre.
- /workspace/[action] : assistant existant avec instructions Claude SEO et exports.

## Fonctionnement

Les composants UI existants servent de base : Button, Input, Card, Badge et Progress.
Les tableaux utilisent du HTML sémantique. La navigation mobile est ouvrable et refermable.
Les formulaires ont des libellés et les états vides/erreurs sont présentés dans les pages.

Les données SEO sont fictives. Le tableau éditorial et la checklist locale sont temporaires.
Le contexte du projet et les concurrents sont persistés par Zustand dans le navigateur.
La page de connexion nécessite la configuration Better Auth et PostgreSQL.
Les connecteurs Google et les fournisseurs SEO ne sont pas implémentés par ce travail UI.

## Vérification et aperçu

Exécuter pnpm lint, pnpm build et pnpm test:seo.
Pour travailler normalement : pnpm dev.
Le lanceur local Sites ajoute --strictPort ; scripts/dev.mjs traduit ses arguments et
sert le build avec next start pour éviter une incompatibilité de télémétrie de next dev
dans cet environnement. Exécuter pnpm build avant sites-preview start.
Cet aperçu local est destiné au navigateur de contrôle, pas à une URL publique.
