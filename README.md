# Branche : `web/feature/api/frontend-routes-implementation`

## Objectif

Implémenter l’ensemble des **routes API frontend** et connecter le frontend web à une logique métier complète via le **core backend**, incluant temps réel, tracking, dashboard et gestion des trajets.

---

## Ce qui a été construit

### API Frontend (Next.js)

* Création de nombreuses routes API (`/app/api/...`)
* Structuration par domaine :

  * trajets
  * réservations
  * notifications
  * locations
  * administration
* Introduction des **Server-Sent Events (SSE)** :

  * positions en temps réel
  * notifications

---

### Core & Logique métier

* Implémentation de services métiers :

  * dashboard (driver / passenger)
  * authentification
  * favoris
  * historique
  * suggestions de localisation
* Centralisation de la logique dans le `core`
* Mise en place d’un modèle orienté services

---

### Feature principale : trajet-en-cours

* Suivi temps réel des positions
* Hooks spécialisés :

  * `useRealtimePositions`
  * `useLocationEmitter`
* Synchronisation driver ↔ passenger

---

### Recherche & Matching

* Amélioration de l’algorithme (matchingV4)
* Suggestions dynamiques de localisation
* Expérience utilisateur enrichie

---

### Dashboard

* Refactor complet :

  * driver
  * passenger
* Composants modulaires
* Gestion des états via hooks et services

---

### Notifications

* Système temps réel via SSE
* Composants UI dédiés
* Factory de notifications côté core

---

### Tests

* Extension massive des tests
* Couverture des nouvelles features
* Mise à jour des fixtures

---

### Maintenance & outils

* Suppression des anciens scripts auto-commit
* Ajout de scripts DB :

  * seed
  * clean
* Normalisation du repo (.gitignore)

---

## Breaking Changes

* Toutes les routes protégées nécessitent désormais `[id]`
* Refactor complet des accès aux données
* Changement structurel des pages Next.js

---

## Résultat final

Le frontend web est maintenant :

Connecté au backend via API
Temps réel (positions + notifications)
Structuré et scalable
Aligné avec une architecture core propre
Prêt pour intégration mobile

---

## Prochaine étape

* Intégration Mobile / Frontend
* Stabilisation backend core
* Distribution des services

---

## Insight

Cette branche marque le passage d’un frontend isolé à un **système applicatif complet piloté par API et logique métier centralisée**.
