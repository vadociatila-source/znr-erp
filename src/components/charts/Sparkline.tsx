// Sparkline — mini trend linija s area fill
interface SparklineProps {
  data: number[]
  color?: string
  height?: number
}

export function Sparkline({ data, color = 'var(--mg-500)', height = 32 }: SparklineProps) {
  if (data.length < 2) return null

  const WIDTH = 80
  const HEIGHT = height
  const PADDING = 2

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((v, i) => {
    const x = PADDING + (i / (data.length - 1)) * (WIDTH - PADDING * 2)
    const y = PADDING + (1 - (v - min) / range) * (HEIGHT - PADDING * 2)
    return `${x},${y}`
  })

  const polyline = points.join(' ')
  const firstPt = points[0].split(',')
  const lastPt = points[points.length - 1].split(',')
  const areaPath = `M ${firstPt[0]},${HEIGHT} L ${polyline} L ${lastPt[0]},${HEIGHT} Z`

  return (
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="overflow-visible">
      <path d={areaPath} fill={color} fillOpacity={0.08} />
      <polyline points={polyline} fill="none" stroke={color}
                strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastPt[0]} cy={lastPt[1]} r={2.5} fill={color} />
    </svg>
  )
}
