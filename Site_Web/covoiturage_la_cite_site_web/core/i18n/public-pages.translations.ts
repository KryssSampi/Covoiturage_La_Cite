/**
 * Dictionnaires de traduction pour les pages publiques et la page d'accueil.
 * Chaque page a son propre dictionnaire mappant les clés FR → EN.
 * Utilisé avec la variable `lang` de `useAppState`.
 *
 * Usage dans un composant :
 *   const { lang } = useAppState();
 *   const t = HOME_TRANSLATIONS;
 *   <h1>{lang === Language.FR ? t.title : t.titleEn}</h1>
 */

/** Retourne la traduction selon la langue courante */
import { Language } from '@/core/i18n/types';

// ─── Helper ──────────────────────────────────────────────────────────────────

/** Retourne la traduction selon la langue courante */
export function t(fr: string, en: string, lang: Language): string {
  return lang === Language.FR ? fr : en;
}

// ─── HOME PAGE (app/page.tsx) ────────────────────────────────────────────────

export const HOME_TRANSLATIONS = {
  // CTA Section
  ctaTitleFr: 'Prêt à Commencer Votre Voyage ?',
  ctaTitleEn: 'Ready To Start Your Trip ?',
  ctaSubtitleFr: 'Rejoignez des centaines d\'étudiants qui voyagent déjà intelligemment avec Nous',
  ctaSubtitleEn: 'Join a hundreds of Students Who Already Start to Travel Wisely',
  ctaButtonFr: 'Créer Mon Compte Gratuitement',
  ctaButtonEn: 'Create My Free Account',
  ctaFooterTextFr: 'Ce site est Réservé aux Membres du Collège de La Cité',
  ctaFooterTextEn: 'This site is reserved for members of the College of La Cité',
} as const;

// ─── ABOUT PAGE (app/(Public)/about/page.tsx) ────────────────────────────────

export const ABOUT_TRANSLATIONS = {
  // Hero
  aboutHeroTitleFr: 'À propos de',
  aboutHeroTitleEn: 'About',
  aboutHeroSubtitleFr: 'Née au cœur du Collège La Cité à Ottawa, notre plateforme réunit étudiants, enseignants et personnel autour d\'une idée simple : partager la route pour économiser, se connecter et protéger l\'environnement. Chaque trajet partagé est un pas vers une communauté plus soudée.',
  aboutHeroSubtitleEn: 'Born at the heart of Collège La Cité in Ottawa, our platform brings together students, teachers and staff around a simple idea: share the ride to save money, connect and protect the environment. Every shared ride is a step towards a closer community.',

  // Piliers
  pillarsTitleFr: 'Nos piliers fondateurs',
  pillarsTitleEn: 'Our Founding Pillars',

  // Mission
  missionTitleFr: 'Mission',
  missionTitleEn: 'Mission',
  missionDescFr: 'Faciliter les déplacements quotidiens entre le campus, les résidences et les quartiers avoisinants. Nous proposons un service fiable, institutionnel et conçu sur mesure pour la réalité des étudiants — horaires variables, budgets serrés, besoins de flexibilité.',
  missionDescEn: 'Facilitate daily travel between campus, residences and surrounding neighborhoods. We offer a reliable, institutional service designed for the reality of students — variable schedules, tight budgets, flexibility needs.',
  missionBullet1Fr: 'Trajets adaptés aux horaires de cours',
  missionBullet1En: 'Trips adapted to class schedules',
  missionBullet2Fr: 'Intégration avec l\'identité institutionnelle',
  missionBullet2En: 'Integration with institutional identity',
  missionBullet3Fr: 'Application web et mobile disponibles',
  missionBullet3En: 'Web and mobile applications available',

  // Communauté
  communityTitleFr: 'Communauté',
  communityTitleEn: 'Community',
  communityDescFr: 'Plus qu\'un simple outil de transport, Covoiturage La Cité crée des liens. Conducteurs et passagers partagent le même campus, les mêmes objectifs, et développent un réseau de confiance qui dépasse le simple trajet.',
  communityDescEn: 'More than just a transportation tool, Covoiturage La Cité creates bonds. Drivers and passengers share the same campus, the same goals, and develop a trusted network that goes beyond the simple ride.',
  communityBullet1Fr: 'Profils vérifiés de la communauté La Cité',
  communityBullet1En: 'Verified profiles from La Cité community',
  communityBullet2Fr: 'Système d\'évaluations et de réputation',
  communityBullet2En: 'Rating and reputation system',
  communityBullet3Fr: 'Groupes de covoiturage récurrents',
  communityBullet3En: 'Recurring carpool groups',

  // Impact
  impactTitleFr: 'Impact environnemental',
  impactTitleEn: 'Environmental Impact',
  impactDescFr: 'Chaque place partagée réduit les émissions de CO₂, diminue le trafic routier et libère des places de stationnement. Ensemble, nous contribuons à un campus plus vert et une ville plus respirable.',
  impactDescEn: 'Every shared seat reduces CO₂ emissions, decreases road traffic and frees up parking spaces. Together, we contribute to a greener campus and a more breathable city.',
  impactBullet1Fr: 'Réduction de l\'empreinte carbone collective',
  impactBullet1En: 'Reduction of collective carbon footprint',
  impactBullet2Fr: 'Moins de véhicules sur le campus',
  impactBullet2En: 'Fewer vehicles on campus',
  impactBullet3Fr: 'Statistiques d\'impact visibles dans le tableau de bord',
  impactBullet3En: 'Impact statistics visible in the dashboard',

  // Stats
  statsTitleFr: 'La plateforme en chiffres',
  statsTitleEn: 'The Platform in Numbers',
  statsMembersFr: 'Membres inscrits',
  statsMembersEn: 'Registered Members',
  statsTripsFr: 'Trajets complétés',
  statsTripsEn: 'Completed Trips',
  statsCo2Fr: 'CO₂ économisé',
  statsCo2En: 'CO₂ Saved',
  statsRatingFr: 'Note moyenne',
  statsRatingEn: 'Average Rating',

  // Valeurs
  valuesTitleFr: 'Nos valeurs',
  valuesTitleEn: 'Our Values',
  valueTrustTitleFr: 'Confiance et transparence',
  valueTrustTitleEn: 'Trust and Transparency',
  valueTrustDescFr: 'Chaque interaction repose sur des profils vérifiés, des évaluations honnêtes et une communication claire. Pas de mauvaises surprises — vous savez toujours avec qui vous voyagez.',
  valueTrustDescEn: 'Every interaction is based on verified profiles, honest ratings and clear communication. No bad surprises — you always know who you\'re traveling with.',
  valueExcellenceTitleFr: 'Excellence du service',
  valueExcellenceTitleEn: 'Service Excellence',
  valueExcellenceDescFr: 'Interface intuitive, notifications en temps réel, suivi de trajet et support réactif. Nous investissons continuellement pour offrir la meilleure expérience possible.',
  valueExcellenceDescEn: 'Intuitive interface, real-time notifications, trip tracking and responsive support. We continuously invest to offer the best possible experience.',
  valueResponsibilityTitleFr: 'Responsabilité sociale',
  valueResponsibilityTitleEn: 'Social Responsibility',
  valueResponsibilityDescFr: 'Contribuer à la mobilité durable n\'est pas qu\'un slogan. C\'est un engagement concret qui se traduit par moins de pollution, moins de congestion et plus de solidarité sur le campus.',
  valueResponsibilityDescEn: 'Contributing to sustainable mobility is not just a slogan. It is a concrete commitment that translates into less pollution, less congestion and more solidarity on campus.',
  valueAccessibilityTitleFr: 'Accessibilité pour tous',
  valueAccessibilityTitleEn: 'Accessibility for All',
  valueAccessibilityDescFr: 'Que vous soyez conducteur ou passager, notre plateforme est pensée pour être simple, abordable et accessible. Des tarifs suggérés équitables et une interface adaptée à tous les appareils.',
  valueAccessibilityDescEn: 'Whether you\'re a driver or passenger, our platform is designed to be simple, affordable and accessible. Fair suggested rates and an interface adapted to all devices.',

  // Sécurité
  securityTitleFr: 'Sécurité et confiance',
  securityTitleEn: 'Safety and Trust',
  securitySubtitleFr: 'La sécurité de nos membres est au cœur de chaque décision de conception. Voici les mécanismes que nous avons mis en place pour garantir des trajets sereins.',
  securitySubtitleEn: 'The safety of our members is at the heart of every design decision. Here are the mechanisms we have put in place to ensure peaceful trips.',
  securityVerifyTitleFr: 'Vérification d\'identité',
  securityVerifyTitleEn: 'Identity Verification',
  securityVerifyDescFr: 'Chaque compte est validé via l\'identité institutionnelle du Collège La Cité. Les profils passent par des contrôles de cohérence avant d\'être activés, incluant la vérification du courriel institutionnel et des informations personnelles.',
  securityVerifyDescEn: 'Each account is validated via Collège La Cité institutional identity. Profiles go through consistency checks before being activated, including institutional email and personal information verification.',
  securityReportTitleFr: 'Signalement et modération',
  securityReportTitleEn: 'Reporting and Moderation',
  securityReportDescFr: 'Un système de signalement accessible à tout moment permet de rapporter les comportements inappropriés. Notre équipe de modération examine chaque cas et intervient rapidement — de l\'avertissement à la suspension du compte.',
  securityReportDescEn: 'A reporting system accessible at all times allows reporting inappropriate behavior. Our moderation team reviews each case and intervenes quickly — from warning to account suspension.',
  securitySessionTitleFr: 'Protection des sessions',
  securitySessionTitleEn: 'Session Protection',
  securitySessionDescFr: 'Sessions sécurisées avec tokens chiffrés, détection d\'anomalies de connexion et déconnexion automatique en cas d\'inactivité prolongée. Vos données restent protégées à chaque instant.',
  securitySessionDescEn: 'Secured sessions with encrypted tokens, connection anomaly detection and automatic disconnection in case of prolonged inactivity. Your data remains protected at all times.',
} as const;

// ─── ACCESSIBILITY PAGE (app/(Public)/accessibilite/page.tsx) ────────────────

export const ACCESSIBILITY_TRANSLATIONS = {
  // Hero
  accessHeroTitleFr: 'Accessibilité pour tous',
  accessHeroTitleEn: 'Accessibility for All',
  accessHeroSubtitleFr: 'Nous croyons que chaque personne mérite une expérience numérique inclusive et confortable. Notre plateforme s\'aligne progressivement sur les recommandations WCAG 2.1 niveau AA pour garantir l\'accès à tous.',
  accessHeroSubtitleEn: 'We believe every person deserves an inclusive and comfortable digital experience. Our platform progressively aligns with WCAG 2.1 Level AA recommendations to guarantee access for all.',

  // Engagements
  commitmentsTitleFr: 'Nos engagements',
  commitmentsTitleEn: 'Our Commitments',

  keyboardTitleFr: 'Navigation au clavier',
  keyboardTitleEn: 'Keyboard Navigation',
  keyboardDescFr: 'Tous les parcours essentiels de l\'application sont navigables entièrement au clavier. Les utilisateurs peuvent parcourir les menus, remplir les formulaires, réserver un trajet et gérer leur profil sans souris.',
  keyboardDescEn: 'All essential application paths are fully navigable by keyboard. Users can browse menus, fill forms, book a trip and manage their profile without a mouse.',
  keyboardBullet1Fr: 'Focus visible sur tous les éléments interactifs',
  keyboardBullet1En: 'Visible focus on all interactive elements',
  keyboardBullet2Fr: 'Ordre de tabulation logique',
  keyboardBullet2En: 'Logical tab order',
  keyboardBullet3Fr: 'Raccourcis clavier pour actions courantes',
  keyboardBullet3En: 'Keyboard shortcuts for common actions',

  contrastTitleFr: 'Contrastes et lisibilité',
  contrastTitleEn: 'Contrast and Readability',
  contrastDescFr: 'Les contrastes de couleur respectent les ratios minimaux recommandés par WCAG 2.1 AA. Les textes sont lisibles sur tous les appareils, des écrans mobiles aux moniteurs de bureau.',
  contrastDescEn: 'Color contrasts meet the minimum ratios recommended by WCAG 2.1 AA. Texts are readable on all devices, from mobile screens to desktop monitors.',
  contrastBullet1Fr: 'Ratio de contraste ≥ 4.5:1 pour le texte',
  contrastBullet1En: 'Contrast ratio ≥ 4.5:1 for text',
  contrastBullet2Fr: 'Ratio ≥ 3:1 pour les composants d\'interface',
  contrastBullet2En: 'Ratio ≥ 3:1 for UI components',
  contrastBullet3Fr: 'Mode sombre natif avec bons contrastes',
  contrastBullet3En: 'Native dark mode with good contrasts',

  typographyTitleFr: 'Typographie adaptative',
  typographyTitleEn: 'Adaptive Typography',
  typographyDescFr: 'Les tailles de texte sont ajustables et les polices choisies privilégient la lisibilité. Le contenu s\'adapte fluidement grâce à un design responsive couvrant toutes les résolutions d\'écran.',
  typographyDescEn: 'Text sizes are adjustable and chosen fonts prioritize readability. Content adapts fluidly thanks to responsive design covering all screen resolutions.',
  typographyBullet1Fr: 'Zoom jusqu\'à 200% sans perte',
  typographyBullet1En: 'Zoom up to 200% without loss',
  typographyBullet2Fr: 'Tailles en rem/em (pas de px fixes)',
  typographyBullet2En: 'Sizes in rem/em (no fixed px)',
  typographyBullet3Fr: 'Interlignage généreux pour le confort',
  typographyBullet3En: 'Generous line spacing for comfort',

  formsTitleFr: 'Libellés et formulaires',
  formsTitleEn: 'Labels and Forms',
  formsDescFr: 'Chaque champ de formulaire dispose d\'un libellé explicite et d\'instructions claires. Les messages d\'erreur sont descriptifs et guident l\'utilisateur vers la correction.',
  formsDescEn: 'Each form field has an explicit label and clear instructions. Error messages are descriptive and guide the user to correction.',
  formsBullet1Fr: 'Labels associés à chaque input',
  formsBullet1En: 'Labels associated with each input',
  formsBullet2Fr: 'Messages d\'erreur inline et descriptifs',
  formsBullet2En: 'Inline and descriptive error messages',
  formsBullet3Fr: 'Attributs ARIA pour les lecteurs d\'écran',
  formsBullet3En: 'ARIA attributes for screen readers',

  // Technologies
  techTitleFr: 'Technologies d\'assistance',
  techTitleEn: 'Assistive Technologies',
  techScreenReaderTitleFr: 'Lecteurs d\'écran',
  techScreenReaderTitleEn: 'Screen Readers',
  techScreenReaderDescFr: 'Compatible avec VoiceOver, NVDA et JAWS. Les rôles ARIA, les régions live et les descriptions alternatives sont intégrés dans l\'interface.',
  techScreenReaderDescEn: 'Compatible with VoiceOver, NVDA and JAWS. ARIA roles, live regions and alternative descriptions are built into the interface.',
  techTouchTitleFr: 'Zones tactiles',
  techTouchTitleEn: 'Touch Areas',
  techTouchDescFr: 'Les boutons et liens respectent une taille minimale de 44×44px pour faciliter l\'interaction sur écrans tactiles et pour les utilisateurs avec des difficultés motrices.',
  techTouchDescEn: 'Buttons and links meet a minimum size of 44×44px to facilitate interaction on touch screens and for users with motor difficulties.',
  techResponsiveTitleFr: 'Design responsive',
  techResponsiveTitleEn: 'Responsive Design',
  techResponsiveDescFr: 'L\'interface s\'adapte parfaitement à tous les formats : téléphone, tablette, ordinateur portable et écran large, sans perte de fonctionnalité.',
  techResponsiveDescEn: 'The interface adapts perfectly to all formats: phone, tablet, laptop and widescreen, without loss of functionality.',

  // Improvement
  improvementTitleFr: 'Amélioration continue',
  improvementTitleEn: 'Continuous Improvement',
  improvementDescFr: 'L\'accessibilité est un processus continu. Nous testons régulièrement notre plateforme avec des outils automatisés et des retours utilisateurs. Si vous rencontrez un obstacle d\'accessibilité, n\'hésitez pas à nous le signaler.',
  improvementDescEn: 'Accessibility is an ongoing process. We regularly test our platform with automated tools and user feedback. If you encounter an accessibility barrier, please let us know.',
  improvementBadge1Fr: 'Audits WCAG réguliers',
  improvementBadge1En: 'Regular WCAG audits',
  improvementBadge2Fr: 'Tests avec lecteurs d\'écran',
  improvementBadge2En: 'Screen reader testing',
  improvementBadge3Fr: 'Retours utilisateurs intégrés',
  improvementBadge3En: 'Integrated user feedback',
} as const;

// ─── HOW IT WORKS PAGE (app/(Public)/comment-ca-marche/page.tsx) ─────────────

export const HOW_IT_WORKS_TRANSLATIONS = {
  // Hero
  hiwHeroTitleFr: 'Comment ça marche',
  hiwHeroTitleEn: 'How It Works',
  hiwHeroSubtitleFr: 'Un parcours simple et intuitif en 5 étapes pour covoiturer en toute sérénité. De l\'inscription à l\'évaluation, chaque étape est pensée pour être rapide et transparente.',
  hiwHeroSubtitleEn: 'A simple and intuitive 5-step journey to carpool with peace of mind. From registration to rating, each step is designed to be quick and transparent.',

  // Steps
  step1TitleFr: 'Créez votre compte',
  step1TitleEn: 'Create Your Account',
  step1DescFr: 'Inscrivez-vous avec votre identité institutionnelle du Collège La Cité. Complétez votre profil en ajoutant votre photo, votre programme d\'études et vos préférences de trajet. La vérification de votre courriel institutionnel garantit un environnement de confiance dès le premier jour.',
  step1DescEn: 'Register with your Collège La Cité institutional identity. Complete your profile by adding your photo, study program and trip preferences. Your institutional email verification guarantees a trusted environment from day one.',
  step1Badge1Fr: 'Inscription en 2 minutes',
  step1Badge1En: '2-minute registration',
  step1Badge2Fr: 'Courriel @lacitec.on.ca',
  step1Badge2En: '@lacitec.on.ca email',
  step1Badge3Fr: 'Profil personnalisable',
  step1Badge3En: 'Customizable profile',

  step2TitleFr: 'Recherchez ou proposez un trajet',
  step2TitleEn: 'Search or Offer a Ride',
  step2DescFr: 'Utilisez notre carte interactive pour trouver un trajet qui correspond à votre itinéraire. Vous êtes conducteur ? Publiez votre trajet en quelques clics en précisant le départ, la destination, l\'horaire et le nombre de places disponibles. Les passagers verront votre offre instantanément.',
  step2DescEn: 'Use our interactive map to find a trip that matches your route. Are you a driver? Publish your trip in a few clicks by specifying departure, destination, schedule and available seats. Passengers will see your offer instantly.',
  step2Badge1Fr: 'Carte interactive',
  step2Badge1En: 'Interactive map',
  step2Badge2Fr: 'Alertes de disponibilité',
  step2Badge2En: 'Availability alerts',
  step2Badge3Fr: 'Compatible mobile',
  step2Badge3En: 'Mobile compatible',

  step3TitleFr: 'Confirmez la réservation',
  step3TitleEn: 'Confirm the Booking',
  step3DescFr: 'Le conducteur reçoit votre demande et peut l\'accepter ou la refuser. Une fois confirmé, vous recevez tous les deux une notification avec les détails du trajet : point de rencontre, heure exacte, informations du véhicule et contribution suggérée. Tout est clair avant de partir.',
  step3DescEn: 'The driver receives your request and can accept or decline it. Once confirmed, you both receive a notification with trip details: meeting point, exact time, vehicle information and suggested contribution. Everything is clear before leaving.',
  step3Badge1Fr: 'Tarif transparent',
  step3Badge1En: 'Transparent pricing',
  step3Badge2Fr: 'Notification instantanée',
  step3Badge2En: 'Instant notification',

  step4TitleFr: 'Voyagez et suivez le trajet',
  step4TitleEn: 'Travel and Track the Trip',
  step4DescFr: 'Pendant le trajet, suivez votre progression sur la carte en temps réel. Le système de suivi GPS permet au passager de voir l\'arrivée estimée et au conducteur de signaler les étapes clés. En cas de problème, un bouton d\'urgence est accessible à tout moment.',
  step4DescEn: 'During the trip, track your progress on the real-time map. The GPS tracking system allows the passenger to see the estimated arrival and the driver to report key milestones. In case of problem, an emergency button is accessible at all times.',
  step4Badge1Fr: 'Suivi GPS en direct',
  step4Badge1En: 'Live GPS tracking',
  step4Badge2Fr: 'Chat intégré',
  step4Badge2En: 'Built-in chat',

  step5TitleFr: 'Évaluez l\'expérience',
  step5TitleEn: 'Rate the Experience',
  step5DescFr: 'À la fin du trajet, notez votre expérience et laissez un commentaire. Ce système d\'évaluation bidirectionnel renforce la confiance au sein de la communauté : les bons conducteurs et passagers sont mis en valeur, tandis que les comportements problématiques sont rapidement identifiés.',
  step5DescEn: 'At the end of the trip, rate your experience and leave a comment. This two-way rating system strengthens trust within the community: good drivers and passengers are highlighted, while problematic behaviors are quickly identified.',
  step5Badge1Fr: 'Note sur 5 étoiles',
  step5Badge1En: '5-star rating',
  step5Badge2Fr: 'Commentaires détaillés',
  step5Badge2En: 'Detailed comments',

  // CTA
  ctaTitleFr: 'Prêt à commencer ?',
  ctaTitleEn: 'Ready to start?',
  ctaDescFr: 'Rejoignez la communauté Covoiturage La Cité et commencez à partager vos trajets dès aujourd\'hui. L\'inscription est gratuite et ne prend que 2 minutes.',
  ctaDescEn: 'Join the Covoiturage La Cité community and start sharing your trips today. Registration is free and only takes 2 minutes.',
  ctaButtonFr: 'Créer mon compte',
  ctaButtonEn: 'Create my account',
} as const;

// ─── CONDITIONS PAGE (app/(Public)/conditions/page.tsx) ──────────────────────

export const CONDITIONS_TRANSLATIONS = {
  // Hero
  condHeroTitleFr: 'Conditions d\'utilisation',
  condHeroTitleEn: 'Terms of Use',
  condHeroSubtitleFr: 'En utilisant Covoiturage La Cité, vous acceptez les règles suivantes. Ces conditions visent à garantir une expérience sûre, respectueuse et équitable pour toute la communauté.',
  condHeroSubtitleEn: 'By using Covoiturage La Cité, you accept the following rules. These terms aim to ensure a safe, respectful and fair experience for the entire community.',

  // Rules
  rule1TitleFr: 'Compte personnel et informations exactes',
  rule1TitleEn: 'Personal Account and Accurate Information',
  rule1DescFr: 'Chaque utilisateur doit créer un compte personnel unique avec des informations véridiques et à jour. L\'utilisation d\'un faux profil, d\'une identité empruntée ou la création de comptes multiples est strictement interdite. Votre courriel institutionnel sert de vérification principale.',
  rule1DescEn: 'Each user must create a unique personal account with truthful and up-to-date information. The use of a fake profile, borrowed identity or creation of multiple accounts is strictly prohibited. Your institutional email serves as primary verification.',
  rule1Badge1Fr: 'Un seul compte par personne',
  rule1Badge1En: 'One account per person',
  rule1Badge2Fr: 'Informations vérifiables',
  rule1Badge2En: 'Verifiable information',

  rule2TitleFr: 'Respect des engagements et des autres membres',
  rule2TitleEn: 'Respect for Commitments and Other Members',
  rule2DescFr: 'Lorsque vous réservez ou proposez un trajet, vous vous engagez à respecter l\'horaire convenu, le point de rencontre et les conditions du voyage. Les annulations tardives répétées, le non-respect des passagers ou conducteurs, ou tout comportement irrespectueux peut entraîner des sanctions.',
  rule2DescEn: 'When you book or offer a trip, you commit to respecting the agreed schedule, meeting point and travel conditions. Repeated late cancellations, disrespect for passengers or drivers, or any disrespectful behavior may result in sanctions.',
  rule2Badge1Fr: 'Ponctualité requise',
  rule2Badge1En: 'Punctuality required',
  rule2Badge2Fr: 'Courtoisie obligatoire',
  rule2Badge2En: 'Courtesy mandatory',

  rule3TitleFr: 'Contenu interdit',
  rule3TitleEn: 'Prohibited Content',
  rule3DescFr: 'Il est interdit de publier du contenu abusif, trompeur, offensant, discriminatoire ou dangereux sur la plateforme. Cela inclut les messages, les descriptions de trajet, les commentaires d\'évaluation et toute autre interaction. Tout contenu signalé est examiné et retiré si jugé non conforme.',
  rule3DescEn: 'It is prohibited to publish abusive, misleading, offensive, discriminatory or dangerous content on the platform. This includes messages, trip descriptions, rating comments and any other interaction. All reported content is reviewed and removed if deemed non-compliant.',
  rule3Badge1Fr: 'Pas de spam',
  rule3Badge1En: 'No spam',
  rule3Badge2Fr: 'Pas de discrimination',
  rule3Badge2En: 'No discrimination',
  rule3Badge3Fr: 'Pas de contenu trompeur',
  rule3Badge3En: 'No misleading content',

  rule4TitleFr: 'Obligation de signalement',
  rule4TitleEn: 'Reporting Obligation',
  rule4DescFr: 'Tout incident de sécurité, comportement inapproprié ou situation dangereuse doit être signalé rapidement via le formulaire de signalement. Le silence face à un comportement problématique met en danger l\'ensemble de la communauté. En cas de danger immédiat, contactez le 911 en premier.',
  rule4DescEn: 'Any security incident, inappropriate behavior or dangerous situation must be reported promptly via the reporting form. Silence in the face of problematic behavior endangers the entire community. In case of immediate danger, contact 911 first.',
  rule4LinkFr: 'Accéder au formulaire de signalement',
  rule4LinkEn: 'Access the reporting form',

  rule5TitleFr: 'Sanctions et suspension',
  rule5TitleEn: 'Sanctions and Suspension',
  rule5DescFr: 'Le non-respect de ces conditions peut entraîner des mesures allant de l\'avertissement à la suspension temporaire ou permanente du compte. Les décisions de modération sont prises en accord avec les politiques institutionnelles du Collège La Cité et sont communiquées par courriel.',
  rule5DescEn: 'Non-compliance with these terms may result in measures ranging from a warning to temporary or permanent account suspension. Moderation decisions are made in accordance with Collège La Cité institutional policies and are communicated by email.',
  rule5Badge1Fr: 'Processus équitable',
  rule5Badge1En: 'Fair process',
  rule5Badge2Fr: 'Notification par courriel',
  rule5Badge2En: 'Email notification',

  // Legal note
  legalNoteFr: 'Ce résumé présente les règles de base d\'utilisation de la plateforme Covoiturage La Cité. Il ne remplace pas le texte contractuel complet de l\'institution. Pour toute question relative aux conditions d\'utilisation, contactez-nous.',
  legalNoteEn: 'This summary presents the basic rules for using the Covoiturage La Cité platform. It does not replace the full contractual text of the institution. For any questions regarding terms of use, contact us.',
} as const;

// ─── PRIVACY PAGE (app/(Public)/confidentialite/page.tsx) ────────────────────

export const PRIVACY_TRANSLATIONS = {
  // Hero
  privHeroTitleFr: 'Politique de confidentialité',
  privHeroTitleEn: 'Privacy Policy',
  privHeroSubtitleFr: 'Nous prenons la protection de vos données personnelles très au sérieux. Cette page résume nos principes de traitement des données selon une approche claire, inspirée des exigences de la loi PIPEDA et des meilleures pratiques en matière de vie privée.',
  privHeroSubtitleEn: 'We take the protection of your personal data very seriously. This page summarizes our data processing principles with a clear approach, inspired by PIPEDA requirements and best practices in privacy.',

  // Principles
  dataCollectedTitleFr: 'Données collectées',
  dataCollectedTitleEn: 'Collected Data',
  dataCollectedDescFr: 'Nous collectons uniquement les données nécessaires au fonctionnement du service de covoiturage. Aucune donnée superflue n\'est demandée ou stockée.',
  dataCollectedDescEn: 'We only collect data necessary for the operation of the carpooling service. No superfluous data is requested or stored.',
  dataCollectedBullet1Fr: 'Informations de compte (nom, courriel, programme)',
  dataCollectedBullet1En: 'Account information (name, email, program)',
  dataCollectedBullet2Fr: 'Préférences de trajet et réservations',
  dataCollectedBullet2En: 'Trip preferences and bookings',
  dataCollectedBullet3Fr: 'Traces d\'activité techniques (logs de sécurité)',
  dataCollectedBullet3En: 'Technical activity traces (security logs)',
  dataCollectedBullet4Fr: 'Données de géolocalisation (pendant les trajets uniquement)',
  dataCollectedBullet4En: 'Geolocation data (during trips only)',

  dataUsageTitleFr: 'Usage des données',
  dataUsageTitleEn: 'Data Usage',
  dataUsageDescFr: 'Vos données sont utilisées exclusivement pour le bon fonctionnement de la plateforme. Nous ne vendons jamais vos données à des tiers et ne les partageons qu\'avec votre consentement.',
  dataUsageDescEn: 'Your data is used exclusively for the proper functioning of the platform. We never sell your data to third parties and only share it with your consent.',
  dataUsageBullet1Fr: 'Opération et amélioration du service',
  dataUsageBullet1En: 'Service operation and improvement',
  dataUsageBullet2Fr: 'Sécurité et prévention des fraudes',
  dataUsageBullet2En: 'Security and fraud prevention',
  dataUsageBullet3Fr: 'Statistiques produit anonymisées',
  dataUsageBullet3En: 'Anonymized product statistics',
  dataUsageBullet4Fr: 'Support utilisateur personnalisé',
  dataUsageBullet4En: 'Personalized user support',

  retentionTitleFr: 'Conservation des données',
  retentionTitleEn: 'Data Retention',
  retentionDescFr: 'Les durées de rétention sont adaptées à la finalité de chaque type de donnée et respectent les obligations institutionnelles et réglementaires.',
  retentionDescEn: 'Retention periods are adapted to the purpose of each type of data and comply with institutional and regulatory obligations.',
  retentionBullet1Fr: 'Données de compte : durée de l\'inscription + 1 an',
  retentionBullet1En: 'Account data: registration duration + 1 year',
  retentionBullet2Fr: 'Historique des trajets : 2 ans',
  retentionBullet2En: 'Trip history: 2 years',
  retentionBullet3Fr: 'Logs de sécurité : 6 mois',
  retentionBullet3En: 'Security logs: 6 months',
  retentionBullet4Fr: 'Données GPS : supprimées après le trajet',
  retentionBullet4En: 'GPS data: deleted after the trip',

  rightsTitleFr: 'Vos droits',
  rightsTitleEn: 'Your Rights',
  rightsDescFr: 'Conformément à la loi PIPEDA et aux politiques du Collège La Cité, vous disposez de droits clairs sur vos données personnelles.',
  rightsDescEn: 'In accordance with PIPEDA and Collège La Cité policies, you have clear rights over your personal data.',
  rightsBullet1Fr: 'Droit d\'accès à vos données',
  rightsBullet1En: 'Right to access your data',
  rightsBullet2Fr: 'Droit de rectification',
  rightsBullet2En: 'Right to rectification',
  rightsBullet3Fr: 'Droit de suppression',
  rightsBullet3En: 'Right to deletion',
  rightsBullet4Fr: 'Droit de portabilité des données',
  rightsBullet4En: 'Right to data portability',

  // Technical measures
  techMeasuresTitleFr: 'Mesures techniques de protection',
  techMeasuresTitleEn: 'Technical Protection Measures',
  techEncryptionTitleFr: 'Chiffrement',
  techEncryptionTitleEn: 'Encryption',
  techEncryptionDescFr: 'Toutes les communications sont chiffrées via HTTPS/TLS. Les mots de passe sont hashés avec des algorithmes robustes (bcrypt). Les tokens d\'authentification sont signés et rotatifs.',
  techEncryptionDescEn: 'All communications are encrypted via HTTPS/TLS. Passwords are hashed with robust algorithms (bcrypt). Authentication tokens are signed and rotated.',
  techInfraTitleFr: 'Infrastructure sécurisée',
  techInfraTitleEn: 'Secured Infrastructure',
  techInfraDescFr: 'Nos serveurs sont hébergés dans des centres de données certifiés avec surveillance 24/7, sauvegardes automatiques et plans de reprise après sinistre.',
  techInfraDescEn: 'Our servers are hosted in certified data centers with 24/7 monitoring, automatic backups and disaster recovery plans.',
  techMonitoringTitleFr: 'Surveillance continue',
  techMonitoringTitleEn: 'Continuous Monitoring',
  techMonitoringDescFr: 'Détection d\'anomalies en temps réel, alertes de sécurité automatisées et audits réguliers pour identifier et corriger les vulnérabilités potentielles.',
  techMonitoringDescEn: 'Real-time anomaly detection, automated security alerts and regular audits to identify and fix potential vulnerabilities.',

  // Contact
  rightsContactTitleFr: 'Exercer vos droits',
  rightsContactTitleEn: 'Exercise Your Rights',
  rightsContactDescFr: 'Pour toute demande relative à vos données personnelles (accès, rectification, suppression), envoyez un courriel. Nous nous engageons à traiter votre demande dans un délai de 30 jours.',
  rightsContactDescEn: 'For any request regarding your personal data (access, rectification, deletion), send an email. We commit to processing your request within 30 days.',
} as const;

// ─── CONTACT PAGE (app/(Public)/contact/page.tsx) ────────────────────────────

export const CONTACT_TRANSLATIONS = {
  // Hero
  contactHeroTitleFr: 'Contactez-nous',
  contactHeroTitleEn: 'Contact Us',
  contactHeroSubtitleFr: 'Besoin d\'aide, une question, ou un incident à signaler ? Notre équipe est là pour vous accompagner. Retrouvez ci-dessous tous les moyens de nous joindre.',
  contactHeroSubtitleEn: 'Need help, have a question, or report an incident? Our team is here to support you. Find below all the ways to reach us.',

  // Channels
  emailTitleFr: 'Support par courriel',
  emailTitleEn: 'Email Support',
  emailDescFr: 'Pour les questions générales, les demandes d\'information ou l\'assistance technique, envoyez-nous un courriel. Nous répondons dans un délai de 24 à 48 heures ouvrables.',
  emailDescEn: 'For general questions, information requests or technical assistance, send us an email. We respond within 24 to 48 business hours.',

  hoursTitleFr: 'Horaires de réponse',
  hoursTitleEn: 'Response Hours',
  hoursDescFr: 'Notre équipe de support est disponible du lundi au vendredi, de 8h00 à 17h00 (heure d\'Ottawa, EST). Les messages reçus en dehors de ces heures seront traités le jour ouvrable suivant.',
  hoursDescEn: 'Our support team is available Monday to Friday, 8:00 AM to 5:00 PM (Ottawa time, EST). Messages received outside these hours will be processed the next business day.',
  hoursWeekdayFr: 'Lun — Ven : 8h00 – 17h00',
  hoursWeekdayEn: 'Mon — Fri: 8:00 AM – 5:00 PM',
  hoursWeekendFr: 'Sam — Dim : Fermé',
  hoursWeekendEn: 'Sat — Sun: Closed',

  emergencyTitleFr: 'Urgence sécurité',
  emergencyTitleEn: 'Security Emergency',
  emergencyDescFr: 'En cas de risque immédiat pour votre sécurité, contactez d\'abord les services d\'urgence (911). Ensuite, soumettez un signalement sur la plateforme pour que notre équipe puisse agir.',
  emergencyDescEn: 'In case of immediate risk to your safety, contact emergency services (911) first. Then submit a report on the platform so our team can act.',
  emergencyLinkFr: 'Formulaire de signalement',
  emergencyLinkEn: 'Reporting form',

  // Additional
  additionalTitleFr: 'Autres points de contact',
  additionalTitleEn: 'Other Contact Points',
  campusAddressTitleFr: 'Adresse du campus',
  campusAddressTitleEn: 'Campus Address',
  phoneTitleFr: 'Ligne téléphonique',
  phoneTitleEn: 'Phone Line',
  phoneDescFr: 'Pour les questions liées au Collège La Cité : Renvoi vers le service de covoiturage disponible',
  phoneDescEn: 'For questions related to Collège La Cité: Transfer to carpooling service available',
  studentServicesTitleFr: 'Services étudiants',
  studentServicesTitleEn: 'Student Services',
  studentServicesDescFr: 'Les services aux étudiants du Collège La Cité peuvent également vous orienter pour toute question relative au covoiturage et au transport sur le campus.',
  studentServicesDescEn: 'Collège La Cité student services can also direct you for any questions related to carpooling and transportation on campus.',
  faqTitleFr: 'FAQ et aide',
  faqTitleEn: 'FAQ and Help',
  faqDescFr: 'Avant de nous écrire, consultez notre section d\'aide intégrée à l\'application. La plupart des questions courantes y trouvent une réponse rapide et détaillée.',
  faqDescEn: 'Before writing to us, check our help section built into the app. Most common questions find a quick and detailed answer there.',

  // CTA
  ctaReportTitleFr: 'Signaler un problème',
  ctaReportTitleEn: 'Report an Issue',
  ctaReportDescFr: 'Le formulaire de signalement est centralisé sur la page sécurité pour assurer un traitement uniforme et rapide de tous les incidents.',
  ctaReportDescEn: 'The reporting form is centralized on the security page to ensure uniform and rapid processing of all incidents.',
  ctaReportButtonFr: 'Ouvrir le formulaire',
  ctaReportButtonEn: 'Open the form',
} as const;

// ─── SECURITY PAGE (app/(Public)/securite/page.tsx) ──────────────────────────

export const SECURITY_TRANSLATIONS = {
  // Hero
  secHeroTitleFr: 'Votre sécurité, notre priorité',
  secHeroTitleEn: 'Your Safety, Our Priority',
  secHeroSubtitleFr: 'La sécurité des membres est intégrée à chaque aspect de la plateforme. De la vérification d\'identité à la protection des données, découvrez les mécanismes que nous avons mis en place pour garantir des trajets sereins.',
  secHeroSubtitleEn: 'Member safety is integrated into every aspect of the platform. From identity verification to data protection, discover the mechanisms we have put in place to ensure peaceful trips.',

  // Pillars
  secVerifyTitleFr: 'Vérification d\'identité',
  secVerifyTitleEn: 'Identity Verification',
  secVerifyDescFr: 'Chaque compte est validé via l\'identité institutionnelle du Collège La Cité. Les profils passent par des contrôles de cohérence rigoureux avant d\'être pleinement activés.',
  secVerifyDescEn: 'Each account is validated via Collège La Cité institutional identity. Profiles go through rigorous consistency checks before being fully activated.',
  secVerifyBullet1Fr: 'Vérification du courriel @lacitec.on.ca',
  secVerifyBullet1En: '@lacitec.on.ca email verification',
  secVerifyBullet2Fr: 'Contrôle des doublons de compte',
  secVerifyBullet2En: 'Account duplicate checking',
  secVerifyBullet3Fr: 'Validation manuelle des cas suspects',
  secVerifyBullet3En: 'Manual validation of suspicious cases',

  secReportTitleFr: 'Signalement et modération',
  secReportTitleEn: 'Reporting and Moderation',
  secReportDescFr: 'Un système de signalement accessible à tout moment. Chaque rapport est examiné par notre équipe de modération qui intervient rapidement — de l\'avertissement à la suspension.',
  secReportDescEn: 'A reporting system accessible at all times. Each report is reviewed by our moderation team who intervenes quickly — from warning to suspension.',
  secReportBullet1Fr: 'Alertes en temps réel',
  secReportBullet1En: 'Real-time alerts',
  secReportBullet2Fr: 'Processus d\'escalade structuré',
  secReportBullet2En: 'Structured escalation process',
  secReportBullet3Fr: 'Audit complet des événements',
  secReportBullet3En: 'Complete event audit',

  secSessionTitleFr: 'Protection des sessions',
  secSessionTitleEn: 'Session Protection',
  secSessionDescFr: 'Sessions sécurisées avec tokens chiffrés, détection d\'anomalies de connexion et déconnexion automatique en cas d\'inactivité prolongée.',
  secSessionDescEn: 'Secured sessions with encrypted tokens, connection anomaly detection and automatic disconnection in case of prolonged inactivity.',
  secSessionBullet1Fr: 'Tokens JWT chiffrés et rotatifs',
  secSessionBullet1En: 'Encrypted and rotated JWT tokens',
  secSessionBullet2Fr: 'Infrastructure sécurisée',
  secSessionBullet2En: 'Secured infrastructure',
  secSessionBullet3Fr: 'Gestion multi-appareils',
  secSessionBullet3En: 'Multi-device management',

  // Additional measures
  addMeasuresTitleFr: 'Mesures complémentaires',
  addMeasuresTitleEn: 'Additional Measures',
  emergencyButtonTitleFr: 'Bouton d\'urgence en trajet',
  emergencyButtonTitleEn: 'In-Trip Emergency Button',
  emergencyButtonDescFr: 'Pendant un trajet actif, chaque participant a accès à un bouton d\'urgence qui notifie immédiatement l\'équipe de support et enregistre les coordonnées GPS du moment.',
  emergencyButtonDescEn: 'During an active trip, each participant has access to an emergency button that immediately notifies the support team and records the current GPS coordinates.',
  ratingTitleFr: 'Évaluations bidirectionnelles',
  ratingTitleEn: 'Two-Way Ratings',
  ratingDescFr: 'Après chaque trajet, conducteurs et passagers s\'évaluent mutuellement. Les profils avec des notes faibles sont signalés automatiquement pour examen.',
  ratingDescEn: 'After each trip, drivers and passengers rate each other. Profiles with low ratings are automatically flagged for review.',
  historyTitleFr: 'Historique complet',
  historyTitleEn: 'Complete History',
  historyDescFr: 'Chaque trajet, réservation et interaction est enregistré. Cet historique est consultable par l\'utilisateur et peut servir de preuve en cas de litige.',
  historyDescEn: 'Every trip, booking and interaction is recorded. This history is accessible by the user and can serve as evidence in case of dispute.',
  zeroToleranceTitleFr: 'Politique de tolérance zéro',
  zeroToleranceTitleEn: 'Zero Tolerance Policy',
  zeroToleranceDescFr: 'Le harcèlement, la discrimination et les comportements dangereux entraînent une suspension immédiate du compte, sans préavis, conformément à nos conditions d\'utilisation.',
  zeroToleranceDescEn: 'Harassment, discrimination and dangerous behaviors result in immediate account suspension, without notice, in accordance with our terms of use.',

  // Report form
  reportFormTitleFr: 'Formulaire de signalement',
  reportFormTitleEn: 'Reporting Form',
  reportFormSubtitleFr: 'Si vous êtes témoin ou victime d\'un incident, remplissez ce formulaire. Toutes les informations sont traitées de manière confidentielle.',
  reportFormSubtitleEn: 'If you witness or are a victim of an incident, fill out this form. All information is treated confidentially.',
  reportFormTypeFr: 'Type d\'incident',
  reportFormTypeEn: 'Type of Incident',
  reportFormTypePlaceholderFr: 'Sélectionner un type',
  reportFormTypePlaceholderEn: 'Select a type',
  reportFormDateFr: 'Date de l\'incident',
  reportFormDateEn: 'Date of Incident',
  reportFormDetailsFr: 'Description détaillée',
  reportFormDetailsEn: 'Detailed Description',
  reportFormPlaceholderFr: 'Décrivez l\'incident en détail : contexte, personnes impliquées, date et heure, lieu...',
  reportFormPlaceholderEn: 'Describe the incident in detail: context, people involved, date and time, location...',
  reportFormSubmitFr: 'Envoyer le signalement',
  reportFormSubmitEn: 'Submit Report',
  reportFormConfidentialFr: 'Toutes les informations sont traitées de manière confidentielle et sécurisée.',
  reportFormConfidentialEn: 'All information is treated confidentially and securely.',

  // Incident types
  incidentSecurityFr: 'Sécurité pendant un trajet',
  incidentSecurityEn: 'Safety during a trip',
  incidentBehaviorFr: 'Comportement inapproprié',
  incidentBehaviorEn: 'Inappropriate behavior',
  incidentHarassmentFr: 'Harcèlement ou discrimination',
  incidentHarassmentEn: 'Harassment or discrimination',
  incidentTechnicalFr: 'Problème technique',
  incidentTechnicalEn: 'Technical problem',
  incidentFraudFr: 'Fraude ou usurpation d\'identité',
  incidentFraudEn: 'Fraud or identity theft',
  incidentOtherFr: 'Autre',
  incidentOtherEn: 'Other',
} as const;

// ─── FAQ PAGE (app/(Public)/faq/page.tsx) ────────────────────────────────────

export const FAQ_TRANSLATIONS = {
  // Hero
  faqHeroTitleFr: 'Foire aux questions',
  faqHeroTitleEn: 'Frequently Asked Questions',
  faqHeroSubtitleFr: 'Trouvez rapidement des réponses à vos questions sur Covoiturage La Cité — inscription, trajets, sécurité, paiements et bien plus encore.',
  faqHeroSubtitleEn: 'Quickly find answers to your questions about Covoiturage La Cité — registration, trips, security, payments and much more.',
} as const;

// ─── Export combiné pour accès rapide ────────────────────────────────────────

export const ALL_PUBLIC_PAGE_TRANSLATIONS = {
  home: HOME_TRANSLATIONS,
  about: ABOUT_TRANSLATIONS,
  accessibility: ACCESSIBILITY_TRANSLATIONS,
  howItWorks: HOW_IT_WORKS_TRANSLATIONS,
  conditions: CONDITIONS_TRANSLATIONS,
  privacy: PRIVACY_TRANSLATIONS,
  contact: CONTACT_TRANSLATIONS,
  security: SECURITY_TRANSLATIONS,
  faq: FAQ_TRANSLATIONS,
} as const;