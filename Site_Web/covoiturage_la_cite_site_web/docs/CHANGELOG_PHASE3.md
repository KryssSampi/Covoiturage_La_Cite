# Changelog — Phase 3 : Refactoring carte & favoris unifiés

## Résumé

Refactoring majeur de la carte temps réel, harmonisation des favoris à travers
l'application, synchronisation de la progression, et remplacement de tous les
emojis par des icônes React.

---

## Nouveaux fichiers

| Fichier | Rôle |
|---|---|
| `shared/types/lieu-favori.types.ts` | Type unifié `LieuFavoriUnifie` + `LieuFavoriIconTag` |
| `shared/fixtures/favoris.fixtures.ts` | Source unique de vérité des lieux favoris (`FIXTURE_LIEUX_FAVORIS`) |
| `shared/utils/lieu-favori-icon.tsx` | Résolution `iconTag` → composant React-icon (`getLieuFavoriIcon`) |

---

## Modifications

### 1. Emojis → React Icons (`react-icons/fa`)

**Fichiers modifiés :**
- `features/map-service/constants/index.ts` — `ZONES_CAMPUS` : 🏫→EP, 🅿️→PA/PB/PC, 🚌→BUS, 📚→BIB, 🏋️→GYM
- `features/map-service/markers/index.ts` — `gasStationSVG` et `domicileSVG` : emojis `<text>` remplacés par des formes SVG propres
- `features/trajet-en-cours/components/TrajetMap.tsx` — Tous les boutons et la légende : 🎯→`FaCrosshairs`, 🚗/↑→`FaCar`/`FaArrowUp`, 🔄→`FaSyncAlt`, 🏁→`FaFlagCheckered`, 🚌→`FaBus`, ⛽→`FaGasPump`, 📍→`FaMapMarkerAlt`, 📋→`FaList`, 🎓→`FaGraduationCap`

### 2. Auto-recentrement désactivé par défaut

- `TrajetMap.tsx` : `autoCenter` initialisé à `false`
- Le recentrement ne se fait que si on clique sur le bouton (qui recentre immédiatement + active le suivi)

### 3. Favoris toujours visibles sur la carte

- `TrajetMap.tsx` : Couche de marqueurs favoris ajoutée (itération sur `FIXTURE_LIEUX_FAVORIS`)
- Marqueurs `favoriSVG` (étoile dans un teardrop) avec couleur par `iconTag`
- Popup affichant pseudonyme + adresse
- Visibles quel que soit le niveau de zoom

### 4. Boutons off-screen : campus + domicile uniquement

- `TrajetMap.tsx` : `initOffScreenButtons` limité à 2 cibles (Campus La Cité + Mon domicile)
- Coordonnées tirées de `FIXTURE_LIEUX_FAVORIS`

### 5. Zoom-dependent & viewport filtering

- Déjà implémenté dans les couches `overpass.ts` (bus≥14, gas≥13) et `campus.ts` (polygone≥13, zones≥15)
- Les POI ne sont requêtés que dans la zone visible de la carte (bbox)

### 6. Polylines OSRM (routes réalistes)

**Fichier modifié :** `features/trajet-en-cours/fixtures/map.fixtures.ts`
- `genPolyline()` (courbes de Bézier aléatoires) remplacé par `fetchOsrmPolyline()` (appel OSRM)
- Fallback en ligne droite interpolée si OSRM échoue
- `genererNouvelleFixtureMap()` est devenu `async`

**Fichier modifié :** `features/trajet-en-cours/hooks/useTrajetMap.ts`
- Pré-génération async (ref `preGenRef` pour éviter les doublons)
- Chargement du prochain trajet via `await genererNouvelleFixtureMap()`

### 7. Synchronisation ProgressionSection ↔ TrajetMap

**Fichiers modifiés :**
- `features/trajet-en-cours/types/map.types.ts` — `TrajetMapProps.trajetHook` ajouté
- `features/trajet-en-cours/types/progression-signalement.types.ts` — `ProgressionSectionProps.mapState` ajouté
- `features/trajet-en-cours/components/TrajetMap.tsx` — Accepte `trajetHook` externe (hook levé dans le parent)
- `features/trajet-en-cours/components/ProgressionMessagerie.tsx` — Quand `mapState` est fourni, dérive la progression depuis l'état de la carte (%, distance, ETA, statuts d'étapes)
- `features/trajet-en-cours/components/TrajetEnCoursPage.tsx` — `useTrajetMap` levé dans le parent, état partagé entre `TrajetMap` et `ProgressionSection`

### 8. Type favoris unifié + fixture unique

**Type `LieuFavoriUnifie` :**
- `id`, `pseudonyme`, `adresse`, `coordonnees: {lat, lng}`, `iconTag`, `isAnchored?`, `hasOffScreenButton?`

**Fixture `FIXTURE_LIEUX_FAVORIS` :**
- Campus La Cité (ancré, chapeau de diplomé, coordonnées exactes Ottawa)
- Domicile, Travail, Gatineau, Montreal

### 9. Dashboard favoris → autofill départ

**Fichiers modifiés :**
- `features/dashboard/hooks/useFavorites.ts` — `handleAutofill(value, coordonnees?)` dispatch les coordonnées dans l'événement
- `features/dashboard/hooks/useSuperSearch.ts` — Écoute `gero-search-section-autofill` → remplit le **départ** (pas l'arrivée) + stocke les coordonnées GPS
- `features/dashboard/components/shared/favorites.section.tsx` — Utilise `FIXTURE_LIEUX_FAVORIS`, `getLieuFavoriIcon`, passe les coordonnées au clic

### 10. SuperSearch harmonisé

**Fichiers modifiés :**
- `features/dashboard/components/shared/supersearch.section.tsx` — `DEFAULT_FAV_DESTINATIONS` généré depuis `FIXTURE_LIEUX_FAVORIS` (plus d'adresses Paris)
- `features/dashboard/types/search.types.ts` — `FavDestination.coordonnees?` ajouté

---

## Erreurs TypeScript

0 erreurs sur tous les fichiers modifiés. Warnings pré-existants : `height`, `pct`, `distDoneKm` non utilisés dans TrajetMap (cosmétique).

## Nouveau marqueur SVG

- `favoriSVG(label, color)` : étoile dans un teardrop
- `createFavoriIcon(label, color)` : crée un `DivIcon` Leaflet depuis le SVG
