import React from 'react';
import { pendingServices, pendingStats } from '../data/serviciosPendientesData';
import styles from './ServiciosPendientes.module.css';

export default function ServiciosPendientes() {
  const statusColors = {
    'Pendiente': '#f2a800',
    'En Progreso': '#0b5fa5',
    'Bloqueado': '#d64545',
    'Revisión': '#2f8b58'
  };

  const priorityColors = {
    'Alta': '#d64545',
    'Media': '#f2a800',
    'Baja': '#2f8b58'
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Servicios Pendientes</h1>
        <div className={styles.summary}>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{pendingStats.total}</span>
            <span className={styles.metricLabel}>Total Pendientes</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{pendingStats.totalEstimatedHours}</span>
            <span className={styles.metricLabel}>Horas Estimadas</span>
          </div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Por Estado</h3>
          <div className={styles.statusList}>
            {Object.entries(pendingStats.byStatus).map(([status, count]) => (
              <div key={status} className={styles.statusItem}>
                <div
                  className={styles.statusDot}
                  style={{ backgroundColor: statusColors[status as keyof typeof statusColors] }}
                ></div>
                <span className={styles.statusLabel}>{status}</span>
                <span className={styles.statusCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.statCard}>
          <h3>Por Perfil</h3>
          <div className={styles.profileList}>
            {Object.entries(pendingStats.byProfile).map(([profile, count]) => (
              <div key={profile} className={styles.profileItem}>
                <span className={styles.profileLabel}>{profile}</span>
                <span className={styles.profileCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.servicesList}>
        <h2>Lista de Servicios Pendientes</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Estado</th>
                <th>Categoría</th>
                <th>Área</th>
                <th>Perfil</th>
                <th>Prioridad</th>
                <th>Horas Est.</th>
                <th>Fecha Creación</th>
              </tr>
            </thead>
            <tbody>
              {pendingServices.map(service => (
                <tr key={service.id}>
                  <td>{service.id}</td>
                  <td>{service.title}</td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{ backgroundColor: statusColors[service.status] }}
                    >
                      {service.status}
                    </span>
                  </td>
                  <td>{service.category}</td>
                  <td>{service.area}</td>
                  <td>{service.assignedProfile}</td>
                  <td>
                    <span
                      className={styles.priorityBadge}
                      style={{ backgroundColor: priorityColors[service.priority] }}
                    >
                      {service.priority}
                    </span>
                  </td>
                  <td>{service.estimatedHours}</td>
                  <td>{service.createdDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
