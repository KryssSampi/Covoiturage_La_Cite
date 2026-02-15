#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Script de réorganisation de l'arborescence existante
 * Usage: node reorganize-structure.js
 * 
 * ⚠️ IMPORTANT: Ce script va déplacer vos fichiers.
 * Faites un commit Git ou une sauvegarde avant de l'exécuter !
 */
import { promises as fs } from 'fs';
import path from 'path';
// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// Plan de réorganisation
const reorganizationPlan = [
  // ============================================
  // MODÈLES: app/models/ → domain/models/
  // ============================================
  {
    from: 'app/models',
    to: 'domain/models',
    type: 'move-directory',
    description: 'Déplacement des modèles vers domain (cœur métier)'
  },

  // ============================================
  // APP STATE: app/app_state.ts → core/state/
  // ============================================
  {
    from: 'app/app_state.ts',
    to: 'core/state/app_state.ts',
    type: 'move-file',
    description: 'Déplacement du state global vers core'
  },

  // ============================================
  // DATA: app/data/ → À ANALYSER
  // ============================================
  {
    from: 'app/data/testdata.js',
    to: 'tests/fixtures/testdata.js',
    type: 'move-file',
    description: 'Déplacement des données de test vers tests/fixtures'
  },

  // ============================================
  // COMPOSANTS: composant/ → shared/components/
  // ============================================
  {
    from: 'composant/footer.jsx',
    to: 'shared/components/footer.jsx',
    type: 'move-file',
    description: 'Déplacement du footer vers shared/components'
  },
  {
    from: 'composant/homepage',
    to: 'shared/components/homepage',
    type: 'move-directory',
    description: 'Déplacement des composants homepage vers shared'
  },

  // ============================================
  // UI PRIMITIVES: ui/ → shared/ui/
  // ============================================
  {
    from: 'ui/boutons',
    to: 'shared/ui/buttons',
    type: 'move-directory',
    description: 'Déplacement des boutons vers shared/ui'
  },
  {
    from: 'ui/logo',
    to: 'shared/ui/logo',
    type: 'move-directory',
    description: 'Déplacement du logo vers shared/ui'
  },
  {
    from: 'ui/warm_sentence.jsx',
    to: 'shared/ui/warm-sentence.jsx',
    type: 'move-file',
    description: 'Déplacement du composant UI vers shared/ui'
  },

  // ============================================
  // SCRIPTS
  // ============================================
  {
    from: 'generate-models.js',
    to: 'scripts/generate-models.js',
    type: 'move-file',
    description: 'Déplacement du générateur de modèles vers scripts'
  },
  {
    from: 'generate-architecture.js',
    to: 'scripts/generate-architecture.js',
    type: 'move-file',
    description: 'Déplacement du générateur d\'architecture vers scripts'
  },
];

/**
 * Vérifie si un fichier ou dossier existe
 */
async function exists(filePath) {
  try {
    await fs.access(path.resolve(process.cwd(), filePath));
    return true;
  } catch {
    return false;
  }
}

/**
 * Crée un dossier s'il n'existe pas
 */
async function ensureDirectory(dirPath) {
  const fullPath = path.resolve(process.cwd(), dirPath);
  if (!(await exists(fullPath))) {
    await fs.mkdir(fullPath, { recursive: true });
  }
}

/**
 * Déplace un fichier
 */
async function moveFile(from, to) {
  const fromPath = path.resolve(process.cwd(), from);
  const toPath = path.resolve(process.cwd(), to);
  
  if (!(await exists(fromPath))) {
    return { success: false, reason: 'Source inexistante' };
  }

  // Créer le dossier parent si nécessaire
  await ensureDirectory(path.dirname(to));

  // Vérifier si le fichier destination existe déjà
  if (await exists(toPath)) {
    return { success: false, reason: 'Destination existe déjà' };
  }

  try {
    await fs.rename(fromPath, toPath);
    return { success: true };
  } catch (error) {
    return { success: false, reason: error.message };
  }
}

/**
 * Déplace un dossier entier
 */
async function moveDirectory(from, to) {
  const fromPath = path.resolve(process.cwd(), from);
  const toPath = path.resolve(process.cwd(), to);

  if (!(await exists(fromPath))) {
    return { success: false, reason: 'Source inexistante' };
  }

  if (await exists(toPath)) {
    return { success: false, reason: 'Destination existe déjà' };
  }

  try {
    // Créer le dossier parent
    await ensureDirectory(path.dirname(to));
    
    // Déplacer le dossier
    await fs.rename(fromPath, toPath);
    return { success: true };
  } catch (error) {
    return { success: false, reason: error.message };
  }
}

/**
 * Copie récursive d'un dossier
 */
async function copyDirectory(from, to) {
  const fromPath = path.resolve(process.cwd(), from);
  const toPath = path.resolve(process.cwd(), to);

  if (!(await exists(fromPath))) {
    return { success: false, reason: 'Source inexistante' };
  }

  await ensureDirectory(to);

  try {
    const items = await fs.readdir(fromPath);
    
    for (const item of items) {
      const srcPath = path.join(fromPath, item);
      const destPath = path.join(toPath, item);
      const stat = await fs.stat(srcPath);

      if (stat.isDirectory()) {
        await copyDirectory(path.join(from, item), path.join(to, item));
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }

    return { success: true };
  } catch (error) {
    return { success: false, reason: error.message };
  }
}

/**
 * Supprime les dossiers vides de l'ancienne structure
 */
async function cleanupEmptyDirectories() {
  const oldDirs = ['composant', 'ui'];
  let cleaned = 0;

  for (const dir of oldDirs) {
    const fullPath = path.resolve(process.cwd(), dir);
    if (await exists(fullPath)) {
      try {
        // Vérifier si le dossier est vide (ou ne contient que des sous-dossiers vides)
        const isEmpty = async (dirPath) => {
          const items = await fs.readdir(dirPath);
          if (items.length === 0) return true;
          
          for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stat = await fs.stat(itemPath);
            if (stat.isDirectory() && !(await isEmpty(itemPath))) {
              return false;
            }
          }
          return true;
        };

        if (await isEmpty(fullPath)) {
          await fs.rm(fullPath, { recursive: true });
          console.log(`${colors.green}✓${colors.reset}  Dossier vide supprimé: ${colors.yellow}${dir}${colors.reset}`);
          cleaned++;
        }
      } catch (error) {
        // Ignorer les erreurs
        console.log(`${colors.red}✗${colors.reset}  Erreur lors du nettoyage de ${dir}: ${error.message}`);
      }
    }
  }

  return cleaned;
}

/**
 * Crée un fichier de mapping pour aider avec les imports
 */
async function createImportMapping() {
  const mapping = `# 📋 Guide de Migration des Imports

Ce fichier liste les changements de chemins pour vous aider à mettre à jour vos imports.

## Modèles (Models)

\`\`\`typescript
// AVANT
import { UserModel } from '@/app/models'
import { TrajetModel } from '@/app/models'

// APRÈS
import { UserModel } from '@/domain/models'
import { TrajetModel } from '@/domain/models'
\`\`\`

## App State

\`\`\`typescript
// AVANT
import { AppState } from '@/app/app_state'

// APRÈS
import { AppState } from '@/core/state/app_state'
\`\`\`

## Composants Partagés

\`\`\`typescript
// AVANT
import Footer from '@/composant/footer'
import Header from '@/composant/homepage/header'

// APRÈS
import Footer from '@/shared/components/footer'
import Header from '@/shared/components/homepage/header'
\`\`\`

## UI Primitives

\`\`\`typescript
// AVANT
import ToggleLang from '@/ui/boutons/togglelang'
import MainLogo from '@/ui/logo/main_logo'
import WarmSentence from '@/ui/warm_sentence'

// APRÈS
import ToggleLang from '@/shared/ui/buttons/togglelang'
import MainLogo from '@/shared/ui/logo/main_logo'
import WarmSentence from '@/shared/ui/warm-sentence'
\`\`\`

## Données de Test

\`\`\`typescript
// AVANT
import testData from '@/app/data/testdata'

// APRÈS
import testData from '@/tests/fixtures/testdata'
\`\`\`

---

## 🔍 Rechercher et Remplacer (Regex)

Vous pouvez utiliser ces patterns pour faciliter la migration:

### VSCode / IDE

1. **Modèles:**
   - Rechercher: \`from ['"]@/app/models\`
   - Remplacer: \`from '@/domain/models\`

2. **Composants:**
   - Rechercher: \`from ['"]@/composant/\`
   - Remplacer: \`from '@/shared/components/\`

3. **UI:**
   - Rechercher: \`from ['"]@/ui/\`
   - Remplacer: \`from '@/shared/ui/\`

4. **App State:**
   - Rechercher: \`from ['"]@/app/app_state\`
   - Remplacer: \`from '@/core/state/app_state\`

---

## 📝 Checklist

- [ ] Mettre à jour tous les imports dans \`app/\`
- [ ] Mettre à jour tous les imports dans \`features/\`
- [ ] Mettre à jour tous les imports dans \`shared/\`
- [ ] Tester la compilation TypeScript
- [ ] Vérifier qu'il n'y a pas d'erreurs de build
- [ ] Tester l'application localement

---

## 💡 Conseil

Utilisez la fonctionnalité "Find in Files" de votre IDE pour rechercher:
- \`@/app/models\`
- \`@/composant\`
- \`@/ui/\`
- \`app_state\`

Et remplacez-les par les nouveaux chemins.
`;

  const mappingPath = path.resolve(process.cwd(), 'IMPORT_MIGRATION_GUIDE.md');
  await fs.writeFile(mappingPath, mapping);
  console.log(`\n${colors.cyan}📋 Guide de migration créé:${colors.reset} IMPORT_MIGRATION_GUIDE.md\n`);
}

/**
 * Crée un fichier de sauvegarde de l'état actuel
 */
async function createBackupInfo() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const info = {
    date: new Date().toISOString(),
    reorganizationPlan: reorganizationPlan,
    note: 'Sauvegarde créée avant la réorganisation. Utilisez Git pour revenir en arrière si nécessaire.'
  };

  const backupPath = path.resolve(process.cwd(), `.backup-info-${timestamp}.json`);
  await fs.writeFile(backupPath, JSON.stringify(info, null, 2));
  return backupPath;
}

/**
 * Fonction principale
 */
async function main() {
  console.log('\n' + colors.blue + '╔════════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.blue + '║  Réorganisation de l\'arborescence du projet       ║' + colors.reset);
  console.log(colors.blue + '╚════════════════════════════════════════════════════╝' + colors.reset + '\n');

  // Vérifier si Git est présent
  console.log(`${colors.yellow}⚠️  ATTENTION:${colors.reset} Ce script va déplacer vos fichiers.\n`);
  console.log(`${colors.cyan}💡 Conseil:${colors.reset} Faites un commit Git avant de continuer.\n`);
  
  // Créer une sauvegarde des informations
  const backupFile = await createBackupInfo();
  console.log(`${colors.green}✓${colors.reset}  Fichier de sauvegarde créé: ${path.basename(backupFile)}\n`);

  // Statistiques
  let moved = 0;
  let skipped = 0;
  let errors = 0;

  console.log(`${colors.blue}📦 Début de la réorganisation...${colors.reset}\n`);

  // Créer les dossiers nécessaires
  console.log(`${colors.cyan}1. Création des dossiers de destination...${colors.reset}\n`);
  await ensureDirectory('tests/fixtures');
  console.log(`${colors.green}✓${colors.reset}  Dossiers créés\n`);

  // Exécuter le plan de réorganisation
  console.log(`${colors.cyan}2. Déplacement des fichiers...${colors.reset}\n`);
  
  for (const [index, operation] of reorganizationPlan.entries()) {
    const { from, to, type, description } = operation;
    
    console.log(`${colors.blue}[${index + 1}/${reorganizationPlan.length}]${colors.reset} ${description}`);
    console.log(`    ${colors.yellow}${from}${colors.reset} → ${colors.green}${to}${colors.reset}`);

    let result;
    if (type === 'move-file') {
      result = await moveFile(from, to);
    } else if (type === 'move-directory') {
      result = await moveDirectory(from, to);
    }

    if (result.success) {
      console.log(`    ${colors.green}✓ Déplacé avec succès${colors.reset}\n`);
      moved++;
    } else {
      if (result.reason === 'Source inexistante') {
        console.log(`    ${colors.yellow}⏭  Ignoré (source inexistante)${colors.reset}\n`);
        skipped++;
      } else if (result.reason === 'Destination existe déjà') {
        console.log(`    ${colors.yellow}⏭  Ignoré (destination existe déjà)${colors.reset}\n`);
        skipped++;
      } else {
        console.log(`    ${colors.red}✗ Erreur: ${result.reason}${colors.reset}\n`);
        errors++;
      }
    }
  }

  // Nettoyage des dossiers vides
  console.log(`${colors.cyan}3. Nettoyage des dossiers vides...${colors.reset}\n`);
  const cleaned = await cleanupEmptyDirectories();
  if (cleaned > 0) {
    console.log();
  }

  // Créer le guide de migration
  console.log(`${colors.cyan}4. Création du guide de migration...${colors.reset}`);
  await createImportMapping();

  // Résumé
  console.log(colors.blue + '╔════════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.blue + '║                    RÉSUMÉ                          ║' + colors.reset);
  console.log(colors.blue + '╚════════════════════════════════════════════════════╝' + colors.reset);
  console.log(`\n${colors.green}✓${colors.reset}  Fichiers/Dossiers déplacés: ${colors.green}${moved}${colors.reset}`);
  console.log(`${colors.yellow}⏭${colors.reset}  Opérations ignorées: ${colors.yellow}${skipped}${colors.reset}`);
  console.log(`${colors.red}✗${colors.reset}  Erreurs: ${colors.red}${errors}${colors.reset}`);
  console.log(`${colors.green}✓${colors.reset}  Dossiers vides nettoyés: ${colors.green}${cleaned}${colors.reset}\n`);

  if (errors > 0) {
    console.log(`${colors.red}⚠️  Des erreurs sont survenues. Vérifiez les messages ci-dessus.${colors.reset}\n`);
  } else if (moved > 0) {
    console.log(`${colors.green}✨ Réorganisation terminée avec succès!${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}ℹ️  Aucun fichier à déplacer (structure déjà à jour ou fichiers inexistants).${colors.reset}\n`);
  }

  // Instructions suivantes
  console.log(colors.magenta + '📝 PROCHAINES ÉTAPES IMPORTANTES:' + colors.reset);
  console.log(`
   1. ${colors.cyan}Consulter le guide:${colors.reset} IMPORT_MIGRATION_GUIDE.md
   2. ${colors.cyan}Mettre à jour les imports:${colors.reset} Utilisez la recherche/remplacement dans votre IDE
   3. ${colors.cyan}Vérifier la compilation:${colors.reset} npm run build
   4. ${colors.cyan}Tester l'application:${colors.reset} npm run dev
   5. ${colors.cyan}Commit les changements:${colors.reset} git add . && git commit -m "refactor: reorganize project structure"
  `);

  console.log(colors.yellow + '⚠️  N\'OUBLIEZ PAS:' + colors.reset);
  console.log(`   Les imports dans vos fichiers doivent être mis à jour manuellement! 😅\n`);
}

// Exécution
try {
  await main();
} catch (error) {
  console.error(`\n${colors.red}❌ Erreur fatale:${colors.reset}`, error.message);
  console.error(error.stack);
  process.exit(1);
}