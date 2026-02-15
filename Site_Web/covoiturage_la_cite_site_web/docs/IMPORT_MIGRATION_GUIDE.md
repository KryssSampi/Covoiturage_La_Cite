# 📋 Guide de Migration des Imports

Ce fichier liste les changements de chemins pour vous aider à mettre à jour vos imports.

## Modèles (Models)

```typescript
// AVANT
import { UserModel } from '@/app/models'
import { TrajetModel } from '@/app/models'

// APRÈS
import { UserModel } from '@/domain/models'
import { TrajetModel } from '@/domain/models'
```

## App State

```typescript
// AVANT
import { AppState } from '@/app/app_state'

// APRÈS
import { AppState } from '@/core/state/app_state'
```

## Composants Partagés

```typescript
// AVANT
import Footer from '@/composant/footer'
import Header from '@/composant/homepage/header'

// APRÈS
import Footer from '@/shared/components/footer'
import Header from '@/shared/components/homepage/header'
```

## UI Primitives

```typescript
// AVANT
import ToggleLang from '@/ui/boutons/togglelang'
import MainLogo from '@/ui/logo/main_logo'
import WarmSentence from '@/ui/warm_sentence'

// APRÈS
import ToggleLang from '@/shared/ui/buttons/togglelang'
import MainLogo from '@/shared/ui/logo/main_logo'
import WarmSentence from '@/shared/ui/warm-sentence'
```

## Données de Test

```typescript
// AVANT
import testData from '@/app/data/testdata'

// APRÈS
import testData from '@/tests/fixtures/testdata'
```

---

## 🔍 Rechercher et Remplacer (Regex)

Vous pouvez utiliser ces patterns pour faciliter la migration:

### VSCode / IDE

1. **Modèles:**
   - Rechercher: `from ['"]@/app/models`
   - Remplacer: `from '@/domain/models`

2. **Composants:**
   - Rechercher: `from ['"]@/composant/`
   - Remplacer: `from '@/shared/components/`

3. **UI:**
   - Rechercher: `from ['"]@/ui/`
   - Remplacer: `from '@/shared/ui/`

4. **App State:**
   - Rechercher: `from ['"]@/app/app_state`
   - Remplacer: `from '@/core/state/app_state`

---

## 📝 Checklist

- [ ] Mettre à jour tous les imports dans `app/`
- [ ] Mettre à jour tous les imports dans `features/`
- [ ] Mettre à jour tous les imports dans `shared/`
- [ ] Tester la compilation TypeScript
- [ ] Vérifier qu'il n'y a pas d'erreurs de build
- [ ] Tester l'application localement

---

## 💡 Conseil

Utilisez la fonctionnalité "Find in Files" de votre IDE pour rechercher:
- `@/app/models`
- `@/composant`
- `@/ui/`
- `app_state`

Et remplacez-les par les nouveaux chemins.
