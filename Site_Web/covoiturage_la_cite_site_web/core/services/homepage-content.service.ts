import { Language } from '@/core/state/app_state';

export interface Advantage {
  titleFr: string;
  titleEn: string;
  image: string;
  descriptionFr: string;
  descriptionEn: string;
}

export interface Step {
  number: number;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  linkText?: {
    fr: string;
    en: string;
  };
  linkHref?: string;
}

export interface NavLink {
  href: string;
  fr: string;
  en: string;
}

export interface HomepageStat {
  value: string;
  labelFr: string;
  labelEn: string;
}

const ADVANTAGES: Advantage[] = [
  {
    titleFr: 'Economie',
    titleEn: 'Savings',
    image: '/img/avantages/economie.png',
    descriptionFr: "Partagez les frais de transport et economisez de l'argent sur vos trajets quotidiens.",
    descriptionEn: 'Share transport costs and save money on your daily trips.',
  },
  {
    titleFr: 'Communaute',
    titleEn: 'Community',
    image: '/img/avantages/communaute.png',
    descriptionFr: "Faites de nouvelles rencontres et elargissez votre cercle social en partageant vos trajets avec d'autres etudiants.",
    descriptionEn: 'Make new friends and expand your social circle by sharing your trips with other students.',
  },
  {
    titleFr: 'Ecologie',
    titleEn: 'Ecology',
    image: '/img/avantages/ecologie.png',
    descriptionFr: 'Reduisez votre empreinte carbone en partageant vos trajets et en contribuant a un environnement plus propre.',
    descriptionEn: 'Reduce your carbon footprint by sharing your trips and contributing to a cleaner environment.',
  },
  {
    titleFr: 'Securite',
    titleEn: 'Security',
    image: '/img/avantages/securite.png',
    descriptionFr: "Notre plateforme met en place des mesures de securite pour assurer la tranquillite d'esprit de nos utilisateurs.",
    descriptionEn: 'Our platform implements security measures to ensure the peace of mind of our users during shared trips.',
  },
  {
    titleFr: 'Simplicite',
    titleEn: 'Ease of Use',
    image: '/img/avantages/simplicite.png',
    descriptionFr: 'Notre plateforme conviviale rend la planification et la gestion de vos trajets de covoiturage simple et efficace.',
    descriptionEn: 'Our user-friendly platform makes planning and managing your carpooling trips simple and efficient.',
  },
  {
    titleFr: 'Flexibilite',
    titleEn: 'Flexibility',
    image: '/img/avantages/flexibilite.png',
    descriptionFr: 'Notre plateforme vous offre une grande flexibilite pour organiser vos trajets de maniere adaptee a vos besoins.',
    descriptionEn: 'Our platform offers great flexibility to organize your trips in a way that suits your needs.',
  },
];

const HOW_IT_WORKS_STEPS: Step[] = [
  {
    number: 1,
    titleFr: 'Inscrivez vous',
    titleEn: 'Sign-Up',
    descriptionFr: "avec votre adresse email du College la Cite et verifiez votre identite etudiante",
    descriptionEn: 'Create your account with your college email and verify your student identity.',
    linkText: { fr: 'Creer un compte ', en: 'Sign Up' },
    linkHref: '/inscription',
  },
  {
    number: 2,
    titleFr: 'Reservez / Proposez',
    titleEn: 'Book / Offer',
    descriptionFr: 'Rechercher un covoiturage disponible pour votre destination ou proposer en un si vous etes conducteur',
    descriptionEn: 'Search for an available carpooling ride for your destination or offer one if you are a driver.',
  },
  {
    number: 3,
    titleFr: 'Voyagez',
    titleEn: 'Travel',
    descriptionFr: 'Partagez le trajet, les frais et creez des liens avec vos camarades et collegues du College La Cite',
    descriptionEn: 'Share the ride, costs and create links with your classmates and colleagues at La Cite College.',
  },
  {
    number: 4,
    titleFr: "Evaluez l'experience",
    titleEn: 'Evaluate the experience',
    descriptionFr: "Faites des retroactions sur votre experience, notez les autres utilisateurs afin d'ameliorer votre securite et votre confort",
    descriptionEn: 'Give feedback on your experience, rate other users to improve your safety and comfort.',
  },
];

const NAV_LINKS: NavLink[] = [
  { href: '/', fr: 'Accueil', en: 'Home' },
  { href: '/#pourquoi-nous-choisir', fr: 'Pourquoi Nous Choisir ?', en: 'Why choose us ?' },
  { href: '/#comment-ca-marche', fr: 'Comment Ca Marche ?', en: 'How it Works ?' },
];

const HOMEPAGE_STATS: HomepageStat[] = [
  { value: '500+', labelFr: 'Utilisateurs Inscrits', labelEn: 'Registered Users' },
  { value: '1200+', labelFr: 'Trajets Partages', labelEn: 'Rides Shared' },
  { value: '50%', labelFr: 'Economies moyenne', labelEn: 'Average Savings' },
  { value: '2.5T', labelFr: 'CO2 Evite', labelEn: 'CO2 Avoided' },
];

export function getHomepageAdvantages(): Advantage[] {
  return ADVANTAGES;
}

export function getHomepageHowItWorksSteps(): Step[] {
  return HOW_IT_WORKS_STEPS;
}

export function getHomepageNavLinks(): NavLink[] {
  return NAV_LINKS;
}

export function getHomepageStats(): HomepageStat[] {
  return HOMEPAGE_STATS;
}

export function getLocalizedAdvantageTitle(advantage: Advantage, lang: Language): string {
  return lang === Language.FR ? advantage.titleFr : advantage.titleEn;
}

export function getLocalizedAdvantageDescription(advantage: Advantage, lang: Language): string {
  return lang === Language.FR ? advantage.descriptionFr : advantage.descriptionEn;
}

export function getLocalizedStepTitle(step: Step, lang: Language): string {
  return lang === Language.FR ? step.titleFr : step.titleEn;
}

export function getLocalizedStepDescription(step: Step, lang: Language): string {
  return lang === Language.FR ? step.descriptionFr : step.descriptionEn;
}

export function getLocalizedStepLinkText(step: Step, lang: Language): string | undefined {
  if (!step.linkText) return undefined;
  return lang === Language.FR ? step.linkText.fr : step.linkText.en;
}

export function getLocalizedNavLinkLabel(link: NavLink, lang: Language): string {
  return lang === Language.FR ? link.fr : link.en;
}

export function getLocalizedHomepageStatLabel(stat: HomepageStat, lang: Language): string {
  return lang === Language.FR ? stat.labelFr : stat.labelEn;
}
