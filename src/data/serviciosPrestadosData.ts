// Datos sintéticos para Servicios Prestados
export const profiles = ['GP', 'AN', 'AS', 'ARS', 'DE', 'CD'] as const;
export type Profile = typeof profiles[number];

export const months = [
  '2025-10', '2025-11', '2025-12',
  '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06',
  '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12',
  '2027-01', '2027-02', '2027-03', '2027-04', '2027-05', '2027-06',
  '2027-07', '2027-08', '2027-09', '2027-10', '2027-11', '2027-12',
  '2028-01', '2028-02'
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
}));// Datos para evolución por horas y perfil
export const hoursByProfile = profiles.map(profile => ({
  profile,
  data: servicesEvolution.map(item => ({
    month: item.month,
    hours: item.byProfile[profile].hours,
    services: item.byProfile[profile].services
  }))
}));
