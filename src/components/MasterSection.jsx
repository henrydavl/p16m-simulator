import Knob from './Knob'
import Button from './Button'

export default function MasterSection({ state, onUpdate, onSelect }) {
  const { volume, limiter, outputLevel, selected } = state

  return (
    <div
      className="flex flex-col items-center gap-[8px] px-[6px] pt-[8px] pb-[6px] w-[72px] rounded-[3px] transition-all duration-150"
      style={{
        background: '#141414',
        border: selected
          ? '1px solid #c07018'
          : '1px solid #343434',
        boxShadow: selected
          ? '0 0 12px rgba(192, 112, 24, 0.3), inset 0 0 8px rgba(192, 112, 24, 0.07)'
          : 'none',
      }}
    >
      {/* Section label */}
      <span className="text-[#484848] text-[7px] font-mono tracking-[0.25em] uppercase">
        MASTER
      </span>

      {/* MAIN button */}
      <Button label="MAIN" variant="main" active={selected} onClick={onSelect} />

      {/* Separator */}
      <div className="w-full h-px bg-[#2a2a2a]" />

      {/* ── OUTPUT ── label */}
      <SectionRule label="OUTPUT" />

      {/* Master volume */}
      <Knob
        value={volume}
        min={0}
        max={100}
        label="VOL"
        onChange={(v) => onUpdate({ volume: Math.round(v) })}
        size={46}
      />

      {/* Separator */}
      <div className="w-full h-px bg-[#222]" />

      {/* Limiter + Output level */}
      <Knob
        value={limiter}
        min={0}
        max={100}
        label="LIMIT"
        onChange={(v) => onUpdate({ limiter: Math.round(v) })}
        size={38}
      />

      <Knob
        value={outputLevel}
        min={0}
        max={100}
        label="LEVEL"
        onChange={(v) => onUpdate({ outputLevel: Math.round(v) })}
        size={38}
      />
    </div>
  )
}

function SectionRule({ label }) {
  return (
    <div className="flex items-center gap-[3px] w-full">
      <div className="h-px bg-[#2e2e2e] flex-1" />
      <span className="text-[#3e3e3e] text-[7px] font-mono tracking-[0.18em] uppercase whitespace-nowrap">
        {label}
      </span>
      <div className="h-px bg-[#2e2e2e] flex-1" />
    </div>
  )
}
