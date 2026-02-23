import { Language } from '@/core/state/app_state'

export interface Advantage {
  titleFr: string
  titleEn: string
  image: string
  descriptionFr: string
  descriptionEn: string
}

/**
 * Hook pour gérer les avantages de la section "Pourquoi nous choisir"
 * Centralise la liste des avantages
 */
export function useAdvantages() {
  const advantages: Advantage[] = [
    {
      titleFr: 'Économie',
      titleEn: 'Savings',
      image: '/img/avantages/économie.png',
      descriptionFr: 'Partagez les frais de transport et économisez de l\'argent sur vos trajets quotidiens.',
      descriptionEn: 'Share transport costs and save money on your daily trips.',
    },
    {
      titleFr: 'Communauté',
      titleEn: 'Community',
      image: '/img/avantages/communauté.png',
      descriptionFr: 'Faites de nouvelles rencontres et élargissez votre cercle social en partageant vos trajets avec d\'autres étudiants.',
      descriptionEn: 'Make new friends and expand your social circle by sharing your trips with other students.',
    },
    {
      titleFr: 'Écologie',
      titleEn: 'Ecology',
      image: '/img/avantages/écologie.png',
      descriptionFr: 'Réduisez votre empreinte carbone en partageant vos trajets et en contribuant à un environnement plus propre.',
      descriptionEn: 'Reduce your carbon footprint by sharing your trips and contributing to a cleaner environment.',
    },
    {
      titleFr: 'Sécurité',
      titleEn: 'Security',
      image: '/img/avantages/sécurité.png',
      descriptionFr: 'Notre plateforme met en place des mesures de sécurité pour assurer la tranquillité d\'esprit de nos utilisateurs lors de leurs trajets partagés.',
      descriptionEn: 'Our platform implements security measures to ensure the peace of mind of our users during shared trips.',
    },
    {
      titleFr: 'Simplicité',
      titleEn: 'Ease of Use',
      image: '/img/avantages/simplicité.png',
      descriptionFr: 'Notre plateforme conviviale rend la planification et la gestion de vos trajets de covoiturage simple et efficace.',
      descriptionEn: 'Our user-friendly platform makes planning and managing your carpooling trips simple and efficient.',
    },
    {
      titleFr: 'Flexibilité',
      titleEn: 'Flexibility',
      image: '/img/avantages/flexibilité.png',
      descriptionFr: 'Notre plateforme vous offre une grande flexibilité pour organiser vos trajets de manière adaptée à vos besoins.',
      descriptionEn: 'Our platform offers great flexibility to organize your trips in a way that suits your needs.',
    },
  ]

  const getTitle = (advantage: Advantage, lang: Language): string => {
    return lang === Language.FR ? advantage.titleFr : advantage.titleEn
  }

  const getDescription = (advantage: Advantage, lang: Language): string => {
    return lang === Language.FR ? advantage.descriptionFr : advantage.descriptionEn
  }

  return {
    advantages,
    getTitle,
    getDescription,
  }
}
