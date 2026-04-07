"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaCamera,
  FaCheck,
  FaPencil,
  FaRightFromBracket,
  FaUser,
  FaEye,
  FaCar,
  FaBell,
  FaLock,
  FaMagnifyingGlass,
  FaCarSide,
  FaUniversalAccess,
} from "react-icons/fa6";
import { Language, useAppState } from "@/core/state/app_state";
import { useLoader } from "@/core/context/loader.context";
import { mockMeData } from "@/features/profile/fixtures/profile.fixtures";
import { mockVehicles } from "@/features/profile/fixtures/vehicles.fixtures";
import type {
  MeData,
  SettingsTab,
  ProfileVisibility,
  VehicleInfo,
} from "@/features/profile/types/profile.types";
import {
  ProfileTab,
  VisibilityTab,
  TripAmbianceTab,
  NotificationsTab,
  PrivacyTab,
  SearchPreferencesTab,
  VehicleTab,
  AccessibilityTab,
} from "@/features/profile/components/settings";
import { CoverPhotoOverlay, type UploadedCoverImage } from "@/features/profile/components/settings/overlays/CoverPhotoOverlay";
import { ProfilePhotoOverlay } from "@/features/profile/components/settings/overlays/ProfilePhotoOverlay";
import { BadgesOrganizerOverlay } from "@/features/profile/components/settings/overlays/BadgesOrganizerOverlay";
import { PROFILE_BADGE_CATALOG, getBadgeIcon } from "@/features/profile/components/settings/constants/badgeCatalog";

// ── Helpers ───────────────────────────────────────────────────────────────────

const ICON_COLOR = "#08316e";
const DEFAULT_COVER_IMAGES = [
  "/img/planifier-background.png",
  "/img/list-detail-background.png",
  "/img/nouveautes-section-background.png",
];

function schoolRoleLabel(role: string, isFR: boolean): string {
  const mapFR: Record<string, string> = {
    etudiant: "Étudiant",
    professeur: "Professeur",
    membredupersonnel: "Membre du personnel",
    administrateur: "Administrateur",
  };
  const mapEN: Record<string, string> = {
    etudiant: "Student",
    professeur: "Professor",
    membredupersonnel: "Staff Member",
    administrateur: "Administrator",
  };
  const map = isFR ? mapFR : mapEN;
  return map[role?.toLowerCase()] ?? role;
}

function appRoleLabel(role: string, isFR: boolean): string {
  const mapFR: Record<string, string> = {
    driver: "Conducteur",
    passenger: "Passager",
    admin: "Administrateur",
    moderator: "Modérateur",
  };
  const mapEN: Record<string, string> = {
    driver: "Driver",
    passenger: "Passenger",
    admin: "Administrator",
    moderator: "Moderator",
  };
  const map = isFR ? mapFR : mapEN;
  return map[role?.toLowerCase()] ?? role;
}

// ── Traductions ───────────────────────────────────────────────────────────────

const translations = {
  fr: {
    profileSummary: "Résumé du profil",
    myBio: "Ma Bio",
    myBadges: "Mes Badges",
    manage: "Organiser",
    logout: "Déconnexion",
    profile: "Mon Profil",
    visibility: "Visibilité",
    trip: "Ambiance Trajet",
    notifications: "Notifications",
    privacy: "Confidentialité",
    actually: "Actuellement",
    search: "Recherche",
    vehicle: "Véhicule",
    accessibility: "Accessibilité",
    saveChanges: "Enregistrer les modifications",
    saved: "Enregistré",
    previewProfile: "Voir l'aperçu de mon profil",
    noBadgeSelected: "Aucun badge sélectionné",
    badgesVisibilityHint: "Jusqu'à 9 badges visibles sur votre profil public.",
    changeCoverPhoto: "Changer la photo de couverture",
    changeProfilePhoto: "Changer la photo de profil",
  },
  en: {
    profileSummary: "Profile Summary",
    myBio: "My Bio",
    myBadges: "My Badges",
    manage: "Organize",
    logout: "Logout",
    profile: "My Profile",
    visibility: "Visibility",
    trip: "Trip Ambiance",
    actually : "Currently",
    notifications: "Notifications",
    privacy: "Privacy",
    search: "Search",
    vehicle: "Vehicle",
    accessibility: "Accessibility",
    saveChanges: "Save Changes",
    saved: "Saved",
    previewProfile: "Preview my profile",
    noBadgeSelected: "No badge selected",
    badgesVisibilityHint: "Up to 9 badges visible on your public profile.",
    changeCoverPhoto: "Change cover photo",
    changeProfilePhoto: "Change profile photo",
  },
};

// ── Page Principale ───────────────────────────────────────────────────────────

export default function ProfileSettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useAppState();
  const isFR = lang === Language.FR;
  const t = isFR ? translations.fr : translations.en;

  const initialTab = (searchParams.get("tab") as SettingsTab) ?? "profile";
  const [tab, setTab] = useState<SettingsTab>(initialTab);
  const { setActiveLoader } = useLoader();

  const [me, setMe] = useState<MeData | null>(null);
  const [profileData, setProfileData] = useState<MeData | null>(null);
  const [visibility, setVisibility] = useState<ProfileVisibility>({
    goScore: true,
    tripsCount: true,
    globalRating: true,
    co2Saved: true,
  });
  const [tripPrefs, setTripPrefs] = useState<{
    musicAccepted: boolean;
    petsAccepted: boolean;
    smokingAccepted: boolean;
    conversationLevel: "quiet" | "moderate" | "chatty";
  }>({
    musicAccepted: true,
    petsAccepted: false,
    smokingAccepted: false,
    conversationLevel: "moderate",
  });
  const [notifPrefs, setNotifPrefs] = useState({
    emailPrimordiales: true,
    emailSecondaires: true,
    emailNegligeables: false,
    pushPrimordiales: true,
    pushSecondaires: true,
    pushNegligeables: false,
  });
  const [privacy, setPrivacy] = useState({
    showPhoneNumber: false,
    showLastName: true,
    allowAffinityTracking: true,
  });
  const [searchPrefs, setSearchPrefs] = useState<{
    defaultDepartureRadiusMeters: number;
    defaultArrivalRadiusMeters: number;
    defaultTimeToleranceMinutes: number;
    defaultMaxPrice?: number;
    requireVerifiedDriver: boolean;
    minDriverGoScore: number;
    minDriverRating: number;
    minPassengerGoScore: number;
    baggagePolicy: "none" | "light" | "heavy";
    requirePassengerMessage: boolean;
  }>({
    defaultDepartureRadiusMeters: 800,
    defaultArrivalRadiusMeters: 800,
    defaultTimeToleranceMinutes: 30,
    defaultMaxPrice: undefined,
    requireVerifiedDriver: false,
    minDriverGoScore: 0,
    minDriverRating: 3.5,
    minPassengerGoScore: 0,
    baggagePolicy: "light",
    requirePassengerMessage: false,
  });
  const [vehicles, setVehicles] = useState<VehicleInfo[]>(() => mockVehicles.map((v) => ({ ...v })));
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(() => {
    const activeVehicle = mockVehicles.find((v) => v.isActive);
    return activeVehicle?.id ?? mockVehicles[0]?.id ?? "";
  });
  const vehicle = vehicles.find((v) => v.id === selectedVehicleId) ?? vehicles[0] ?? null;
  const [accessibility, setAccessibility] = useState({
    fontSize: "medium" as "small" | "medium" | "large",
    highContrast: false,
    reducedMotion: false,
    screenReaderOptimized: false,
  });
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string>(DEFAULT_COVER_IMAGES[0]);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [uploadedCoverImages, setUploadedCoverImages] = useState<UploadedCoverImage[]>([]);
  const [isCoverOverlayOpen, setIsCoverOverlayOpen] = useState(false);
  const [avatarPhotoUrl, setAvatarPhotoUrl] = useState<string | undefined>(mockMeData.avatarUrl);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | undefined>(undefined);
  const [isProfilePhotoOverlayOpen, setIsProfilePhotoOverlayOpen] = useState(false);
  const [isBadgesOverlayOpen, setIsBadgesOverlayOpen] = useState(false);
  const [selectedBadgeIds, setSelectedBadgeIds] = useState<string[]>(
    PROFILE_BADGE_CATALOG.slice(0, 4).map((badge) => badge.id)
  );

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // États initiaux pour la détection de modifications
  const [initialProfileData, setInitialProfileData] = useState<MeData | null>(null);
  const [initialVisibility, setInitialVisibility] = useState<ProfileVisibility | null>(null);
  const [initialTripPrefs, setInitialTripPrefs] = useState<typeof tripPrefs | null>(null);
  const [initialNotifPrefs, setInitialNotifPrefs] = useState<typeof notifPrefs | null>(null);
  const [initialPrivacy, setInitialPrivacy] = useState<typeof privacy | null>(null);
  const [initialSearchPrefs, setInitialSearchPrefs] = useState<typeof searchPrefs | null>(null);
  const [initialAccessibility, setInitialAccessibility] = useState<typeof accessibility | null>(null);

  // Détection de modifications par onglet
  const hasChanges = (() => {
    switch (tab) {
      case "profile":
        return initialProfileData
          ? JSON.stringify(profileData) !== JSON.stringify(initialProfileData)
          : false;
      case "visibility":
        return initialVisibility
          ? JSON.stringify(visibility) !== JSON.stringify(initialVisibility)
          : false;
      case "trip":
        return initialTripPrefs
          ? JSON.stringify(tripPrefs) !== JSON.stringify(initialTripPrefs)
          : false;
      case "notifications":
        return initialNotifPrefs
          ? JSON.stringify(notifPrefs) !== JSON.stringify(initialNotifPrefs)
          : false;
      case "privacy":
        return initialPrivacy
          ? JSON.stringify(privacy) !== JSON.stringify(initialPrivacy)
          : false;
      case "search":
        return initialSearchPrefs
          ? JSON.stringify(searchPrefs) !== JSON.stringify(initialSearchPrefs)
          : false;
      case "vehicle":
        return false;
      case "accessibility":
        return initialAccessibility
          ? JSON.stringify(accessibility) !== JSON.stringify(initialAccessibility)
          : false;
      default:
        return false;
    }
  })();

  const handleSaveWithReset = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      // Réinitialiser les états initiaux après sauvegarde
      setInitialProfileData(profileData);
      setInitialVisibility({ ...visibility });
      setInitialTripPrefs({ ...tripPrefs });
      setInitialNotifPrefs({ ...notifPrefs });
      setInitialPrivacy({ ...privacy });
      setInitialSearchPrefs({ ...searchPrefs });
      setInitialAccessibility({ ...accessibility });
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  // Charger le profil (utilise les fixtures pour l'instant)
  useEffect(() => {
    setActiveLoader(true);
    setTimeout(() => {
      setMe(mockMeData);
      setProfileData(mockMeData);
      setAvatarPhotoUrl(mockMeData.avatarUrl);
      setInitialProfileData(mockMeData);
      if (mockMeData.preferences) {
        const newTripPrefs = {
          musicAccepted: mockMeData.preferences.musicAccepted ?? true,
          petsAccepted: mockMeData.preferences.petsAccepted ?? false,
          smokingAccepted: mockMeData.preferences.smokingAccepted ?? false,
          conversationLevel: (mockMeData.preferences.conversationLevel as "quiet" | "moderate" | "chatty") ?? "moderate",
        };
        setTripPrefs(newTripPrefs);
        setInitialTripPrefs(newTripPrefs);
        const newNotifPrefs = {
          emailPrimordiales: mockMeData.preferences.emailPrimordiales ?? true,
          emailSecondaires: mockMeData.preferences.emailSecondaires ?? true,
          emailNegligeables: mockMeData.preferences.emailNegligeables ?? false,
          pushPrimordiales: mockMeData.preferences.pushPrimordiales ?? true,
          pushSecondaires: mockMeData.preferences.pushSecondaires ?? true,
          pushNegligeables: mockMeData.preferences.pushNegligeables ?? false,
        };
        setNotifPrefs(newNotifPrefs);
        setInitialNotifPrefs(newNotifPrefs);
      }
      setInitialVisibility({ ...visibility });
      setInitialPrivacy({ ...privacy });
      setInitialSearchPrefs({ ...searchPrefs });
      setInitialAccessibility({ ...accessibility });
      setActiveLoader(false);
    }, 500);
  }, [setActiveLoader]);

  const navigateToTab = (newTab: SettingsTab) => {
    setTab(newTab);
    router.push(`/profile/settings?tab=${newTab}`);
  };

  const handleLogout = () => {
    router.push("/login");
  };

  if (!me) return null;

  const selectedBadges = PROFILE_BADGE_CATALOG.filter((badge) => selectedBadgeIds.includes(badge.id));
  const displayedCoverUrl = coverPreviewUrl ?? coverPhotoUrl;
  const displayedAvatarUrl = avatarPreviewUrl ?? avatarPhotoUrl ?? me.avatarUrl ?? "/assets/placeholder/placeholer-profile-picture.png";

  const showPreviewButton = tab === "profile" || tab === "visibility";
  const profilePreviewHref = me ? `/profile/${me.id}` : "#";

  const tabs = [
    { key: "profile" as SettingsTab, label: t.profile, icon: <FaUser size={14} /> },
    { key: "visibility" as SettingsTab, label: t.visibility, icon: <FaEye size={14} /> },
    { key: "trip" as SettingsTab, label: t.trip, icon: <FaCar size={14} /> },
    { key: "notifications" as SettingsTab, label: t.notifications, icon: <FaBell size={14} /> },
    { key: "privacy" as SettingsTab, label: t.privacy, icon: <FaLock size={14} /> },
    { key: "search" as SettingsTab, label: t.search, icon: <FaMagnifyingGlass size={14} /> },
    { key: "vehicle" as SettingsTab, label: t.vehicle, icon: <FaCarSide size={14} /> },
    { key: "accessibility" as SettingsTab, label: t.accessibility, icon: <FaUniversalAccess size={14} /> },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 text-gray-800">
      {/* ── Banner ────────────────────────────────────────────────────────── */}
      <div className="relative mb-16 overflow-visible">
        <div className="relative h-48 w-full overflow-hidden rounded-2xl">
          <Image
            src={displayedCoverUrl}
            alt="Banner"
            fill
            className="object-cover"
          />

          <button
            type="button"
            onClick={() => {
              setCoverPreviewUrl(null);
              setIsCoverOverlayOpen(true);
            }}
            className="absolute bottom-2 right-4 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-md hover:bg-gray-50"
          >
            <FaPencil size={12} style={{ color: ICON_COLOR }} />
            {t.changeCoverPhoto}
          </button>
        </div>

        <div className="absolute -bottom-12 left-6 z-10">
          <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow-lg sm:h-36 sm:w-36">
            <Image
              src={displayedAvatarUrl}
              alt={`${me.firstName} ${me.lastName}`}
              fill
              className="object-cover"
            />
         
          </div>
          <button
            type="button"
            onClick={() => {
              setAvatarPreviewUrl(undefined);
              setIsProfilePhotoOverlayOpen(true);
            }}
            className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:text-gray-700"
            aria-label={t.changeProfilePhoto}
          >
            <FaCamera size={14} />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        <aside className=" relative w-full shrink-0 lg:w-72">
          {/* Résumé du profil */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-500">{t.profileSummary}</h3>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold">{me.firstName} {me.lastName}</p>
              <FaCheck className="text-white rounded-full bg-blue-500 p-1" size={16} />
            </div>
            <p className="text-sm text-gray-500">
              {schoolRoleLabel(profileData?.schoolRole ?? "", isFR)}
            </p>
            <p className="text-xs text-gray-400">
              {t.actually} - {appRoleLabel(me.role, isFR)}
            </p>
          </div>

          {/* Ma Bio */}
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-700">{t.myBio}</h3>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm leading-relaxed text-gray-600">
                {profileData?.bio || (isFR ? "Ajoutez une bio pour vous présenter..." : "Add a bio to introduce yourself...")}
              </p>
            </div>
          </div>

          {/* Mes Badges */}
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">{t.myBadges}</h3>
              <button
                type="button"
                onClick={() => setIsBadgesOverlayOpen(true)}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                {t.manage}
              </button>
            </div>
            {selectedBadges.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {selectedBadges.slice(0, 9).map((badge) => {
                  const Icon = getBadgeIcon(badge.iconKey);
                  return (
                    <div key={badge.id} className="flex flex-col items-center gap-1 rounded-lg bg-gray-50 p-2">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${badge.colorClass}`}>
                        <Icon size={14} />
                      </div>
                      <span className="text-center text-[10px] font-medium text-gray-600">
                        {isFR ? badge.nameFr : badge.nameEn}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">{t.noBadgeSelected}</p>
            )}
            <p className="mt-2 text-[11px] text-gray-400">{t.badgesVisibilityHint}</p>
          </div>

          {/* Déconnexion */}
          <button
            onClick={handleLogout}
            className="flex absolute bottom-3 w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition-all hover:bg-red-700"
          >
            <FaRightFromBracket size={14} />
            {t.logout}
          </button>
        </aside>

        {/* ── Contenu principal ───────────────────────────────────────────── */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="flex gap-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => navigateToTab(t.key)}
                className={`rounded-t-xl px-4 py-2 text-sm font-medium transition-all ${
                  tab === t.key
                    ? "bg-white text-blue-600 border-t-2 border-x-2 border-blue-500"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="rounded-b-xl flex-1 min-h-[70vh] max-w-full rounded-r-xl border-b border-x border-gray-200 bg-white p-6 shadow-sm">
            {/* En-tête avec titre et bouton d'enregistrement */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                {tab === "profile" && <h2 className="text-xl font-bold">{t.profile}</h2>}
                {tab === "visibility" && <h2 className="text-xl font-bold">{t.visibility}</h2>}
                {tab === "trip" && <h2 className="text-xl font-bold">{t.trip}</h2>}
                {tab === "notifications" && <h2 className="text-xl font-bold">{t.notifications}</h2>}
                {tab === "privacy" && <h2 className="text-xl font-bold">{t.privacy}</h2>}
                {tab === "search" && <h2 className="text-xl font-bold">{t.search}</h2>}
                {tab === "vehicle" && <h2 className="text-xl font-bold">{t.vehicle}</h2>}
                {tab === "accessibility" && <h2 className="text-xl font-bold">{t.accessibility}</h2>}
              </div>
              {tab !== "vehicle" && (
                <button
                  onClick={handleSaveWithReset}
                  disabled={!hasChanges || saving}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                    !hasChanges || saving
                      ? "cursor-not-allowed bg-gray-200 text-gray-400"
                      : saved
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {saving ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : saved ? (
                    <FaCheck size={13} />
                  ) : hasChanges ? (
                    <FaPencil size={12} />
                  ) : (
                    <FaCheck size={12} className="opacity-0" />
                  )}
                  <span className="text-xs">{saved ? t.saved : t.saveChanges}</span>
                </button>
              )}
            </div>

            {tab === "profile" && profileData && (
              <ProfileTab user={profileData} onChange={(updates) => setProfileData({ ...profileData, ...updates })} />
            )}

            {tab === "visibility" && (
              <VisibilityTab visibility={visibility} onChange={setVisibility} />
            )}

            {tab === "trip" && (
              <TripAmbianceTab preferences={tripPrefs} onChange={setTripPrefs} />
            )}

            {tab === "notifications" && (
              <NotificationsTab preferences={notifPrefs} onChange={setNotifPrefs} />
            )}

            {tab === "privacy" && (
              <PrivacyTab privacy={privacy} onChange={setPrivacy} />
            )}

            {tab === "search" && (
              <SearchPreferencesTab preferences={searchPrefs} onChange={setSearchPrefs} />
            )}

            {tab === "vehicle" && (
              <VehicleTab
                vehicle={vehicle}
                vehicles={vehicles}
                onChange={(updates) => {
                  const incomingVehicleId = typeof updates.id === "string" ? updates.id : undefined;
                  if (incomingVehicleId && !vehicles.some((v) => v.id === incomingVehicleId)) {
                    setVehicles((prev) => [...prev, updates as VehicleInfo]);
                    setSelectedVehicleId(incomingVehicleId);
                    return;
                  }

                  if (!selectedVehicleId) return;

                  const alwaysUserEditable = new Set<keyof VehicleInfo>(["isActive", "maxSeats"]);
                  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
                  const adminEditableFields = new Set<keyof VehicleInfo>(
                    (selectedVehicle?.adminEditableConfig?.editableFields ?? []) as (keyof VehicleInfo)[]
                  );

                  const filteredUpdates = Object.fromEntries(
                    Object.entries(updates).filter(([key]) => {
                      const field = key as keyof VehicleInfo;
                      return alwaysUserEditable.has(field) || adminEditableFields.has(field);
                    })
                  ) as Partial<VehicleInfo>;

                  if (Object.keys(filteredUpdates).length === 0) return;

                  setVehicles((prev) =>
                    prev.map((v) =>
                      v.id === selectedVehicleId ? { ...v, ...filteredUpdates } : v
                    )
                  );
                }}
                onSelectVehicle={(vehicleId) => setSelectedVehicleId(vehicleId)}
                onSetActive={(vehicleId) => {
                  setVehicles((prev) =>
                    prev.map((v) => ({
                      ...v,
                      isActive: v.id === vehicleId,
                    }))
                  );
                  setSelectedVehicleId(vehicleId);
                }}
                allowVehicleCreation
              />
            )}

            {tab === "accessibility" && (
              <AccessibilityTab settings={accessibility} onChange={setAccessibility} />
            )}

            {/* Bouton d'aperçu du profil - visible uniquement pour Mon Profil et Visibilité */}
            {showPreviewButton && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <a
                  href={profilePreviewHref}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-blue-600 py-3 text-sm font-semibold text-blue-600 transition-all hover:bg-blue-50"
                >
                  {t.previewProfile}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <CoverPhotoOverlay
        key={isCoverOverlayOpen ? `cover-open-${coverPhotoUrl}` : "cover-closed"}
        isOpen={isCoverOverlayOpen}
        isFR={isFR}
        currentCoverUrl={coverPhotoUrl}
        defaultCoverUrls={DEFAULT_COVER_IMAGES}
        uploadedCoverImages={uploadedCoverImages}
        onUploadImages={(dataUrls) => {
          setUploadedCoverImages((prev) => [
            ...prev,
            ...dataUrls.map((url, idx) => ({ id: `cover-upload-${Date.now()}-${idx}`, url })),
          ]);
        }}
        onDeleteUploadedImage={(imageId) => {
          setUploadedCoverImages((prev) => {
            const imageToDelete = prev.find((image) => image.id === imageId);
            if (imageToDelete && coverPhotoUrl === imageToDelete.url) {
              setCoverPhotoUrl(DEFAULT_COVER_IMAGES[0]);
            }
            if (imageToDelete && coverPreviewUrl === imageToDelete.url) {
              setCoverPreviewUrl(DEFAULT_COVER_IMAGES[0]);
            }
            return prev.filter((image) => image.id !== imageId);
          });
        }}
        onPreview={(url) => setCoverPreviewUrl(url)}
        onSave={(url) => {
          setCoverPhotoUrl(url);
          setCoverPreviewUrl(null);
        }}
        onClose={() => {
          setCoverPreviewUrl(null);
          setIsCoverOverlayOpen(false);
        }}
      />

      <ProfilePhotoOverlay
        key={isProfilePhotoOverlayOpen ? `avatar-open-${avatarPhotoUrl ?? "none"}` : "avatar-closed"}
        isOpen={isProfilePhotoOverlayOpen}
        isFR={isFR}
        currentAvatarUrl={avatarPhotoUrl}
        onPreview={(url) => setAvatarPreviewUrl(url)}
        onSave={(url) => {
          setAvatarPhotoUrl(url);
          setAvatarPreviewUrl(undefined);
          setMe((prev) => (prev ? { ...prev, avatarUrl: url } : prev));
          setProfileData((prev) => (prev ? { ...prev, avatarUrl: url } : prev));
        }}
        onClose={() => {
          setAvatarPreviewUrl(undefined);
          setIsProfilePhotoOverlayOpen(false);
        }}
      />

      <BadgesOrganizerOverlay
        isOpen={isBadgesOverlayOpen}
        isFR={isFR}
        allBadges={PROFILE_BADGE_CATALOG}
        selectedBadgeIds={selectedBadgeIds}
        onSelectionChange={setSelectedBadgeIds}
        onClose={() => setIsBadgesOverlayOpen(false)}
      />
    </main>
  );
}
