export type PeriodKey = 'Último mes' | 'Último trimestre' | 'Último año'

export interface HeatRow { area: string; values: number[] }
export interface Node { id: string; label: string; group?: string }
export interface Link { source: string; target: string; value?: number }

export interface Gco05Data {
  completeness: number
  accessTime: number
  usage: Record<string, number>
  heatmap: HeatRow[]
  trend: number[]
  network: { nodes: Node[]; links: Link[] }
}

const base: Record<PeriodKey, Gco05Data> = {
  'Último mes': {
    completeness: 82,
    accessTime: 4.2,
    usage: { DeepWiki: 420, Repos: 310 },
    heatmap: [
      { area: 'Vivienda', values: [20,40,60,80,100] },
      { area: 'Territorio', values: [10,30,50,80,90] },
      { area: 'Movilidad', values: [30,50,70,85,95] }
    ],
    trend: [65,68,70,72,74,76,78,80,81,82],
    network: {
      nodes: [ { id: 'n1', label: 'DeepWiki' }, { id: 'n2', label: 'Repos' }, { id: 'n3', label: 'Foro' } ],
      links: [ { source: 'n1', target: 'n2', value: 8 }, { source: 'n2', target: 'n3', value: 4 }, { source: 'n1', target: 'n3', value: 6 } ]
    }
  },
  'Último trimestre': {
    completeness: 78,
    accessTime: 5.0,
    usage: { DeepWiki: 1200, Repos: 900 },
    heatmap: [
      { area: 'Vivienda', values: [10,20,30,50,70] },
      { area: 'Territorio', values: [5,25,40,60,70] },
      { area: 'Movilidad', values: [20,40,60,75,82] }
    ],
    trend: [60,62,64,66,68,70,72,75,76,78],
    network: {
      nodes: [ { id: 'n1', label: 'DeepWiki' }, { id: 'n2', label: 'Repos' }, { id: 'n3', label: 'Foro' }, { id: 'n4', label: 'Chat' } ],
      links: [ { source: 'n1', target: 'n2', value: 12 }, { source: 'n2', target: 'n3', value: 6 }, { source: 'n3', target: 'n4', value: 3 } ]
    }
  },
  'Último año': {
    completeness: 74,
    accessTime: 6.1,
    usage: { DeepWiki: 4100, Repos: 3100 },
    heatmap: [
      { area: 'Vivienda', values: [5,10,20,40,60] },
      { area: 'Territorio', values: [2,15,30,50,60] },
      { area: 'Movilidad', values: [10,30,50,70,78] }
    ],
    trend: [50,52,54,56,58,60,64,68,72,74],
    network: {
      nodes: [ { id: 'n1', label: 'DeepWiki' }, { id: 'n2', label: 'Repos' }, { id: 'n3', label: 'Foro' }, { id: 'n4', label: 'Chat' }, { id: 'n5', label: 'WikiBot' } ],
      links: [ { source: 'n1', target: 'n2', value: 22 }, { source: 'n2', target: 'n3', value: 18 }, { source: 'n3', target: 'n4', value: 9 }, { source: 'n1', target: 'n5', value: 7 } ]
    }
  }
}

export default function getGco05Data(period: PeriodKey){
  return base[period]
}
