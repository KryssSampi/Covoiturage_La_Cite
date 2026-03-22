/**
 * JsonStorageManager — Gestionnaire bas-niveau de lecture/écriture JSON
 *
 * Usage serveur uniquement (Next.js API routes).
 * Aucun composant client ne doit importer ce fichier directement.
 * Toutes les écritures doivent passer par PersistenceManager.
 *
 * Intègre un système de surveillance des fichiers (fs.watch) qui détecte
 * les modifications (internes ET manuelles) et publie un événement
 * via un EventEmitter partagé.
 */
import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

/** Émetteur d'événements partagé — publie 'change:<entity>' à chaque modification détectée */
export const dbEventEmitter = new EventEmitter();
// Augmente la limite de listeners (une route SSE par client connecté)
dbEventEmitter.setMaxListeners(100);

export class JsonStorageManager {
  private readonly dbDir: string;

  /**
   * Hashes du contenu de chaque fichier — permet de distinguer
   * un vrai changement d'un simple événement fs.watch redondant.
   */
  private contentHashes = new Map<string, string>();

  /** Watchers actifs — pour pouvoir les fermer proprement si nécessaire */
  private watchers = new Map<string, fs.FSWatcher>();

  constructor(dbDir?: string) {
    this.dbDir = dbDir ?? path.join(process.cwd(), 'tests', 'db');
  }

  /** Résout le chemin absolu du fichier JSON */
  private resolve(name: string): string {
    return path.join(this.dbDir, `${name}.json`);
  }

  /**
   * Lit et parse un fichier JSON
   * @throws si le fichier n'existe pas ou n'est pas du JSON valide
   */
  read<T>(name: string): T {
    let raw = fs.readFileSync(this.resolve(name), 'utf-8');
    // Supprime le BOM UTF-8 si présent (ajouté par certains outils Windows)
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    return JSON.parse(raw) as T;
  }

  /**
   * Sérialise et écrit un fichier JSON (indenté 2 espaces)
   * Publie un événement 'change:<entity>' après l'écriture.
   * @throws si l'écriture échoue
   */
  write<T>(name: string, data: T): void {
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(this.resolve(name), content, 'utf-8');

    // Met à jour le hash et publie l'événement immédiatement
    this.contentHashes.set(name, content);
    dbEventEmitter.emit(`change:${name}`, data);
  }

  /** Vérifie si le fichier JSON existe */
  exists(name: string): boolean {
    return fs.existsSync(this.resolve(name));
  }

  /**
   * Démarre la surveillance d'un fichier JSON via fs.watch.
   * Détecte les modifications manuelles (éditeur de texte, scripts externes).
   * Si le contenu a changé depuis la dernière vérification, publie un événement.
   *
   * @param entity Nom de l'entité (ex: 'driver_finance_accounts')
   */
  watch(entity: string): void {
    // Évite d'enregistrer deux watchers pour la même entité
    if (this.watchers.has(entity)) return;

    const filePath = this.resolve(entity);
    if (!fs.existsSync(filePath)) return;

    // Initialise le hash avec le contenu actuel du fichier
    try {
      const initial = fs.readFileSync(filePath, 'utf-8');
      this.contentHashes.set(entity, initial);
    } catch {
      // Fichier pas encore lisible — on continue
    }

    // Timer anti-rebond : fs.watch peut déclencher plusieurs événements rapprochés
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const watcher = fs.watch(filePath, () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        try {
          const current = fs.readFileSync(filePath, 'utf-8');
          const previous = this.contentHashes.get(entity) ?? '';

          // Publie uniquement si le contenu a réellement changé
          if (current !== previous) {
            this.contentHashes.set(entity, current);
            dbEventEmitter.emit(`change:${entity}`, JSON.parse(current));
          }
        } catch {
          // Fichier temporairement inaccessible (écriture en cours) — on ignore
        }
      }, 150);
    });

    this.watchers.set(entity, watcher);
  }

  /** Arrête la surveillance d'un fichier */
  unwatch(entity: string): void {
    const watcher = this.watchers.get(entity);
    if (watcher) {
      watcher.close();
      this.watchers.delete(entity);
    }
  }
}
