import React, { useState } from 'react';
import { workloadData, profileWorkload } from '../data/cargaTrabajoData';
import { months } from '../data/serviciosPrestadosData';
import styles from './CargaTrabajo.module.css';

// Generate SVG utilization evolution chart
function generateUtilizationEvolutionChart(data: {month: string, utilization: Record<string, number>}[], width = 600, height = 300): React.ReactElement | null {
  if (!data || data.length === 0) return null;

  const profiles = Object.keys(data[0].utilization);
  const colors = ['#007acc', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14'];

  return (
    <div className={styles.svgWrapperCentered}>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      <defs>
        <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" strokeWidth="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      
      {/* Y-axis labels */}
      <text x="10" y="30" fontSize="12" fill="#666">Utilización (%)</text>
      
      {/* Profile lines */}
      {profiles.map((profile, profileIndex) => {
        const profileData = data.map(d => ({ month: d.month, value: d.utilization[profile] || 0 }));
        const values = profileData.map(d => d.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;

        const points = profileData.map((d, i) => {
          const x = (i / (profileData.length - 1)) * (width - 80) + 40;
          const y = height - 60 - ((d.value - min) / range) * (height - 120);
          return `${x},${y}`;
        }).join(' ');

        const color = colors[profileIndex % colors.length];

        return (
          <g key={profile}>
            <polyline 
              fill="none" 
              stroke={color} 
              strokeWidth="2" 
              points={points} 
            />
            {profileData.map((d, i) => {
              const x = (i / (profileData.length - 1)) * (width - 80) + 40;
              const y = height - 60 - ((d.value - min) / range) * (height - 120);
              return <circle key={`${profile}-${i}`} cx={x} cy={y} r="3" fill={color} />
            })}
          </g>
        );
      })}
      
      {/* X-axis labels */}
      {data.map((d, i) => {
        if (i % Math.ceil(data.length / 6) === 0 || i === data.length - 1) {
          const x = (i / (data.length - 1)) * (width - 80) + 40;
          return (
            <text key={`label-${i}`} x={x} y={height - 10} fontSize="10" fill="#666" textAnchor="middle">
              {d.month}
            </text>
          );
        }
        return null;
      })}
      
      {/* Legend */}
      {profiles.map((profile, i) => (
        <g key={`legend-${profile}`}>
          <rect x={width - 120} y={20 + i * 15} width="12" height="3" fill={colors[i % colors.length]} />
          <text x={width - 100} y={25 + i * 15} fontSize="11" fill="#666">{profile}</text>
        </g>
      ))}
      </svg>
    </div>
  );
}

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

      <div className={styles.evolutionChart}>
        <h2>Evolución de Utilización por Perfil - Toda la Duración del Contrato</h2>
        {generateUtilizationEvolutionChart(workloadData)}
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
