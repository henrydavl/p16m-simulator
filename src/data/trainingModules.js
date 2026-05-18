// Training module definitions.
// Each milestone.content is a placeholder — replace with real material when ready.
// Structure: Module → Milestones (sequential). All milestones in a module must be
// completed before the module is considered done.

export const MODULES = [
  {
    id: 1,
    title: 'Device Overview',
    description: 'Get familiar with the P16-M layout and its main sections.',
    milestones: [
      {
        id: 1,
        title: 'What Is the P16-M?',
        content: 'TODO: Introduction to the Behringer Powerplay P16-M — its purpose as a personal monitor mixer, typical live/studio use cases, and how it fits into a stage setup.',
      },
      {
        id: 2,
        title: 'Panel Layout',
        content: 'TODO: Walk through the physical layout — channel strip section, EQ section, PAN/BAL section, OUTPUT section, SETUP buttons. Identify each control on the simulator.',
      },
      {
        id: 3,
        title: 'Channel Strips',
        content: 'TODO: Explain the 16 channel strips, the SELECT button, LED indicator, channel label. Cover stereo pairs (1-2 DRUM, 3-4 KEYS, 5-6 SEQ) vs. mono channels.',
      },
    ],
  },
  {
    id: 2,
    title: 'Channel Control',
    description: 'Select channels and control their individual levels, solo, and mute.',
    milestones: [
      {
        id: 1,
        title: 'Selecting a Channel',
        content: 'TODO: How channel selection works — pressing SELECT highlights the channel. Context-sensitive controls (VOLUME, PAN/BAL, EQ) then act on the selected channel. Stereo pairs always select together.',
      },
      {
        id: 2,
        title: 'Volume Control',
        content: 'TODO: The VOLUME knob is context-sensitive. When a channel is selected it controls that channel\'s level; when MAIN is selected it controls the overall mix. The knob remembers each channel\'s position.',
      },
      {
        id: 3,
        title: 'Solo & Mute',
        content: 'TODO: MUTE silences a channel. SOLO makes only that channel audible. Solo overrides mute. Multiple channels can be soloed at once. Both buttons act on whichever channel is currently selected.',
      },
    ],
  },
  {
    id: 3,
    title: 'EQ & PAN',
    description: 'Shape the tone and stereo position of each channel and the master mix.',
    milestones: [
      {
        id: 1,
        title: 'Equalizer Basics',
        content: 'TODO: The four EQ knobs (BASS, MID, FREQ, TREBLE) act on the selected channel. Center position (50%) = flat/neutral. FREQ sets the centre frequency of the mid-peaking band (200 Hz – 8 kHz).',
      },
      {
        id: 2,
        title: 'PAN / BAL',
        content: 'TODO: For mono channels, PAN positions the sound in the stereo field. For stereo pairs, the knob is a BAL (balance) control — center = natural L/R stereo, turning adjusts the image without collapsing it.',
      },
      {
        id: 3,
        title: 'Master EQ & PAN',
        content: 'TODO: Selecting MAIN routes EQ and PAN to the master chain, affecting the entire mix output. Useful for overall tone shaping and headphone comfort.',
      },
    ],
  },
  {
    id: 4,
    title: 'Output & Protection',
    description: 'Set the final output level and protect your hearing with the limiter.',
    milestones: [
      {
        id: 1,
        title: 'LIMITER Knob',
        content: 'TODO: The LIMITER sets the threshold of a brick-wall peak limiter on the master output. Fully clockwise = transparent (no limiting). Turning counterclockwise lowers the threshold, clamping loud peaks — essential for hearing protection on IEMs.',
      },
      {
        id: 2,
        title: 'OUTPUT LEVEL',
        content: 'TODO: The LEVEL knob is the final output gain stage — controls headphone/IEM loudness independently of the mix balance. Use LEVEL for "how loud", use channel volumes for "mix balance".',
      },
    ],
  },
]
