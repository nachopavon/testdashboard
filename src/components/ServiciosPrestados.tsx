import React, { useState } from 'react';
import { servicesEvolution, hoursByProfile, profiles, Profile } from '../data/serviciosPrestadosData';
import styles from './ServiciosPrestados.module.css';

type TabType = 'evolucion' | 'horas-perfil';

export default function ServiciosPrestados() {
  const [activeTab, setActiveTab] = useState<TabType>('evolucion');

  const totalServices = servicesEvolution.reduce((sum, item) => sum + item.servicesCount, 0);
  const totalHours = servicesEvolution.reduce((sum, item) => sum + item.totalHours, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Servicios Prestados</h1>
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
            <h2>Evolución del Número de Servicios Prestados</h2>
            <div className={styles.chart}>
              {/* Placeholder para gráfico de evolución */}
              <div className={styles.placeholder}>
                <svg width="100%" height="300" viewBox="0 0 800 300">
                  <polyline
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="3"
                    points={servicesEvolution.map((item, i) =>
                      `${i * 50 + 50},${300 - (item.servicesCount / 100) * 250}`
                    ).join(' ')}
                  />
                  {servicesEvolution.map((item, i) => (
                    <circle
                      key={i}
                      cx={i * 50 + 50}
                      cy={300 - (item.servicesCount / 100) * 250}
                      r="4"
                      fill="var(--accent)"
                    />
                  ))}
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.profilesContainer}>
            <h2>Evolución de Servicios por Horas y Perfil</h2>
            <div className={styles.profilesGrid}>
              {profiles.map(profile => (
                <div key={profile} className={styles.profileCard}>
                  <h3>{profile}</h3>
                  <div className={styles.profileStats}>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>
                        {hoursByProfile.find(p => p.profile === profile)?.data.reduce((sum, item) => sum + item.hours, 0)}
                      </span>
                      <span className={styles.statLabel}>Horas Totales</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>
                        {hoursByProfile.find(p => p.profile === profile)?.data.reduce((sum, item) => sum + item.services, 0)}
                      </span>
                      <span className={styles.statLabel}>Servicios</span>
                    </div>
                  </div>
                  <div className={styles.miniChart}>
                    {/* Mini gráfico de evolución */}
                    <svg width="100%" height="60" viewBox="0 0 200 60">
                      <polyline
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="2"
                        points={hoursByProfile.find(p => p.profile === profile)?.data.map((item, i) =>
                          `${i * 10 + 10},${60 - (item.hours / 300) * 50}`
                        ).join(' ')}
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
