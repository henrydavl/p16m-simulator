import { useEffect, useRef, useState } from 'react'
import Knob from './Knob'
import SongSelector from './SongSelector'
import KofiButton from './KofiButton'
import { getSourceLevel } from '../audio/audioEngine'
import logoText from '../assets/logo-text-only.png'

// Zone highlight — maps classic zone keys onto HQ layout sections
function hqZoneHL(section, activeZone) {
  const zones = Array.isArray(activeZone) ? activeZone : activeZone ? [activeZone] : []
  const shouldHighlight = {
    center:   zones.some(z => z === 'eq' || z === 'pan'),
    col3:     zones.includes('col3'),
    channels: zones.includes('channels'),
  }[section] ?? false

  const base = {
    transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease',
    borderRadius: 6,
    position: 'relative',
    transformOrigin: 'center center',
  }
  if (!shouldHighlight) return base
  const scaleVal = section === 'channels' ? 1.05 : 1.13
  return {
    ...base,
    transform: `scale(${scaleVal})`,
    zIndex: 10,
    boxShadow: '0 0 0 3px rgba(192,112,24,0.9), 0 0 0 5px rgba(192,112,24,0.2), 0 8px 32px rgba(192,112,24,0.35)',
  }
}

export default function MixerBoardHQ({
  state,
  d,
  highlightZone,
  songs,
  currentSongId,
  isFetchingManifest,
  isLoadingSong,
  loadProgress,
  onSongChange,
  onPlay,
  onStop,
  activeChannelIds,
  songError,
  scale,
  isPortrait,
  mixerRef,
  selectedCh,
  displayPan,
  displayEq,
  activeVolume,
  handleVolumeChange,
  isActive,
}) {
  const hasSelection = !!(selectedCh || state.master.selected)

  const eqChange = (field) => (v) => {
    const val = Math.round(v)
    if (selectedCh) d({ type: 'UPDATE_SELECTED_EQ', updates: { [field]: val } })
    else if (state.master.selected) d({ type: 'UPDATE_MASTER', updates: { [field]: val } })
  }

  return (
    <div
      style={{
        background: 'var(--bg-page)', minHeight: '100dvh', gap: 14, padding: '12px 8px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Portrait blocker */}
      {isPortrait && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'var(--bg-page)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 16,
        }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="14" y="4" width="20" height="32" rx="3" stroke="#555" strokeWidth="2" />
            <path d="M24 42 L30 36 L18 36 Z" fill="#555" />
          </svg>
          <span style={{ color: '#555', fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.2em' }}>
            ROTATE DEVICE
          </span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Song selector row */}
        <div style={{ width: '100%' }}>
          <SongSelector
            songs={songs}
            currentSongId={currentSongId}
            onSongChange={onSongChange}
            isLoading={isFetchingManifest}
          />
          {songError && (
            <div style={{ color: '#ef4444', fontSize: 8, fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 4 }}>
              ⚠ {songError}
            </div>
          )}
        </div>

        {/* ── HQ Device shell ──────────────────────────────────────────── */}
        <div
          ref={mixerRef}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            borderRadius: 14,
            overflow: 'visible',
            background: 'linear-gradient(160deg, #363636 0%, #262626 100%)',
            border: '2px solid #4a4a4a',
            boxShadow: '0 24px 64px rgba(0,0,0,0.85), 0 4px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {/* ── Header bar ─────────────────────────────────────────────── */}
          <div style={{
            background: 'linear-gradient(180deg, #6a6a6a 0%, #5a5a5a 100%)',
            borderBottom: '2px solid #111',
            borderRadius: '12px 12px 0 0',
            padding: '8px 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ color: '#1a1a1a', fontSize: 16, fontWeight: 800, letterSpacing: '0.06em', fontFamily: 'sans-serif' }}>
                P16-HQ
              </span>
              <div style={{ width: 1, height: 12, background: '#888', alignSelf: 'center' }} />
              <span style={{ color: '#444', fontSize: 10, letterSpacing: '0.25em', fontFamily: 'sans-serif', fontWeight: 600, textTransform: 'uppercase' }}>
                Powerplay
              </span>
            </div>
            <img src={logoText} alt="behringer" style={{ height: 18, mixBlendMode: 'multiply' }} />
          </div>

          {/* ── Main panel ─────────────────────────────────────────────── */}
          <div style={{ background: '#1c1c1c', padding: '14px 18px 10px' }}>

            {/* ═══ UPPER SECTION ══════════════════════════════════════════ */}
            <div style={{ display: 'flex', gap: 18, marginBottom: 14, alignItems: 'flex-start' }}>

              {/* ── LEFT BLOCK ───────────────────────────────────────── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 186, flexShrink: 0 }}>

                {/* MIX PRESET + CHANNELS — non-functional visual */}
                <div style={{ opacity: 0.2, pointerEvents: 'none', display: 'flex', gap: 6 }}>
                  <div style={{ flex: 1 }}>
                    <HQSectionLabel label="MIX PRESET" />
                    <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                      <HQBtn label="RECALL" />
                      <HQBtn label="STORE" />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <HQSectionLabel label="CHANNELS" />
                    <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                      <HQBtn label="LINK" />
                      <HQBtn label="GROUP" />
                    </div>
                  </div>
                </div>

                {/* SELECT section — two equal columns: [MAIN ULTRANET] | [SELECT SOLO MUTE] */}
                <div style={{ display: 'flex', gap: 8 }}>

                  {/* Left col — headphone icon + MAIN btn + ULTRANET indicator */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {/* Headphone icon row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <svg width="13" height="11" viewBox="0 0 24 20" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M3 14v-4a9 9 0 0 1 18 0v4" />
                        <rect x="1" y="11" width="4" height="6" rx="2" fill="#333" stroke="none" />
                        <rect x="19" y="11" width="4" height="6" rx="2" fill="#333" stroke="none" />
                      </svg>
                      <div style={{ flex: 1, height: 1, background: '#2a2a2a' }} />
                    </div>
                    {/* MAIN btn + ULTRANET indicator side by side */}
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <HQBtn
                        label="MAIN"
                        active={state.master.selected}
                        color={state.master.mute ? 'red' : 'neutral'}
                        onClick={() => d({ type: 'SELECT_MAIN' })}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#15532e', boxShadow: '0 0 5px #16a34a' }} />
                        <span style={{ color: '#2a5a2a', fontSize: 6, fontFamily: 'monospace', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>ULTRANET</span>
                      </div>
                    </div>
                  </div>

                  {/* Right col — SELECT label + SOLO + MUTE */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <HQSectionLabel label="SELECT" />
                    <div style={{ display: 'flex', gap: 5 }}>
                      <HQBtn
                        label="SOLO" active={selectedCh?.solo ?? false} color="yellow"
                        onClick={() => d({ type: 'TOGGLE_SELECTED_SOLO' })}
                      />
                      <HQBtn
                        label="MUTE" active={selectedCh?.mute ?? false} color="red"
                        onClick={() => d({ type: 'TOGGLE_SELECTED_MUTE' })}
                      />
                    </div>
                  </div>
                </div>

                {/* Transport */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {activeChannelIds.size > 0 && !isLoadingSong ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: 22 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 4px #22c55e' }} />
                        <span style={{ color: '#2e4a2e', fontSize: 8, fontFamily: 'monospace', letterSpacing: '0.12em' }}>PLAYING</span>
                      </div>
                      <button
                        type="button" onClick={onStop}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          height: 22, paddingInline: 10, borderRadius: 3,
                          background: '#1c0000', border: '1px solid #3a0000',
                          color: '#ef4444', fontSize: 9, fontFamily: 'monospace',
                          letterSpacing: '0.12em', cursor: 'pointer',
                        }}
                      >
                        ■ STOP
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!currentSongId || isLoadingSong || isFetchingManifest}
                      onClick={onPlay}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        height: 22, paddingInline: 10, borderRadius: 3,
                        background: '#1c1200', border: '1px solid #3a2800',
                        color: (!currentSongId || isLoadingSong || isFetchingManifest) ? '#3a2800' : '#f59e0b',
                        fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.12em',
                        cursor: (!currentSongId || isLoadingSong || isFetchingManifest) ? 'default' : 'pointer',
                      }}
                    >
                      <span style={{
                        width: 5, height: 5, borderRadius: '50%',
                        background: isLoadingSong ? '#5a4000' : (!currentSongId || isFetchingManifest) ? '#3a2800' : '#f59e0b44',
                        boxShadow: isLoadingSong ? 'none' : (!currentSongId || isFetchingManifest) ? 'none' : '0 0 3px #f59e0b66',
                      }} />
                      {isLoadingSong
                        ? loadProgress.total > 0 ? `${loadProgress.done} / ${loadProgress.total}` : '· · ·'
                        : '▶ PLAY'}
                    </button>
                  )}
                </div>
              </div>

              {/* Vertical divider */}
              <div style={{ width: 2, background: '#606060', alignSelf: 'stretch', flexShrink: 0, borderRadius: 1 }} />

              {/* ── CENTER BLOCK — 6 shared knobs ──────────────────── */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, ...hqZoneHL('center', highlightZone) }}>

                {/* Top row: TREBLE, MID, PANORAMA — symmetric 3 knobs */}
                <div style={{
                  display: 'flex', justifyContent: 'space-evenly', alignItems: 'center',
                  opacity: hasSelection ? 1 : 0.35,
                  pointerEvents: hasSelection ? 'auto' : 'none',
                  transition: 'opacity 150ms',
                }}>
                  <HQKnob value={displayEq.treble} min={0} max={100} label="TREBLE" size={50} isBipolar onChange={eqChange('treble')} />
                  <HQKnob value={displayEq.mid}    min={0} max={100} label="MID"    size={50} isBipolar onChange={eqChange('mid')} />
                  <HQKnob
                    value={displayPan} min={-50} max={50} label="PANORAMA" size={50} isPan
                    onChange={(v) => {
                      const val = Math.round(v)
                      if (selectedCh) d({ type: 'UPDATE_SELECTED_PAN', pan: val })
                      else if (state.master.selected) d({ type: 'UPDATE_MASTER', updates: { pan: val } })
                    }}
                    onClick={() => {
                      if (selectedCh) d({ type: 'UPDATE_SELECTED_PAN', pan: 0 })
                      else if (state.master.selected) d({ type: 'UPDATE_MASTER', updates: { pan: 0 } })
                    }}
                  />
                </div>

                {/* Bottom row: BASS, FREQ, VOLUME — symmetric 3 knobs */}
                {/* BASS + FREQ dim when nothing selected; VOLUME always active */}
                <div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}>
                  <div style={{ opacity: hasSelection ? 1 : 0.35, pointerEvents: hasSelection ? 'auto' : 'none', transition: 'opacity 150ms' }}>
                    <HQKnob value={displayEq.bass} min={0} max={100} label="BASS" size={50} isBipolar onChange={eqChange('bass')} />
                  </div>
                  <div style={{ opacity: hasSelection ? 1 : 0.35, pointerEvents: hasSelection ? 'auto' : 'none', transition: 'opacity 150ms' }}>
                    <HQKnob value={displayEq.freq} min={0} max={100} label="FREQ" size={50} noRing onChange={eqChange('freq')} />
                  </div>
                  <HQKnob
                    value={activeVolume} min={0} max={100} label="VOLUME" size={50}
                    onChange={handleVolumeChange}
                    onClick={() => {
                      if (selectedCh) d({ type: 'UPDATE_CHANNEL', id: selectedCh.id, updates: { volume: 0 } })
                      else d({ type: 'UPDATE_MASTER', updates: { volume: 0 } })
                    }}
                  />
                </div>
              </div>

              {/* Vertical divider */}
              <div style={{ width: 2, background: '#606060', alignSelf: 'stretch', flexShrink: 0, borderRadius: 1 }} />

              {/* ── RIGHT BLOCK — OUTPUT + LIMITER ─────────────────── */}
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 6,
                width: 186, flexShrink: 0, alignItems: 'center',
                ...hqZoneHL('col3', highlightZone),
              }}>
                <HQSectionLabel label="OUTPUT" />
                <HQKnob
                  value={state.master.outputLevel} min={0} max={100} label="LEVEL" size={66} noRing
                  onChange={(v) => d({ type: 'UPDATE_MASTER', updates: { outputLevel: Math.round(v) } })}
                />
                <div style={{ color: '#2a2a2a', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.15em' }}>OR</div>
                <HQKnob
                  value={state.master.limiter} min={0} max={100} label="LIMITER" size={44} noRing
                  onChange={(v) => d({ type: 'UPDATE_MASTER', updates: { limiter: Math.round(v) } })}
                />
              </div>
            </div>

            {/* ═══ CHANNEL BUTTONS ROW ════════════════════════════════════ */}
            <div style={hqZoneHL('channels', highlightZone)}>
              <HQSectionLabel label="Channel Select" />
              <div style={{ display: 'flex', gap: 3, marginTop: 6, minWidth: 958 }}>
                {state.channels.map((ch) => (
                  <HQChannelBtn
                    key={ch.id}
                    ch={ch}
                    isActive={isActive(ch)}
                    sourceKey={ch.trackKey}
                    onSelect={() => d({ type: 'SELECT_CHANNEL', id: ch.id })}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Bottom strip — matches header height/color ──────────────── */}
          <div style={{
            background: 'linear-gradient(0deg, #6a6a6a 0%, #5a5a5a 100%)',
            borderTop: '2px solid #111',
            borderRadius: '0 0 12px 12px',
            height: 12,
          }} />
        </div>
      </div>

      {/* Watermark */}
      <div style={{ textAlign: 'center', userSelect: 'none', lineHeight: 1.8 }}>
        <div style={{ color: '#555', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.18em' }}>CREATED BY</div>
        {['HENRY DAVID LIE', 'KEVIN AWARD ARMELDO'].map((name) => (
          <div key={name} style={{ color: '#bbb', fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em' }}>{name}</div>
        ))}
        <KofiButton />
      </div>
    </div>
  )
}

// ─── Helper components ────────────────────────────────────────────────────────

function HQSectionLabel({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ flex: 1, height: 1, background: '#2e2e2e' }} />
      <span style={{ color: '#4a4a4a', fontSize: 8, fontFamily: 'monospace', letterSpacing: '0.22em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: '#2e2e2e' }} />
    </div>
  )
}

function HQBtn({ label, active = false, color = 'neutral', onClick }) {
  const C = {
    neutral: { led: '#4ade80', bg: '#22c55e', border: '#4ade80', text: '#000' },
    yellow:  { led: '#facc15', bg: '#7a5a00', border: '#ccaa00', text: '#fff0aa' },
    red:     { led: '#ff4444', bg: '#7a0000', border: '#cc0000', text: '#ffaaaa' },
    amber:   { led: '#f59e0b', bg: '#1c1200', border: '#3a2800', text: '#f59e0b' },
  }[color] ?? {}

  return (
    <button
      type="button" onClick={onClick}
      style={{
        flex: 1, height: 34, borderRadius: 3,
        background: active ? C.bg : '#d0d0d0',
        border: `1px solid ${active ? C.border : '#aaa'}`,
        color: active ? C.text : '#000',
        fontSize: 8, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
        boxShadow: active ? `0 0 8px ${C.led}25` : 'none',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
      }}
    >
      {label}
    </button>
  )
}

/**
 * HQ-style knob: Knob.jsx wrapped in a dot-ring SVG overlay.
 * noRing:    skip the dot ring — render plain Knob with pointer only.
 * isPan:     fills from center outward (green at 0, red otherwise).
 * isBipolar: fills from center outward, always green (EQ knobs — center = 0 dB).
 * Normal:    fills from index 0 upward with green→yellow→orange gradient.
 */
function HQKnob({ value, min = 0, max = 100, label, size = 50, onChange, onClick, isPan = false, isBipolar = false, noRing = false }) {
  if (noRing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, userSelect: 'none' }}>
        <Knob value={value} min={min} max={max} label="" size={size} showArc={false} onChange={onChange} onClick={onClick} />
        {label && (
          <span style={{ fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.12em', color: '#5a5a5a', textTransform: 'uppercase' }}>
            {label}
          </span>
        )}
      </div>
    )
  }

  const N = 11
  const TRACK_START = 135   // matching Knob.jsx
  const TRACK_SPAN  = 270   // matching Knob.jsx

  // Scale the dot ring just outside the knob's outer skirt (r=22 in viewBox=48)
  const skirtR     = 22 * (size / 48)
  const dotRingR   = skirtR + 5
  const wrapSize   = Math.ceil(2 * (dotRingR + 4))
  const cx         = wrapSize / 2
  const cy         = wrapSize / 2
  const DOT_R      = 2

  // Determine which dots are lit
  let litMin = 0, litMax = -1
  if (isPan || isBipolar) {
    const centerIdx = Math.floor(N / 2)                          // 5
    const ratio     = (value - min) / (max - min)               // 0–1, 0.5 = centre
    const curIdx    = Math.round(ratio * (N - 1))
    litMin = Math.min(centerIdx, curIdx)
    litMax = Math.max(centerIdx, curIdx)
  } else {
    const ratio = (value - min) / (max - min)
    litMax = Math.round(ratio * (N - 1))
    litMin = 0
  }

  const dotColor = (i, lit) => {
    if (!lit) return '#202020'
    if (isBipolar) return '#22c55e'
    if (isPan) {
      const isCenter = Math.abs(value - (min + max) / 2) < 0.5
      return isCenter ? '#22c55e' : '#ef4444'
    }
    const t = i / (N - 1)
    return t < 0.45 ? '#22c55e' : t < 0.72 ? '#facc15' : '#f97316'
  }

  const dots = Array.from({ length: N }, (_, i) => {
    const deg = TRACK_START + (TRACK_SPAN / (N - 1)) * i
    const rad = (deg * Math.PI) / 180
    return {
      x: cx + dotRingR * Math.cos(rad),
      y: cy + dotRingR * Math.sin(rad),
      lit: i >= litMin && i <= litMax,
      i,
    }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, userSelect: 'none' }}>
      <div style={{
        position: 'relative', width: wrapSize, height: wrapSize,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Dot ring — sits on top, pointer-events: none so knob drag still works */}
        <svg
          width={wrapSize} height={wrapSize}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        >
          {dots.map(({ x, y, lit, i: idx }) => {
            const col = dotColor(idx, lit)
            return (
              <circle
                key={idx}
                cx={x.toFixed(1)} cy={y.toFixed(1)} r={DOT_R}
                fill={col}
                style={{ filter: lit ? `drop-shadow(0 0 2px ${col})` : 'none' }}
              />
            )
          })}
        </svg>
        {/* Actual interactive knob — label="" so we render it ourselves below */}
        <Knob
          value={value} min={min} max={max} label="" size={size}
          showArc={false}
          showPointer={true}
          onChange={onChange}
          onClick={onClick}
        />
      </div>
      {label && (
        <span style={{ fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.12em', color: '#5a5a5a', textTransform: 'uppercase' }}>
          {label}
        </span>
      )}
    </div>
  )
}

/** Single-dot level indicator — polls getSourceLevel via RAF */
function HQLevelDot({ sourceKey, isActive }) {
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

  const col = level > 0.7 ? '#f97316' : level > 0.35 ? '#facc15' : '#22c55e'
  return (
    <div style={{
      width: 5, height: 5, borderRadius: '50%',
      background: isActive && level > 0.05 ? col : '#1a1a1a',
      boxShadow: isActive && level > 0.05 ? `0 0 4px ${col}` : 'none',
      transition: 'background 80ms, box-shadow 80ms',
      flexShrink: 0,
    }} />
  )
}

/** HQ channel select button — the button itself is the LED */
function HQChannelBtn({ ch, isActive, sourceKey, onSelect }) {
  const { selected, solo, mute } = ch
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

  // mute/solo override selected for bg+glow so state is visible immediately
  // border stays green when selected to show selection regardless of mute/solo
  const btnBg = mute    ? '#7a0000'
    : solo    ? '#7a5a00'
    : lit     ? '#22c55e'
    : '#d0d0d0'

  const btnBorder = selected ? '#22c55e'
    : solo  ? '#facc15'
    : mute  ? '#ef4444'
    : lit   ? '#1a3a1a'
    : '#1e1e1e'

  const btnGlow = mute   ? '0 0 6px #ef444455'
    : solo   ? '0 0 6px #facc1555'
    : selected ? '0 0 5px #22c55e33'
    : lit    ? '0 0 6px #22c55e66'
    : 'none'

  const labelCol = solo ? '#facc15' : mute ? '#ef4444' : selected ? '#4ade80' : '#a2a2a2'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <button
        type="button" onClick={onSelect}
        style={{
          width: '100%', height: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: btnBg,
          border: `1px solid ${btnBorder}`,
          borderRadius: 4,
          cursor: 'pointer',
          transition: 'background 60ms, border-color 60ms, box-shadow 60ms',
          boxShadow: btnGlow,
        }}
      >
        <span style={{ color: '#000', fontSize: 9, fontFamily: 'monospace', userSelect: 'none' }}>
          {ch.id}
        </span>
      </button>
      <span style={{
        color: labelCol, fontSize: 8, fontFamily: 'monospace',
        letterSpacing: '0.04em', textTransform: 'uppercase',
        textAlign: 'center', lineHeight: 1.2, userSelect: 'none',
      }}>
        {ch.label}
      </span>
    </div>
  )
}
