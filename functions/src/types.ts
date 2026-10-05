export interface Ride {
  rideId: string;
  deviceId?: string;
  updatedAt?: number;
  [key: string]: unknown; // Index signature zit alleen hier
}

export interface Sample {
  t: number;
  [key: string]: unknown;
}

// Geen 'extends Ride' en geen dubbele index signature nodig
export interface RideDetails {
  rideId: string;
  deviceId?: string;
  updatedAt?: number;
  samplesCount: number;
  samples: Sample[];
  [key: string]: unknown;
}

export interface UpdateRideInput {
  title?: string;
  deviceId?: string;
  notes?: string;
  updatedAt: number;
  [key: string]: unknown; // Zorgt ervoor dat Firestore update() tevreden is!
}