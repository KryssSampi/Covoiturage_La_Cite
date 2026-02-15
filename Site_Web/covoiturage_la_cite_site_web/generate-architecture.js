#!/usr/bin/env node

/**
 * Script de création de l'arborescence complète du projet
 * Usage: node create-structure.js
 * 
 * Ce script crée tous les dossiers manquants pour une architecture DDD complète
 */

import { promises as fs } from 'fs';
import path from 'path';


// Arborescence complète à créer
const directories = [
  // Routes Next.js (UI uniquement)
  'app/(public)',
  'app/(auth)',
  'app/(protected)',
  'app/(admin)',
  'app/api/auth',
  'app/api/users',
  'app/api/trajets',
  'app/api/middleware',

  // Infrastructure transversale
  'core/state',
  'core/context',
  'core/services',
  'core/hooks',
  'core/utils',
  'core/guards',
  'core/config',
  'core/lib',

  // Cœur métier pur (DDD)
  'domain/models',
  'domain/types',
  'domain/validators',
  'domain/exceptions',
  'domain/repositories',

  // Implémentations concrètes
  'infrastructure/api',
  'infrastructure/repositories',
  'infrastructure/mappers',
  'infrastructure/adapters',

  // Modules métier isolés
  'features/auth',
  'features/trajets',
  'features/profile',
  'features/notifications',

  // UI réutilisable
  'shared/components',
  'shared/ui',
  'shared/hooks',
  'shared/providers',
  'shared/assets',
  'shared/utils',

  // Code serveur pur
  'server/actions',
  'server/auth',
  'server/middleware',
  'server/errors',

  // Autres dossiers
  'types',
  'public',
  'docs',
  'tests',
  'scripts',
  'styles',
  'config',
];

// Fichiers de base à créer (optionnels)
const baseFiles = {
  'app/layout.tsx': `import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mon Application',
  description: 'Application de gestion de trajets',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
`,
  'app/page.tsx': `export default function Home() {
  return (
    <main>
      <h1>Bienvenue</h1>
    </main>
  )
}
`,
  'app/error.tsx': `'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Une erreur est survenue</h2>
      <button onClick={() => reset()}>Réessayer</button>
    </div>
  )
}
`,
  'app/loading.tsx': `export default function Loading() {
  return <div>Chargement...</div>
}
`,
  '.gitkeep': '',
};

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

/**
 * Crée un dossier s'il n'existe pas
 */
async function createDirectory(dirPath) {
  const fullPath = path.resolve(process.cwd(), dirPath);
  
  try {
    await fs.access(fullPath);
    console.log(`${colors.yellow}⏭  ${colors.reset}${dirPath} (existe déjà)`);
    return false;
  } catch {
    try {
      await fs.mkdir(fullPath, { recursive: true });
      console.log(`${colors.green}✓${colors.reset}  ${dirPath}`);
      return true;
    } catch (error) {
      console.error(`${colors.red}✗${colors.reset}  ${dirPath} - Erreur: ${error.message}`);
      return false;
    }
  }
}

/**
 * Crée un fichier s'il n'existe pas
 */
async function createFile(filePath, content) {
  const fullPath = path.resolve(process.cwd(), filePath);
  const dir = path.dirname(fullPath);

  // Créer le dossier parent si nécessaire
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }

  try {
    await fs.access(fullPath);
    return false;
  } catch {
    try {
      await fs.writeFile(fullPath, content);
      return true;
    } catch (error) {
      console.error(`${colors.red}✗${colors.reset}  Erreur création fichier ${filePath}: ${error.message}`);
      return false;
    }
  }
}

/**
 * Ajoute un fichier .gitkeep dans les dossiers vides
 */
async function addGitkeepToEmptyDirs() {
  let count = 0;
  
  for (const dir of directories) {
    const fullPath = path.resolve(process.cwd(), dir);
    try {
      await fs.access(fullPath);    
      const files = await fs.readdir(fullPath);
      if (files.length === 0) {
        await createFile(path.join(dir, '.gitkeep'), '');
        count++;
      }
    } catch {
      // Ignorer les erreurs d'accès (dossier non créé)
    }
  }

  return count;
}

/**
 * Fonction principale
 */
async function main() {
  console.log('\n' + colors.blue + '╔════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.blue + '║  Création de l\'arborescence du projet     ║' + colors.reset);
  console.log(colors.blue + '╚════════════════════════════════════════════╝' + colors.reset + '\n');

  console.log(`📂 Répertoire de travail: ${colors.blue}${process.cwd()}${colors.reset}\n`);

  // Compteurs
  let created = 0;
  let skipped = 0;

  // Création des dossiers
  console.log('🏗️  Création des dossiers...\n');
  for (const dir of directories) {
    if (await createDirectory(dir)) {
      created++;
    } else {
      skipped++;
    }
  }

  // Création des fichiers de base (optionnel)
  console.log('\n📄 Création des fichiers de base...\n');
  let filesCreated = 0;
  
  for (const [filePath, content] of Object.entries(baseFiles)) {
    if (filePath !== '.gitkeep' && await createFile(filePath, content)) {
      console.log(`${colors.green}✓${colors.reset}  ${filePath}`);
      filesCreated++;
    }
  }

  // Ajout des .gitkeep
  console.log('\n🔖 Ajout des fichiers .gitkeep...\n');
  const gitkeepCount = await addGitkeepToEmptyDirs();
  console.log(`${colors.green}✓${colors.reset}  ${gitkeepCount} fichiers .gitkeep ajoutés`);

  // Résumé
  console.log('\n' + colors.blue + '╔════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.blue + '║             RÉSUMÉ                         ║' + colors.reset);
  console.log(colors.blue + '╚════════════════════════════════════════════╝' + colors.reset);
  console.log(`\n${colors.green}✓${colors.reset}  Dossiers créés: ${colors.green}${created}${colors.reset}`);
  console.log(`${colors.yellow}⏭${colors.reset}  Dossiers existants: ${colors.yellow}${skipped}${colors.reset}`);
  console.log(`${colors.green}✓${colors.reset}  Fichiers créés: ${colors.green}${filesCreated}${colors.reset}`);
  console.log(`${colors.green}✓${colors.reset}  Fichiers .gitkeep: ${colors.green}${gitkeepCount}${colors.reset}\n`);

  console.log('✨ Structure créée avec succès!\n');
  console.log('📝 Prochaines étapes:');
  console.log('   1. Vérifier les dossiers créés');
  console.log('   2. Configurer Next.js (next.config.js)');
  console.log('   3. Installer les dépendances (npm install)');
  console.log('   4. Commencer à développer! 🚀\n');
}

// Exécution
try {
  main();
} catch (error) {
  console.error(`\n${colors.red}❌ Erreur fatale:${colors.reset}`, error.message);
  process.exit(1);
}