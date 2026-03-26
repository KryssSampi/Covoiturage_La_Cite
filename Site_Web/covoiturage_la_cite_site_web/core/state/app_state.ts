import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';

export enum Language {
  FR = 'fr',
  EN = 'en',
}

// ── Seule chose stockée pour l'utilisateur connecté ──────────────────────────
// Aucune donnée sensible, aucun profil complet — juste ce qu'il faut pour
// l'affichage et le routage.
export interface ConnectedUser {
  id:           string;
  role:         string;   // 'driver' | 'passenger' | 'admin'
  firstName:    string;
  lastName:     string;
  avatarUrl:    string | null;
  canBeDriver:  boolean;
}

// ── Observable pattern ────────────────────────────────────────────────────────
export abstract class ObservableObject {
  private listeners = new Set<() => void>();

  constructor() {
    return new Proxy(this, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      set(target: ObservableObject | any, prop, value) {
        if (target[prop] !== value) {
          target[prop] = value;
          target.notify();
        }
        return true;
      },
    });
  }

  public subscribe(l: () => void) {
    this.listeners.add(l);
    return () => { this.listeners.delete(l); };
  }

  protected notify() {
    this.listeners.forEach((l) => l());
  }
}

// ── AppState singleton ────────────────────────────────────────────────────────
export class AppState extends ObservableObject {
  private static instance: AppState | null = null;
  private _lang: Language = Language.FR;
  private _userConnected: ConnectedUser | null = null;
  private _isInitialized = false;

  get isAuthenticated(): boolean {
    return this._userConnected !== null;
  }

  get userConnected(): ConnectedUser | null {
    return this._userConnected;
  }

  set userConnected(value: ConnectedUser | null) {
    this._userConnected = value;
    this.notify();
  }

  get lang(): Language {
    return this._lang;
  }

  set lang(value: Language) {
    this._lang = value;
    if (typeof window !== 'undefined') {
      localStorage.setItem('appLang', value);
      Cookies.set('appLang', value);
    }
    this.notify();
  }

  private constructor() {
    super();
    this.initializeFromSession();
  }

  public static get MainInstance(): AppState {
    if (!AppState.instance) {
      AppState.instance = new AppState();
    }
    return AppState.instance;
  }

  private initializeFromSession() {
    if (typeof window === 'undefined' || this._isInitialized) return;

    try {
      const storedLang = localStorage.getItem('appLang') as Language;
      if (storedLang) this._lang = storedLang;

      const raw = sessionStorage.getItem('userConnected');
      if (raw) {
        const parsed = JSON.parse(raw) as ConnectedUser;
        // Validation minimale avant de restaurer
        if (parsed?.id && parsed?.role) {
          this._userConnected = parsed;
        }
      }
    } catch {
      this.logout();
    } finally {
      this._isInitialized = true;
    }
  }

  public login(user: ConnectedUser) {
    this._userConnected = user;

    if (typeof window !== 'undefined') {
      const payload = JSON.stringify(user);
      sessionStorage.setItem('userConnected', payload);
      Cookies.set('userConnected', payload);
    }

    this.notify();
  }

  public logout() {
    this._userConnected = null;

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('userConnected');
      Cookies.remove('userConnected');
    }

    this.notify();
  }

  public toggleLanguage() {
    this.lang = this.lang === Language.FR ? Language.EN : Language.FR;
  }

  public setLanguage(lang: Language) {
    this.lang = lang;
  }
}

// ── Hook React ────────────────────────────────────────────────────────────────
export function useAppState() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const instance = AppState.MainInstance;
    const unsubscribe = instance.subscribe(() => setTick((t) => t + 1));
    return unsubscribe;
  }, []);

  return AppState.MainInstance;
}

export function getUserConnected(): ConnectedUser | null {
  return AppState.MainInstance.userConnected;
}
