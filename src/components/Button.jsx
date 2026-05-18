// LED colours per variant
const LED = {
  select: { off: '#1a1a1a', on: '#22c55e', glow: '0 0 5px #22c55e' },
  solo:   { off: '#1a1a1a', on: '#facc15', glow: '0 0 5px #facc15' },
  mute:   { off: '#1a1a1a', on: '#ef4444', glow: '0 0 5px #ef4444' },
  main:   { off: '#1a1a1a', on: '#f59e0b', glow: '0 0 5px #f59e0b' },
}

const FACE = {
  select: { off: 'bg-[#1e1e1e] text-[#555] border-[#2e2e2e]', on: 'bg-[#222] text-[#aaa] border-[#3a3a3a]' },
  solo:   { off: 'bg-[#1e1e1e] text-[#555] border-[#2e2e2e]', on: 'bg-[#2a2600] text-[#facc15] border-[#4a4200]' },
  mute:   { off: 'bg-[#1e1e1e] text-[#555] border-[#2e2e2e]', on: 'bg-[#280000] text-[#ef4444] border-[#440000]' },
  main:   { off: 'bg-[#1e1e1e] text-[#555] border-[#2e2e2e]', on: 'bg-[#281800] text-[#f59e0b] border-[#443000]' },
}

export default function Button({ label, active = false, variant = 'select', onClick }) {
  const led  = LED[variant]  ?? LED.select
  const face = FACE[variant] ?? FACE.select

  return (
    <div className="flex flex-col items-center gap-[3px]">
      {/* LED indicator dot */}
      <div
        className="w-[6px] h-[6px] rounded-full transition-all duration-150"
        style={{
          backgroundColor: active ? led.on : led.off,
          boxShadow: active ? led.glow : 'none',
        }}
      />
      {/* Button face */}
      <button
        type="button"
        onClick={onClick}
        className={`
          w-full py-[3px] px-[2px] rounded-[2px] border
          text-[8px] font-mono tracking-[0.12em] uppercase
          transition-all duration-100 active:scale-95
          ${active ? face.on : face.off}
        `}
      >
        {label}
      </button>
    </div>
  )
}
