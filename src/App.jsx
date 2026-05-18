import { useState, useEffect, useRef } from 'react'
import MixerBoard from './components/MixerBoard'
import TrainingPanel from './components/training/TrainingPanel'
import { CHANNELS } from './data/channels'
import { loadSong, unloadSong, unlockContext } from './audio/audioEngine'

const CDN_BASE = 'https://cdn.p16-simulator.cloud'

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('p16_theme') ?? 'dark')
  const [trainingOpen, setTrainingOpen] = useState(false)
  const [highlightZone, setHighlightZone] = useState(null)

  const [songs, setSongs] = useState([])
  const [currentSongId, setCurrentSongId] = useState(null)
  const [isFetchingManifest, setIsFetchingManifest] = useState(true)
  const [isLoadingSong, setIsLoadingSong] = useState(false)
  const [loadProgress, setLoadProgress] = useState({ done: 0, total: 0 })
  const [activeChannelIds, setActiveChannelIds] = useState(new Set())
  const [songError, setSongError] = useState(null)

  const loadAbortRef = useRef(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('p16_theme', theme)
  }, [theme])

  // Fetch manifest on mount — just populate the dropdown, do NOT auto-load audio
  useEffect(() => {
    setIsFetchingManifest(true)
    fetch(`${CDN_BASE}/songs.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`songs.json ${r.status}`)
        return r.json()
      })
      .then((data) => {
        setSongs(data)
        if (data.length > 0) setCurrentSongId(data[0].id)
      })
      .catch(() => setSongError('Could not load song list from CDN.'))
      .finally(() => setIsFetchingManifest(false))
  }, [])

  // Song selector change — just update selection, stop any current audio
  function handleSongChange(songId) {
    if (songId === currentSongId) return
    loadAbortRef.current?.abort()
    unloadSong()
    setCurrentSongId(songId)
    setActiveChannelIds(new Set())
    setSongError(null)
    setIsLoadingSong(false)
  }

  // PLAY button — unlock AudioContext (user gesture) then load tracks
  async function handlePlay() {
    const song = songs.find((s) => s.id === currentSongId)
    if (!song || isLoadingSong) return

    // Must happen synchronously within the click handler — creates + resumes AudioContext
    unlockContext()

    loadAbortRef.current?.abort()
    const controller = new AbortController()
    loadAbortRef.current = controller

    setIsLoadingSong(true)
    setLoadProgress({ done: 0, total: 0 })
    setSongError(null)

    try {
      await loadSong(song, (done, total) => setLoadProgress({ done, total }), controller.signal)
      const loadedKeys = new Set(Object.keys(song.tracks))
      setActiveChannelIds(
        new Set(CHANNELS.filter((ch) => loadedKeys.has(ch.trackKey)).map((ch) => ch.id))
      )
    } catch (err) {
      if (err.name === 'AbortError') return
      console.error('Song load failed:', err)
      setSongError('Failed to load song. Check CDN connection.')
      setActiveChannelIds(new Set())
    } finally {
      if (!controller.signal.aborted) setIsLoadingSong(false)
    }
  }

  function handleToggleTraining() {
    if (trainingOpen) setHighlightZone(null)
    setTrainingOpen((o) => !o)
  }

  const dark = theme === 'dark'

  return (
    <>
      <TrainingPanel
        open={trainingOpen}
        onToggle={handleToggleTraining}
        theme={theme}
        onHighlight={setHighlightZone}
      />
      <button
        onClick={() => setTheme(dark ? 'light' : 'dark')}
        style={{
          position: 'fixed', top: 14, right: 14, zIndex: 300,
          height: 26, paddingInline: 10,
          background: dark ? '#141414' : '#d0d0d0',
          border: `1px solid ${dark ? '#2a2a2a' : '#b0b0b0'}`,
          borderRadius: 3,
          color: dark ? '#555' : '#666',
          fontSize: 8, fontFamily: 'monospace', letterSpacing: '0.14em',
          cursor: 'pointer',
        }}
      >
        {dark ? '◐ LIGHT' : '◑ DARK'}
      </button>
      <MixerBoard
        highlightZone={highlightZone}
        songs={songs}
        currentSongId={currentSongId}
        isFetchingManifest={isFetchingManifest}
        isLoadingSong={isLoadingSong}
        loadProgress={loadProgress}
        onSongChange={handleSongChange}
        onPlay={handlePlay}
        activeChannelIds={activeChannelIds}
        songError={songError}
      />
    </>
  )
}
