# 12 · Questions ouvertes

À trancher avant ou pendant le développement du backend. Quand une question est tranchée, on la déplace
dans [11 · Décisions](11-decisions.md) et on note ici la décision correspondante.

**Priorité** : 🔴 bloque le démarrage du backend · 🟠 à trancher avant la fin de la V1 · ⚪ peut attendre.

| N° | Question | Priorité | Options et recommandation |
|---|---|---|---|
| Q-01 | Les signalements sont-ils bien **validés par l'équipe** avant toute modification ? | 🔴 | Recommandé : oui (DEC-08). Sans validation, une erreur ou un acte malveillant s'afficherait comme « la loi ». |
| Q-02 | **Qui relit** le contenu juridique ? | 🔴 | Un juriste, un étudiant en droit avancé, une clinique juridique (UCAD) ou une association. RG-21 exige au moins deux personnes. |
| Q-03 | **Nom de domaine** | 🔴 | Nécessaire pour l'API, l'envoi des e-mails (SPF, DKIM, DMARC), la page publique et les mentions légales. |
| Q-04 | Dons en **V1 ou V2** ? | 🟠 | Recommandé : V2 (DEC-15). Les contrats marchands Wave et Orange Money prennent du temps. |
| Q-05 | Liste exacte des **révisions depuis 2018** | 🟠 | La compilation du Conseil constitutionnel s'arrête à la loi 2018-14, même si vie-publique.sn l'annonce « mise à jour avec la loi n° 2023-13 ». À intégrer : 2019-10, 2021-41, 2023-13 (une version cnra.sn va jusqu'à 2021-41) ; 2024-15 et proposition n° 17/2026 à vérifier. Source qui fait foi : Journal officiel. Le registre (`Amendment.integrationStatus`) suit l'avancement. |
| Q-06 | **Photo de profil** (E22) ? | ⚪ | Recommandé : non en V1 (initiales seulement). Une photo impose stockage, modération et données en plus. |
| Q-07 | ~~Boutons **« Avec Google » et « Avec Apple »** (E03)~~ | ✅ | **Tranchée** : retirés en V1, e-mail seul (DEC-17). |
| Q-08 | **Durée de conservation des reçus** de dons | 🟠 | Durée légale comptable au Sénégal à vérifier (souvent 10 ans). Conditionne RG-45. |
| Q-09 | **Outil de statistiques anonymes** | ⚪ | Options : aucun en V1, outil auto-hébergé respectueux de la vie privée, ou simples compteurs côté serveur. |
| Q-10 | **Hébergeur** précis | 🟠 | Clever Cloud (plateforme Java très simple) ou Scaleway (plus de contrôle, souvent moins cher). Les deux sont en France. |
| Q-11 | **Décisions du Conseil constitutionnel** : V2 ou plus tard ? | ⚪ | La maquette les montre (E08, E10). Le modèle les prévoit déjà (`TypeTexte.DECISION`, renvoi `CITE_PAR`). |
| Q-12 | Une révision peut-elle **déplacer un article** dans une autre division ? | ⚪ | Non rencontré à ce jour. Si oui, versionner le rattachement article-division. |
| Q-13 | **Android minimum** pris en charge | 🟠 | À fixer selon les téléphones les plus courants au Sénégal ; influence les tests et la taille de l'app. |
| Q-14 | Statistiques anonymes **activées par défaut** ou sur demande ? | 🟠 | À valider avec les exigences de la CDP ; recommandé : désactivées par défaut si le moindre doute existe. |
| Q-15 | **Structure juridique** qui porte le projet | 🔴 | Personne physique ou association : nécessaire pour la déclaration CDP, les mentions légales, les contrats Wave et Orange Money et les reçus de dons. |
| Q-16 | **Traduction** de l'interface en wolof et en anglais (E27) | ⚪ | Qui traduit et relit ? Les textes de loi restent en français (RG-14). |
| Q-17 | Écran de **bienvenue en plusieurs pages** (points de pagination de la maquette E02) ? | ⚪ | Décidé pour l'instant : une seule page (EC-09). |
| Q-18 | **Courriel de contact** (« Nous écrire », E28) et adresse d'envoi des codes | 🟠 | Dépend de Q-03. Ex. `contact@` et `ne-pas-repondre@`. |
