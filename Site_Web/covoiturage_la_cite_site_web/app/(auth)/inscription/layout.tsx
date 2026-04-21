import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Covoiturage La Cité - Inscription",
    description: "Créez votre compte sur la plateforme de covoiturage dédiée à la communauté de La Cité.",
};

export default function InscriptionLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fr" style={{ scrollBehavior: "smooth", overflowX: "hidden" }}>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                {children}
            </body>
        </html>
    );
}
