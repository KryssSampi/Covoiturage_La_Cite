/**
 * ProfileTab — Onglet "Mon Profil"
 * Informations personnelles de base : nom, rôle scolaire, bio, langues
 */

"use client";

import { FaPencil } from "react-icons/fa6";
import { Language, useAppState } from "@/core/state/app_state";
import type { MeData, SchoolRoleEditable } from "../../types/profile.types";

interface ProfileTabProps {
  user: MeData;
  onChange: (updates: Partial<MeData>) => void;
}

const translations = {
  fr: {
    title: "Mon Profil",
    description: "Gérez vos données de base visibles par les autres membres.",
    firstName: "Prénom",
    lastName: "Nom",
    phone: "Téléphone",
    phonePlaceholder: "ex: 613-555-0101",
    schoolRole: "Rôle à l'école",
    bio: "Bio",
    bioPlaceholder: "Ajoutez une bio pour vous présenter...",
    languages: "Langues parlées",
    selectSchoolRole: "Sélectionnez votre rôle",
    etudiant: "Étudiant",
    professeur: "Professeur",
    membredupersonnel: "Membre du personnel",
    administrateur: "Administrateur",
  },
  en: {
    title: "My Profile",
    description: "Manage your base data visible to other members.",
    firstName: "First Name",
    lastName: "Last Name",
    phone: "Phone",
    phonePlaceholder: "e.g. 613-555-0101",
    schoolRole: "School Role",
    bio: "Bio",
    bioPlaceholder: "Add a bio to introduce yourself...",
    languages: "Spoken Languages",
    selectSchoolRole: "Select your role",
    etudiant: "Student",
    professeur: "Professor",
    membredupersonnel: "Staff Member",
    administrateur: "Administrator",
  },
};

// Labels de langues pour l'affichage des badges
const languageLabels: Record<string, string> = {
  FR: "Français",
  EN: "English",
  ES: "Español",
  DE: "Deutsch",
  IT: "Italiano",
  PT: "Português",
  ZH: "中文",
  AR: "العربية",
  HI: "हिन्दी",
  RU: "Русский",
  JA: "日本語",
  KO: "한국어",
  NL: "Nederlands",
  PL: "Polski",
  TR: "Türkçe",
  VI: "Tiếng Việt",
  TH: "ไทย",
  SV: "Svenska",
  RO: "Română",
  EL: "Ελληνικά",
};

export function ProfileTab({ user, onChange }: ProfileTabProps) {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;
  const t = isFR ? translations.fr : translations.en;

  const schoolRoleLabelsFR: Record<string, string> = {
    etudiant: "Étudiant",
    professeur: "Professeur",
    membredupersonnel: "Membre du personnel",
    administrateur: "Administrateur",
  };
  const schoolRoleLabelsEN: Record<string, string> = {
    etudiant: "Student",
    professeur: "Professor",
    membredupersonnel: "Staff Member",
    administrateur: "Administrator",
  };
  const schoolRoleLabels = isFR ? schoolRoleLabelsFR : schoolRoleLabelsEN;

  return (
    <div>
      <p className="mb-4 text-sm text-gray-500">{t.description}</p>

      {/* Email institutionnel (lecture seule) */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">Courriel institutionnel</label>
        <input
          value={user.email || ''}
          readOnly
          className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm"
        />
      </div>

      {/* Courriel notification (éditable) */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">{isFR ? "Courriel de notification (optionnel)" : "Notification email (optional)"}</label>
        <div className="relative">
          <input
            type="email"
            value={user.notificationEmail || ''}
            onChange={(e) => onChange({ notificationEmail: e.target.value || undefined })}
            placeholder="ex: mon.email@gmail.com"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
          />
          <FaPencil size={12} className="absolute right-3 top-3 text-gray-400" />
        </div>
        <p className="mt-1 text-xs text-gray-500">Recevez vos notifications sur ce courriel secondaire.</p>
      </div>

      {/* Prénom et Nom */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{t.firstName}</label>
          <div className="relative">
            <input
              value={user.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
            />
            <FaPencil size={12} className="absolute right-3 top-3 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">{t.lastName}</label>
          <div className="relative">
            <input
              value={user.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
            />
            <FaPencil size={12} className="absolute right-3 top-3 text-gray-400" />
          </div>
      </div>
      </div>

      {/* Téléphone */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">{t.phone}</label>
        <div className="relative">
          <input
            type="tel"
            value={user.phone ?? ""}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder={t.phonePlaceholder}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none"
          />
          <FaPencil size={12} className="absolute right-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Rôle à l'école */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">{t.schoolRole}</label>
        <div className="relative">
          <select
            value={user.schoolRole}
            onChange={(e) => onChange({ schoolRole: e.target.value as SchoolRoleEditable })}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none appearance-none"
          >
            <option value="etudiant">{schoolRoleLabels.etudiant}</option>
            <option value="professeur">{schoolRoleLabels.professeur}</option>
            <option value="membredupersonnel">{schoolRoleLabels.membredupersonnel}</option>
            <option value="administrateur">{schoolRoleLabels.administrateur}</option>
          </select>
          <span className="absolute right-3 top-3 text-gray-400">▼</span>
        </div>
      </div>

      {/* Bio */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">{t.bio}</label>
        <textarea
          value={user.bio ?? ""}
          onChange={(e) => onChange({ bio: e.target.value })}
          placeholder={t.bioPlaceholder}
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none resize-none"
        />
      </div>

      {/* Langues parlées */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">{t.languages}</label>
        {/* Langues sélectionnées affichées comme labels/badges */}
        {user.languagesSpoken && user.languagesSpoken.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {user.languagesSpoken.map((langCode) => (
              <span
                key={langCode}
                className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
              >
                {languageLabels[langCode] ?? langCode}
                <button
                  type="button"
                  onClick={() => {
                    const updated = (user.languagesSpoken ?? []).filter((l) => l !== langCode);
                    onChange({ languagesSpoken: updated });
                  }}
                  className="ml-1 text-blue-400 hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        {/* Select riche pour ajouter des langues */}
        <div className="relative">
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                const current = user.languagesSpoken ?? [];
                if (!current.includes(e.target.value)) {
                  onChange({ languagesSpoken: [...current, e.target.value] });
                }
              }
              e.target.value = "";
            }}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none appearance-none"
          >
            <option value="">{isFR ? "+ Ajouter une langue..." : "+ Add a language..."}</option>
            <option value="FR">🇫🇷 {isFR ? "Français" : "French"}</option>
            <option value="EN">🇬🇧 {isFR ? "Anglais" : "English"}</option>
            <option value="ES">🇪🇸 {isFR ? "Espagnol" : "Spanish"}</option>
            <option value="DE">🇩🇪 {isFR ? "Allemand" : "German"}</option>
            <option value="IT">🇮🇹 {isFR ? "Italien" : "Italian"}</option>
            <option value="PT">🇵🇹 {isFR ? "Portugais" : "Portuguese"}</option>
            <option value="ZH">🇨🇳 {isFR ? "Chinois" : "Chinese"}</option>
            <option value="AR">🇸🇦 {isFR ? "Arabe" : "Arabic"}</option>
            <option value="HI">🇮🇳 {isFR ? "Hindi" : "Hindi"}</option>
            <option value="RU">🇷🇺 {isFR ? "Russe" : "Russian"}</option>
            <option value="JA">🇯🇵 {isFR ? "Japonais" : "Japanese"}</option>
            <option value="KO">🇰🇷 {isFR ? "Coréen" : "Korean"}</option>
            <option value="NL">🇳🇱 {isFR ? "Néerlandais" : "Dutch"}</option>
            <option value="PL">🇵🇱 {isFR ? "Polonais" : "Polish"}</option>
            <option value="TR">🇹🇷 {isFR ? "Turc" : "Turkish"}</option>
            <option value="VI">🇻🇳 {isFR ? "Vietnamien" : "Vietnamese"}</option>
            <option value="TH">🇹🇭 {isFR ? "Thaï" : "Thai"}</option>
            <option value="SV">🇸🇪 {isFR ? "Suédois" : "Swedish"}</option>
            <option value="RO">🇷🇴 {isFR ? "Roumain" : "Romanian"}</option>
            <option value="EL">🇬🇷 {isFR ? "Grec" : "Greek"}</option>
          </select>
          <span className="absolute right-3 top-3 text-gray-400">▼</span>
        </div>
      </div>
    </div>
  );
}
