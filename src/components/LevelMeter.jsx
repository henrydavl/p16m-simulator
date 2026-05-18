import { useState, useEffect, useRef } from 'react'
import { getSourceLevel } from '../audio/audioEngine'

const SEGMENTS = 8
const LIT   = ['#15803d','#16a34a','#22c55e','#4ade80','#facc15','#fbbf24','#f97316','#ef4444']
const UNLIT = '#1a1a1a'

export default function LevelMeter({ active, phase = 0, sourceKey }) {
  const [litCount, setLitCount] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(rafRef.current)
      setLitCount(0)
      return
    }

    if (sourceKey) {
      // Real audio level — both channels in a stereo pair share the same sourceKey
      // so they read the same analyser and always move together
      function tick() {
        const level = getSourceLevel(sourceKey)
        setLitCount(Math.round(level * SEGMENTS))
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    } else {
      // Fake sine for channels without audio (shouldn't reach here since active
      // is gated on AUDIO_CHANNEL_IDS, but kept as a fallback)
      function tick(ts) {
        const t = ts / 1000
        const raw =
          Math.sin(t * 2.3 + phase)              * 0.45 +
          Math.sin(t * 5.7 + phase * 1.3 + 1.2) * 0.30 +
          Math.sin(t * 1.1 + phase * 0.7 + 2.5) * 0.25
        setLitCount(Math.round(((raw + 1) / 2) * SEGMENTS))
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    return () => cancelAnimationFrame(rafRef.current)
  }, [active, phase, sourceKey])

  return (
    <div className="flex flex-col-reverse gap-[2px] w-[10px] mx-auto">
      {Array.from({ length: SEGMENTS }, (_, i) => (
        <div
          key={i}
          className="h-[5px] rounded-[1px] transition-colors duration-75"
          style={{ backgroundColor: i < litCount ? LIT[i] : UNLIT }}
        />
      ))}
    </div>
  )
}
