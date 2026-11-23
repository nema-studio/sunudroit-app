# 11 · Décisions

Journal des décisions d'architecture et de produit. Une décision n'est jamais effacée : si elle change,
on ajoute une nouvelle décision qui la **remplace** et on l'indique.

**Statut** : ✅ validée par Mamadou · 💡 proposée, à valider.

| N° | Décision | Statut | Date |
|---|---|---|---|
| DEC-01 | Hors ligne d'abord : le corpus est livré en éditions SQLite complètes | 💡 | 22.11.2026 |
| DEC-02 | Backend en monolithe modulaire Spring Boot | 💡 | 22.11.2026 |
| DEC-03 | Charte : Inter seule, mouvement doux sans rebond | ✅ | 22.11.2026 |
| DEC-04 | Accueil V4 (recherche, Parcourir, Reprendre, Vérifier) | ✅ | 22.11.2026 |
| DEC-05 | Compte par e-mail et code à 6 chiffres, sans mot de passe ni téléphone | ✅ | 22.11.2026 |
| DEC-06 | Comptes dès le lancement, avec favoris synchronisés en V1 | ✅ | 22.11.2026 |
| DEC-07 | Corpus V1 : Constitution + loi organique 2016-23 ; base de travail : Conseil constitutionnel (2018) | ✅ | 22.11.2026 |
| DEC-08 | Signalements ouverts à tous, validation par l'équipe | 💡 (Q-01) | 22.11.2026 |
| DEC-09 | Back-office intégré au backend, en Thymeleaf + htmx | ✅ (interface web) · 💡 (technologie) | 22.11.2026 |
| DEC-10 | Hébergement sur un cloud européen géré | ✅ | 22.11.2026 |
| DEC-11 | Back-office protégé par comptes nominatifs, mot de passe et 2e facteur | 💡 | 22.11.2026 |
| DEC-12 | PostgreSQL, Flyway, contrat OpenAPI d'abord | 💡 | 22.11.2026 |
| DEC-13 | Une version d'article = un instantané complet | 💡 | 22.11.2026 |
| DEC-14 | Liens partagés vers une page web publique légère | 💡 | 22.11.2026 |
| DEC-15 | Dons en V2 | 💡 (Q-04) | 22.11.2026 |
| DEC-16 | API en anglais, domaine et base en français | 💡 | 22.11.2026 |
| DEC-17 | V1 : connexion par e-mail seul ; Google et Apple plus tard | ✅ | 22.11.2026 |

---

### DEC-01 · Hors ligne d'abord, corpus en éditions
- **Contexte** : connexions irrégulières et coûteuses ; un texte de loi doit rester lisible partout.
- **Décision** : l'app lit un fichier SQLite local (une « édition ») ; le serveur publie des éditions numérotées que l'app télécharge.
- **Conséquences** : lecture, recherche et vérification sans réseau ; le serveur peut tomber sans empêcher la lecture ; il faut une chaîne de publication fiable (contrôles, empreinte, bascule atomique).
- **Écarté** : API qui sert les articles un par un (inutilisable hors ligne, coût réseau).

### DEC-02 · Monolithe modulaire Spring Boot
- **Contexte** : développeur seul, budget limité, domaine encore jeune.
- **Décision** : une seule application Spring Boot, découpée en modules `corpus`, `atelier`, `compte`, `notification`, `don`, aux frontières vérifiées (Spring Modulith).
- **Conséquences** : un seul déploiement, une seule base ; on pourra extraire un module plus tard si besoin.
- **Écarté** : microservices (complexité d'exploitation sans bénéfice à cette échelle).

### DEC-03 · Charte typographique et mouvement ✅
- Inter seule ; hiérarchie par la taille et la graisse ; aucun `fontSize` dans les écrans ; animations douces, sans ressort ni rebond, via `theme/motion.ts`.
- Remplace l'usage de Bricolage Grotesque, Instrument Sans et JetBrains Mono, puis de Source Serif 4.

### DEC-04 · Nouvel accueil ✅
- Une action principale (recherche), tout le corpus visible (carte Constitution + tuiles), « Reprendre », « Vérifier une citation ». Pas de doublon avec la barre d'onglets.
- Remplace la pile de cartes animée de la maquette d'origine (E06).

### DEC-05 · Compte par e-mail ✅
- E-mail + code à 6 chiffres, sans mot de passe. Un seul parcours pour l'inscription et la connexion. Prénom obligatoire, nom facultatif, demandés seulement pour un nouveau compte.
- **Écarté** : SMS (coût par envoi, fraude aux numéros surtaxés, donnée plus sensible) ; mot de passe (réinitialisation, fuites).

### DEC-06 · Comptes dès le lancement ✅
- Le compte doit servir dès le premier jour : la synchronisation des favoris est donc en V1. Historique synchronisé en V2.

### DEC-07 · Corpus de la V1 ✅
- Constitution + loi organique n° 2016-23 relative au Conseil constitutionnel, avec leurs renvois.
- Base de développement : version annotée du Conseil constitutionnel (à jour au 11 mai 2018). Mamadou recherche et intègre les révisions suivantes dans le back-office. Lancement public conditionné à RG-30.

### DEC-08 · Signalements ouverts 💡
- Tout utilisateur peut signaler une erreur ; seule l'équipe modifie le corpus, après relecture (RG-34).
- À confirmer : Q-01.

### DEC-09 · Back-office intégré
- ✅ Une petite interface web d'administration.
- 💡 Technologie : pages générées par Spring Boot avec Thymeleaf et htmx (une seule application, sécurité par session, peu de JavaScript). **Écarté** : application React séparée (deux déploiements, authentification par jetons, plus de travail).

### DEC-10 · Cloud européen ✅
- Plateforme gérée (Clever Cloud ou Scaleway, Q-10), PostgreSQL géré, stockage objet, e-mails via un service européen.
- Conséquence : déclaration du transfert de données à la CDP (RG-82).

### DEC-11 · Sécurité du back-office 💡
- Comptes nominatifs (pas de compte partagé), mot de passe haché en Argon2id, 2e facteur par application d'authentification (TOTP), rôles, journal d'audit.

### DEC-12 · Données et contrat 💡
- PostgreSQL (contraintes d'exclusion pour les périodes, recherche plein texte en français, JSONB), migrations Flyway versionnées dans le dépôt.
- Contrat OpenAPI écrit en premier ; types de l'app générés depuis ce contrat.

### DEC-13 · Versions en instantanés 💡
- Chaque version stocke le texte complet ; les différences mot à mot sont calculées à l'affichage (E11, E13).
- **Écarté** : stocker des différences (fragile, illisible pour un relecteur, sans gain de place notable).

### DEC-14 · Page web publique des articles 💡
- `https://<domaine>/a/{articleId}` : texte en vigueur, version, source, bouton « Ouvrir dans l'app ». Sert les partages vers des personnes sans l'app.

### DEC-15 · Dons en V2 💡
- Les écrans E17 à E20 sont modélisés dès maintenant ; l'intégration Wave et Orange Money (contrats marchands, webhooks, reçus) vient après le lancement. À confirmer : Q-04.

### DEC-16 · Langue de l'API 💡
- Routes et champs JSON en anglais, comme le contrat d'authentification déjà codé dans l'app ; domaine Java et tables en français. Une table de correspondance figure dans [09](09-api.md).
- **Écarté** : tout en français (renommer le contrat déjà codé) ; tout en anglais (le domaine juridique est français, les termes « révision », « alinéa » n'ont pas d'équivalent exact).

### DEC-17 · E-mail seul en V1 ✅
- **Contexte** : Q-07. La maquette (E03) montre « Avec Google » et « Avec Apple ».
- **Décision** : la V1 ne propose que l'e-mail et le code à 6 chiffres (DEC-05). Les boutons Google et Apple sont retirés de l'app, sans mention « bientôt » : Apple refuse les fonctions visibles mais inactives.
- **Pourquoi** : ces connexions sont gratuites, mais elles coûtent du travail : passage d'Expo Go à une *development build*, vérification des jetons, fusion des comptes, révocation Apple à la suppression, deux parcours de plus à tester. On démarre le backend plus simplement.
- **Pour plus tard** : on ajoutera Google en priorité si des utilisateurs abandonnent à l'étape du code par e-mail. Proposer Google oblige à proposer aussi Apple sur iPhone (règle 4.8 de l'App Store).
- **Ce qui rend l'ajout facile** : un compte est identifié par son `id` (UUID), jamais par son adresse. Les connexions externes s'ajouteront dans une nouvelle table `identite_externe (fournisseur, sujet, utilisateur_id)`, sans migrer les comptes existants. Règle prévue : même adresse vérifiée par Google = même compte ; adresse masquée Apple = compte distinct.
