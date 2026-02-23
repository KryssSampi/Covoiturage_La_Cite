
import { Footer } from "@/shared/components/footer";
import type { Metadata } from "next";
import { Header } from "@/shared/components/header";
import { LoaderProvider } from "@/core/context/loader.context";
import { LoaderManager } from "@/shared/components/LoaderManager";



export const metadata : Metadata = {
  title: "Covoiturage La Cité- tableau de bord",
  description: "Covoiturage La Cité - Simplifiez vos déplacements avec notre plateforme de covoiturage dédiée à la communauté de La Cité. Trouvez facilement des trajets partagés, réduisez votre empreinte carbone et connectez-vous avec d'autres membres pour des voyages plus économiques et conviviaux.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

return (
    <>
    <LoaderProvider>
      <LoaderManager />
      <Header />
      {children}
      <Footer />
    </LoaderProvider>

    </>
  );
}
