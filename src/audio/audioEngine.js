import { CHANNELS } from '../data/channels'

const CDN_BASE = import.meta.env.VITE_CDN_BASE

// Build trackKey → [channelId, ...] map from CHANNELS definitions (computed once at module load).
// Stereo pairs produce two entries; mono tracks produce one.
const TRACK_CHANNELS = {}
for (const ch of CHANNELS) {
  if (!TRACK_CHANNELS[ch.trackKey]) TRACK_CHANNELS[ch.trackKey] = []
  TRACK_CHANNELS[ch.trackKey].push(ch.id)
}

let ctx = null
let masterGain = null
let masterBass = null
let masterMid = null
let masterTreble = null
let masterPanner = null
let limiter = null
let postLimiterGain = null
let outputGain = null
const channelNodes = {} // id → { gainNode, bassFilter, midFilter, trebleFilter, pannerNode, volume, active }
const analysers = {}    // trackKey → AnalyserNode
const analyserBufs = {} // trackKey → Float32Array (reused each frame)
let activeSources = []  // current song's AudioBufferSourceNodes

export function getSourceLevel(trackKey) {
  const analyser = analysers[trackKey]
  if (!analyser) return 0
  const buf = analyserBufs[trackKey]
  analyser.getFloatTimeDomainData(buf)
  let rms = 0
  for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i]
  return Math.min(Math.sqrt(rms / buf.length) * 7, 1)
}

function buildMasterChain() {
  masterGain = ctx.createGain()
  masterGain.gain.value = 0.75

  masterBass = ctx.createBiquadFilter()
  masterBass.type = 'lowshelf'
  masterBass.frequency.value = 200
  masterBass.Q.value = 0.7071
  masterBass.gain.value = 0

  masterMid = ctx.createBiquadFilter()
  masterMid.type = 'peaking'
  masterMid.frequency.value = 1265
  masterMid.Q.value = 0.8
  masterMid.gain.value = 0

  masterTreble = ctx.createBiquadFilter()
  masterTreble.type = 'highshelf'
  masterTreble.frequency.value = 4000
  masterTreble.Q.value = 0.7071
  masterTreble.gain.value = 0

  masterPanner = ctx.createStereoPanner()
  masterPanner.pan.value = 0

  masterGain.connect(masterBass)
  masterBass.connect(masterMid)
  masterMid.connect(masterTreble)
  masterTreble.connect(masterPanner)

  // Brick-wall limiter: high ratio, fast attack, no knee.
  // threshold=0dB (knob=100) → transparent; postLimiterGain cancels automatic makeup gain.
  limiter = ctx.createDynamicsCompressor()
  limiter.threshold.value = 0
  limiter.ratio.value = 20
  limiter.attack.value = 0.003
  limiter.release.value = 0.25
  limiter.knee.value = 0

  postLimiterGain = ctx.createGain()
  postLimiterGain.gain.value = 1.0

  outputGain = ctx.createGain()
  outputGain.gain.value = 0.75

  masterPanner.connect(limiter)
  limiter.connect(postLimiterGain)
  postLimiterGain.connect(outputGain)
  outputGain.connect(ctx.destination)
}

function buildChannelChain(id) {
  const gainNode = ctx.createGain()
  gainNode.gain.value = 0.75

  const bassFilter = ctx.createBiquadFilter()
  bassFilter.type = 'lowshelf'
  bassFilter.frequency.value = 200
  bassFilter.Q.value = 0.7071
  bassFilter.gain.value = 0

  const midFilter = ctx.createBiquadFilter()
  midFilter.type = 'peaking'
  midFilter.frequency.value = 1265
  midFilter.Q.value = 0.8
  midFilter.gain.value = 0

  const trebleFilter = ctx.createBiquadFilter()
  trebleFilter.type = 'highshelf'
  trebleFilter.frequency.value = 4000
  trebleFilter.Q.value = 0.7071
  trebleFilter.gain.value = 0

  const pannerNode = ctx.createStereoPanner()
  pannerNode.pan.value = 0

  gainNode.connect(bassFilter)
  bassFilter.connect(midFilter)
  midFilter.connect(trebleFilter)
  trebleFilter.connect(pannerNode)
  pannerNode.connect(masterGain)

  channelNodes[id] = { gainNode, bassFilter, midFilter, trebleFilter, pannerNode, volume: 75, active: true }
}

function clearSources() {
  activeSources.forEach(s => { try { s.stop() } catch {} s.disconnect() })
  activeSources = []
  Object.keys(analysers).forEach(k => { try { analysers[k].disconnect() } catch {} delete analysers[k] })
  Object.keys(analyserBufs).forEach(k => delete analyserBufs[k])
}

function ensureContext() {
  if (ctx) return
  ctx = new (window.AudioContext || window.webkitAudioContext)()
  buildMasterChain()
  for (let id = 1; id <= 16; id++) buildChannelChain(id)
}

function recomputeGain(id) {
  const ch = channelNodes[id]
  if (!ch || !ctx) return
  ch.gainNode.gain.setTargetAtTime(
    ch.active ? ch.volume / 100 : 0,
    ctx.currentTime, 0.015
  )
}

export async function loadSong(manifest, onProgress, signal) {
  ensureContext()

  if (ctx.state === 'suspended') {
    try { await ctx.resume() } catch {}
  }

  clearSources()

  const { folder, tracks } = manifest
  const trackEntries = Object.entries(tracks)
  const total = trackEntries.length
  let done = 0

  const buffers = {}
  await Promise.all(trackEntries.map(async ([trackKey, filename]) => {
    const url = encodeURI(`${CDN_BASE}/${folder}/${filename}`)
    const resp = await fetch(url, signal ? { signal } : undefined)
    if (!resp.ok) throw new Error(`Failed to fetch ${filename}: ${resp.status}`)
    const arrayBuf = await resp.arrayBuffer()
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    buffers[trackKey] = await ctx.decodeAudioData(arrayBuf)
    done++
    onProgress?.(done, total)
  }))

  // Safety net for loop sync: MP3s decoded with mismatched lengths (e.g. missing
  // LAME gapless headers) would drift out of sync on every loop. Trim all buffers
  // to the shortest one — any extra trailing samples are silence/encoder padding.
  const minLength = Math.min(...Object.values(buffers).map(b => b.length))
  for (const [key, buf] of Object.entries(buffers)) {
    if (buf.length === minLength) continue
    const trimmed = ctx.createBuffer(buf.numberOfChannels, minLength, buf.sampleRate)
    for (let c = 0; c < buf.numberOfChannels; c++) {
      trimmed.copyToChannel(buf.getChannelData(c).subarray(0, minLength), c)
    }
    buffers[key] = trimmed
  }

  const pendingSources = []

  for (const [trackKey, buffer] of Object.entries(buffers)) {
    const channelIds = TRACK_CHANNELS[trackKey]
    if (!channelIds) continue

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.75
    analysers[trackKey] = analyser
    analyserBufs[trackKey] = new Float32Array(analyser.fftSize)

    source.connect(analyser)

    if (channelIds.length === 2) {
      // Stereo pair — split to L and R channel nodes (lower id = L, higher id = R)
      const [leftId, rightId] = [...channelIds].sort((a, b) => a - b)
      if (buffer.numberOfChannels >= 2) {
        const splitter = ctx.createChannelSplitter(2)
        analyser.connect(splitter)
        splitter.connect(channelNodes[leftId].gainNode, 0)
        splitter.connect(channelNodes[rightId].gainNode, 1)
      } else {
        analyser.connect(channelNodes[leftId].gainNode)
        analyser.connect(channelNodes[rightId].gainNode)
      }
    } else {
      // Mono — downmix to true mono before the StereoPannerNode
      const monoMix = ctx.createGain()
      monoMix.channelCount = 1
      monoMix.channelCountMode = 'explicit'
      analyser.connect(monoMix)
      monoMix.connect(channelNodes[channelIds[0]].gainNode)
    }

    pendingSources.push(source)
  }

  const startTime = ctx.currentTime + 0.05
  pendingSources.forEach(s => s.start(startTime))
  activeSources = pendingSources
}

export function unloadSong() {
  clearSources()
}

// Call synchronously inside a click handler (user gesture) before any await.
// Creates the AudioContext and fires resume() without waiting — browser unlocks it.
export function unlockContext() {
  ensureContext()
  if (ctx.state !== 'running') ctx.resume()
}

export function isContextRunning() {
  return ctx?.state === 'running'
}

export async function stopAudio() {
  if (!ctx) return
  clearSources()
  await ctx.close()
  ctx = null
  masterGain = null
  masterBass = null
  masterMid = null
  masterTreble = null
  masterPanner = null
  limiter = null
  postLimiterGain = null
  outputGain = null
  Object.keys(channelNodes).forEach(k => delete channelNodes[k])
}

export function setChannelVolume(id, value) {
  const ch = channelNodes[id]
  if (!ch) return
  ch.volume = value
  recomputeGain(id)
}

export function setChannelActive(id, active) {
  const ch = channelNodes[id]
  if (!ch) return
  ch.active = active
  recomputeGain(id)
}

export function setChannelPan(id, value) {
  const ch = channelNodes[id]
  if (!ch || !ctx) return
  ch.pannerNode.pan.setTargetAtTime(value / 50, ctx.currentTime, 0.015)
}

export function setMasterVolume(value) {
  if (!masterGain || !ctx) return
  masterGain.gain.setTargetAtTime(value / 100, ctx.currentTime, 0.015)
}

export function setMasterEQ({ bass, mid, freq, treble }) {
  if (!masterBass || !ctx) return
  masterBass.gain.setTargetAtTime((bass - 50) / 50 * 12, ctx.currentTime, 0.015)
  masterMid.gain.setTargetAtTime((mid - 50) / 50 * 12, ctx.currentTime, 0.015)
  masterTreble.gain.setTargetAtTime((treble - 50) / 50 * 12, ctx.currentTime, 0.015)
  masterMid.frequency.setTargetAtTime(200 * Math.pow(40, freq / 100), ctx.currentTime, 0.015)
}

export function setMasterPan(value) {
  if (!masterPanner || !ctx) return
  masterPanner.pan.setTargetAtTime(value / 50, ctx.currentTime, 0.015)
}

export function setLimiterThreshold(value) {
  if (!limiter || !postLimiterGain || !ctx) return
  const threshold_dB = -(100 - value) * 0.2
  limiter.threshold.setTargetAtTime(threshold_dB, ctx.currentTime, 0.015)
  const compensation = Math.pow(10, threshold_dB * (1 - 1 / limiter.ratio.value) / 20)
  postLimiterGain.gain.setTargetAtTime(compensation, ctx.currentTime, 0.015)
}

export function setOutputLevel(value) {
  if (!outputGain || !ctx) return
  outputGain.gain.setTargetAtTime(value / 100, ctx.currentTime, 0.015)
}

export function setChannelEQ(id, { bass, mid, freq, treble }) {
  const ch = channelNodes[id]
  if (!ch || !ctx) return
  ch.bassFilter.gain.setTargetAtTime((bass - 50) / 50 * 12, ctx.currentTime, 0.015)
  ch.midFilter.gain.setTargetAtTime((mid - 50) / 50 * 12, ctx.currentTime, 0.015)
  ch.trebleFilter.gain.setTargetAtTime((treble - 50) / 50 * 12, ctx.currentTime, 0.015)
  ch.midFilter.frequency.setTargetAtTime(200 * Math.pow(40, freq / 100), ctx.currentTime, 0.015)
}
