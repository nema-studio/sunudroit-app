# 07 · Cycles de vie

Chaque diagramme décrit les états possibles d'un objet et ce qui le fait changer d'état.
Une transition absente du diagramme est **interdite** : le backend doit la refuser.

---

## 1. Saisie éditoriale (version d'article, intitulé de division, renvoi, note)

Champ : `statut_editorial`. Règles : RG-20, RG-21, RG-22, RG-25.

```mermaid
stateDiagram-v2
    [*] --> Brouillon : saisie ou import
    state "En relecture" as EnRelecture
    state "Validée" as Validee
    state "Publiée" as Publiee
    state "Abandonnée" as Abandonnee

    Brouillon --> EnRelecture : l'auteur soumet
    Brouillon --> Abandonnee : l'auteur abandonne
    EnRelecture --> Validee : un relecteur différent de l'auteur valide
    EnRelecture --> Brouillon : le relecteur renvoie avec un commentaire
    Validee --> Publiee : incluse dans une édition publiée
    Validee --> Brouillon : correction avant publication (nouvelle relecture obligatoire)
    Publiee --> [*]
    Abandonnee --> [*]

    note right of Publiee
        Immuable. Une correction crée
        une NOUVELLE saisie qui refait
        tout le cycle (RG-06).
    end note
```

---

## 2. Révision (registre)

Deux dimensions indépendantes : le **statut juridique** (ce que dit le droit) et le **statut d'intégration** (où en est l'équipe).

```mermaid
stateDiagram-v2
    direction LR
    state "Statut juridique" as J {
        state "En projet" as EnProjet
        state "Promulguée" as Promulguee
        state "Censurée" as Censuree
        [*] --> EnProjet : projet ou proposition connu
        [*] --> Promulguee : loi déjà publiée au JO
        EnProjet --> Promulguee : promulgation et publication
        EnProjet --> Censuree : décision du Conseil constitutionnel
        EnProjet --> [*] : abandon du projet (retiré du registre)
    }
```

```mermaid
stateDiagram-v2
    direction LR
    state "À intégrer" as AIntegrer
    state "En cours" as EnCours
    state "Intégrée" as Integree
    [*] --> AIntegrer : révision enregistrée
    AIntegrer --> EnCours : première saisie d'un effet
    EnCours --> Integree : tous les effets saisis et validés
    Integree --> EnCours : erreur découverte (nouvelle saisie)
    Integree --> [*]

    note right of AIntegrer
        Seule une révision PROMULGUÉE
        peut quitter « À intégrer ».
        Une révision CENSURÉE reste
        consultable, sans effet (RG-09).
    end note
```

---

## 3. Version d'article (statut affiché à l'utilisateur)

Ce statut n'est **pas stocké** : il se déduit des dates et du champ `abrogee` au moment de l'affichage.

```mermaid
stateDiagram-v2
    direction LR
    state "Future" as Future
    state "En vigueur" as EnVigueur
    state "Ancienne" as Ancienne
    state "Abrogée" as Abrogee

    [*] --> Future : valide_du postérieure à aujourd'hui
    [*] --> EnVigueur : valide_du passée, valide_au vide
    Future --> EnVigueur : la date d'entrée en vigueur arrive
    EnVigueur --> Ancienne : une version suivante entre en vigueur
    EnVigueur --> Abrogee : version d'abrogation entre en vigueur
    Ancienne --> [*]
    Abrogee --> [*]
```

| Statut | Badge (E10, E11) | Couleur |
|---|---|---|
| En vigueur | « ● EN VIGUEUR » | Vert |
| Ancienne | « ANCIENNE » | Gris |
| Abrogée | « ABROGÉ » | Corail |
| Future | « EN VIGUEUR LE … » | Jaune |

---

## 4. Édition du corpus (serveur)

```mermaid
stateDiagram-v2
    direction LR
    state "En préparation" as EnPreparation
    state "Publiée" as Publiee
    state "Retirée" as Retiree

    [*] --> EnPreparation : l'administrateur lance une édition
    EnPreparation --> Publiee : fichier généré, empreinte calculée, contrôles passés
    EnPreparation --> [*] : échec des contrôles (rien n'est publié)
    Publiee --> Retiree : erreur grave découverte
    Retiree --> [*]

    note right of Retiree
        Une édition retirée n'est plus
        proposée. On publie aussitôt une
        édition corrigée de numéro supérieur :
        on ne revient jamais en arrière (RG-22).
    end note
```

**Contrôles avant publication** : aucune version validée ne se chevauche ; tous les renvois pointent vers des textes présents ;
toutes les révisions citées existent ; chaque article a une version en vigueur ou abrogée ; le fichier s'ouvre et l'index de
recherche répond.

---

## 5. Mise à jour de l'édition (téléphone)

```mermaid
stateDiagram-v2
    state "À jour" as AJour
    state "Mise à jour disponible" as Disponible
    state "Téléchargement" as Telechargement
    state "En attente de connexion" as Attente
    state "Vérification" as Verification
    state "Installation" as Installation
    state "App trop ancienne" as TropAncienne

    [*] --> AJour
    AJour --> Disponible : nouvelle édition annoncée (notification ou vérification quotidienne)
    Disponible --> TropAncienne : version_app_min non satisfaite (RG-27)
    Disponible --> Telechargement : réseau disponible
    Telechargement --> Attente : coupure réseau
    Attente --> Telechargement : réseau retrouvé (reprise)
    Telechargement --> Verification : fichier complet
    Verification --> Installation : empreinte correcte
    Verification --> Disponible : empreinte incorrecte (nouvel essai plus tard)
    Installation --> AJour : bascule atomique réussie
    Installation --> AJour : échec, l'ancienne édition reste active
    TropAncienne --> AJour : l'utilisateur met l'app à jour
```

L'écran E34 montre les états « Disponible », « Téléchargement » (64 %) et « En attente de connexion ».

---

## 6. Demande de code de connexion

```mermaid
stateDiagram-v2
    direction LR
    state "Émise" as Emise
    state "Vérifiée" as Verifiee
    state "Expirée" as Expiree
    state "Bloquée" as Bloquee

    [*] --> Emise : POST /auth/email/request
    Emise --> Emise : code faux (essais + 1, moins de 5)
    Emise --> Verifiee : code juste
    Emise --> Expiree : 10 minutes écoulées
    Emise --> Bloquee : 5e code faux
    Emise --> Expiree : nouvelle demande pour la même adresse
    Verifiee --> [*]
    Expiree --> [*]
    Bloquee --> [*]
```

---

## 7. Session dans l'application

```mermaid
stateDiagram-v2
    state "Chargement" as Chargement
    state "Visiteur" as Visiteur
    state "Connecté, nom à compléter" as NomACompleter
    state "Connecté" as Connecte

    [*] --> Chargement : lancement
    Chargement --> Visiteur : aucune session enregistrée
    Chargement --> Connecte : session valide
    Chargement --> Visiteur : session d'un ancien format ou invalide (effacée)
    Visiteur --> NomACompleter : code vérifié, nouveau compte
    Visiteur --> Connecte : code vérifié, compte existant
    NomACompleter --> Connecte : prénom enregistré
    NomACompleter --> Visiteur : déconnexion
    Connecte --> Visiteur : déconnexion
    Connecte --> Visiteur : compte supprimé
    Connecte --> Visiteur : rafraîchissement refusé (session révoquée)
```

En cas de rafraîchissement impossible **faute de réseau**, l'utilisateur reste « Connecté » : il garde ses favoris locaux,
la synchronisation reprendra plus tard.

---

## 8. Signalement

```mermaid
stateDiagram-v2
    state "Nouveau" as Nouveau
    state "En examen" as EnExamen
    state "Accepté" as Accepte
    state "Corrigé" as Corrige
    state "Refusé" as Refuse
    state "Doublon" as Doublon

    [*] --> Nouveau : envoi depuis l'app
    Nouveau --> EnExamen : un éditeur le prend
    Nouveau --> Doublon : rattaché à un signalement existant
    EnExamen --> Accepte : erreur avérée
    EnExamen --> Refuse : conforme au Journal officiel (motif obligatoire)
    EnExamen --> Doublon : rattaché
    Accepte --> Corrige : la correction est publiée dans une édition
    Corrige --> [*]
    Refuse --> [*]
    Doublon --> [*]
```

L'auteur, s'il a laissé un contact, reçoit un e-mail à l'entrée dans « Refusé » et dans « Corrigé » (RG-33).

---

## 9. Don (V2)

```mermaid
stateDiagram-v2
    state "Initié" as Initie
    state "En attente de confirmation" as EnAttente
    state "Confirmé" as Confirme
    state "Échoué" as Echoue
    state "Expiré" as Expire
    state "Annulé" as Annule

    [*] --> Initie : POST /donations
    Initie --> EnAttente : session de paiement créée chez le prestataire
    Initie --> Echoue : prestataire indisponible
    EnAttente --> Confirme : notification de paiement signée et vérifiée
    EnAttente --> Echoue : refus du prestataire
    EnAttente --> Annule : annulation dans Wave ou Orange Money
    EnAttente --> Expire : 15 minutes sans confirmation
    Confirme --> [*] : reçu généré
    Echoue --> [*]
    Annule --> [*]
    Expire --> [*]
```

Les états finaux « Échoué », « Annulé » et « Expiré » s'affichent sur E19 avec « non débité » et la référence.
Seul le prestataire fait passer un don à « Confirmé » (RG-61).

---

## 10. Compte utilisateur

```mermaid
stateDiagram-v2
    direction LR
    state "Actif" as Actif
    state "Suppression demandée" as Demandee
    state "Purgé" as Purge

    [*] --> Actif : premier code vérifié
    Actif --> Demandee : DELETE /me (confirmation « SUPPRIMER »)
    Demandee --> Purge : 30 jours écoulés (tâche CU-40)
    Purge --> [*]

    note right of Demandee
        Connexion impossible, données
        invisibles. Une nouvelle inscription
        avec la même adresse crée un
        nouveau compte vide.
    end note
```
