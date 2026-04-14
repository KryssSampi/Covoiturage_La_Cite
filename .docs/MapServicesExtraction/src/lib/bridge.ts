// ─────────────────────────────────────────────────────────────────────────────
// lib/bridge.ts
// Pont WebView ↔ C# (.NET MAUI)
//
// Entrant  (C# → WebView) : window.postMessage(JSON.stringify(msg), '*')
// Sortant  (WebView → C#) : window.chrome.webview?.postMessage(JSON.stringify(msg))
//                         | window.ReactNativeWebView?.postMessage(JSON.stringify(msg))
//                         | window.parent.postMessage(JSON.stringify(msg), '*')  ← fallback dev
// ─────────────────────────────────────────────────────────────────────────────
import type { BridgeIncoming, BridgeOutgoing } from '@/types'

type Handler = (msg: BridgeIncoming) => void

const _handlers: Handler[] = []
let   _initialized = false

/** Initialise l'écoute des messages entrants. Appeler une seule fois. */
export function initBridge(onMessage: Handler) {
  _handlers.push(onMessage)
  if (_initialized) return
  _initialized = true

  window.addEventListener('message', (e) => {
    try {
      const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
      if (data?.type) _handlers.forEach((h) => h(data as BridgeIncoming))
    } catch { /* ignore non-JSON */ }
  })
}

/** Envoie un message vers C# (ou la fenêtre parente en dev). */
export function sendToBridge(msg: BridgeOutgoing) {
  const json = JSON.stringify(msg)
  try {
    // .NET MAUI WebView2
    const w = window as Window & {
      chrome?: { webview?: { postMessage: (s: string) => void } }
      ReactNativeWebView?: { postMessage: (s: string) => void }
    }
    if (w.chrome?.webview?.postMessage) {
      w.chrome.webview.postMessage(json)
    } else if (w.ReactNativeWebView?.postMessage) {
      w.ReactNativeWebView.postMessage(json)
    } else {
      // Fallback dev (iframe parent ou même fenêtre)
      window.parent.postMessage(json, '*')
    }
  } catch (err) {
    console.warn('[Bridge] sendToBridge failed:', err)
  }
}

/** Helper : expose une API globale window.mapBridge pour les tests manuels */
export function exposeBridgeGlobally(
  setCircuits: (circuits: Parameters<Handler>[0] extends { type: 'SET_CIRCUITS' } ? Parameters<Handler>[0]['circuits'] : never) => void,
  selectCircuit: (index: number) => void,
) {
  ;(window as unknown as Record<string, unknown>).mapBridge = {
    /** Envoie un message entrant comme si C# l'avait envoyé */
    send: (msg: BridgeIncoming) => _handlers.forEach((h) => h(msg)),
    /** Raccourcis pratiques pour les tests console */
    setCircuits,
    selectCircuit,
    /** Log des messages sortants */
    _outgoing: [] as BridgeOutgoing[],
  }
}
