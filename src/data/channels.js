export const CHANNELS = [
  { id: 1,  label: 'DRUM L',  type: 'stereo', trackKey: 'DRUM'    },
  { id: 2,  label: 'DRUM R',  type: 'stereo', trackKey: 'DRUM'    },
  { id: 3,  label: 'KEYS L',  type: 'stereo', trackKey: 'KEYS'    },
  { id: 4,  label: 'KEYS R',  type: 'stereo', trackKey: 'KEYS'    },
  { id: 5,  label: 'SEQ L',   type: 'stereo', trackKey: 'SEQ'     },
  { id: 6,  label: 'SEQ R',   type: 'stereo', trackKey: 'SEQ'     },
  { id: 7,  label: 'SYNTH',   type: 'mono',   trackKey: 'SYNTH'   },
  { id: 8,  label: 'BASS',    type: 'mono',   trackKey: 'BASS'    },
  { id: 9,  label: 'GTR 1',   type: 'mono',   trackKey: 'GTR 1'   },
  { id: 10, label: 'GTR 2',   type: 'mono',   trackKey: 'GTR 2'   },
  { id: 11, label: 'VIO',     type: 'mono',   trackKey: 'VIO'     },
  { id: 12, label: 'SAXO',    type: 'mono',   trackKey: 'SAXO'    },
  { id: 13, label: 'ALL VCL', type: 'mono',   trackKey: 'ALL VCL' },
  { id: 14, label: 'MD',      type: 'mono',   trackKey: 'MD'      },
  { id: 15, label: 'CLICK',   type: 'mono',   trackKey: 'CLICK'   },
  { id: 16, label: 'ACC',     type: 'mono',   trackKey: 'ACC'     },
]

export const INITIAL_CHANNEL_STATE = {
  volume: 0,
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
  volume: 0,
  limiter: 100, // far RIGHT = limiter off / transparent — clean starting point
  outputLevel: 0,
  selected: false,
  bass: 50,
  mid: 50,
  freq: 50,
  treble: 50,
  pan: 0,
}
