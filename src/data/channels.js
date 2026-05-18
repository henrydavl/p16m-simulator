export const CHANNELS = [
  { id: 1,  label: 'DRUM L',  type: 'stereo' },
  { id: 2,  label: 'DRUM R',  type: 'stereo' },
  { id: 3,  label: 'KEYS L',  type: 'stereo' },
  { id: 4,  label: 'KEYS R',  type: 'stereo' },
  { id: 5,  label: 'SEQ L',   type: 'stereo' },
  { id: 6,  label: 'SEQ R',   type: 'stereo' },
  { id: 7,  label: 'SYNTH',   type: 'mono' },
  { id: 8,  label: 'BASS',    type: 'mono' },
  { id: 9,  label: 'GTR 1',   type: 'mono' },
  { id: 10, label: 'GTR 2',   type: 'mono' },
  { id: 11, label: 'VIO',     type: 'mono' },
  { id: 12, label: 'SAXO',    type: 'mono' },
  { id: 13, label: 'ALL VCL', type: 'mono' },
  { id: 14, label: 'MD',      type: 'mono' },
  { id: 15, label: 'CLICK',   type: 'mono' },
  { id: 16, label: 'ACC',     type: 'mono' },
]

export const INITIAL_CHANNEL_STATE = {
  volume: 75,
  pan: 0,
  mute: false,
  solo: false,
  selected: false,
  bass: 50,
  mid: 50,
  freq: 50,
  treble: 50,
}

export const INITIAL_MASTER_STATE = {
  volume: 75,
  limiter: 100,
  outputLevel: 75,
  selected: false,
}
