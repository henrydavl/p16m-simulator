// Stereo pair files: one audio file feeds two mixer channels (L and R)
const STEREO_FILE_MAP = {
  'DRUM': [1, 2],
  'KEYS': [3, 4],
  'SEQ':  [5, 6],
}

// Mono files: one audio file feeds one mixer channel
const MONO_FILE_MAP = {
  'SYNTH':   7,
  'BASS':    8,
  'GTR 1':   9,
  'ALL VCL': 13,
}

// Channel IDs that have audio — used by the UI to suppress meters on silent channels
export const AUDIO_CHANNEL_IDS = new Set([
  ...Object.values(STEREO_FILE_MAP).flat(),
  ...Object.values(MONO_FILE_MAP),
])

// Maps channel id → source file key, so stereo pairs share the same analyser
export const CHANNEL_SOURCE_MAP = {
  ...Object.fromEntries(Object.entries(STEREO_FILE_MAP).flatMap(([k, [l, r]]) => [[l, k], [r, k]])),
  ...Object.fromEntries(Object.entries(MONO_FILE_MAP).map(([k, id]) => [id, k])),
}

// Resolved at module load via Vite — keys are filenames without extension
const AUDIO_URLS = Object.fromEntries(
  Object.entries(
    import.meta.glob('/src/assets/audio/*.mp3', { eager: true, query: '?url', import: 'default' })
  ).map(([path, url]) => [path.split('/').pop().replace(/\.mp3$/i, ''), url])
)

let ctx = null
let masterGain = null
let limiter = null
let postLimiterGain = null
let outputGain = null
const channelNodes = {} // id → { gainNode, pannerNode, volume, active }
const analysers = {}    // fileKey → AnalyserNode
const analyserBufs = {} // fileKey → Float32Array (reused to avoid GC)

export function getSourceLevel(fileKey) {
  const analyser = analysers[fileKey]
  if (!analyser) return 0
  const buf = analyserBufs[fileKey]
  analyser.getFloatTimeDomainData(buf)
  let rms = 0
  for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i]
  // Scale: typical music RMS ~0.05–0.25 → multiply to fill meter; clamp to 1
  return Math.min(Math.sqrt(rms / buf.length) * 7, 1)
}

function buildChannelChain(id) {
  const gainNode = ctx.createGain()
  gainNode.gain.value = 0.75

  const bassFilter = ctx.createBiquadFilter()
  bassFilter.type = 'lowshelf'
  bassFilter.frequency.value = 200
  bassFilter.gain.value = 0

  const midFilter = ctx.createBiquadFilter()
  midFilter.type = 'peaking'
  midFilter.frequency.value = 1265  // center at freq=50 on log scale
  midFilter.Q.value = 1
  midFilter.gain.value = 0

  const trebleFilter = ctx.createBiquadFilter()
  trebleFilter.type = 'highshelf'
  trebleFilter.frequency.value = 4000
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

function recomputeGain(id) {
  const ch = channelNodes[id]
  if (!ch || !ctx) return
  ch.gainNode.gain.setTargetAtTime(
    ch.active ? ch.volume / 100 : 0,
    ctx.currentTime, 0.015
  )
}

async function decodeFile(url) {
  const resp = await fetch(url)
  const buf = await resp.arrayBuffer()
  return ctx.decodeAudioData(buf)
}

export async function initAudio(onProgress) {
  if (ctx) return

  ctx = new (window.AudioContext || window.webkitAudioContext)()

  masterGain = ctx.createGain()
  masterGain.gain.value = 0.75

  // Brick-wall limiter: high ratio, fast attack, no knee
  // At threshold=0dB (knob=100) the compressor is transparent; peaks are only limited
  // when the knob is turned down. postLimiterGain cancels Web Audio's automatic makeup
  // gain so quiet parts stay at the same level regardless of threshold setting.
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

  masterGain.connect(limiter)
  limiter.connect(postLimiterGain)
  postLimiterGain.connect(outputGain)
  outputGain.connect(ctx.destination)

  for (let id = 1; id <= 16; id++) buildChannelChain(id)

  // Decode all available files in parallel, reporting progress as each one finishes
  const total = Object.keys(AUDIO_URLS).length
  let done = 0
  const buffers = {}
  await Promise.all(
    Object.entries(AUDIO_URLS).map(async ([name, url]) => {
      buffers[name] = await decodeFile(url)
      done++
      onProgress?.(done, total)
    })
  )

  const pendingSources = []

  function makeAnalyser(fileKey) {
    const a = ctx.createAnalyser()
    a.fftSize = 256
    a.smoothingTimeConstant = 0.75
    analysers[fileKey] = a
    analyserBufs[fileKey] = new Float32Array(a.fftSize)
    return a
  }

  for (const [filename, [leftId, rightId]] of Object.entries(STEREO_FILE_MAP)) {
    const buffer = buffers[filename]
    if (!buffer) continue
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const analyser = makeAnalyser(filename)
    source.connect(analyser)
    if (buffer.numberOfChannels >= 2) {
      const splitter = ctx.createChannelSplitter(2)
      analyser.connect(splitter)
      splitter.connect(channelNodes[leftId].gainNode, 0)
      splitter.connect(channelNodes[rightId].gainNode, 1)
    } else {
      analyser.connect(channelNodes[leftId].gainNode)
      analyser.connect(channelNodes[rightId].gainNode)
    }
    pendingSources.push(source)
  }

  for (const [filename, channelId] of Object.entries(MONO_FILE_MAP)) {
    const buffer = buffers[filename]
    if (!buffer) continue
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const analyser = makeAnalyser(filename)
    source.connect(analyser)
    // Downmix to true mono: if the MP3 was encoded stereo (reverb tails, etc.)
    // this strips the stereo image so the StereoPanner positions it correctly.
    const monoMix = ctx.createGain()
    monoMix.channelCount = 1
    monoMix.channelCountMode = 'explicit'
    analyser.connect(monoMix)
    monoMix.connect(channelNodes[channelId].gainNode)
    pendingSources.push(source)
  }

  // Start all sources at the same moment
  const startTime = ctx.currentTime + 0.05
  pendingSources.forEach(s => s.start(startTime))
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

export function setLimiterThreshold(value) {
  if (!limiter || !postLimiterGain || !ctx) return
  // Knob 100→0 maps to threshold 0dB→-20dB.
  // 0dB = fully transparent; -20dB = aggressive peak limiting.
  const threshold_dB = -(100 - value) * 0.2
  limiter.threshold.setTargetAtTime(threshold_dB, ctx.currentTime, 0.015)
  // Cancel Web Audio's automatic makeup gain: makeup = -threshold * (1 - 1/ratio) dB.
  // Compensation (linear) = inverse of that: 10^(threshold * (1 - 1/ratio) / 20)
  const compensation = Math.pow(10, threshold_dB * (1 - 1 / limiter.ratio.value) / 20)
  postLimiterGain.gain.setTargetAtTime(compensation, ctx.currentTime, 0.015)
}

export function setOutputLevel(value) {
  if (!outputGain || !ctx) return
  outputGain.gain.setTargetAtTime(value / 100, ctx.currentTime, 0.015)
}

export async function stopAudio() {
  if (!ctx) return
  await ctx.close()
  ctx = null
  masterGain = null
  limiter = null
  postLimiterGain = null
  outputGain = null
  Object.keys(analysers).forEach(k => delete analysers[k])
  Object.keys(analyserBufs).forEach(k => delete analyserBufs[k])
  Object.keys(channelNodes).forEach(k => delete channelNodes[k])
}

export function setChannelEQ(id, { bass, mid, freq, treble }) {
  const ch = channelNodes[id]
  if (!ch || !ctx) return
  // 0–100 → -12 to +12 dB
  ch.bassFilter.gain.setTargetAtTime((bass - 50) / 50 * 12, ctx.currentTime, 0.015)
  ch.midFilter.gain.setTargetAtTime((mid - 50) / 50 * 12, ctx.currentTime, 0.015)
  ch.trebleFilter.gain.setTargetAtTime((treble - 50) / 50 * 12, ctx.currentTime, 0.015)
  // freq 0–100 → 200 Hz to 8000 Hz (log scale)
  ch.midFilter.frequency.setTargetAtTime(200 * Math.pow(40, freq / 100), ctx.currentTime, 0.015)
}
