import { useState, useEffect, useRef } from 'react'
import { getSourceLevel } from '../audio/audioEngine'

function LevelLed({ sourceKey, isActive, mute }) {
  const [level, setLevel] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!isActive || !sourceKey) {
      cancelAnimationFrame(rafRef.current)
      setLevel(0)
      return
    }
    function tick() {
      setLevel(getSourceLevel(sourceKey))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isActive, sourceKey])

  const lit = isActive && level > 0.05
  return (
    <span style={{
      position: 'absolute', top: 0, left: 0,
      width: 'calc(33%)', height: 12, borderRadius: '0 0 4px 0',
      background: lit ? '#22c55e' : '#0c0c0c',
      boxShadow: lit ? '0 0 5px #22c55e80' : 'none',
      transition: 'background 60ms, box-shadow 60ms',
    }} />
  )
}

export default function ChannelStrip({ channel, state, isActive, sourceKey, onSelect }) {
  const { id, label } = channel
  const { mute, solo, selected } = state

  const borderColor = selected ? '#7a4a0a'
    : solo   ? '#4a4000'
    : mute   ? '#3a0a0a'
    : '#1c1c1c'

  const boxShadow = selected
    ? '0 0 8px rgba(192,112,24,0.18), inset 0 0 6px rgba(192,112,24,0.04)'
    : solo
    ? '0 0 4px rgba(180,160,0,0.1)'
    : mute
    ? '0 0 4px rgba(160,0,0,0.1)'
    : 'none'

  const backgroundColor = solo ? '#8775008c' : mute ? '#8c191980' : '#111'


  return (
    <div
      className="flex flex-col items-center gap-[5px] pt-[7px] pb-[6px] px-[4px] transition-all duration-150"
      style={{
        width: 58,
        background: '#111',
        border: `2px solid ${borderColor}`,
        borderRadius: 3,
        boxShadow,
      }}
    >
      {/* Channel number above button */}
      <span style={{ color: '#aaa', fontSize: 9, fontFamily: 'monospace', userSelect: 'none' }}>
        {id}
      </span>

      {/* Hardware-style channel SELECT button */}
      <button
        type="button"
        onClick={onSelect}
        className="relative flex items-center justify-center transition-all duration-100 active:scale-[0.97] select-none"
        style={{
          width: '100%', height: 30,
          borderRadius: 3, overflow: 'hidden',
          background: selected ? '#0a1c0a' : '#141414',
          border: `1px solid ${selected ? '#163016' : '#202020'}`,
          boxShadow: selected
            ? '0 0 6px rgba(34,197,94,0.12), inset 0 1px 0 rgba(255,255,255,0.04)'
            : 'inset 0 1px 0 rgba(255,255,255,0.025)',
        }}
      >
        {/* Top-left LED — audio activity indicator */}
        <LevelLed sourceKey={sourceKey} isActive={isActive} mute={mute} />

        {/* Top-right LED — mute indicator */}
        <span style={{
          position: 'absolute', top: 0, right: 0,
          width: 'calc(33%)', height: 12, borderRadius: '0 0 0 4px',
          background: mute ? '#ef4444' : '#0c0c0c',
          boxShadow: mute ? '0 0 5px #ef4444' : 'none',
        }} />
      </button>

      {/* Instrument label */}
      <span
        className="text-center uppercase select-none"
        style={{
          color: '#a2a2a2', fontSize: 9,
          fontFamily: 'monospace', letterSpacing: '0.04em',
          lineHeight: '1.2', maxWidth: 50,
          wordBreak: 'break-word', hyphens: 'auto'
        }}
      >
        {label}
      </span>
    </div>
  )
}
