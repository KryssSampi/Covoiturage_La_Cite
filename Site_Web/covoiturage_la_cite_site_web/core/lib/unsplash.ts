export async function getCityImage(city: string) {
  const lowerCity = city.toLowerCase();

  if (lowerCity.includes("cité")) {
    const image = "/assets/destinations-pictures/la-cite.png";
    setImage(image);
    return image;
  }

  switch (lowerCity) {
    case "campus la cité":
    case "la cité":
    case "cité":
    case "cité collégiale":
        const image = "/assets/destinations-pictures/la-cite.png";
        setImage(image);
        return image;

    case "maison":
        const imageMaison = "/assets/destinations-pictures/maison.png";
        setImage(imageMaison);
        return imageMaison;
    case "travail":
        const imageTravail = "/assets/destinations-pictures/travail.png";
        setImage(imageTravail);
        return imageTravail;   

    default:
      const res = await fetch(`/api/unsplash?city=${city}`);

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      if(!data.image || data.image.length === 0) {
        const defaultImage = "/assets/destinations-pictures/default-city.png";
        setImage(defaultImage);
        return defaultImage;
      }
      setImage(data.image);
      return data?.image || null;
  }
}
function setImage(image: string | null): void {
  if (typeof window !== "undefined") {
    const imageElement = document.querySelector("img[data-city-image]");
    if (imageElement) {
      imageElement.setAttribute("src", image || "");
    }
  }
}
