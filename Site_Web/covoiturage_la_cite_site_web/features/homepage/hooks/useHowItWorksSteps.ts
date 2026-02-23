import { Language } from '@/core/state/app_state'

export interface Step {
  number: number
  titleFr: string
  titleEn: string
  descriptionFr: string
  descriptionEn: string
  linkText?: {
    fr: string
    en: string
  }
  linkHref?: string
}

/**
 * Hook pour gérer les étapes de "Comment ça marche"
 * Centralise la logique des étapes du processus
 */
export function useHowItWorksSteps() {
  const steps: Step[] = [
    {
      number: 1,
      titleFr: 'Inscrivez vous',
      titleEn: 'Sign-Up',
      descriptionFr: 'avec votre adresse email du Collège la Cité et vérifiez votre identité étudiante',
      descriptionEn: 'Create your account with your college email and verify your student identity.',
      linkText: {
        fr: 'Créer un compte ',
        en: 'Sign Up',
      },
      linkHref: '/inscription',
    },
    {
      number: 2,
      titleFr: 'Réservez / Proposez',
      titleEn: 'Book / Offer',
      descriptionFr: 'Rechercher un covoiturage disponible pour votre destination ou Proposer en un si vous êtes conducteur',
      descriptionEn: 'Search for an available carpooling ride for your destination or offer one if you are a driver.',
    },
    {
      number: 3,
      titleFr: 'Voyagez',
      titleEn: 'Travel',
      descriptionFr: 'Partagez le trajet , les frais et créez des liens avec vos camarades et collègues du Collège La Cité',
      descriptionEn: 'Share the ride, costs and create links with your classmates and colleagues at La Cité College.',
    },
    {
      number: 4,
      titleFr: 'Évaluez l\'expérience',
      titleEn: 'Evaluate the experience',
      descriptionFr: 'Faites des rétrocactions sur votre espérence, notez les autres utilisateurs afin d\'améliorer votre sécurité et votre confort',
      descriptionEn: 'Give feedback on your experience, rate other users to improve your safety and comfort.',
    },
  ]

  const getTitle = (step: Step, lang: Language): string => {
    return lang === Language.FR ? step.titleFr : step.titleEn
  }

  const getDescription = (step: Step, lang: Language): string => {
    return lang === Language.FR ? step.descriptionFr : step.descriptionEn
  }

  const getLinkText = (step: Step, lang: Language): string | undefined => {
    if (!step.linkText) return undefined
    return lang === Language.FR ? step.linkText.fr : step.linkText.en
  }

  return {
    steps,
    getTitle,
    getDescription,
    getLinkText,
  }
}
