# Architecture

## Parcours

Better Auth crée les comptes et sessions PostgreSQL. Les layouts privés vérifient la session. Chaque route de projet, conversation, audit et import vérifie l’utilisateur propriétaire ; les mutations vérifient aussi l’origine.

Le questionnaire crée ou modifie un projet en base. Son brouillon est conservé dans la session du navigateur pendant le retour OAuth, associé à l’utilisateur et expirant après 30 minutes. TanStack Query charge la liste des projets puis les détails du projet sélectionné ; Zustand conserve uniquement la sélection en mémoire.

## Collecte

`runAudit` enregistre un audit CRAWLING avec exclusion des audits déjà actifs dans une transaction sérialisable. Les sources indépendantes sont collectées en parallèle : HTML, GSC, GA4, PageSpeed/CrUX et pages concurrentes. Chaque source conserve un statut ; l’échec d’une source ne fabrique pas de données pour les autres.

Le crawler borne le nombre de pages, les délais, les redirections et la taille de réponse. Il vérifie les adresses DNS publiques et fixe l’adresse vérifiée sur la connexion HTTPS pour éviter le rebinding DNS. Robots.txt est respecté. Les limites et erreurs sont enregistrées.

Les preuves et constats sont enregistrés dans Audit/Finding. Les constats disposent d’un état OPEN/DONE modifiable par une action authentifiée next-safe-action. Un audit COMPLETE signifie que des données ont été collectées, pas que toutes les sources sont exhaustives ou que le site a passé tous les contrôles.

## Analyse et contenus

L’agent AI SDK utilise xAI directement avec Grok. Il dispose de trois outils : recherche documentaire, lecture documentaire paginée et lecture des preuves du projet autorisé. Les sources volumineuses sont paginées. Le contexte récupéré est traité comme non fiable ; il n’accorde aucun droit supplémentaire.

Les messages sont persistés ; l’historique provient du serveur et ne fait pas confiance aux messages système ou résultats d’outils envoyés par le client. Les exports contiennent le texte affiché. Word applique les niveaux de titres ; Excel conserve les valeurs comme chaînes, y compris celles commençant par un signe égal.

## Stockage et exploitation

Prisma 6.19.3 utilise le moteur standard pour PostgreSQL direct et l’extension Accelerate pour les URL Prisma. La génération du client est faite au build. Les modèles métiers existants sont conservés ; aucune suppression de données ni reset de base n’est nécessaire pour cette mise à jour.

Les preuves complètes restent en base. L’API du dashboard retourne un extrait borné pour éviter des réponses massives sur Vercel. Aucun token Google ni secret de fournisseur n’est renvoyé au navigateur.

L’exécution des audits reste synchrone et bornée à la durée de la fonction Vercel. Une interruption nécessite une relance ; le verrou expire après cinq minutes. Ce n’est pas encore une file de jobs durable, un ordonnanceur automatique ou un système de facturation multi-client.
