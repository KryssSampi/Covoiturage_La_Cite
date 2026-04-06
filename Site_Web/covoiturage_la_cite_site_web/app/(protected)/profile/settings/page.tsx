"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLoader } from "@/core/context/loader.context";
import { FaCheck, FaPlus, FaXmark } from "react-icons/fa6";
import { SettingsSidebar } from "@/features/profile/components/SettingsSidebar";
import type { MeData, SettingsTab, UserPreferences } from "@/features/profile/types/profile.types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          value ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            value ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}

function SaveButton({
  saving,
  saved,
  onClick,
}: {
  saving: boolean;
  saved: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
        saved
          ? "bg-green-100 text-green-700"
          : "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
      }`}
    >
      {saving ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : saved ? (
        <>
          <FaCheck size={13} /> Enregistré
        </>
      ) : (
        "Enregistrer les modifications"
      )}
    </button>
  );
}

function schoolRoleLabel(role: string): string {
  const map: Record<string, string> = {
    etudiant: "Étudiant",
    professeur: "Professeur",
    membredupersonnel: "Membre du personnel",
    administrateur: "Administrateur",
  };
  if (typeof role !== "string") return role == null ? "" : String(role);
  const key = role.toLowerCase().replace(/\s+/g, "");
  return map[key] ?? role;
}

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    driver: "Conducteur",
    passenger: "Passager",
    admin: "Administrateur",
  };
  if (typeof role !== "string") return role == null ? "" : String(role);
  const key = role.toLowerCase().replace(/\s+/g, "");
  return map[key] ?? role;
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function ProfileSettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = (searchParams.get("tab") as SettingsTab) ?? "profile";
  const [tab, setTab] = useState<SettingsTab>(initialTab);

  const { setActiveLoader } = useLoader();

  const [me, setMe] = useState<MeData | null>(null);

  // Profil form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState("fr");
  const [languages, setLanguages] = useState<string[]>(["fr"]);
  const [langInput, setLangInput] = useState("");

  // Préférences form
  const [prefs, setPrefs] = useState<UserPreferences>({
    musicAccepted: false,
    petsAccepted: false,
    smokingAccepted: false,
    conversationLevel: "moderate",
    emailPrimordiales: true,
    emailSecondaires: true,
    emailNegligeables: false,
    pushPrimordiales: true,
    pushSecondaires: true,
    pushNegligeables: false,
  });

  // Save states
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savedPrefs, setSavedPrefs] = useState(false);

  // Charger le profil
  useEffect(() => {
    setActiveLoader(true);
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((data: MeData) => {
        setMe(data);
        setFirstName(data.firstName ?? "");
        setLastName(data.lastName ?? "");
        setBio(data.bio ?? "");
        setPhone(data.phone ?? "");
        setLanguage(data.language ?? "fr");
        setLanguages(data.languagesSpoken?.length ? data.languagesSpoken : [data.language ?? "fr"]);
        if (data.preferences) setPrefs(data.preferences);
      })
      .finally(() => setActiveLoader(false));
  }, [setActiveLoader]);

  // Sync tab depuis query param
  useEffect(() => {
    const t = searchParams.get("tab") as SettingsTab;
    if (t) setTab(t);
  }, [searchParams]);

  // Navigation vers un onglet
  const navigateToTab = (newTab: SettingsTab) => {
    setTab(newTab);
    router.push(`/profile/settings?tab=${newTab}`);
  };

  // ── Langues ──────────────────────────────────────────────────────────────

  const addLanguage = () => {
    const val = langInput.trim().toUpperCase();
    if (!val || languages.map((l) => l.toUpperCase()).includes(val)) {
      setLangInput("");
      return;
    }
    setLanguages([...languages, val]);
    setLangInput("");
  };

  const removeLanguage = (lang: string) => {
    setLanguages(languages.filter((l) => l !== lang));
  };

  // ── Sauvegarde profil ─────────────────────────────────────────────────────

  const saveProfile = async () => {
    setSavingProfile(true);
    setSavedProfile(false);
    try {
      const r = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          bio: bio || undefined,
          phoneNumber: phone || undefined,
          language,
          languagesSpoken: languages.length ? languages : undefined,
        }),
      });
      if (r.ok) setSavedProfile(true);
    } finally {
      setSavingProfile(false);
      setTimeout(() => setSavedProfile(false), 3000);
    }
  };

  // ── Sauvegarde préférences ────────────────────────────────────────────────

  const savePrefs = async () => {
    setSavingPrefs(true);
    setSavedPrefs(false);
    try {
      const r = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: prefs }),
      });
      if (r.ok) setSavedPrefs(true);
    } finally {
      setSavingPrefs(false);
      setTimeout(() => setSavedPrefs(false), 3000);
    }
  };

  // ── Déconnexion ───────────────────────────────────────────────────────────

  const handleLogout = async () => {
    setActiveLoader(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    } catch {
      // ignore
    }
    router.push("/login");
  };

  if (!me) return null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 text-gray-800">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar */}
        <SettingsSidebar
          user={me}
          activeTab={tab}
          onNavigate={navigateToTab}
          onLogout={handleLogout}
        />

        {/* Contenu principal */}
        <div className="flex-1">
          <h1 className="mb-1 text-xl font-bold">
            {tab === "profile" ? "Configuration du profil" : "Paramètres"}
          </h1>
          <p className="mb-6 text-sm text-gray-400">
            {tab === "profile"
              ? "Gérez vos données de base visibles par les autres membres."
              : "Configurez vos préférences pour une meilleure expérience."}
          </p>

          {/* ── Tab Profil ─────────────────────────────────────────────────── */}
          {tab === "profile" && (
            <div className="flex flex-col gap-5">
              {/* Nom */}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Prénom
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Nom
                </label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
                  placeholder="Parlez-vous de vous…"
                />
                <p className="mt-1 text-right text-xs text-gray-300">{bio.length}/500</p>
              </div>

              {/* Téléphone */}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
                  placeholder="+1 613 555 0100"
                />
              </div>

              {/* Langue principale */}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Langue principale
                </label>
                <input
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  maxLength={5}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
                  placeholder="fr"
                />
              </div>

              {/* Langues parlées */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Langues parlées
                </label>
                <div className="mb-3 flex flex-wrap gap-2">
                  {languages.map((l) => (
                    <span
                      key={l}
                      className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700"
                    >
                      {l.toUpperCase()}
                      <button
                        onClick={() => removeLanguage(l)}
                        className="ml-1 text-blue-400 hover:text-blue-600"
                        aria-label={`Supprimer ${l}`}
                      >
                        <FaXmark size={10} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={langInput}
                    onChange={(e) => setLangInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addLanguage()}
                    placeholder="ex: EN, ES, AR…"
                    maxLength={10}
                    className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                  />
                  <button
                    onClick={addLanguage}
                    className="flex items-center gap-1 rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
                  >
                    <FaPlus size={11} /> Ajouter
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Tapez un code de langue (FR, EN, ES…) et appuyez sur Entrée
                </p>
              </div>

              <SaveButton saving={savingProfile} saved={savedProfile} onClick={saveProfile} />
            </div>
          )}

          {/* ── Tab Paramètres ─────────────────────────────────────────────── */}
          {tab === "settings" && (
            <div className="flex flex-col gap-6">
              {/* Ambiance de trajet */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Ambiance de trajet</h3>
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm divide-y divide-gray-50">
                  <Toggle
                    value={prefs.musicAccepted}
                    onChange={(v) => setPrefs({ ...prefs, musicAccepted: v })}
                    label="Musique acceptée"
                  />
                  <Toggle
                    value={prefs.petsAccepted}
                    onChange={(v) => setPrefs({ ...prefs, petsAccepted: v })}
                    label="Animaux acceptés"
                  />
                  <Toggle
                    value={prefs.smokingAccepted}
                    onChange={(v) => setPrefs({ ...prefs, smokingAccepted: v })}
                    label="Fumeur"
                  />
                </div>
              </div>

              {/* Niveau de conversation */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Niveau de conversation</h3>
                <div className="flex gap-2">
                  {["quiet", "moderate", "chatty"].map((level) => (
                    <button
                      key={level}
                      onClick={() => setPrefs({ ...prefs, conversationLevel: level })}
                      className={`flex-1 rounded-xl border py-2 text-xs font-medium capitalize transition-all ${
                        prefs.conversationLevel === level
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {level === "quiet" ? "Calme" : level === "moderate" ? "Modéré" : "Bavard"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications par email */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Notifications par email</h3>
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm divide-y divide-gray-50">
                  <Toggle
                    value={prefs.emailPrimordiales}
                    onChange={(v) => setPrefs({ ...prefs, emailPrimordiales: v })}
                    label="Primordiales (urgentes)"
                  />
                  <Toggle
                    value={prefs.emailSecondaires}
                    onChange={(v) => setPrefs({ ...prefs, emailSecondaires: v })}
                    label="Secondaires (importantes)"
                  />
                  <Toggle
                    value={prefs.emailNegligeables}
                    onChange={(v) => setPrefs({ ...prefs, emailNegligeables: v })}
                    label="Négligeables (infos)"
                  />
                </div>
              </div>

              {/* Notifications push */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Notifications push mobile</h3>
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm divide-y divide-gray-50">
                  <Toggle
                    value={prefs.pushPrimordiales}
                    onChange={(v) => setPrefs({ ...prefs, pushPrimordiales: v })}
                    label="Primordiales (urgentes)"
                  />
                  <Toggle
                    value={prefs.pushSecondaires}
                    onChange={(v) => setPrefs({ ...prefs, pushSecondaires: v })}
                    label="Secondaires (importantes)"
                  />
                  <Toggle
                    value={prefs.pushNegligeables}
                    onChange={(v) => setPrefs({ ...prefs, pushNegligeables: v })}
                    label="Négligeables (infos)"
                  />
                </div>
              </div>

              <SaveButton saving={savingPrefs} saved={savedPrefs} onClick={savePrefs} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
