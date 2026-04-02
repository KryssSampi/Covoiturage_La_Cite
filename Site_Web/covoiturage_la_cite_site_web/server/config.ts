/**
 * server/config.ts — Configuration du Server Core (.NET)
 * 
 * Centralise l'URL du backend et les constantes de communication.
 */

export const SERVER_CORE_URL = process.env.SERVER_CORE_URL ?? 'http://localhost:5000';

/** Timeout par défaut pour les requêtes vers le Server Core (ms) */
export const DEFAULT_TIMEOUT = 15_000;

/** Préfixe des routes API du Server Core */
export const API_PREFIX = 'api';
