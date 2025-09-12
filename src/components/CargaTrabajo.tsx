import React from 'react';
import { workloadData, profileWorkload } from '../data/cargaTrabajoData';
import styles from './CargaTrabajo.module.css';

export default function CargaTrabajo() {
  const totalHours = workloadData.reduce((sum, item) => sum + item.totalHours, 0);
  const avgUtilization = Math.round(
    profileWorkload.reduce((sum, p) => sum + p.avgUtilization, 0) / profileWorkload.length
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
        <h1>Carga de Trabajo</h1>
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

      <div className={styles.profilesGrid}>
        {profileWorkload.map(profile => (
          <div key={profile.profile} className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <h3>{profile.profile}</h3>
              <div className={styles.utilizationBadge}
                   style={{ backgroundColor: getUtilizationColor(profile.avgUtilization) }}>
                {profile.avgUtilization}%
              </div>
            </div>

            <div className={styles.profileStats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{profile.totalHours}</span>
                <span className={styles.statLabel}>Horas Totales</span>
              </div>
            </div>

            <div className={styles.chart}>
              <svg width="100%" height="120" viewBox="0 0 300 120">
                <polyline
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  points={profile.data.map((item, i) =>
                    `${i * 15 + 20},${120 - (item.hours / 200) * 80}`
                  ).join(' ')}
                />
                {profile.data.map((item, i) => (
                  <circle
                    key={i}
                    cx={i * 15 + 20}
                    cy={120 - (item.hours / 200) * 80}
                    r="3"
                    fill="var(--accent)"
                    opacity="0.7"
                  />
                ))}
              </svg>
            </div>

            <div className={styles.monthlyData}>
              {profile.data.slice(-6).map((item, i) => (
                <div key={i} className={styles.monthItem}>
                  <span className={styles.monthLabel}>
                    {item.month.split('-')[1]}/{item.month.split('-')[0].slice(-2)}
                  </span>
                  <div className={styles.monthBar}>
                    <div
                      className={styles.monthFill}
                      style={{
                        width: `${Math.min((item.hours / 200) * 100, 100)}%`,
                        backgroundColor: getUtilizationColor(item.utilization)
                      }}
                    ></div>
                  </div>
                  <span className={styles.monthValue}>{item.hours}h</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.overallChart}>
        <h2>Evolución General de la Carga de Trabajo</h2>
        <div className={styles.chartContainer}>
          <svg width="100%" height="300" viewBox="0 0 800 300">
            {profileWorkload.map((profile, profileIndex) => (
              <polyline
                key={profile.profile}
                fill="none"
                stroke={`hsl(${profileIndex * 60}, 70%, 50%)`}
                strokeWidth="2"
                points={profile.data.map((item, i) =>
                  `${i * 40 + 50},${300 - (item.hours / 200) * 250}`
                ).join(' ')}
              />
            ))}
          </svg>
        </div>
        <div className={styles.legend}>
          {profileWorkload.map((profile, i) => (
            <div key={profile.profile} className={styles.legendItem}>
              <div
                className={styles.legendColor}
                style={{ backgroundColor: `hsl(${i * 60}, 70%, 50%)` }}
              ></div>
              <span>{profile.profile}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
