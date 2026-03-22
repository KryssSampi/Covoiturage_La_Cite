// ============================================================
//  CONSTANTES — formulaire de creation de trajet
// ============================================================

// Limites de prix par passager (en CAD)
export const MIN_PRICE = 1;
export const MAX_PRICE = 50;

// Nombre minimum de places disponibles
export const MIN_AVAILABLE_SEATS = 1;

// Vehicules mock (remplacer par GET /api/driver/{id}/vehicles)
export interface MockVehicle {
  id: string;
  label: string;
  maxPassengers: number;
  color?: string;
}

export const MOCK_VEHICLES: MockVehicle[] = [
  { id: 'v-001', label: 'Honda Civic 2020',    maxPassengers: 4, color: 'Noire'   },
  { id: 'v-002', label: 'Toyota Corolla 2019', maxPassengers: 4, color: 'Blanche' },
  { id: 'v-003', label: 'Mazda3 2021',         maxPassengers: 4, color: 'Grise'   },
  { id: 'v-004', label: 'Dodge Grand Caravan', maxPassengers: 7, color: 'Argent'  },
  { id: 'v-005', label: 'Ford F-150 2022',     maxPassengers: 5, color: 'Bleu'    },
];
