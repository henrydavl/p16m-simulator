import { useReducer, useEffect, useRef, useState } from 'react'
import logo from '../assets/logo-with-icon.png'
import { CHANNELS, INITIAL_CHANNEL_STATE, INITIAL_MASTER_STATE } from '../data/channels'
import {
  setChannelVolume, setChannelActive, setChannelPan, setChannelEQ,
  setMasterVolume, setMasterEQ, setMasterPan, setLimiterThreshold, setOutputLevel,
} from '../audio/audioEngine'
import Knob from './Knob'
import ChannelStrip from './ChannelStrip'
import SongSelector from './SongSelector'
import MixerBoardHQ from './MixerBoardHQ'
import KofiButton from './KofiButton'

// ─── State ───────────────────────────────────────────────────────────────────

// Mixer state is cached here so a page refresh keeps the user's faders/EQ/limiter
// instead of resetting everything to the silent boot state. Cleared on training reset.
const MIXER_KEY = 'p16_mixer'

function buildInitialState() {
  return {
    channels: CHANNELS.map((ch) => ({
      ...ch,
      ...INITIAL_CHANNEL_STATE,
      // Stereo L channels (odd ids 1,3,5) default hard-left; R channels (even 2,4,6) hard-right.
      // Without this, both sides of the split sit at centre and collapse to mono.
      pan: ch.type === 'stereo' ? (ch.id % 2 === 1 ? -50 : 50) : 0,
    })),
    master: { ...INITIAL_MASTER_STATE },
  }
}

// First load (or after a training reset) → silent boot state (volumes 0). Otherwise
// overlay the cached mixer values onto the current channel definitions, by index, so a
// future change to CHANNELS can't be corrupted by a stale cache. Selection is never
// restored (starts deselected).
function initReducerState() {
  const base = buildInitialState()
  try {
    const saved = JSON.parse(localStorage.getItem(MIXER_KEY))
    if (!saved || !Array.isArray(saved.channels)) return base
    return {
      channels: base.channels.map((ch, i) => {
        const s = saved.channels[i]
        if (!s) return ch
        const { volume, pan, mute, solo, bass, mid, freq, treble } = s
        return { ...ch, volume, pan, mute, solo, bass, mid, freq, treble, selected: false }
      }),
      master: { ...base.master, ...(saved.master ?? {}), selected: false },
    }
  } catch {
    return base
  }
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
            return { ...ch, pan: Math.max(Math.min(base + B * 2, 50), -50) }
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

function zoneHL(zone, activeZone) {
  const zones = Array.isArray(activeZone) ? activeZone : [activeZone]
  const base = {
    transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease',
    borderRadius: 6,
    position: 'relative',
    transformOrigin: 'center center',
  }
  if (!activeZone || !zones.includes(zone)) return base
  const scale = zone === 'channels' ? 1.05 : 1.13
  return {
    ...base,
    transform: `scale(${scale})`,
    zIndex: 10,
    boxShadow: '0 0 0 3px rgba(192,112,24,0.9), 0 0 0 5px rgba(192,112,24,0.2), 0 8px 32px rgba(192,112,24,0.35)',
  }
}

export default function MixerBoard({
  skin = 'classic',
  highlightZone = null,
  songs = [],
  currentSongId = null,
  isFetchingManifest = false,
  isLoadingSong = false,
  loadProgress = { done: 0, total: 0 },
  onSongChange,
  onPlay,
  onStop,
  activeChannelIds = new Set(),
  songError = null,
}) {
  const [state, dispatch] = useReducer(reducer, undefined, initReducerState)
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
  const isActive = (ch) => activeChannelIds.has(ch.id) && !ch.mute && (!anySolo || ch.solo)

  const selectedCh = state.channels.find((ch) => ch.selected)
  const selectedPair = state.channels.filter((ch) => ch.selected)
  const isStereoPairSelected = selectedPair.length === 2 && selectedPair.every(ch => ch.type === 'stereo')

  // For a stereo pair, display the BAL value (0 = natural L/R stereo).
  // Derive it from whichever channel moved away from its default (L base=-50, R base=+50).
  const displayPan = isStereoPairSelected
    ? (() => {
        const L = selectedPair.find(ch => ch.id % 2 === 1)
        const R = selectedPair.find(ch => ch.id % 2 === 0)
        return L.pan !== -50 ? (L.pan + 50) / 2 : (R.pan - 50) / 2
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

  // Audio sync effect — runs regardless of skin
  useEffect(() => {
    if (activeChannelIds.size === 0) return
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
  }, [state, activeChannelIds])

  // Cache mixer state so a refresh keeps the user's levels. Store only the mutable
  // values (not channel definitions or selection) so the cache stays small and robust.
  useEffect(() => {
    try {
      const compact = {
        channels: state.channels.map(({ volume, pan, mute, solo, bass, mid, freq, treble }) =>
          ({ volume, pan, mute, solo, bass, mid, freq, treble })),
        master: state.master,
      }
      localStorage.setItem(MIXER_KEY, JSON.stringify(compact))
    } catch {}
  }, [state])

  if (skin === 'hq') {
    return (
      <MixerBoardHQ
        state={state}
        d={d}
        highlightZone={highlightZone}
        songs={songs}
        currentSongId={currentSongId}
        isFetchingManifest={isFetchingManifest}
        isLoadingSong={isLoadingSong}
        loadProgress={loadProgress}
        onSongChange={onSongChange}
        onPlay={onPlay}
        onStop={onStop}
        activeChannelIds={activeChannelIds}
        songError={songError}
        scale={scale}
        isPortrait={isPortrait}
        mixerRef={mixerRef}
        selectedCh={selectedCh}
        displayPan={displayPan}
        displayEq={displayEq}
        activeVolume={activeVolume}
        handleVolumeChange={handleVolumeChange}
        isActive={isActive}
        anySolo={anySolo}
      />
    )
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

      {/* ── Song selector + device shell share a column so selector matches mixer width ── */}
      <div style={{ display: 'flex', flexDirection: 'column', transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        <div style={{ width: '100%' }}>
          <SongSelector
            songs={songs}
            currentSongId={currentSongId}
            onSongChange={onSongChange}
            isLoading={isFetchingManifest}
          />
          {songError && (
            <div style={{
              color: '#ef4444', fontSize: 8, fontFamily: 'monospace',
              letterSpacing: '0.1em', marginBottom: 4,
            }}>
              ⚠ {songError}
            </div>
          )}
        </div>

        {/* ── Device shell ─────────────────────────────────────────────── */}
        <div
          ref={mixerRef}
          style={{
            borderRadius: 10,
            overflow: 'visible',
            border: '1px solid #2a2a2a',
            boxShadow: '0 24px 64px rgba(0,0,0,0.85), 0 4px 12px rgba(0,0,0,0.6)',
          }}
        >
        {/* ── Silver top bar ─────────────────────────────────────────── */}
        <div
          style={{
            background: 'linear-gradient(180deg, #c8c8c8 0%, #bcbcbc 50%, #b4b4b4 100%)',
            borderBottom: '2px solid #888',
            borderRadius: '9px 9px 0 0',
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
              <span style={{ color: '#111', fontSize: 27, fontWeight: 100, fontFamily: 'serif', lineHeight: 1, fontStyle: 'italic' }}>
                16
              </span>
            </div>
            <div style={{ color: '#444', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'sans-serif', marginTop: 3, fontWeight: 600 }}>
              16-Channel Digital Personal Mixer&nbsp;<b>P16-M</b>
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
                  <div style={{ color: '#383838', fontSize: 8, fontFamily: 'monospace', textAlign: 'center', letterSpacing: '0.15em', marginBottom: 4 }}>MAIN</div>
                  <HwTopBtn label="MAIN" active={state.master.selected} color="amber"
                            onClick={() => d({ type: 'SELECT_MAIN' })} />
                </div>
                <div>
                  <div style={{ color: '#383838', fontSize: 8, fontFamily: 'monospace', textAlign: 'center', letterSpacing: '0.15em', marginBottom: 4 }}>SOLO</div>
                  <HwTopBtn label="SOLO" active={selectedCh?.solo ?? false} color="yellow"
                            onClick={() => d({ type: 'TOGGLE_SELECTED_SOLO' })} />
                </div>
                <div>
                  <div style={{ color: '#383838', fontSize: 8, fontFamily: 'monospace', textAlign: 'center', letterSpacing: '0.15em', marginBottom: 4 }}>MUTE</div>
                  <HwTopBtn label="MUTE" active={selectedCh?.mute ?? false} color="red"
                            onClick={() => d({ type: 'TOGGLE_SELECTED_MUTE' })} />
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
                      type="button"
                      onClick={onStop}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        height: 22, paddingInline: 10, borderRadius: 3,
                        background: '#1c0000', border: '1px solid #3a0000',
                        color: '#ef4444', fontSize: 9, fontFamily: 'monospace',
                        letterSpacing: '0.12em', cursor: 'pointer',
                      }}
                    >
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef444444', boxShadow: '0 0 3px #ef444466' }} />
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
                      ? loadProgress.total > 0
                        ? `${loadProgress.done} / ${loadProgress.total}`
                        : '· · ·'
                      : '▶ PLAY'}
                  </button>
                )}
              </div>
            </div>

            {/* Vertical divider */}
            <div style={{ width: 1, background: '#1e1e1e', alignSelf: 'stretch', marginRight: 20 }} />

            {/* COL 2 — EQUALIZER + PAN/BAL (inactive when nothing selected) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, paddingRight: 20, opacity: (selectedCh || state.master.selected) ? 1 : 0.35, pointerEvents: (selectedCh || state.master.selected) ? 'auto' : 'none', transition: 'opacity 150ms' }}>

              {/* EQUALIZER */}
              <div style={zoneHL('eq', highlightZone)}>
                <SectionLabel label="EQUALIZER" />
                <div style={{ position: 'relative', display: 'flex', gap: 20, marginTop: 8, justifyContent: 'space-around' }}>
                  {['BASS', 'MID', 'FREQ', 'TREBLE'].map((lbl) => {
                    const field = lbl.toLowerCase()
                    return (
                      <Knob
                        key={lbl} value={displayEq[field]} min={0} max={100} label={lbl} size={46}
                        onChange={(v) => {
                          const val = Math.round(v)
                          if (selectedCh) d({ type: 'UPDATE_SELECTED_EQ', updates: { [field]: val } })
                          else if (state.master.selected) d({ type: 'UPDATE_MASTER', updates: { [field]: val } })
                        }}
                        onClick={() => {
                          if (selectedCh) d({ type: 'UPDATE_SELECTED_EQ', updates: { [field]: 50 } })
                          else if (state.master.selected) d({ type: 'UPDATE_MASTER', updates: { [field]: 50 } })
                        }}
                      />
                    )
                  })}
                  {/* MID↔FREQ link: FREQ only sweeps the MID band's centre frequency */}
                  <div style={{
                    position: 'absolute',
                    top: 22, left: '50%',
                    transform: 'translateX(-50%)',
                    width: 60, height: 2,
                    background: '#666', borderRadius: 1,
                    pointerEvents: 'none',
                  }} />
                </div>
              </div>

              {/* PAN / BAL */}
              <div style={zoneHL('pan', highlightZone)}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {/* Left col — ULTRANET, centred */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: '#555', fontSize: 8, fontFamily: 'monospace', letterSpacing: '0.18em' }}>ULTRANET</span>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#15532e', boxShadow: '0 0 5px #16a34a' }} />
                  </div>
                  {/* Right col — label + arc + knob */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <SectionLabel label="PAN/BAL" />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
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
              </div>
            </div>

            {/* Vertical divider */}
            <div style={{ width: 1, background: '#1e1e1e', alignSelf: 'stretch', marginRight: 20 }} />

            {/* COL 3 — OUTPUT (functional) + VOLUME (functional) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 196, ...zoneHL('col3', highlightZone) }}>

              {/* OUTPUT — functional */}
              <div>
                <SectionLabel label="OUTPUT" />
                <div style={{ display: 'flex', gap: 20, marginTop: 8, justifyContent: 'center' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8, justifyContent: 'center' }}>
                  <VolumeTriangle volume={activeVolume} />
                  <Knob
                    value={activeVolume} min={0} max={100} label="" size={48}
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
          <div style={zoneHL('channels', highlightZone)}>
            <SectionLabel label="Channel Select" />
            <div style={{ display: 'flex', gap: 2, marginTop: 8 }}>
              {state.channels.map((ch) => (
                <ChannelStrip
                  key={ch.id}
                  channel={{ id: ch.id, label: ch.label, type: ch.type }}
                  state={{ mute: ch.mute, solo: ch.solo, selected: ch.selected }}
                  isActive={isActive(ch)}
                  sourceKey={ch.trackKey}
                  onSelect={() => d({ type: 'SELECT_CHANNEL', id: ch.id })}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Silver bottom bar ───────────────────────────────────────── */}
        <div
          style={{
            height: 14,
            background: 'linear-gradient(0deg, #c8c8c8 0%, #bcbcbc 50%, #b4b4b4 100%)',
            borderTop: '2px solid #888',
            borderRadius: '0 0 9px 9px',
          }}
        />
        </div>
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
        <KofiButton />
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
      <span style={{ color: '#666', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.22em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
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
        width: 44, height: 36, borderRadius: 3, overflow: 'hidden',
        background: active ? C.bg : '#141414',
        border: `1px solid ${active ? C.border : '#1e1e1e'}`,
        color: active ? C.text : '#2a2a2a',
        fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
        boxShadow: active ? `0 0 8px ${C.led}25, inset 0 1px 0 rgba(255,255,255,0.04)` : 'inset 0 1px 0 rgba(255,255,255,0.025)',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {/* LED — top-right corner, clipped like channel buttons */}
      <span style={{
        position: 'absolute', top: 0, right: 0,
        width: 'calc(33%)', height: 10,
        borderRadius: '0 3px 0 4px',
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
