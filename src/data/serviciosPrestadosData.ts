// Datos sintéticos para Servicios Prestados
export const profiles = ['GP', 'AN', 'AS', 'ARS', 'DE', 'CD'] as const;
export type Profile = typeof profiles[number];

export const months = [
  '2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06',
  '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12',
  '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'
];

export interface ServiceData {
  month: string;
  servicesCount: number;
  totalHours: number;
  byProfile: Record<Profile, { services: number; hours: number }>;
}

// Evolución del número de servicios prestados
export const servicesEvolution: ServiceData[] = months.map((month, i) => ({
  month,
  servicesCount: Math.floor(50 + Math.sin(i * 0.5) * 20 + Math.random() * 10),
  totalHours: Math.floor(800 + Math.sin(i * 0.5) * 200 + Math.random() * 100),
  byProfile: {
    GP: { services: Math.floor(5 + Math.random() * 3), hours: Math.floor(80 + Math.random() * 20) },
    AN: { services: Math.floor(8 + Math.random() * 4), hours: Math.floor(120 + Math.random() * 30) },
    AS: { services: Math.floor(10 + Math.random() * 5), hours: Math.floor(150 + Math.random() * 40) },
    ARS: { services: Math.floor(6 + Math.random() * 3), hours: Math.floor(100 + Math.random() * 25) },
    DE: { services: Math.floor(15 + Math.random() * 7), hours: Math.floor(250 + Math.random() * 60) },
    CD: { services: Math.floor(4 + Math.random() * 2), hours: Math.floor(60 + Math.random() * 15) }
  }
}));

// Datos para evolución por horas y perfil
export const hoursByProfile = profiles.map(profile => ({
  profile,
  data: servicesEvolution.map(item => ({
    month: item.month,
    hours: item.byProfile[profile].hours,
    services: item.byProfile[profile].services
  }))
}));
