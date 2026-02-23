

import type { Metadata } from "next";

// Configuration de la police monospace Geist

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
<>
        {children}
  </>
  );
}
