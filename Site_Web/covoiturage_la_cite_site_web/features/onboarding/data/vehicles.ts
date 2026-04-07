// Données pour les sélecteurs de véhicule lors de l'onboarding (marché canadien)

export interface VehicleMake {
  make: string;
  models: string[];
}

function normalizeVehicleKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function makeModelKey(make: string, model: string): string {
  return `${normalizeVehicleKey(make)}::${normalizeVehicleKey(model)}`;
}

export const VEHICLE_MAKES: VehicleMake[] = [
  {
    make: 'Toyota',
    models: ['Camry', 'Corolla', 'Rav4', 'Highlander', 'Prius', 'Prius Prime', 'Venza', 'Sienna', 'Tacoma', 'Tundra', 'Sequoia', 'C-HR'],
  },
  {
    make: 'Honda',
    models: ['Civic', 'Accord', 'CR-V', 'Pilot', 'HR-V', 'Ridgeline', 'Odyssey', 'Passport', 'Fit', 'Insight'],
  },
  {
    make: 'Ford',
    models: ['F-150', 'Escape', 'Edge', 'Explorer', 'Bronco', 'Maverick', 'Mustang', 'Transit Connect', 'Ranger'],
  },
  {
    make: 'Chevrolet',
    models: ['Silverado', 'Equinox', 'Traverse', 'Malibu', 'Trax', 'Blazer', 'Tahoe', 'Suburban', 'Colorado'],
  },
  {
    make: 'Hyundai',
    models: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Kona', 'Ioniq 5', 'Ioniq 6', 'Santa Cruz', 'Palisade', 'Venue'],
  },
  {
    make: 'Kia',
    models: ['Forte', 'K5', 'Sportage', 'Sorento', 'Telluride', 'Soul', 'Niro', 'EV6', 'Seltos', 'Carnival'],
  },
  {
    make: 'Nissan',
    models: ['Altima', 'Sentra', 'Rogue', 'Murano', 'Pathfinder', 'Frontier', 'Titan', 'Kicks', 'Qashqai', 'Leaf'],
  },
  {
    make: 'Mazda',
    models: ['Mazda3', 'Mazda6', 'CX-3', 'CX-30', 'CX-5', 'CX-50', 'CX-9', 'MX-5 Miata'],
  },
  {
    make: 'Volkswagen',
    models: ['Golf', 'Jetta', 'Passat', 'Tiguan', 'Atlas', 'Taos', 'ID.4', 'Arteon'],
  },
  {
    make: 'Subaru',
    models: ['Impreza', 'Legacy', 'Outback', 'Forester', 'Crosstrek', 'Ascent', 'WRX', 'BRZ', 'Solterra'],
  },
  {
    make: 'BMW',
    models: ['Série 3', 'Série 5', 'X1', 'X3', 'X5', 'X7', 'Série 4', 'Série 2'],
  },
  {
    make: 'Mercedes-Benz',
    models: ['Classe A', 'Classe C', 'Classe E', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS'],
  },
  {
    make: 'Audi',
    models: ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron'],
  },
  {
    make: 'GMC',
    models: ['Sierra', 'Terrain', 'Acadia', 'Yukon', 'Canyon', 'Envoy'],
  },
  {
    make: 'Dodge',
    models: ['Charger', 'Challenger', 'Durango', 'Hornet', 'Grand Caravan'],
  },
  {
    make: 'Chrysler',
    models: ['Pacifica', 'Pacifica Hybrid', '300'],
  },
  {
    make: 'Jeep',
    models: ['Wrangler', 'Cherokee', 'Grand Cherokee', 'Compass', 'Renegade', 'Gladiator'],
  },
  {
    make: 'Ram',
    models: ['1500', '2500', '3500', 'ProMaster City'],
  },
  {
    make: 'Tesla',
    models: ['Model 3', 'Model S', 'Model X', 'Model Y', 'Cybertruck'],
  },
  {
    make: 'Volvo',
    models: ['S60', 'S90', 'XC40', 'XC60', 'XC90', 'V60', 'V90', 'C40'],
  },
  {
    make: 'Mitsubishi',
    models: ['Outlander', 'Outlander PHEV', 'Eclipse Cross', 'Mirage', 'RVR'],
  },
  {
    make: 'Buick',
    models: ['Encore', 'Encore GX', 'Envision', 'Enclave'],
  },
  {
    make: 'Lincoln',
    models: ['Corsair', 'Nautilus', 'Aviator', 'Navigator'],
  },
  {
    make: 'Cadillac',
    models: ['CT4', 'CT5', 'XT4', 'XT5', 'XT6', 'Escalade', 'Lyriq'],
  },
  {
    make: 'Lexus',
    models: ['IS', 'ES', 'GS', 'LS', 'NX', 'RX', 'GX', 'LX', 'UX'],
  },
  {
    make: 'Acura',
    models: ['ILX', 'TLX', 'RDX', 'MDX', 'ZDX'],
  },
  {
    make: 'Infiniti',
    models: ['Q50', 'Q60', 'QX50', 'QX60', 'QX80'],
  },
  {
    make: 'Genesis',
    models: ['G70', 'G80', 'G90', 'GV70', 'GV80'],
  },
  {
    make: 'Polestar',
    models: ['Polestar 2', 'Polestar 3'],
  },
  {
    make: 'Rivian',
    models: ['R1T', 'R1S'],
  },
];

export const VEHICLE_COLORS: { value: string; label: string }[] = [
  { value: 'Blanc', label: 'Blanc' },
  { value: 'Noir', label: 'Noir' },
  { value: 'Gris', label: 'Gris' },
  { value: 'Argent', label: 'Argent' },
  { value: 'Rouge', label: 'Rouge' },
  { value: 'Bleu', label: 'Bleu' },
  { value: 'Bleu marine', label: 'Bleu marine' },
  { value: 'Vert', label: 'Vert' },
  { value: 'Beige', label: 'Beige' },
  { value: 'Brun', label: 'Brun' },
  { value: 'Or', label: 'Or' },
  { value: 'Orange', label: 'Orange' },
  { value: 'Jaune', label: 'Jaune' },
  { value: 'Violet', label: 'Violet' },
  { value: 'Bordeaux', label: 'Bordeaux' },
  { value: 'Turquoise', label: 'Turquoise' },
  { value: 'Champagne', label: 'Champagne' },
  { value: 'Autre', label: 'Autre' },
];

export const VEHICLE_YEARS: number[] = Array.from(
  { length: new Date().getFullYear() - 1979 },
  (_, i) => new Date().getFullYear() + 1 - i
);

// Capacité standard (sièges totaux incluant le conducteur) par modèle.
// Fallback à 5 places totales pour les modèles non listés.
const MODEL_STANDARD_CAPACITY: Record<string, number> = {
  [makeModelKey("Toyota", "Highlander")]: 7,
  [makeModelKey("Toyota", "Sienna")]: 7,
  [makeModelKey("Toyota", "Sequoia")]: 7,
  [makeModelKey("Honda", "Pilot")]: 7,
  [makeModelKey("Honda", "Odyssey")]: 7,
  [makeModelKey("Ford", "Explorer")]: 7,
  [makeModelKey("Ford", "Transit Connect")]: 7,
  [makeModelKey("Chevrolet", "Traverse")]: 7,
  [makeModelKey("Chevrolet", "Tahoe")]: 7,
  [makeModelKey("Chevrolet", "Suburban")]: 7,
  [makeModelKey("Hyundai", "Palisade")]: 7,
  [makeModelKey("Kia", "Sorento")]: 7,
  [makeModelKey("Kia", "Telluride")]: 7,
  [makeModelKey("Kia", "Carnival")]: 8,
  [makeModelKey("Nissan", "Pathfinder")]: 7,
  [makeModelKey("Mazda", "CX-9")]: 7,
  [makeModelKey("Mazda", "MX-5 Miata")]: 2,
  [makeModelKey("Volkswagen", "Atlas")]: 7,
  [makeModelKey("Subaru", "Ascent")]: 7,
  [makeModelKey("Subaru", "BRZ")]: 4,
  [makeModelKey("BMW", "X7")]: 7,
  [makeModelKey("Mercedes-Benz", "GLS")]: 7,
  [makeModelKey("Audi", "Q7")]: 7,
  [makeModelKey("GMC", "Acadia")]: 7,
  [makeModelKey("GMC", "Yukon")]: 7,
  [makeModelKey("Dodge", "Durango")]: 7,
  [makeModelKey("Dodge", "Grand Caravan")]: 7,
  [makeModelKey("Chrysler", "Pacifica")]: 7,
  [makeModelKey("Chrysler", "Pacifica Hybrid")]: 7,
  [makeModelKey("Ram", "ProMaster City")]: 7,
  [makeModelKey("Tesla", "Model X")]: 7,
  [makeModelKey("Volvo", "XC90")]: 7,
  [makeModelKey("Mitsubishi", "Outlander")]: 7,
  [makeModelKey("Lincoln", "Aviator")]: 7,
  [makeModelKey("Lincoln", "Navigator")]: 7,
  [makeModelKey("Cadillac", "Escalade")]: 7,
  [makeModelKey("Lexus", "GX")]: 7,
  [makeModelKey("Lexus", "LX")]: 7,
  [makeModelKey("Acura", "MDX")]: 7,
  [makeModelKey("Infiniti", "QX60")]: 7,
  [makeModelKey("Infiniti", "QX80")]: 7,
  [makeModelKey("Genesis", "GV80")]: 7,
  [makeModelKey("Rivian", "R1S")]: 7,
};

export function getStandardCapacityByModel(make: string, model: string): number {
  if (!make || !model) return 5;
  return MODEL_STANDARD_CAPACITY[makeModelKey(make, model)] ?? 5;
}

export function getMaxPassengerSeatsByModel(make: string, model: string): number {
  return Math.max(1, getStandardCapacityByModel(make, model) - 1);
}

export function getModelsByMake(make: string): string[] {
  return VEHICLE_MAKES.find((m) => m.make === make)?.models ?? [];
}
