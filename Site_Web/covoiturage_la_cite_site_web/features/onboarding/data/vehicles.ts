// Données pour les sélecteurs de véhicule lors de l'onboarding (marché canadien)

export interface VehicleMake {
  make: string;
  models: string[];
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

export function getModelsByMake(make: string): string[] {
  return VEHICLE_MAKES.find((m) => m.make === make)?.models ?? [];
}
