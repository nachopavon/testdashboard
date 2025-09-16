import React from 'react'
import styles from './Gauge.module.css'

function clamp100(n:number){
  if(Number.isNaN(n)) return 0
  return Math.max(0, Math.min(100, n))
}

export default function SmallGauge({ value, target }:{ value:number; target:number }){
  // map 0-10 range to 0-100
  const v100 = (value / 10) * 100
  const t100 = (target / 10) * 100

  const percentage = Math.round(clamp100(v100) * 10) / 10
  const pctForStroke = clamp100(percentage) / 100
  const circ = 2 * Math.PI * 44 // radius 44
  const dash = Math.max(0, Math.min(circ, circ * pctForStroke))

  const targetAngle = (clamp100(t100) / 100) * 360 - 90
  const rad = (targetAngle * Math.PI) / 180
  const cx = 60 + Math.cos(rad) * 44
  const cy = 60 + Math.sin(rad) * 44

  const color = percentage >= t100 ? '#2f8b58' : '#c0392b'

  return (
    <div className={styles.gauge} aria-hidden>
      <svg className={styles.donut} width="120" height="120" viewBox="0 0 120 120" role="img" aria-label={`Gauge ${value} of 10`}>
        <defs>
          <linearGradient id="g1" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#2f8b58" stopOpacity="1" />
            <stop offset="100%" stopColor="#1f6b3f" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* background circle */}
        <circle cx="60" cy="60" r="44" stroke="#eee" strokeWidth="14" fill="none" />

        {/* foreground arc */}
        <circle cx="60" cy="60" r="44" stroke={color} strokeWidth="14" fill="none"
          strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ * 0.25} strokeLinecap="round" transform="rotate(-90 60 60)" />

        {/* small target marker */}
        <line x1={cx} y1={cy} x2={60 + Math.cos(rad) * 36} y2={60 + Math.sin(rad) * 36} stroke="#333" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      </svg>
    </div>
  )
}
