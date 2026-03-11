
export enum Language {
    FR = 'fr',
    EN = 'en',
}

// Ton nouveau "modèle d'observable" universel
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
            }
        });
    }

    public subscribe(l: () => void) {
        this.listeners.add(l);
        return () => this.listeners.delete(l);
    }

    protected notify() {
        this.listeners.forEach(l => l());
    }
}
import Cookies from 'js-cookie';
export class AppState extends ObservableObject {
    private static instance: AppState | null = null;
    private _lang: Language = Language.FR;
    private _userConnected: UserModel | null = null ;
    private _isInitialized = false;

    get isAuthenticated(): boolean {
        return this._userConnected !== null;
    }

    get userConnected(): UserModel | null {
        return this._userConnected;
    }

    set userConnected(value: UserModel | null) {
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

    /**
     * Initialise l'état depuis sessionStorage au démarrage
     */
    private initializeFromSession() {
        if (typeof window === 'undefined' || this._isInitialized) return;

        try {
            // Restaurer la langue
            const storedLang = localStorage.getItem('appLang') as Language;
            if (storedLang) {
                this._lang = storedLang;
            }

            // Restaurer l'utilisateur depuis sessionStorage
            const storedUserJson = sessionStorage.getItem('userConnected');
            if (storedUserJson) {
                const userData = JSON.parse(storedUserJson);
                this._userConnected = new UserModel(userData);
                console.log('✅ Session restaurée:', this._userConnected.nom);
            }
        } catch (error) {
            console.error('❌ Erreur lors de la restauration de session:', error);
            this.logout(); // Nettoyer en cas d'erreur
        } finally {
            this._isInitialized = true;
        }
    }

    /**
     * Connecte un utilisateur et persiste la session
     */
    public login(user: UserModel) {
        try {
            // Créer une instance UserModel propre
            this.userConnected = new UserModel(user);

            // Persister dans sessionStorage
            if (typeof window !== 'undefined') {
                const userToStore = {
                    ...user,
                    created_at: (user.created_at as unknown) instanceof Date
                        ? user.created_at.toString() 
                        : user.created_at,
                    updated_at: (user.updated_at as unknown) instanceof Date 
                        ? user.updated_at.toString() 
                        : user.updated_at,
                };
                sessionStorage.setItem('userConnected', JSON.stringify(userToStore));
                Cookies.set('userConnected', JSON.stringify(userToStore));
            }

            console.log('✅ Utilisateur connecté:', this._userConnected?.nom);
            this.notify();
        } catch (error) {
            console.error('❌ Erreur lors de la connexion:', error);
            throw error;
        }
    }

    /**
     * Déconnecte l'utilisateur et nettoie la session
     */
    public logout() {

        this.userConnected = null;
        
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('userConnected');
            Cookies.remove('userConnected');
        }

      
        console.log('👋 Utilisateur déconnecté');
        this.notify();
    }

    /**
     * Toggle la langue
     */
    public toggleLanguage() {
        this.lang = this.lang === Language.FR ? Language.EN : Language.FR;
        console.log(`🌐 Langue changée: ${this.lang}`);
    }

    /**
     * Définit la langue
     */
    public setLanguage(lang: Language) {
        this.lang = lang;
        console.log(`🌐 Langue définie: ${this.lang}`);
    }
}

import { UserModel } from '@/domain/models';
import { useState, useEffect } from 'react';


export function useAppState() {
    const [, setTick] = useState(0);

    useEffect(() => {
        const instance = AppState.MainInstance;
        const unsubscribe = instance.subscribe(() => {
            setTick(tick => tick + 1);
        });
        
        return () => {
            unsubscribe();
        };
    }, []);

    return AppState.MainInstance;
}

export function getUserConnected() {
    const appState = AppState.MainInstance;
    return appState.userConnected;
}