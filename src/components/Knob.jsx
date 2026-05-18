import { useRef } from 'react'

const SVG_SIZE = 48
const CX = 24
const CY = 24
const ARC_R  = 17.5
const KNOB_R = 14
const DRAG_PX = 200

// Track runs CW from bottom-left (7:30) to bottom-right (4:30)
const TRACK_START = 135  // SVG degrees (0=right, CW)
const TRACK_END   = 45

function svgXY(r, deg) {
  const rad = (deg * Math.PI) / 180
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)]
}

function valueToSvgDeg(value, min, max) {
  const fromTop = -135 + ((value - min) / (max - min)) * 270
  return ((fromTop + 270) % 360 + 360) % 360
}

function arcPath(r, aDeg, bDeg) {
  const span = ((bDeg - aDeg) + 360) % 360
  if (span < 0.5) return ''
  const [sx, sy] = svgXY(r, aDeg)
  const [ex, ey] = svgXY(r, bDeg)
  const large = span > 180 ? 1 : 0
  return `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`
}

export default function Knob({ value, min = 0, max = 100, label, onChange, size = SVG_SIZE, showPointer = true }) {
  const drag = useRef(null)

  const deg   = valueToSvgDeg(value, min, max)
  const fillD = arcPath(ARC_R, TRACK_START, deg)
  const trackD = arcPath(ARC_R, TRACK_START, TRACK_END)
  // Indicator: short line from near-centre to near-edge (clock-hand style)
  const [i1x, i1y] = svgXY(3.5, deg)
  const [i2x, i2y] = svgXY(KNOB_R - 1.5, deg)

  function onPointerDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { y0: e.clientY, v0: value }
  }
  function onPointerMove(e) {
    if (!drag.current) return
    const delta = drag.current.y0 - e.clientY
    const next = drag.current.v0 + (delta * (max - min)) / DRAG_PX
    onChange(Math.min(max, Math.max(min, next)))
  }
  function onPointerUp() { drag.current = null }

  return (
    <div className="flex flex-col items-center gap-[3px] select-none">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className="cursor-ns-resize touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Outer skirt ring */}
        <circle cx={CX} cy={CY} r={22} fill="#1c1c1c" />
        {/* Tick marks at 0%, 25%, 50%, 75%, 100% of arc */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const tickDeg = TRACK_START + t * 270
          const [ox, oy] = svgXY(20.5, tickDeg)
          const [ix, iy] = svgXY(18.5, tickDeg)
          return (
            <line key={t} x1={ox.toFixed(2)} y1={oy.toFixed(2)} x2={ix.toFixed(2)} y2={iy.toFixed(2)}
              stroke="#3a3a3a" strokeWidth="1" strokeLinecap="round" />
          )
        })}
        {/* Arc track */}
        <path d={trackD} fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
        {/* Arc value fill */}
        {fillD && (
          <path d={fillD} fill="none" stroke="#c07018" strokeWidth="2.5" strokeLinecap="round" />
        )}
        {/* Knob body — outer ring for depth */}
        <circle cx={CX} cy={CY} r={KNOB_R + 1} fill="#1e1e1e" />
        {/* Knob face */}
        <circle cx={CX} cy={CY} r={KNOB_R} fill="#2e2e2e" />
        {/* Subtle top-left highlight simulating convex surface */}
        <circle cx={CX - 3} cy={CY - 3} r={6} fill="#383838" opacity="0.5" />
        {/* Indicator line */}
        {showPointer && (
          <line
            x1={i1x.toFixed(2)} y1={i1y.toFixed(2)}
            x2={i2x.toFixed(2)} y2={i2y.toFixed(2)}
            stroke="#d8d8d8" strokeWidth="2" strokeLinecap="round"
          />
        )}
        {/* Centre pip */}
        <circle cx={CX} cy={CY} r={1.5} fill="#1a1a1a" />
      </svg>

      {label && (
        <span className="text-[8px] font-mono tracking-[0.12em] text-[#5a5a5a] uppercase">
          {label}
        </span>
      )}
    </div>
  )
}
