

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Covoiturage La Cité - Page de Connexion",
  description: "Covoiturage La Cité - Connectez-vous à votre compte pour accéder à notre plateforme de covoiturage dédiée à la communauté de La Cité. Trouvez facilement des trajets partagés, réduisez votre empreinte carbone et connectez-vous avec d'autres membres pour des voyages plus économiques et conviviaux.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

return (
    <html lang="en" style={{ scrollBehavior:'smooth' , overflowX : 'hidden'}}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
