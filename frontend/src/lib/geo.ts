// Geocoded positions for Vitória-ES neighborhoods
// Verified center coords — avoiding bridges and water

export const NEIGHBORHOOD_COORDS: Record<string, [number, number]> = {
  "Praia do Canto": [-20.2955, -40.2905],
  "Jardim da Penha": [-20.2795, -40.2935],
  "Mata da Praia": [-20.2720, -40.2830],
  "Enseada do Suá": [-20.3010, -40.2900],
  "Jardim Camburi": [-20.2640, -40.2720],
  "Centro": [-20.3195, -40.3381],
  "Bento Ferreira": [-20.3118, -40.3137],
  "Goiabeiras": [-20.2745, -40.3028],
  "Santa Lúcia": [-20.3076, -40.2986],
  "Ilha do Boi": [-20.3035, -40.2780],
};

// Well-known gyms/academias in Vitória
export const KNOWN_GYMS: Array<{
  name: string;
  lat: number;
  lng: number;
  neighborhood: string;
  type: "gym" | "outdoor" | "studio";
}> = [
  {
    name: "Smart Fit — Praia do Canto",
    lat: -20.2978,
    lng: -40.2921,
    neighborhood: "Praia do Canto",
    type: "gym",
  },
  {
    name: "Bodytech — Enseada do Suá",
    lat: -20.3028,
    lng: -40.2887,
    neighborhood: "Enseada do Suá",
    type: "gym",
  },
  {
    name: "Bluefit — Jardim Camburi",
    lat: -20.2659,
    lng: -40.2711,
    neighborhood: "Jardim Camburi",
    type: "gym",
  },
  {
    name: "Arena Funcional — Jardim da Penha",
    lat: -20.2831,
    lng: -40.2942,
    neighborhood: "Jardim da Penha",
    type: "gym",
  },
  {
    name: "Praça dos Namorados (ao ar livre)",
    lat: -20.2989,
    lng: -40.2846,
    neighborhood: "Praia do Canto",
    type: "outdoor",
  },
  {
    name: "Parque Pedra da Cebola (ao ar livre)",
    lat: -20.2764,
    lng: -40.2919,
    neighborhood: "Mata da Praia",
    type: "outdoor",
  },
  {
    name: "Cross Training — Mata da Praia",
    lat: -20.2752,
    lng: -40.2835,
    neighborhood: "Mata da Praia",
    type: "gym",
  },
  {
    name: "Studio Pilates — Praia do Canto",
    lat: -20.2951,
    lng: -40.2869,
    neighborhood: "Praia do Canto",
    type: "studio",
  },
];

// Vitória center for initial map view
export const VITORIA_CENTER: [number, number] = [-20.2892, -40.2826];
export const DEFAULT_ZOOM = 14;
