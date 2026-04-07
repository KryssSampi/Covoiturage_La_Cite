import { ReactNode } from "react";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: "Covoiturage La Cité - Profil",
    description: "Covoiturage La Cité - Consultez et modifiez les informations de votre profil, gérez vos trajets et paramètres de compte sur notre plateforme de covoiturage dédiée à la communauté de La Cité.",
};

export default function ProfileLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </div>
    );
}