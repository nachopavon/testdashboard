import React, { useState } from 'react';
import { servicesEvolution, months, profiles, Profile } from '../data/serviciosPrestadosData';
import styles from './ServiciosPrestados.module.css';

type TabType = 'evolucion' | 'horas-perfil';

// Generate SVG evolution chart
function generateEvolutionChart(data: {month: string, servicesCount: number, totalHours: number}[], width = 600, height = 300) {
  if (!data || data.length === 0) return null;

  const servicesValues = data.map(d => d.servicesCount);
  const hoursValues = data.map(d => d.totalHours);
  
  const servicesMin = Math.min(...servicesValues);
  const servicesMax = Math.max(...servicesValues);
  const hoursMin = Math.min(...hoursValues);
  const hoursMax = Math.max(...hoursValues);
  
  const servicesRange = servicesMax - servicesMin || 1;
  const hoursRange = hoursMax - hoursMin || 1;

  const servicesPoints = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - 80) + 40;
    const y = height - 60 - ((d.servicesCount - servicesMin) / servicesRange) * (height - 120);
    return `${x},${y}`;
  }).join(' ');

  const hoursPoints = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - 80) + 40;
    const y = height - 60 - ((d.totalHours - hoursMin) / hoursRange) * (height - 120);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Grid lines */}
      <defs>
        <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" strokeWidth="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      
      {/* Y-axis labels */}
      <text x="10" y="30" fontSize="12" fill="#666">Servicios</text>
      <text x="10" y={height - 30} fontSize="12" fill="#666">Horas</text>
      
      {/* Services line */}
      <polyline 
        fill="none" 
        stroke="#007acc" 
        strokeWidth="3" 
        points={servicesPoints} 
      />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * (width - 80) + 40;
        const y = height - 60 - ((d.servicesCount - servicesMin) / servicesRange) * (height - 120);
        return <circle key={`services-${i}`} cx={x} cy={y} r="4" fill="#007acc" />
      })}
      
      {/* Hours line */}
      <polyline 
        fill="none" 
        stroke="#28a745" 
        strokeWidth="3" 
        points={hoursPoints} 
      />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * (width - 80) + 40;
        const y = height - 60 - ((d.totalHours - hoursMin) / hoursRange) * (height - 120);
        return <circle key={`hours-${i}`} cx={x} cy={y} r="4" fill="#28a745" />
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
      <rect x={width - 120} y="20" width="15" height="3" fill="#007acc" />
      <text x={width - 100} y="25" fontSize="12" fill="#666">Servicios</text>
      <rect x={width - 120} y="35" width="15" height="3" fill="#28a745" />
      <text x={width - 100} y="40" fontSize="12" fill="#666">Horas</text>
    </svg>
  );
}

export default function ServiciosPrestados() {
  const [activeTab, setActiveTab] = useState<TabType>('evolucion');
  const [selectedMonth, setSelectedMonth] = useState(months[0]);

  const selectedData = servicesEvolution.find(item => item.month === selectedMonth) || servicesEvolution[0];

  const totalServices = selectedData.servicesCount;
  const totalHours = selectedData.totalHours;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Servicios Prestados</h1>
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label htmlFor="month-select">Mes:</label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={styles.select}
            >
              {months.map(month => (
                <option key={month} value={month}>
                  {new Date(month + '-01').toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.summary}>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{totalServices}</span>
            <span className={styles.metricLabel}>Total Servicios</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{totalHours}</span>
            <span className={styles.metricLabel}>Total Horas</span>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'evolucion' ? styles.active : ''}`}
          onClick={() => setActiveTab('evolucion')}
        >
          Evolución del número de servicios prestados
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'horas-perfil' ? styles.active : ''}`}
          onClick={() => setActiveTab('horas-perfil')}
        >
          Evolución de servicios por horas y perfil
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'evolucion' ? (
          <div className={styles.chartContainer}>
            <h2>Evolución del Número de Servicios Prestados - {new Date(selectedMonth + '-01').toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}</h2>
            <div className={styles.chart}>
              <div className={styles.evolutionChart}>
                <h3>Evolución Completa del Contrato</h3>
                {generateEvolutionChart(servicesEvolution)}
              </div>
              <div className={styles.currentMonthData}>
                <h3>Datos del Mes Seleccionado</h3>
                <div className={styles.monthData}>
                  <div className={styles.dataPoint}>
                    <span className={styles.dataLabel}>Servicios:</span>
                    <span className={styles.dataValue}>{selectedData.servicesCount}</span>
                  </div>
                  <div className={styles.dataPoint}>
                    <span className={styles.dataLabel}>Horas Totales:</span>
                    <span className={styles.dataValue}>{selectedData.totalHours}</span>
                  </div>
                </div>
                <svg width="100%" height="150" viewBox="0 0 400 150">
                  <rect x="50" y={150 - (selectedData.servicesCount / 100) * 100} width="100" height={(selectedData.servicesCount / 100) * 100} fill="var(--accent)" />
                  <text x="100" y={130} textAnchor="middle" fill="var(--text)">Servicios</text>
                  <rect x="250" y={150 - (selectedData.totalHours / 1000) * 100} width="100" height={(selectedData.totalHours / 1000) * 100} fill="var(--accent-2)" />
                  <text x="300" y={130} textAnchor="middle" fill="var(--text)">Horas</text>
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.profilesContainer}>
            <h2>Evolución de Servicios por Horas y Perfil - {new Date(selectedMonth + '-01').toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}</h2>
            <div className={styles.profilesGrid}>
              {profiles.map((profile: Profile) => {
                const profileData = selectedData.byProfile[profile];
                return (
                  <div key={profile} className={styles.profileCard}>
                    <h3>{profile}</h3>
                    <div className={styles.profileStats}>
                      <div className={styles.stat}>
                        <span className={styles.statValue}>{profileData.hours}</span>
                        <span className={styles.statLabel}>Horas</span>
                      </div>
                      <div className={styles.stat}>
                        <span className={styles.statValue}>{profileData.services}</span>
                        <span className={styles.statLabel}>Servicios</span>
                      </div>
                    </div>
                    <div className={styles.miniChart}>
                      <svg width="100%" height="60" viewBox="0 0 100 60">
                        <rect x="10" y={60 - (profileData.hours / 300) * 50} width="30" height={(profileData.hours / 300) * 50} fill="var(--accent)" />
                        <rect x="60" y={60 - (profileData.services / 20) * 50} width="30" height={(profileData.services / 20) * 50} fill="var(--accent-2)" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
