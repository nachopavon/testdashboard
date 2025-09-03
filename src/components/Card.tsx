import React from 'react'
import Gauge from './Gauge'
import styles from './Card.module.css'

type Item = {
  id: string
  code: string
  title: string
  value: number
  target: number
  unit?: string
}

export default function Card({item}:{item:Item}){
  return (
    <div className={styles.card}>
      <div className={styles.headerRow}>
        <div className={styles.title}>{item.code}</div>
        <div className={styles.subtitle}>{item.title}</div>
      </div>

      <div className={styles.bodyRow}>
        <div className={styles.donutCol}>
          <Gauge value={item.value} target={item.target} unit={item.unit} />
        </div>
        <div className={styles.metricsCol}>
          <div className={styles.metricLarge}>{item.value}{item.unit ?? '%'}</div>
          <div className={styles.metricLabel}>Actual</div>
          <div className={styles.metricSmall}>Objetivo: {item.target}{item.unit ?? '%'}</div>
        </div>
      </div>
    </div>
  )
}
