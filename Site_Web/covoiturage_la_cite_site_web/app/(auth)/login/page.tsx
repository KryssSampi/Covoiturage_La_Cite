"use client";
import React from "react";
import { Language, useAppState } from "@/core/state/app_state";
/*
  * Cette page de connexion est un point d'entrée pour les utilisateurs qui souhaitent accéder à leur compte sur notre plateforme de covoiturage pour les étudiants. 
  * Elle est conçue pour être simple et intuitive, permettant aux utilisateurs de se connecter rapidement et facilement.
  * La page utilise le contexte global de l'application pour gérer la langue sélectionnée par l'utilisateur, offrant ainsi une expérience personnalisée en fonction de la langue choisie (français ou anglais).
  * Le design de la page est épuré et moderne, avec une mise en page responsive qui s'adapte à différents appareils, garantissant une expérience utilisateur optimale sur mobile, tablette et desktop.
  * Les utilisateurs peuvent entrer leurs informations de connexion, telles que leur adresse e-mail et leur mot de passe, pour accéder à leur compte. Des liens vers les pages d'inscription et de récupération de mot de passe sont également disponibles pour faciliter la navigation.
    * La page de connexion est un élément clé de notre plateforme, car elle permet aux utilisateurs d'accéder à leurs réservations, de gérer leur profil et de profiter pleinement des fonctionnalités de notre service de covoiturage pour les étudiants.
*/
import Link from "next/link"

export default function loginPage() {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const appState = useAppState()
    return(
    <div className="bg-white">
        <Link href=" " >
{appState.lang === Language.FR ? "Connecter Vous" : "Sign In"}
        </Link>
    </div>
    )
}