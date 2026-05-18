import LevelMeter from './LevelMeter'

export default function ChannelStrip({ channel, state, isActive, onSelect }) {
  const { id, label } = channel
  const { mute, solo, selected } = state
  const meterPhase = (id * 1.3) % (2 * Math.PI)

  // Border colour reflects priority: selected > soloed > muted > idle
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

  return (
    <div
      className="flex flex-col items-center gap-[5px] pt-[7px] pb-[6px] px-[4px] transition-all duration-150"
      style={{
        width: 58,
        background: '#111',
        border: `1px solid ${borderColor}`,
        borderRadius: 3,
        boxShadow,
      }}
    >
      {/* Level meter */}
      <LevelMeter active={isActive} phase={meterPhase} />

      {/* Hardware-style channel SELECT button */}
      <button
        type="button"
        onClick={onSelect}
        className="relative flex items-center justify-center transition-all duration-100 active:scale-[0.97] select-none"
        style={{
          width: '100%', height: 30,
          borderRadius: 3,
          background: selected ? '#0a1c0a' : '#141414',
          border: `1px solid ${selected ? '#163016' : '#202020'}`,
          boxShadow: selected
            ? '0 0 6px rgba(34,197,94,0.12), inset 0 1px 0 rgba(255,255,255,0.04)'
            : 'inset 0 1px 0 rgba(255,255,255,0.025)',
        }}
      >
        {/* LED inside button — top-left like hardware */}
        <span style={{
          position: 'absolute', top: 5, left: 5,
          width: 5, height: 5, borderRadius: '50%',
          background: selected ? '#22c55e' : '#0c0c0c',
          boxShadow: selected ? '0 0 5px #22c55e, 0 0 2px #22c55e' : 'none',
        }} />
        <span style={{ color: '#555', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
          {id}
        </span>
      </button>

      {/* Instrument label */}
      <span
        className="text-center uppercase select-none"
        style={{
          color: '#5a5a5a', fontSize: 8,
          fontFamily: 'monospace', letterSpacing: '0.04em',
          lineHeight: '1.2', maxWidth: 50,
          wordBreak: 'break-word', hyphens: 'auto',
        }}
      >
        {label}
      </span>
    </div>
  )
}
