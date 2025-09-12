import React, { useState } from 'react';
import { workloadData, profileWorkload } from '../data/cargaTrabajoData';
import { months } from '../data/serviciosPrestadosData';
import styles from './CargaTrabajo.module.css';

type Filters = { month?: string; lote?: string; req?: string };

export default function CargaTrabajo() {
  const [selectedMonth, setSelectedMonth] = useState(months[months.length - 1]);
  const selectedData = workloadData.find(item => item.month === selectedMonth) || workloadData[workloadData.length - 1];

  const totalHours = selectedData.totalHours;
  const avgUtilization = Math.round(
    Object.values(selectedData.utilization).reduce((sum, u) => sum + u, 0) / Object.values(selectedData.utilization).length
  );

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 100) return '#d64545'; // rojo para sobrecarga
    if (utilization >= 80) return '#f2a800'; // amarillo para alto
    if (utilization >= 60) return '#2f8b58'; // verde para normal
    return '#0b5fa5'; // azul para bajo
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Carga de Trabajo - {selectedMonth}</h1>
        <div className={styles.summary}>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{totalHours}</span>
            <span className={styles.metricLabel}>Horas Totales</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{avgUtilization}%</span>
            <span className={styles.metricLabel}>Utilización Media</span>
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor="month-select">Seleccionar Mes:</label>
          <select
            id="month-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={styles.select}
          >
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.profilesGrid}>
        {profileWorkload.map(profile => {
          const profileData = profile.data.find(item => item.month === selectedMonth) || profile.data[profile.data.length - 1];
          return (
            <div key={profile.profile} className={styles.profileCard}>
              <div className={styles.profileHeader}>
                <h3>{profile.profile}</h3>
                <div className={styles.utilizationBadge}
                     style={{ backgroundColor: getUtilizationColor(profileData.utilization) }}>
                  {profileData.utilization}%
                </div>
              </div>

              <div className={styles.profileStats}>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{profileData.hours}</span>
                  <span className={styles.statLabel}>Horas</span>
                </div>
              </div>

              <div className={styles.chart}>
                <svg width="100%" height="60" viewBox="0 0 100 60">
                  <rect x="20" y={60 - (profileData.hours / 200) * 50} width="60" height={(profileData.hours / 200) * 50} fill="var(--accent)" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
