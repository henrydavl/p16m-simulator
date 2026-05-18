import { useReducer, useState, useEffect, useRef } from 'react'
import logo from '../assets/logo-with-icon.png'
import { CHANNELS, INITIAL_CHANNEL_STATE, INITIAL_MASTER_STATE } from '../data/channels'
import {
  initAudio, stopAudio, setChannelVolume, setChannelActive, setChannelPan, setChannelEQ,
  setMasterVolume, setMasterEQ, setMasterPan, setLimiterThreshold, setOutputLevel,
  AUDIO_CHANNEL_IDS,
  CHANNEL_SOURCE_MAP,
} from '../audio/audioEngine'
import Knob from './Knob'
import ChannelStrip from './ChannelStrip'

// ─── State ───────────────────────────────────────────────────────────────────

const initialState = {
  channels: CHANNELS.map((ch) => ({
    ...ch,
    ...INITIAL_CHANNEL_STATE,
    // Stereo L channels (odd ids 1,3,5) default hard-left; R channels (even 2,4,6) hard-right.
    // Without this, both sides of the split sit at centre and collapse to mono.
    pan: ch.type === 'stereo' ? (ch.id % 2 === 1 ? -50 : 50) : 0,
  })),
  master: { ...INITIAL_MASTER_STATE },
}

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_CHANNEL': {
      const target = state.channels.find((ch) => ch.id === action.id)
      const partnerId = target?.type === 'stereo'
        ? action.id % 2 === 0 ? action.id - 1 : action.id + 1
        : null
      return {
        ...state,
        channels: state.channels.map((ch) =>
          ch.id === action.id || ch.id === partnerId
            ? { ...ch, ...action.updates }
            : ch
        ),
      }
    }
    case 'SELECT_CHANNEL': {
      const clicked = state.channels.find((ch) => ch.id === action.id)
      const partnerId = clicked?.type === 'stereo'
        ? action.id % 2 === 0 ? action.id - 1 : action.id + 1
        : null
      const inPair = (id) => id === action.id || id === partnerId
      const next = !clicked?.selected
      return {
        ...state,
        channels: state.channels.map((ch) => ({
          ...ch,
          selected: inPair(ch.id) ? next : false,
        })),
        master: { ...state.master, selected: false },
      }
    }
    case 'UPDATE_SELECTED_PAN': {
      const selectedPair = state.channels.filter(ch => ch.selected)
      const isStereoPair = selectedPair.length === 2 && selectedPair.every(ch => ch.type === 'stereo')
      if (isStereoPair) {
        // action.pan = balance (-50..+50); 0 = natural stereo (L hard-left, R hard-right)
        const B = action.pan
        return {
          ...state,
          channels: state.channels.map(ch => {
            if (!ch.selected) return ch
            const base = ch.id % 2 === 1 ? -50 : 50  // L base=-50, R base=+50
            return { ...ch, pan: Math.max(Math.min(base + B, 50), -50) }
          }),
        }
      }
      return {
        ...state,
        channels: state.channels.map((ch) =>
          ch.selected ? { ...ch, pan: action.pan } : ch
        ),
      }
    }
    case 'UPDATE_SELECTED_EQ':
      return {
        ...state,
        channels: state.channels.map((ch) =>
          ch.selected ? { ...ch, ...action.updates } : ch
        ),
      }
    case 'UPDATE_MASTER':
      return { ...state, master: { ...state.master, ...action.updates } }
    case 'SELECT_MAIN':
      return {
        ...state,
        channels: state.channels.map((ch) => ({ ...ch, selected: false })),
        master: { ...state.master, selected: !state.master.selected },
      }
    // Toggle solo/mute on all currently selected channels (handles stereo pairs)
    case 'TOGGLE_SELECTED_SOLO': {
      const ref = state.channels.find((ch) => ch.selected)
      if (!ref) return state
      const next = !ref.solo
      return { ...state, channels: state.channels.map((ch) => ch.selected ? { ...ch, solo: next } : ch) }
    }
    case 'TOGGLE_SELECTED_MUTE': {
      const ref = state.channels.find((ch) => ch.selected)
      if (!ref) return state
      const next = !ref.mute
      return { ...state, channels: state.channels.map((ch) => ch.selected ? { ...ch, mute: next } : ch) }
    }
    default:
      return state
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MixerBoard() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [audioStatus, setAudioStatus] = useState('idle') // 'idle' | 'loading' | 'playing'
  const [loadProgress, setLoadProgress] = useState({ done: 0, total: 0 })
  const [scale, setScale] = useState(1)
  const [isPortrait, setIsPortrait] = useState(false)
  const mixerRef = useRef(null)

  useEffect(() => {
    function update() {
      setIsPortrait(window.matchMedia('(orientation: portrait)').matches)
      const el = mixerRef.current
      if (!el) return
      const s = Math.min(
        (window.innerWidth - 24) / el.offsetWidth,
        (window.innerHeight - 24) / el.offsetHeight,
        1
      )
      // Floor at 0.65 — below this the controls become too small to use;
      // the outer container scrolls for anything that overflows.
      setScale(Math.max(s, 0.65))
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', () => setTimeout(update, 120))
    return () => window.removeEventListener('resize', update)
  }, [])

  const anySolo = state.channels.some((ch) => ch.solo)
  const anyMute = state.channels.some((ch) => ch.mute)
  const isActive = (ch) => audioStatus === 'playing' && AUDIO_CHANNEL_IDS.has(ch.id) && !ch.mute && (!anySolo || ch.solo)

  const selectedCh = state.channels.find((ch) => ch.selected)
  const selectedPair = state.channels.filter((ch) => ch.selected)
  const isStereoPairSelected = selectedPair.length === 2 && selectedPair.every(ch => ch.type === 'stereo')

  // For a stereo pair, display the BAL value (0 = natural L/R stereo).
  // Derive it from whichever channel moved away from its default (L base=-50, R base=+50).
  const displayPan = isStereoPairSelected
    ? (() => {
        const L = selectedPair.find(ch => ch.id % 2 === 1)
        const R = selectedPair.find(ch => ch.id % 2 === 0)
        return L.pan !== -50 ? L.pan + 50 : R.pan - 50
      })()
    : selectedCh
      ? selectedCh.pan
      : state.master.selected ? state.master.pan : 0
  // Volume knob: follows selected channel; falls back to master when MAIN selected or nothing selected
  const activeVolume = selectedCh ? selectedCh.volume : state.master.volume
  function handleVolumeChange(v) {
    const val = Math.round(v)
    if (selectedCh) {
      d({ type: 'UPDATE_CHANNEL', id: selectedCh.id, updates: { volume: val } })
    } else {
      d({ type: 'UPDATE_MASTER', updates: { volume: val } })
    }
  }
  const eqSource = selectedCh ?? (state.master.selected ? state.master : null)
  const displayEq = {
    bass:   eqSource?.bass   ?? 50,
    mid:    eqSource?.mid    ?? 50,
    freq:   eqSource?.freq   ?? 50,
    treble: eqSource?.treble ?? 50,
  }

  const d = (action) => dispatch(action)

  async function handleStartAudio() {
    setAudioStatus('loading')
    setLoadProgress({ done: 0, total: 0 })
    try {
      await initAudio((done, total) => setLoadProgress({ done, total }))
      setAudioStatus('playing')
    } catch (err) {
      console.error('Audio init failed:', err)
      setAudioStatus('idle')
    }
  }

  useEffect(() => {
    if (audioStatus !== 'playing') return
    const solo = state.channels.some(ch => ch.solo)
    state.channels.forEach(ch => {
      setChannelVolume(ch.id, ch.volume)
      setChannelPan(ch.id, ch.pan)
      setChannelActive(ch.id, !ch.mute && (!solo || ch.solo))
      setChannelEQ(ch.id, { bass: ch.bass, mid: ch.mid, freq: ch.freq, treble: ch.treble })
    })
    setMasterVolume(state.master.volume)
    setMasterEQ({ bass: state.master.bass, mid: state.master.mid, freq: state.master.freq, treble: state.master.treble })
    setMasterPan(state.master.pan)
    setLimiterThreshold(state.master.limiter)
    setOutputLevel(state.master.outputLevel)
  }, [state, audioStatus])

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

      {/* ── Device shell ───────────────────────────────────────────────── */}
      <div
        ref={mixerRef}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          borderRadius: 10,
          overflow: 'hidden',
          border: '1px solid #2a2a2a',
          boxShadow: '0 24px 64px rgba(0,0,0,0.85), 0 4px 12px rgba(0,0,0,0.6)',
        }}
      >
        {/* ── Silver top bar ─────────────────────────────────────────── */}
        <div
          style={{
            background: 'linear-gradient(180deg, #c8c8c8 0%, #bcbcbc 50%, #b4b4b4 100%)',
            borderBottom: '2px solid #888',
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <img
            src={logo}
            alt="behringer"
            style={{ height: 40, mixBlendMode: 'multiply' }}
          />
          <div style={{ textAlign: 'right', lineHeight: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ color: '#111', fontSize: 18, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
                POWERPLAY
              </span>
              <span style={{ color: '#111', fontSize: 34, fontWeight: 100, fontFamily: 'sans-serif', lineHeight: 1 }}>
                16
              </span>
            </div>
            <div style={{ color: '#444', fontSize: 7.5, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'sans-serif', marginTop: 3, fontWeight: 600 }}>
              16-Channel Digital Personal Mixer&nbsp;&nbsp;P16-M
            </div>
          </div>
        </div>

        {/* ── Black main panel ───────────────────────────────────────── */}
        <div style={{ background: '#0f0f0f', padding: '18px 20px 14px' }}>

          {/* ═══ TOP CONTROL SECTION — 3 columns ═══════════════════════ */}
          <div style={{ display: 'flex', gap: 0, paddingBottom: 16, borderBottom: '1px solid #1a1a1a', marginBottom: 14 }}>

            {/* COL 1 — SETUP (visual) + MAIN/SOLO/MUTE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingRight: 20, minWidth: 196 }}>

              {/* SETUP — visual placeholder only */}
              <div style={{ opacity: 0.2, pointerEvents: 'none' }}>
                <SectionLabel label="SETUP" />
                <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
                  {['LINK', 'GROUP', 'RECALL', 'STORE'].map((l) => (
                    <HwTopBtn key={l} label={l} />
                  ))}
                </div>
              </div>

              {/* MAIN / SOLO / MUTE */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div>
                  <div style={{ color: '#383838', fontSize: 7, fontFamily: 'monospace', textAlign: 'center', letterSpacing: '0.15em', marginBottom: 4 }}>MAIN</div>
                  <HwTopBtn label="MAIN" active={state.master.selected} color="amber"
                            onClick={() => d({ type: 'SELECT_MAIN' })} />
                </div>
                <div>
                  <div style={{ color: '#383838', fontSize: 7, fontFamily: 'monospace', textAlign: 'center', letterSpacing: '0.15em', marginBottom: 4 }}>SOLO</div>
                  <HwTopBtn label="SOLO" active={selectedCh?.solo ?? false} color="yellow"
                            onClick={() => d({ type: 'TOGGLE_SELECTED_SOLO' })} />
                </div>
                <div>
                  <div style={{ color: '#383838', fontSize: 7, fontFamily: 'monospace', textAlign: 'center', letterSpacing: '0.15em', marginBottom: 4 }}>MUTE</div>
                  <HwTopBtn label="MUTE" active={selectedCh?.mute ?? false} color="red"
                            onClick={() => d({ type: 'TOGGLE_SELECTED_MUTE' })} />
                </div>
              </div>

              {/* Audio transport */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {audioStatus === 'playing' ? (
                  <button
                    type="button"
                    onClick={async () => { await stopAudio(); setAudioStatus('idle') }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      height: 22, paddingInline: 10, borderRadius: 3,
                      background: '#0a1c0a', border: '1px solid #163016',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 4px #22c55e' }} />
                    <span style={{ color: '#2e4a2e', fontSize: 7, fontFamily: 'monospace', letterSpacing: '0.12em' }}>■ STOP</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartAudio}
                    disabled={audioStatus === 'loading'}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      height: 22, paddingInline: 10, borderRadius: 3,
                      background: '#1c1200',
                      border: '1px solid #3a2800',
                      color: audioStatus === 'loading' ? '#5a4000' : '#f59e0b',
                      fontSize: 8, fontFamily: 'monospace', letterSpacing: '0.12em',
                      cursor: audioStatus === 'loading' ? 'default' : 'pointer',
                    }}
                  >
                    <span style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: audioStatus === 'loading' ? '#5a4000' : '#f59e0b44',
                      boxShadow: audioStatus === 'loading' ? 'none' : '0 0 3px #f59e0b66',
                    }} />
                    {audioStatus === 'loading'
                      ? loadProgress.total > 0
                        ? `${loadProgress.done} / ${loadProgress.total}`
                        : '· · ·'
                      : '▶ START'}
                  </button>
                )}
              </div>
            </div>

            {/* Vertical divider */}
            <div style={{ width: 1, background: '#1e1e1e', alignSelf: 'stretch', marginRight: 20 }} />

            {/* COL 2 — EQUALIZER + PAN/BAL (inactive when nothing selected) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, paddingRight: 20, opacity: (selectedCh || state.master.selected) ? 1 : 0.35, pointerEvents: (selectedCh || state.master.selected) ? 'auto' : 'none', transition: 'opacity 150ms' }}>

              {/* EQUALIZER */}
              <div>
                <SectionLabel label="EQUALIZER" />
                <div style={{ display: 'flex', gap: 20, marginTop: 8, justifyContent: 'space-around' }}>
                  {[
                    ['BASS',   displayEq.bass,   { bass:   null }],
                    ['MID',    displayEq.mid,    { mid:    null }],
                    ['FREQ',   displayEq.freq,   { freq:   null }],
                    ['TREBLE', displayEq.treble, { treble: null }],
                  ].map(([lbl, val, key]) => (
                    <Knob
                      key={lbl} value={val} min={0} max={100} label={lbl} size={46}
                      onChange={(v) => {
                        const val = Math.round(v)
                        if (selectedCh) d({ type: 'UPDATE_SELECTED_EQ', updates: { [lbl.toLowerCase()]: val } })
                        else if (state.master.selected) d({ type: 'UPDATE_MASTER', updates: { [lbl.toLowerCase()]: val } })
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* PAN / BAL */}
              <div>
                {/* ULTRANET indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ color: '#555', fontSize: 7, fontFamily: 'monospace', letterSpacing: '0.18em' }}>ULTRANET</span>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#15532e', boxShadow: '0 0 5px #16a34a' }} />
                </div>
                <SectionLabel label="PAN/BAL" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
                  <PanBalDisplay pan={displayPan} hasSelection={!!(selectedCh || state.master.selected)} />
                  <Knob
                    value={displayPan} min={-50} max={50} label="" size={56}
                    showPointer={false} showArc={false}
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
              </div>
            </div>

            {/* Vertical divider */}
            <div style={{ width: 1, background: '#1e1e1e', alignSelf: 'stretch', marginRight: 20 }} />

            {/* COL 3 — OUTPUT (functional) + VOLUME (functional) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 196 }}>

              {/* OUTPUT — functional */}
              <div>
                <SectionLabel label="OUTPUT" />
                <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
                  <Knob
                    value={state.master.limiter} min={0} max={100} label="LIMITER" size={48}
                    onChange={(v) => d({ type: 'UPDATE_MASTER', updates: { limiter: Math.round(v) } })}
                  />
                  <Knob
                    value={state.master.outputLevel} min={0} max={100} label="LEVEL" size={48}
                    onChange={(v) => d({ type: 'UPDATE_MASTER', updates: { outputLevel: Math.round(v) } })}
                  />
                </div>
              </div>

              {/* VOLUME — context-sensitive: selected channel or master */}
              <div>
                <SectionLabel label="VOLUME" />
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginTop: 8 }}>
                  <VolumeTriangle volume={activeVolume} />
                  <Knob
                    value={activeVolume} min={0} max={100} label="" size={58}
                    showPointer={false}
                    onChange={handleVolumeChange}
                    onClick={() => {
                      if (selectedCh) d({ type: 'UPDATE_CHANNEL', id: selectedCh.id, updates: { volume: 0 } })
                      else d({ type: 'UPDATE_MASTER', updates: { volume: 0 } })
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ═══ CHANNEL SELECT SECTION ══════════════════════════════════ */}
          <SectionLabel label="Channel Select" />
          <div style={{ display: 'flex', gap: 2, marginTop: 8 }}>
            {state.channels.map((ch) => (
              <ChannelStrip
                key={ch.id}
                channel={{ id: ch.id, label: ch.label, type: ch.type }}
                state={{ mute: ch.mute, solo: ch.solo, selected: ch.selected }}
                isActive={isActive(ch)}
                sourceKey={CHANNEL_SOURCE_MAP[ch.id]}
                onSelect={() => d({ type: 'SELECT_CHANNEL', id: ch.id })}
              />
            ))}
          </div>
        </div>

        {/* ── Silver bottom bar ───────────────────────────────────────── */}
        <div
          style={{
            height: 14,
            background: 'linear-gradient(0deg, #c8c8c8 0%, #bcbcbc 50%, #b4b4b4 100%)',
            borderTop: '2px solid #888',
          }}
        />
      </div>

      {/* Watermark */}
      <div style={{ textAlign: 'center', userSelect: 'none', lineHeight: 1.8 }}>
        <div style={{ color: '#555', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.18em' }}>
          CREATED BY
        </div>
        {['HENRY DAVID LIE', 'KEVIN AWARD ARMELDO'].map((name) => (
          <div key={name} style={{ color: '#bbb', fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em' }}>
            {name}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Helper components ────────────────────────────────────────────────────────

/** ──── LABEL ──── hardware-style section rule */
function SectionLabel({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ flex: 1, height: 1, background: '#444' }} />
      <span style={{ color: '#666', fontSize: 7, fontFamily: 'monospace', letterSpacing: '0.22em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: '#444' }} />
    </div>
  )
}

/** Square hardware-style button with LED inside */
function HwTopBtn({ label, active = false, color = 'neutral', onClick }) {
  const C = {
    neutral: { led: '#22c55e', bg: '#0a1c0a', border: '#163616', text: '#22c55e' },
    yellow:  { led: '#facc15', bg: '#1c1800', border: '#3a3200', text: '#facc15' },
    red:     { led: '#ef4444', bg: '#1c0000', border: '#3a0000', text: '#ef4444' },
    amber:   { led: '#f59e0b', bg: '#1c1200', border: '#3a2800', text: '#f59e0b' },
  }[color] ?? {}
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex items-center justify-center transition-all duration-100 active:scale-[0.97]"
      style={{
        width: 44, height: 36, borderRadius: 3,
        background: active ? C.bg : '#141414',
        border: `1px solid ${active ? C.border : '#1e1e1e'}`,
        color: active ? C.text : '#2a2a2a',
        fontSize: 8, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
        boxShadow: active ? `0 0 8px ${C.led}25, inset 0 1px 0 rgba(255,255,255,0.04)` : 'inset 0 1px 0 rgba(255,255,255,0.025)',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* LED dot — top-left like hardware */}
      <span style={{
        position: 'absolute', top: 5, left: 5,
        width: 5, height: 5, borderRadius: '50%',
        background: active ? C.led : '#0a0a0a',
        boxShadow: active ? `0 0 5px ${C.led}` : 'none',
      }} />
      {label}
    </button>
  )
}

/** Circular-arc LED array for PAN/BAL — dots placed on a true circle arc (bowl shape) */
function PanBalDisplay({ pan, hasSelection }) {
  const N = 9
  const W = 80, H = 14
  const CX = W / 2
  const R = 120           // large radius → subtle arc
  const HALF_ARC = 17.5  // degrees each side of centre
  const DOT_R = 3.5
  // Circle centre is below the SVG so the top of the arc is near the top of H (dome shape)
  const CY_CIRC = DOT_R + R

  const offset = Math.round((pan / 50) * 4)
  const minIdx = Math.min(4, 4 + offset)
  const maxIdx = Math.max(4, 4 + offset)

  const dots = Array.from({ length: N }, (_, i) => {
    const deg = 270 + ((i - 4) / 4) * HALF_ARC  // 270° = straight up (SVG)
    const rad = (deg * Math.PI) / 180
    return {
      cx: CX + R * Math.cos(rad),
      cy: CY_CIRC + R * Math.sin(rad),
      lit: hasSelection && i >= minIdx && i <= maxIdx,
      center: i === 4,
    }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
      <svg width={W} height={H}>
        {dots.map(({ cx, cy, lit, center }, i) => {
          const centered = pan === 0
          const col = lit ? (centered ? '#22c55e' : '#ef4444') : '#1a1a1a'
          const glow = centered ? '#22c55e' : '#ef4444'
          return (
            <circle
              key={i}
              cx={cx.toFixed(1)} cy={cy.toFixed(1)} r={DOT_R}
              fill={col}
              style={{ filter: lit ? `drop-shadow(0 0 3px ${glow})` : 'none' }}
            />
          )
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: W }}>
        <span style={{ color: '#3a3a3a', fontSize: 7, fontFamily: 'monospace' }}>L</span>
        <span style={{ color: '#3a3a3a', fontSize: 7, fontFamily: 'monospace' }}>R</span>
      </div>
    </div>
  )
}

/** Diagonal LED dot row for VOLUME */
function VolumeTriangle({ volume }) {
  const N = 8
  const STEP_X = 7   // horizontal gap between dot centres
  const STEP_Y = 4   // vertical rise per step
  const DOT_R = 2.5
  const PAD = DOT_R + 1
  const W = PAD * 2 + (N - 1) * STEP_X
  const H = PAD * 2 + (N - 1) * STEP_Y
  const litCount = Math.round((volume / 100) * N)

  return (
    <svg width={W} height={H} style={{ overflow: 'visible' }}>
      {/* Triangle outline — right-angle at bottom-right */}
      <polygon
        points={`${PAD},${H - PAD} ${W - PAD},${H - PAD} ${W - PAD},${PAD}`}
        fill="none" stroke="#333" strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* LED dots in a free diagonal line — not clipped to triangle */}
      {Array.from({ length: N }, (_, i) => {
        const cx = PAD + i * STEP_X
        const cy = H - PAD - i * STEP_Y
        const lit = i < litCount
        return (
          <circle
            key={i} cx={cx} cy={cy} r={DOT_R}
            fill={lit ? '#ef4444' : '#1a1a1a'}
            style={{ filter: lit ? 'drop-shadow(0 0 3px #ef4444)' : 'none' }}
          />
        )
      })}
    </svg>
  )
}
