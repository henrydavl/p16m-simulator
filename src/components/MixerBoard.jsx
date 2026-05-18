import { useReducer, useState, useEffect } from 'react'
import { CHANNELS, INITIAL_CHANNEL_STATE, INITIAL_MASTER_STATE } from '../data/channels'
import {
  initAudio, setChannelVolume, setChannelActive, setChannelPan, setChannelEQ,
  setMasterVolume, setLimiterThreshold, setOutputLevel,
  AUDIO_CHANNEL_IDS,
} from '../audio/audioEngine'
import Knob from './Knob'
import ChannelStrip from './ChannelStrip'

// ─── State ───────────────────────────────────────────────────────────────────

const initialState = {
  channels: CHANNELS.map((ch) => ({ ...ch, ...INITIAL_CHANNEL_STATE })),
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
    case 'UPDATE_SELECTED_PAN':
      return {
        ...state,
        channels: state.channels.map((ch) =>
          ch.selected ? { ...ch, pan: action.pan } : ch
        ),
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

  const anySolo = state.channels.some((ch) => ch.solo)
  const anyMute = state.channels.some((ch) => ch.mute)
  const isActive = (ch) => audioStatus === 'playing' && AUDIO_CHANNEL_IDS.has(ch.id) && !ch.mute && (!anySolo || ch.solo)

  // For PAN/BAL display: use first selected channel's pan (stereo pairs share selection)
  const selectedCh = state.channels.find((ch) => ch.selected)
  const displayPan = selectedCh?.pan ?? 0
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
  const displayEq = {
    bass:   selectedCh?.bass   ?? 50,
    mid:    selectedCh?.mid    ?? 50,
    freq:   selectedCh?.freq   ?? 50,
    treble: selectedCh?.treble ?? 50,
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
    setLimiterThreshold(state.master.limiter)
    setOutputLevel(state.master.outputLevel)
  }, [state, audioStatus])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: '#060606', padding: '24px 16px', gap: 14 }}
    >
      {/* ── Device shell ───────────────────────────────────────────────── */}
      <div
        style={{
          borderRadius: 10,
          overflow: 'hidden',
          border: '1px solid #2a2a2a',
          boxShadow: '0 24px 64px rgba(0,0,0,0.85), 0 4px 12px rgba(0,0,0,0.6)',
        }}
      >
        {/* ── Silver top bar ─────────────────────────────────────────── */}
        <div
          style={{
            background: 'linear-gradient(180deg,#d4d4d4 0%,#9e9e9e 55%,#898989 100%)',
            borderBottom: '1px solid #686868',
            padding: '9px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BehringerMark />
            <span style={{ color: '#1c1c1c', fontSize: 13, fontWeight: 700, fontFamily: 'sans-serif', letterSpacing: '0.05em' }}>
              behringer
            </span>
          </div>
          <div style={{ textAlign: 'right', lineHeight: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <span style={{ color: '#181818', fontSize: 17, fontWeight: 900, letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
                POWERPLAY
              </span>
              <span style={{ color: '#181818', fontSize: 26, fontWeight: 200, fontFamily: 'sans-serif', lineHeight: 1 }}>
                16
              </span>
            </div>
            <div style={{ color: '#4a4a4a', fontSize: 8, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'monospace', marginTop: 2 }}>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 4px #22c55e' }} />
                    <span style={{ color: '#2e4a2e', fontSize: 7, fontFamily: 'monospace', letterSpacing: '0.12em' }}>AUDIO ON</span>
                  </div>
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

            {/* COL 2 — EQUALIZER (visual) + PAN/BAL */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, paddingRight: 20 }}>

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
                      onChange={(v) => selectedCh && d({
                        type: 'UPDATE_SELECTED_EQ',
                        updates: { [lbl.toLowerCase()]: Math.round(v) },
                      })}
                    />
                  ))}
                </div>
              </div>

              {/* PAN / BAL */}
              <div>
                {/* ULTRANET indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ color: '#2e2e2e', fontSize: 7, fontFamily: 'monospace', letterSpacing: '0.18em' }}>ULTRANET</span>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#15532e', boxShadow: '0 0 5px #16a34a' }} />
                </div>
                <SectionLabel label="PAN/BAL" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
                  <PanBalDisplay pan={displayPan} hasSelection={!!selectedCh} />
                  <Knob
                    value={displayPan} min={-50} max={50} label="" size={56}
                    onChange={(v) => selectedCh && d({ type: 'UPDATE_SELECTED_PAN', pan: Math.round(v) })}
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
                onSelect={() => d({ type: 'SELECT_CHANNEL', id: ch.id })}
              />
            ))}
          </div>
        </div>

        {/* ── Silver bottom bar ───────────────────────────────────────── */}
        <div
          style={{
            height: 14,
            background: 'linear-gradient(180deg,#888 0%,#aaa 45%,#c4c4c4 100%)',
            borderTop: '1px solid #686868',
          }}
        />
      </div>

      {/* Watermark */}
      <div style={{ textAlign: 'center', userSelect: 'none', lineHeight: 1.8 }}>
        <div style={{ color: '#555', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.18em' }}>
          CREATED BY
        </div>
        {['HENRY DAVID LIE'].map((name) => (
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
      <div style={{ flex: 1, height: 1, background: '#2c2c2c' }} />
      <span style={{ color: '#484848', fontSize: 7, fontFamily: 'monospace', letterSpacing: '0.22em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: '#2c2c2c' }} />
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

/** Horizontal LED dot array for PAN/BAL — shows L/R balance */
function PanBalDisplay({ pan, hasSelection }) {
  // 9 dots; index 4 = centre. Lights from centre to position.
  const offset = Math.round((pan / 50) * 4) // -4 to +4
  const minIdx = Math.min(4, 4 + offset)
  const maxIdx = Math.max(4, 4 + offset)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        {Array.from({ length: 9 }, (_, i) => {
          const lit = hasSelection && i >= minIdx && i <= maxIdx
          return (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: '50%',
              background: lit ? '#f59e0b' : '#141414',
              boxShadow: lit ? '0 0 5px #f59e0b, 0 0 2px #f59e0b' : 'none',
            }} />
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', paddingInline: 1 }}>
        <span style={{ color: '#3a3a3a', fontSize: 7, fontFamily: 'monospace' }}>L</span>
        <span style={{ color: '#3a3a3a', fontSize: 7, fontFamily: 'monospace' }}>R</span>
      </div>
    </div>
  )
}

/** Triangular LED display for VOLUME — bars of increasing height */
function VolumeTriangle({ volume }) {
  const litCount = Math.round((volume / 100) * 10)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3 }}>
      {Array.from({ length: 10 }, (_, i) => {
        const h = 5 + Math.round(i * 2.2)
        const lit = i < litCount
        const hot = i >= 7
        return (
          <div key={i} style={{
            width: 6, height: h, borderRadius: 1,
            background: lit ? (hot ? '#ef4444' : '#f59e0b') : '#111',
            boxShadow: lit ? `0 0 4px ${hot ? '#ef4444' : '#f59e0b'}` : 'none',
          }} />
        )
      })}
    </div>
  )
}

/** Simplified Behringer "B" logomark in the silver bar */
function BehringerMark() {
  return (
    <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
      <path
        d="M3 1.5h7c2.2 0 3.5 1.1 3.5 2.9 0 1.3-.7 2.2-1.8 2.7C13.6 7.5 14.8 8.7 14.8 10.6c0 2.2-1.7 3.5-4.5 3.5H3V1.5z
           M5.4 3.5V6.7h4c1.1 0 1.8-.6 1.8-1.6 0-.9-.7-1.6-1.8-1.6H5.4z
           M5.4 8.8v3.5H9.7c1.3 0 2.1-.7 2.1-1.8 0-1-.8-1.7-2.1-1.7H5.4z"
        fill="#2e2e2e"
      />
    </svg>
  )
}
