# Claude SEO et Better SEO

## Conclusion

Better SEO embarque le dépôt public Claude SEO, épinglé à la révision `92795530b4cc92c6bf7a2435b82c15b003e71181`. La version déclarée reste **2.3.1**. La comparaison avec la révision précédemment intégrée, `55c7914a3ed2869b217b5d5f360a4e7ba28b4848`, montre uniquement une modification de configuration Dependabot : regroupement des mises à jour mineures/correctives de GitHub Actions, fréquence mensuelle et réduction du nombre de demandes ouvertes. Il ne s’agit donc pas d’un nouveau moteur d’analyse SEO. [1][2]

Le principal écart était dans l’exploitation du dépôt par l’application. Lire les instructions d’un spécialiste ne collecte pas les données nécessaires à son analyse. Cette mise à jour ajoute des contrôles déterministes sur les preuves enregistrées, une inspection Google limitée à la page d’entrée du projet, des instantanés cohérents pour une réponse et un catalogue de vingt demandes. Elle conserve les restrictions des sources gratuites et ne transforme pas une recommandation en résultat mesuré.

## Ce que contient réellement le dépôt

La version publique décrit 25 skills et 18 agents spécialisés, avec des scripts Python, des références et des extensions facultatives. Le bundle de Better SEO comprend 188 documents Markdown avec identifiants, empreintes SHA-256 et révision Git. Les instructions sont lues progressivement ; les fichiers complets restent dans le sous-module. La licence MIT est conservée. [3]

Le changelog 2.3.1 mentionne notamment un repli optionnel Open PageRank pour un indicateur de domaine, des choix de modèles pour certains agents Claude, l’enregistrement du détecteur de métadonnées dans le lanceur, des corrections d’installateurs PowerShell et de diagnostics du runtime. Le projet amont précise que le chemin API Open PageRank n’a pas été validé avec un compte réel lors de cette contribution. Cette présence documentaire ne justifie ni d’activer un fournisseur supplémentaire dans Better SEO, ni de présenter un score d’autorité comme déjà disponible. [4]

Les corrections de la version 2.3.0 comprennent des protections réseau contre les proxys privés et des contrôles de métadonnées répétitives. Better SEO utilise son propre collecteur TypeScript, avec validation HTTPS, contrôle des adresses DNS et épinglage de l’adresse au socket. Les protections Python ne remplacent pas celles du serveur Next.js ; elles concernent un autre chemin d’exécution. [4]

Les déclarations `model: opus` des agents amont ne sont pas appliquées dans Better SEO : le fournisseur direct configuré dans l’application reste celui demandé pour le projet. Les commandes shell, les MCP facultatifs et la délégation Claude Code ne deviennent pas automatiquement des outils AI SDK. Le serveur ne permet pas au modèle d’exécuter un script ou une URL arbitraire.

## Lecture du cover.svg

Le cover a été examiné dans le dépôt et rendu visuellement. Son animation contient cinq exemples de commandes et sept questions autour du globe. Ces exemples décrivent des intentions ; ils ne constituent pas des preuves de disponibilité de données ou de performances. [5]

| Élément du cover | Parcours Better SEO | Livrable et limite |
|---|---|---|
| Audit my website | Audit complet | Constats avec URL, preuves, priorité et validation ; couverture du crawl explicitée |
| Schema example.com | Données structurées | JSON-LD observé puis corrections ; éligibilité Google à vérifier |
| Geo my homepage | Visibilité IA | Réponses et entités plus claires ; aucune citation IA mesurée sans source |
| Content my blog | Qualité éditoriale | Relecture E-E-A-T et contenu ; rédaction complète via la tâche distincte de rédaction |
| Backlinks rival.com | Analyse de liens | CSV GSC du propre site ; profil concurrent indisponible sans données fournies |
| How to rank #1? | Stratégie mesurable | Plan de travail et indicateurs, sans promesse de première place |
| What is E-E-A-T? | Qualité éditoriale | Explication contextualisée et preuves à vérifier, sans score fabriqué |
| Build backlinks? | Acquisition de liens | Pistes pertinentes et critères de sélection ; aucune prise de contact automatique |
| Core Web Vitals? | Performance | PageSpeed laboratoire et CrUX terrain, clairement séparés |
| Get cited by AI? | Visibilité IA | Préparation éditoriale et protocole d’observation, sans garantie d’inclusion |
| Do I need schema? | Données structurées | Choix selon le contenu visible et les fonctions Google pertinentes |
| What is GEO? | Visibilité IA | Explication, analyse de page et actions vérifiables |

Les vingt suggestions couvrent aussi les sitemaps, images, opportunités GSC, comparaisons concurrentielles de contenu, briefs, regroupements de sujets, hreflang, SEO local, produits et pages à grande échelle. Elles préparent une demande modifiable avant envoi. Leurs indications de sources expriment des prérequis, pas un état de connexion détecté.

## Intégration appliquée

### Collecte et qualité des preuves

Le collecteur conserve désormais la langue HTML, la hiérarchie des titres, les destinations hreflang, un échantillon de blocs JSON-LD, les attributs d’images et les métadonnées sociales. Les anciens audits restent lisibles : un champ absent est traité comme non mesuré, pas comme un défaut du site. Les contenus volumineux sont bornés. Une valeur `alt` vide peut être correcte pour une image décorative ; une taille de fichier n’est pas déduite de ses dimensions HTML.

La découverte suit au maximum trois documents XML de sitemap sur la même origine, y compris des index. Le crawl garde sa limite de seize pages, son respect de robots.txt et son délai global. Cette architecture convient à une première analyse échantillonnée ; elle n’est pas un crawler exhaustif de milliers d’URL. Une page absente de l’échantillon ne devient ni une page supprimée ni une page orpheline confirmée.

Une requête URL Inspection est ajoutée par audit lorsqu’une propriété GSC est sélectionnée et que l’autorisation Google est disponible. Elle porte sur l’URL d’entrée du projet. Le code vérifie l’appartenance à une propriété de domaine ou à un préfixe avant d’appeler l’API. Google fournit ici l’état de sa version indexée, pas un test de l’URL en direct, et accepte le scope `webmasters.readonly`. [6]

### Analyses calculées

Le nouvel outil `analyzeAudit` propose huit facettes : technique, schéma, international, maillage, contenu, images, opportunités et dérive. Ses sorties contiennent les observations, leur portée et une interprétation prudente. Aucun score global de qualité ou de potentiel de trafic n’est produit par ces calculs.

La vérification hreflang conserve les URL alternatives et examine les liens retour uniquement lorsque les deux pages ont été collectées. Google demande des URL complètement qualifiées et des références réciproques, comprenant la version elle-même. Les variantes non visitées sont identifiées comme non vérifiées. [7]

L’analyse de maillage recense les liens entrants dans l’échantillon et les destinations dont une erreur HTTP a été effectivement observée. Elle ne qualifie pas automatiquement les URL non visitées de liens cassés. L’analyse JSON-LD distingue syntaxe et éligibilité : des données syntaxiquement correctes ne garantissent pas un résultat enrichi, et leur contenu doit correspondre à la page visible. [8]

Les opportunités GSC reprennent un critère transparent : au moins cent impressions et une position moyenne entre quatre et vingt, puis un tri par impressions. Ce seuil est une heuristique de sélection, pas un benchmark universel. La différence de clics n’est calculée que si la même paire requête/page existe dans les deux échantillons. Une ligne manquante reste inconnue, car les données Search Analytics peuvent être partielles. [9]

Le suivi compare les deux derniers audits terminés : statut HTTP, title, description, canonical, robots, H1 et types structurés. Une différence est un changement observé, pas une preuve de causalité SEO. Une présence nouvelle ou une absence est explicitement qualifiée par rapport au crawl échantillonné.

### Cohérence des réponses

Chaque réponse utilise une paire fixe d’audits. Un audit lancé en parallèle ne peut donc pas changer les preuves au milieu de la réponse. La première étape de l’agent impose une consultation des preuves du projet. Les identifiants du projet et les deux instantanés sont déterminés côté serveur après contrôle de propriété ; le modèle ne peut pas sélectionner le projet d’un autre utilisateur.

Les outils de lecture des skills restent limités au bundle autorisé. La rédaction conserve copywriting et humanizer, avec sortie Markdown et exports existants. Les analyses stratégiques demandent un constat, une URL, une modification et un test ; les articles et landing pages gardent leur propre structure éditoriale plutôt qu’un tableau d’audit imposé partout.

## Audit SEO de Better SEO

Les treize URL du sitemap public ont été récupérées et analysées sur leur HTML serveur. Toutes répondaient en HTTP 200, avec un H1 et une URL canonique. Aucune rupture de réciprocité hreflang n’a été identifiée dans cet ensemble. Les résultats sont conservés dans `SEO-PUBLIC-AUDIT-2026-09-12.json` ; il s’agit du relevé avant publication des corrections de cette révision.

Les deux index de ressources répétaient la marque dans le title, car le titre de page et le modèle du layout ajoutaient chacun Better SEO. Le titre est maintenant absolu. Le titre de la page d’accueil décrit les audits et la stratégie de contenu basés sur les données Google. Les repères numériques sans valeur séquentielle ont été retirés de la liste des guides.

Le runtime Python officiel a été préparé sans navigateur. Le script `metadata_template.py` a été exécuté sur les treize couples title/description publics. Il n’a détecté aucun couple correspondant à sa signature précise de métadonnées répétitives. Le fichier `CLAUDE-SEO-METADATA-AUDIT.json` conserve ce résultat. Ce test heuristique n’évalue ni toute la qualité éditoriale, ni les positions Google, ni les conversions. [10]

Le nombre de mots des guides observés est de l’ordre de quelques centaines. Ce nombre ne constitue pas à lui seul un critère de qualité. Les améliorations éditoriales futures doivent apporter des exemples réels, des procédures vérifiées et des réponses à une demande observée, plutôt que gonfler les textes ou créer des variantes artificielles. Google privilégie le contenu utile à son public et avertit contre la production destinée principalement à manipuler le classement. [11]

## Couverture restante et priorités

| Domaine | État effectif | Prochaine validation utile |
|---|---|---|
| HTML et métadonnées | Collecte et analyses bornées implémentées | Audit d’un projet représentatif après déploiement |
| GSC / GA4 | Connecteurs et historique présents | Session propriétaire, propriétés et appels Google réels |
| Inspection Google | Appel ajouté pour l’URL d’entrée | Autorisation et résultat réel sur la propriété du projet |
| Performance | PageSpeed et CrUX existants | Mesures avec clés valides, distinction terrain/laboratoire |
| Rédaction | Agent, skills et exports présents | Réponse réelle et relecture des faits |
| Concurrents | Pages publiques sélectionnées | Étendre le corpus fourni, sans déduire leur trafic privé |
| Backlinks | Import CSV GSC | CSV réel du propriétaire ; pas d’index concurrent exhaustif |
| Local / Maps | Méthode et demandes guidées | Données GBP fournies ; aucune géogrille automatique |
| E-commerce | Analyse du contenu et balisage observés | Catalogue et données Merchant Center vérifiées |
| Monitoring | Comparaison de deux instantanés | Deux audits terminés sur le même projet |
| Rendu JavaScript | Non exécuté par le crawler serveur | Architecture de travailleur dédié si cette couverture devient nécessaire |
| Mobile et parcours privés | Pas de nouvelle validation complète | Session sécurisée et navigateur offrant les dimensions nécessaires |

Le précédent essai de connexion a retourné une erreur générique. Les contrôles publics de configuration avaient confirmé l’activation de l’assistant, mais cela ne prouve pas une génération réussie. Cette distinction reste valable après les changements : les tests de code ne remplacent pas l’essai connecté. Aucune session privée, mesure Google ou réussite de génération n’a été fabriquée.

Les prochains gains de maturité les plus importants sont la validation des parcours connectés, une collecte approfondie asynchrone pour les grands sites, puis la mesure des actions réalisées. Les fonctionnalités nécessitant des sources commerciales, un accès GBP approuvé ou un navigateur distant doivent rester explicitement dépendantes de ces accès. Installer davantage de fichiers de méthode ne supprime pas ces dépendances.

## Publication

La branche de travail publiée doit désormais être `master`. Elle est consolidée à partir de la version déjà présente sur `main`, qui était en avance de trois commits et ne contenait aucune divergence de `master` au moment du contrôle. Les nouveaux changements ne nécessitent aucun push sur `main`. La branche de production configurée dans Vercel reste un paramètre distinct de la branche Git : un build de `master` ne doit pas être présenté comme une mise en production sans vérification du domaine servi.

## Sources

1. AgriciDaniel, [comparaison des deux révisions](https://github.com/AgriciDaniel/claude-seo/compare/55c7914a3ed2869b217b5d5f360a4e7ba28b4848...92795530b4cc92c6bf7a2435b82c15b003e71181), consultée les 11–12 septembre 2026.
2. AgriciDaniel, [commit 9279553](https://github.com/AgriciDaniel/claude-seo/commit/92795530b4cc92c6bf7a2435b82c15b003e71181).
3. AgriciDaniel, [README à la révision intégrée](https://github.com/AgriciDaniel/claude-seo/blob/92795530b4cc92c6bf7a2435b82c15b003e71181/README.md).
4. AgriciDaniel, [Changelog 2.3.1 et 2.3.0](https://github.com/AgriciDaniel/claude-seo/blob/92795530b4cc92c6bf7a2435b82c15b003e71181/CHANGELOG.md), versions datées du 10 septembre 2026.
5. AgriciDaniel, [cover.svg](https://github.com/AgriciDaniel/claude-seo/blob/92795530b4cc92c6bf7a2435b82c15b003e71181/assets/cover.svg).
6. Google, [URL Inspection: index.inspect](https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect), documentation consultée le 11 septembre 2026.
7. Google, [Localized versions of your pages](https://developers.google.com/search/docs/specialty/international/localized-versions).
8. Google, [General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).
9. Google, [Search Analytics query](https://developers.google.com/webmaster-tools/v1/searchanalytics/query).
10. AgriciDaniel, [metadata_template.py](https://github.com/AgriciDaniel/claude-seo/blob/92795530b4cc92c6bf7a2435b82c15b003e71181/scripts/metadata_template.py).
11. Google, [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).
