import { z } from "zod"

const allowedDomains = ["lacitec.on.ca", "collegelacite.ca"]

export const registerSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  email: z
    .string()
    .email("Email invalide")
    .refine((email) => {
      const domain = email.split("@")[1]
      return allowedDomains.includes(domain)
    }, {
      message: "Utilisez votre courriel institutionnel"
    }),
  phone: z.string().min(8, "Téléphone invalide"),
  password: z
    .string()
    .min(8, "Minimum 8 caractères")
    .regex(/[A-Z]/, "Une majuscule requise")
    .regex(/[a-z]/, "Une minuscule requise")
    .regex(/[0-9]/, "Un chiffre requis"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})


export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email requis")
    .email("Email invalide"),

  password: z
    .string()
    .min(1, "Mot de passe requis"),
})

export type LoginSchema = z.infer<typeof loginSchema>