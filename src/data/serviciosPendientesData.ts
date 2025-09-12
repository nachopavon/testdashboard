// Datos sintéticos para Servicios Pendientes
import { profiles, Profile, months } from './serviciosPrestadosData';

export type PendingStatus = 'Pendiente' | 'En Progreso' | 'Bloqueado' | 'Revisión'
export type PendingPriority = 'Alta' | 'Media' | 'Baja'

export interface PendingService {
  id: string;
  title: string;
  status: PendingStatus;
  category: string;
  area: string;
  assignedProfile: Profile;
  priority: PendingPriority;
  estimatedHours: number;
  createdDate: string;
  lastUpdate: string;
}

const baseServices: Omit<PendingService, 'id'>[] = [
  {
    title: 'Implementación de módulo de autenticación',
    status: 'En Progreso',
    category: 'Desarrollo',
    area: 'Seguridad',
    assignedProfile: 'DE',
    priority: 'Alta',
    estimatedHours: 40,
    createdDate: '2024-08-15',
    lastUpdate: '2024-09-10'
  },
  {
    title: 'Análisis de requisitos para nuevo portal',
    status: 'Pendiente',
    category: 'Análisis',
    area: 'Portal Web',
    assignedProfile: 'AN',
    priority: 'Media',
    estimatedHours: 25,
    createdDate: '2024-09-01',
    lastUpdate: '2024-09-05'
  },
  {
    title: 'Arquitectura de base de datos',
    status: 'Bloqueado',
    category: 'Arquitectura',
    area: 'Base de Datos',
    assignedProfile: 'ARS',
    priority: 'Alta',
    estimatedHours: 60,
    createdDate: '2024-07-20',
    lastUpdate: '2024-08-30'
  },
  {
    title: 'Gestión de proyecto de migración',
    status: 'En Progreso',
    category: 'Gestión',
    area: 'Migración',
    assignedProfile: 'GP',
    priority: 'Alta',
    estimatedHours: 80,
    createdDate: '2024-06-10',
    lastUpdate: '2024-09-08'
  },
  {
    title: 'Consultoría digital para UX',
    status: 'Revisión',
    category: 'Consultoría',
    area: 'UX/UI',
    assignedProfile: 'CD',
    priority: 'Media',
    estimatedHours: 30,
    createdDate: '2024-08-25',
    lastUpdate: '2024-09-12'
  },
  {
    title: 'Análisis de sistemas legacy',
    status: 'Pendiente',
    category: 'Análisis',
    area: 'Sistemas Legacy',
    assignedProfile: 'AS',
    priority: 'Baja',
    estimatedHours: 45,
    createdDate: '2024-09-05',
    lastUpdate: '2024-09-07'
  }
];

export const pendingServicesByMonth: Record<string, PendingService[]> = months.reduce((acc, month, idx) => {
  const numServices = Math.max(3, Math.floor(6 + Math.sin(idx * 0.5) * 2 + Math.random() * 2));
  const services: PendingService[] = [];
  for (let i = 0; i < numServices; i++) {
    const base = baseServices[i % baseServices.length];
    services.push({
      ...base,
      id: `${month.replace(/\s+/g, '').substring(0, 6)}-${String(i + 1).padStart(2, '0')}`,
      estimatedHours: Math.floor(base.estimatedHours * (0.8 + Math.random() * 0.4)),
      status: (['Pendiente', 'En Progreso', 'Bloqueado', 'Revisión'] as PendingStatus[])[Math.floor(Math.random() * 4)],
      priority: (['Alta', 'Media', 'Baja'] as PendingPriority[])[Math.floor(Math.random() * 3)]
    });
  }
  acc[month] = services;
  return acc;
}, {} as Record<string, PendingService[]>);

// Estadísticas agregadas por mes
export const pendingStatsByMonth = months.reduce((acc, month) => {
  const services = pendingServicesByMonth[month];
  acc[month] = {
    total: services.length,
    byStatus: {
      Pendiente: services.filter(s => s.status === 'Pendiente').length,
      'En Progreso': services.filter(s => s.status === 'En Progreso').length,
      Bloqueado: services.filter(s => s.status === 'Bloqueado').length,
      Revisión: services.filter(s => s.status === 'Revisión').length
    },
    byProfile: profiles.reduce((pAcc, profile) => {
      pAcc[profile] = services.filter(s => s.assignedProfile === profile).length;
      return pAcc;
    }, {} as Record<Profile, number>),
    totalEstimatedHours: services.reduce((sum, s) => sum + s.estimatedHours, 0)
  };
  return acc;
}, {} as Record<string, {
  total: number;
  byStatus: Record<string, number>;
  byProfile: Record<Profile, number>;
  totalEstimatedHours: number;
}>);
