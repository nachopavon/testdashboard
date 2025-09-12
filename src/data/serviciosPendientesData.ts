// Datos sintéticos para Servicios Pendientes
import { profiles, Profile } from './serviciosPrestadosData';

export interface PendingService {
  id: string;
  title: string;
  status: 'Pendiente' | 'En Progreso' | 'Bloqueado' | 'Revisión';
  category: string;
  area: string;
  assignedProfile: Profile;
  priority: 'Alta' | 'Media' | 'Baja';
  estimatedHours: number;
  createdDate: string;
  lastUpdate: string;
}

export const pendingServices: PendingService[] = [
  {
    id: 'P001',
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
    id: 'P002',
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
    id: 'P003',
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
    id: 'P004',
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
    id: 'P005',
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
    id: 'P006',
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

// Estadísticas agregadas
export const pendingStats = {
  total: pendingServices.length,
  byStatus: {
    Pendiente: pendingServices.filter(s => s.status === 'Pendiente').length,
    'En Progreso': pendingServices.filter(s => s.status === 'En Progreso').length,
    Bloqueado: pendingServices.filter(s => s.status === 'Bloqueado').length,
    Revisión: pendingServices.filter(s => s.status === 'Revisión').length
  },
  byProfile: profiles.reduce((acc, profile) => {
    acc[profile] = pendingServices.filter(s => s.assignedProfile === profile).length;
    return acc;
  }, {} as Record<Profile, number>),
  totalEstimatedHours: pendingServices.reduce((sum, s) => sum + s.estimatedHours, 0)
};
