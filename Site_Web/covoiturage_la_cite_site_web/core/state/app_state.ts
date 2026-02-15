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

                    if (typeof window !== "undefined") {
                        localStorage.setItem("app_state", JSON.stringify(target));
                    }
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

export class AppState extends ObservableObject {
    private static instance: AppState | null = null;
    public lang = Language.FR;

    private constructor() {
        super();
    }

    public static get MainInstance(): AppState {
        if (!AppState.instance) AppState.instance = new AppState();
        return AppState.instance;
    }

    public toggleLanguage() {
        this.lang  = this.lang === Language.FR ? Language.EN : Language.FR;
        console.log(`Justice for all: Language switched to ${this.lang}`);
    }
    public setLanguage(lang: Language) {
        this.lang = lang;
        console.log(`Justice for all: Language set to ${this.lang}`);
    }
}

export enum Language {
    FR = 'fr',
    EN = 'en',
}
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