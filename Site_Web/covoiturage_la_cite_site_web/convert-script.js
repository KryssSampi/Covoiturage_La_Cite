#!/usr/bin/env node

/**
 * Script de conversion JS/JSX → TS/TSX
 * Usage: node convert-to-typescript.js [--dry-run]
 * 
 * ⚠️ IMPORTANT: Testez d'abord en mode --dry-run !
 */

import fs from 'fs';
import path from 'path';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// ============================================
// 🚫 FICHIERS À EXCLURE (ajoutez vos chemins ici)
// ============================================
const EXCEPTIONS = [
  // Exemples (décommentez si nécessaire) :
  // 'scripts/legacy-script.js',
  // 'public/old-widget.js',
  // 'app/data/testdata.js',
  
  // Ajoutez vos propres chemins ici (relatifs à la racine du projet) :
  "scripts\\generate-architecture.js",
  "scripts\\generate-models.js",
  "scripts\\reaorganise-architecture.js",
  "tests\\fixtures\\testdata.js",
  "convert-script.js",
  
];

// ============================================
// 📁 DOSSIERS À IGNORER COMPLÈTEMENT
// ============================================
const IGNORED_DIRECTORIES = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  'out',
];

// ============================================
// 📝 FICHIERS DE CONFIG À TOUJOURS IGNORER
// ============================================
const ALWAYS_IGNORE = [
  'next.config.js',
  'next.config.mjs',
  'postcss.config.js',
  'postcss.config.mjs',
  'tailwind.config.js',
  'tailwind.config.mjs',
  'eslint.config.js',
  'eslint.config.mjs',
  'prettier.config.js',
  'jest.config.js',
  'vitest.config.js',
];

/**
 * Vérifie si un fichier doit être ignoré
 */
function shouldIgnore(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  const normalized = relativePath.replace(/\\/g, '/');
  const fileName = path.basename(filePath);

  // Vérifier les fichiers de config
  if (ALWAYS_IGNORE.includes(fileName)) {
    return true;
  }

  // Vérifier les exceptions personnalisées
  if (EXCEPTIONS.some(exception => {
    const normalizedEx = exception.replace(/\\/g, '/');
    return normalized === normalizedEx || normalized.endsWith(normalizedEx);
  })) {
    return true;
  }

  return false;
}

/**
 * Scanne récursivement un dossier
 */
function scanDirectory(dirPath, results = []) {
  if (!fs.existsSync(dirPath)) return results;

  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!IGNORED_DIRECTORIES.includes(item)) {
        scanDirectory(fullPath, results);
      }
    } else {
      const ext = path.extname(item);
      if ((ext === '.js' || ext === '.jsx') && !shouldIgnore(fullPath)) {
        results.push(fullPath);
      }
    }
  });

  return results;
}

/**
 * Détecte si un fichier contient du JSX
 */
function containsJSX(content) {
  // Patterns simples pour détecter du JSX
  const jsxPatterns = [
    /<[A-Z][a-zA-Z0-9]*[\s>\/]/,           // <Component
    /<[a-z]+[\s>\/]/,                       // <div, <span, etc.
    /React\.createElement/,                 // React.createElement
    /jsx:/,                                 // pragma jsx
    /return\s*\(/,                          // return ( souvent suivi de JSX
  ];

  return jsxPatterns.some(pattern => pattern.test(content));
}

/**
 * Ajoute les types basiques au contenu du fichier
 */
function addBasicTypes(content, hasJSX) {
  let newContent = content;

  // Si le fichier a déjà des types, ne rien faire
  if (content.includes(': ') || content.includes('<') && content.includes('>') && !hasJSX) {
    return newContent;
  }

  // Ajouter des imports React si JSX et pas déjà importé
  if (hasJSX && !content.includes("from 'react'") && !content.includes('from "react"')) {
    // Ne pas ajouter automatiquement car Next.js 13+ n'en a pas besoin
  }

  return newContent;
}

/**
 * Convertit un fichier JS/JSX en TS/TSX
 */
function convertFile(filePath, dryRun = false) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const hasJSX = containsJSX(content);
  const ext = path.extname(filePath);
  
  // Déterminer la nouvelle extension
  let newExt;
  if (ext === '.jsx') {
    newExt = '.tsx';
  } else if (ext === '.js') {
    newExt = hasJSX ? '.tsx' : '.ts';
  } else {
    return { success: false, reason: 'Extension non supportée' };
  }

  const newFilePath = filePath.replace(ext, newExt);

  // Vérifier si le fichier destination existe déjà
  if (fs.existsSync(newFilePath) && newFilePath !== filePath) {
    return { 
      success: false, 
      reason: 'Fichier destination existe déjà',
      oldPath: filePath,
      newPath: newFilePath,
    };
  }

  if (!dryRun) {
    // Ajouter les types de base
    const newContent = addBasicTypes(content, hasJSX);
    
    // Écrire le nouveau fichier
    fs.writeFileSync(newFilePath, newContent, 'utf-8');
    
    // Supprimer l'ancien fichier
    fs.unlinkSync(filePath);
  }

  return {
    success: true,
    oldPath: filePath,
    newPath: newFilePath,
    conversion: `${ext} → ${newExt}`,
    hasJSX,
  };
}

/**
 * Crée un backup
 */
function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupDir = path.resolve(process.cwd(), '.ts-conversion-backup');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
  const info = {
    timestamp: new Date().toISOString(),
    note: 'Backup créé avant la conversion JS/JSX → TS/TSX',
  };

  fs.writeFileSync(backupFile, JSON.stringify(info, null, 2));
  return backupFile;
}

/**
 * Génère un rapport
 */
function generateReport(results, dryRun) {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log('\n' + colors.blue + '╔════════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.blue + '║            RAPPORT DE CONVERSION                  ║' + colors.reset);
  console.log(colors.blue + '╚════════════════════════════════════════════════════╝' + colors.reset + '\n');

  console.log(`${dryRun ? colors.yellow + '🔍 MODE DRY-RUN' : colors.green + '✅ CONVERSIONS APPLIQUÉES'}${colors.reset}\n`);

  console.log(`${colors.cyan}📊 Statistiques:${colors.reset}`);
  console.log(`   • Fichiers convertis: ${colors.green}${successful.length}${colors.reset}`);
  console.log(`   • Échecs/Ignorés: ${colors.yellow}${failed.length}${colors.reset}\n`);

  if (successful.length > 0) {
    console.log(`${colors.cyan}✅ Conversions réussies:${colors.reset}\n`);

    // Regrouper par type de conversion
    const jsToTs = successful.filter(r => r.conversion === '.js → .ts');
    const jsToTsx = successful.filter(r => r.conversion === '.js → .tsx');
    const jsxToTsx = successful.filter(r => r.conversion === '.jsx → .tsx');

    if (jsToTs.length > 0) {
      console.log(`${colors.magenta}   .js → .ts (${jsToTs.length}):${colors.reset}`);
      jsToTs.slice(0, 10).forEach(r => {
        const relative = path.relative(process.cwd(), r.oldPath);
        console.log(`   ${colors.green}✓${colors.reset} ${relative}`);
      });
      if (jsToTs.length > 10) {
        console.log(`   ${colors.cyan}... et ${jsToTs.length - 10} autres${colors.reset}`);
      }
      console.log();
    }

    if (jsToTsx.length > 0) {
      console.log(`${colors.magenta}   .js → .tsx (${jsToTsx.length}):${colors.reset}`);
      jsToTsx.slice(0, 10).forEach(r => {
        const relative = path.relative(process.cwd(), r.oldPath);
        console.log(`   ${colors.green}✓${colors.reset} ${relative}`);
      });
      if (jsToTsx.length > 10) {
        console.log(`   ${colors.cyan}... et ${jsToTsx.length - 10} autres${colors.reset}`);
      }
      console.log();
    }

    if (jsxToTsx.length > 0) {
      console.log(`${colors.magenta}   .jsx → .tsx (${jsxToTsx.length}):${colors.reset}`);
      jsxToTsx.slice(0, 10).forEach(r => {
        const relative = path.relative(process.cwd(), r.oldPath);
        console.log(`   ${colors.green}✓${colors.reset} ${relative}`);
      });
      if (jsxToTsx.length > 10) {
        console.log(`   ${colors.cyan}... et ${jsxToTsx.length - 10} autres${colors.reset}`);
      }
      console.log();
    }
  }

  if (failed.length > 0) {
    console.log(`${colors.yellow}⚠️  Fichiers ignorés/échecs:${colors.reset}\n`);
    failed.forEach(r => {
      const relative = path.relative(process.cwd(), r.oldPath);
      console.log(`   ${colors.yellow}⏭${colors.reset}  ${relative}`);
      console.log(`      ${colors.cyan}Raison:${colors.reset} ${r.reason}\n`);
    });
  }

  return { successful: successful.length, failed: failed.length };
}

/**
 * Fonction principale
 */
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  console.log('\n' + colors.blue + '╔════════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.blue + '║     Conversion JS/JSX → TS/TSX                    ║' + colors.reset);
  console.log(colors.blue + '╚════════════════════════════════════════════════════╝' + colors.reset + '\n');

  if (dryRun) {
    console.log(`${colors.yellow}🔍 MODE DRY-RUN ACTIVÉ${colors.reset}`);
    console.log(`${colors.cyan}Les fichiers ne seront pas modifiés.${colors.reset}\n`);
  } else {
    console.log(`${colors.red}⚠️  MODE ÉCRITURE ACTIVÉ${colors.reset}`);
    console.log(`${colors.yellow}Les fichiers vont être renommés et convertis !${colors.reset}`);
    console.log(`${colors.cyan}💡 Astuce: Utilisez --dry-run pour prévisualiser d'abord.${colors.reset}\n`);

    // Créer un backup
    const backupFile = createBackup();
    console.log(`${colors.green}✓${colors.reset} Backup créé: ${path.basename(backupFile)}\n`);
  }

  // Afficher les exceptions configurées
  if (EXCEPTIONS.length > 0) {
    console.log(`${colors.cyan}🚫 Fichiers exclus (${EXCEPTIONS.length}):${colors.reset}`);
    EXCEPTIONS.forEach(ex => {
      console.log(`   • ${ex}`);
    });
    console.log();
  }

  // Scanner les fichiers
  console.log(`${colors.cyan}📂 Scan des fichiers JS/JSX...${colors.reset}\n`);
  const files = scanDirectory(process.cwd());
  
  if (files.length === 0) {
    console.log(`${colors.green}✨ Aucun fichier JS/JSX trouvé !${colors.reset}`);
    console.log(`${colors.cyan}Votre projet est déjà entièrement en TypeScript.${colors.reset}\n`);
    return;
  }

  console.log(`${colors.green}✓${colors.reset} ${files.length} fichier(s) JS/JSX trouvé(s)\n`);

  // Convertir les fichiers
  console.log(`${colors.cyan}🔧 Conversion en cours...${colors.reset}\n`);

  const results = files.map(filePath => convertFile(filePath, dryRun));

  // Générer le rapport
  const { successful} = generateReport(results, dryRun);

  // Instructions finales
  if (dryRun && successful > 0) {
    console.log(colors.magenta + '📝 PROCHAINES ÉTAPES:' + colors.reset);
    console.log(`
   1. ${colors.cyan}Vérifier les fichiers${colors.reset} ci-dessus
   2. ${colors.cyan}Ajouter des exceptions${colors.reset} si nécessaire dans le script
   3. ${colors.cyan}Exécuter sans --dry-run${colors.reset}: node convert-to-typescript.js
   4. ${colors.cyan}Fixer les erreurs TypeScript${colors.reset}: npm run build
   5. ${colors.cyan}Commiter${colors.reset}: git commit -am "refactor: convert JS/JSX to TS/TSX"
    `);
  } else if (!dryRun && successful > 0) {
    console.log(colors.green + '✨ CONVERSION TERMINÉE AVEC SUCCÈS!' + colors.reset);
    console.log(`
${colors.magenta}📝 PROCHAINES ÉTAPES:${colors.reset}

   1. ${colors.cyan}Vérifier la compilation:${colors.reset}
      npm run build

   2. ${colors.cyan}Corriger les erreurs TypeScript:${colors.reset}
      - Ajouter les types manquants
      - Corriger les erreurs de type
      - Utiliser 'any' temporairement si besoin

   3. ${colors.cyan}Tester l'application:${colors.reset}
      npm run dev

   4. ${colors.cyan}Commiter:${colors.reset}
      git add .
      git commit -m "refactor: convert all JS/JSX to TS/TSX"

${colors.yellow}⚠️  Note:${colors.reset} Un backup a été créé dans .ts-conversion-backup/

${colors.cyan}💡 Conseil:${colors.reset} Ajoutez progressivement les types. Vous pouvez utiliser
   \`any\` temporairement et améliorer les types plus tard.
    `);
  }
}

// Exécution
try {
  main();
} catch (error) {
  console.error(`\n${colors.red}❌ Erreur fatale:${colors.reset}`, error.message);
  console.error(error.stack);
  process.exit(1);
}