import React, { useRef, useState } from 'react'
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

export default function Card({item, index}:{item:Item, index?:number}){
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [tooltipPos, setTooltipPos] = useState<{x:number,y:number}>({x:0,y:0})
  const gaugeRef = useRef<HTMLDivElement|null>(null)

  function showTip(){
    const el = gaugeRef.current
    if(!el) return setTooltipVisible(true)
    const rect = el.getBoundingClientRect()
    const parentRect = (el.parentElement || document.body).getBoundingClientRect()
    setTooltipPos({x: Math.round(rect.left - parentRect.left + rect.width/2), y: Math.round(rect.top - parentRect.top - 8)})
    setTooltipVisible(true)
  }

  return (
    <div className={styles.card} style={index!=null?{animationDelay:`${index*40}ms`}:{}}>
      <div className={styles.headerRow}>
        <div className={styles.title}>{item.code}</div>
        <div className={styles.subtitle}>{item.title}</div>
      </div>

      <div className={styles.bodyRow}>
        <div className={styles.donutCol}>
          <div ref={gaugeRef}
            tabIndex={0}
            onFocus={showTip}
            onBlur={()=>setTooltipVisible(false)}
            onMouseEnter={showTip}
            onMouseLeave={()=>setTooltipVisible(false)}
            aria-describedby={`tip-${item.id}`}>
            <Gauge value={item.value} target={item.target} />
          </div>
          {tooltipVisible && (
            <div id={`tip-${item.id}`} role="status" aria-live="polite" className={styles.cardTooltip} style={{left:tooltipPos.x, top:tooltipPos.y}}>
              <strong>{item.code}</strong>
              <div>{item.value}{item.unit ?? '%' } — Objetivo: {item.target}{item.unit ?? '%'}</div>
            </div>
          )}
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
