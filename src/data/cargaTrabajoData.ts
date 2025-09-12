// Datos sintéticos para Carga de Trabajo
import { profiles, Profile, months } from './serviciosPrestadosData';

export interface WorkloadData {
  month: string;
  totalHours: number;
  byProfile: Record<Profile, number>;
  utilization: Record<Profile, number>; // porcentaje de utilización
}

export const workloadData: WorkloadData[] = months.map((month, i) => {
  const baseHours = 160; // horas mensuales por perfil
  const byProfile = {
    GP: Math.floor(baseHours * (0.8 + Math.sin(i * 0.7) * 0.2 + Math.random() * 0.1)),
    AN: Math.floor(baseHours * (0.9 + Math.sin(i * 0.6) * 0.15 + Math.random() * 0.1)),
    AS: Math.floor(baseHours * (0.85 + Math.sin(i * 0.5) * 0.2 + Math.random() * 0.1)),
    ARS: Math.floor(baseHours * (0.75 + Math.sin(i * 0.8) * 0.25 + Math.random() * 0.1)),
    DE: Math.floor(baseHours * (1.1 + Math.sin(i * 0.4) * 0.3 + Math.random() * 0.1)),
    CD: Math.floor(baseHours * (0.7 + Math.sin(i * 0.9) * 0.2 + Math.random() * 0.1))
  };

  const totalHours = Object.values(byProfile).reduce((sum, hours) => sum + hours, 0);

  const utilization = {
    GP: Math.round((byProfile.GP / baseHours) * 100),
    AN: Math.round((byProfile.AN / baseHours) * 100),
    AS: Math.round((byProfile.AS / baseHours) * 100),
    ARS: Math.round((byProfile.ARS / baseHours) * 100),
    DE: Math.round((byProfile.DE / baseHours) * 100),
    CD: Math.round((byProfile.CD / baseHours) * 100)
  };

  return {
    month,
    totalHours,
    byProfile,
    utilization
  };
});

// Datos agregados por perfil
export const profileWorkload = profiles.map(profile => ({
  profile,
  totalHours: workloadData.reduce((sum, item) => sum + item.byProfile[profile], 0),
  avgUtilization: Math.round(workloadData.reduce((sum, item) => sum + item.utilization[profile], 0) / workloadData.length),
  data: workloadData.map(item => ({
    month: item.month,
    hours: item.byProfile[profile],
    utilization: item.utilization[profile]
  }))
}));
