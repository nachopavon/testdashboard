import React, { useState } from 'react';
import { servicesEvolution, hoursByProfile, profiles, Profile, months } from '../data/serviciosPrestadosData';
import styles from './ServiciosPrestados.module.css';

type TabType = 'evolucion' | 'horas-perfil';

type Filters = { month?: string; lote?: string; req?: string };

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
              <div className={styles.placeholder}>
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
                <svg width="100%" height="200" viewBox="0 0 400 200">
                  <rect x="50" y={200 - (selectedData.servicesCount / 100) * 150} width="100" height={(selectedData.servicesCount / 100) * 150} fill="var(--accent)" />
                  <text x="100" y={180} textAnchor="middle" fill="var(--text)">Servicios</text>
                  <rect x="250" y={200 - (selectedData.totalHours / 1000) * 150} width="100" height={(selectedData.totalHours / 1000) * 150} fill="var(--accent-2)" />
                  <text x="300" y={180} textAnchor="middle" fill="var(--text)">Horas</text>
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.profilesContainer}>
            <h2>Evolución de Servicios por Horas y Perfil - {new Date(selectedMonth + '-01').toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}</h2>
            <div className={styles.profilesGrid}>
              {profiles.map(profile => {
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
