

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LoaderManager } from "@/shared/components/LoaderManager";
import { LoaderProvider } from "@/core/context/loader.context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Empêche le zoom sauvage qui casse ton UI
};
export const metadata: Metadata = {
  title: "Covoiturage La Cité- Page d'Accueil",
  description: "Covoiturage La Cité - Simplifiez vos déplacements avec notre plateforme de covoiturage dédiée à la communauté de La Cité. Trouvez facilement des trajets partagés, réduisez votre empreinte carbone et connectez-vous avec d'autres membres pour des voyages plus économiques et conviviaux.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) 
{
 

return (
<html 
  lang="en" 
  style={{ scrollBehavior: 'smooth' }}
  suppressHydrationWarning={true}  // Empêche les warnings causés par les extensions navigateur (ex: MetaMask)
>
  <body 
    className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-200`}
    suppressHydrationWarning={true}
  >
        <LoaderProvider>
          <LoaderManager />
            {children}
        </LoaderProvider>
      </body>
    </html>
  );
}
