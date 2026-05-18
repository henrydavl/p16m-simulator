// P16-M Worship Team Training Guide
// Source: P16M_Training_Guide.pdf — Kevin Award Armeldo & Henry David Lie
//
// Milestone content uses \n\n for paragraph breaks (rendered with white-space: pre-line).
// Milestones with a `quiz` array show interactive multiple-choice questions;
// all must be answered correctly before the milestone can be marked complete.

export const MODULES = [
  {
    id: 1,
    title: 'Device Basics',
    description: 'Understand what the P16-M is and how your 16 channels are laid out.',
    milestones: [
      {
        id: 1,
        title: 'What is the P16-M?',
        content: `The Behringer Powerplay P16-M is a personal in-ear monitor mixer. It lets each musician on stage control their own headphone mix — independently from the main FOH (front of house) mix.

Instead of asking the sound engineer to "turn up the drums in my ears," you control your own blend right on this unit. Your adjustments do NOT affect the main speakers or any other musician's monitor mix.

HOW IT FITS IN YOUR CHURCH SETUP

1. The main console sends all 16 channels via a single AES50 / Ultranet cable to a P16-D distributor.
2. The distributor feeds up to 8 P16-M units — one for each musician (drummer, keys player, guitarist, etc.).
3. Each musician plugs their in-ear monitors or headphones into their P16-M and controls their own mix.
4. Your mix changes do NOT affect the main speaker sound or anyone else's monitor mix.

PRO TIP: When you first sit down, set all channels to 0 and start fresh. Slowly bring up your own instrument first, then add what you need for timing (drums/click), then blend in the rest.`,
      },
      {
        id: 2,
        title: 'Your Channel Map',
        content: `All 16 channels are pre-assigned to specific instruments in your church setup. Knowing which channel is which lets you dial in your mix quickly during soundcheck.

⚠️ IMPORTANT: Channel assignments may differ between campuses. Always confirm with your campus sound team before your first rehearsal.

CH 01 — DRUM L: Left overhead / drum room mic. Pan left for stereo image.
CH 02 — DRUM R: Right overhead / room mic. Pair with Ch.01, pan right.
CH 03 — KEYS L: Left output of keyboard/piano. Pan slightly left.
CH 04 — KEYS R: Right output of keyboard/piano. Pan slightly right.
CH 05 — SEQ L: Left output of sequencer / backing track player.
CH 06 — SEQ R: Right output of sequencer / backing tracks.
CH 07 — SYNTH: Synthesizer or secondary keyboard (pads, leads). Usually mono.
CH 08 — BASS: Bass guitar DI. Keep prominent for groove and timing reference.
CH 09 — GTR 1: First electric guitar. Rhythm guitarist or worship leader's guitar.
CH 10 — GTR 2: Second electric guitar. Lead or acoustic guitar DI.
CH 11 — VIO: Violin / strings. Can be piercing at high IEM volumes — keep moderate.
CH 12 — SAXO: Saxophone. Keep at moderate level unless you are the sax player.
CH 13 — ALL VCL: All vocals bus — blend of all vocal mics. Important for cues.
CH 14 — MD: Music Director mic — count-ins, cues, and communication.
CH 15 — CLICK: Metronome click track. Critical for tight timing. Keep it clear!
CH 16 — ACC: Accordion or additional acoustic instrument.`,
      },
    ],
  },
  {
    id: 2,
    title: 'Controls Explained',
    description: 'Learn every knob, fader, and button on the P16-M.',
    milestones: [
      {
        id: 1,
        title: 'EQ Knobs',
        content: `The four EQ knobs shape the tone of your monitor mix. They act on the selected channel — or on the full mix when MAIN is selected. Center position (50%) is always flat/neutral.

BASS — Low Frequency EQ | ±12 dB @ 100 Hz, shelving
Shelving EQ fixed at 100 Hz. Affects all frequencies below 100 Hz equally. Boost if your mix feels thin and lacks warmth. Cut if it sounds boomy or muddy. Small adjustments go a long way.

MID — Midrange EQ | ±12 dB, semi-parametric
Semi-parametric midrange with up to 12 dB of boost or cut. Use with the FREQ knob to target a specific frequency. This is where vocals and instruments sit — a slight cut can reduce harshness; too much boost makes the mix sound "honky."

FREQ — Mid Frequency Sweep | 100 Hz to 10 kHz
Sweeps the center frequency of the MID band. Turn FREQ while boosting MID to find the problem frequency, then cut it back. This is the most surgical EQ tool on the unit — use it to zero in on harshness or muddiness.

TREBLE — High Frequency EQ | ±12 dB @ 10 kHz, shelving
Shelving EQ fixed at 10 kHz. Affects all frequencies above 10 kHz equally. Boost for more "air" and clarity on cymbals or acoustic guitar. Cut if your mix is too bright or sibilant (harsh "s" sounds in vocals).`,
      },
      {
        id: 2,
        title: 'Volume, Limiter & Output',
        content: `VOLUME — Master Volume
The main knob. Controls your total mix loudness. Start at 50% and adjust. Never max this out — protect your hearing, especially during a long service.

LIMITER — Peak Protection | Ratio 1:∞
Hard-limiting that clamps the signal completely once it hits the threshold, preventing any peaks above that level. Sets a hard ceiling on the maximum output volume. Set this BEFORE every service to protect your hearing from sudden loud spikes.

LEVEL — Output Level
Sets the final output level going to your IEM or headphones. This is separate from master VOLUME. Use it to trim if one side feels louder than the other.

PAN/BAL — Stereo Position
For stereo channel pairs (like DRUM L/R or KEYS L/R), pan each channel left or right to preserve the stereo image. For mono sources, center is usually best unless you want spatial separation.

CHANNEL FADERS — Individual Channel Volume
The vertical sliders at the bottom. Each controls how loud one specific instrument is in your headphones. This is your primary mixing tool — use it the most.

STORE — Save User Preset
Saves your current mix settings to one of the 16 available user presets. Use after dialing in a mix so you can recall it instantly at the next rehearsal or service.

RECALL — Load User Preset
Loads one of the 16 saved user presets. Great for switching between different service configurations quickly.`,
      },
      {
        id: 3,
        title: 'Workflow: Dialing In Your Mix',
        content: `Follow this order every time you sit down at the P16-M during soundcheck:

STEP 1 — SELECT A CHANNEL
Press its number button at the bottom of the unit.

STEP 2 — ADJUST THE CHANNEL FADER
The vertical slider sets that instrument's volume in your ears.

STEP 3 — SET PAN / BALANCE
For stereo pairs (drum L/R, keys L/R), pan them left and right respectively.

STEP 4 — USE EQ SPARINGLY
Bass/Mid/Treble adjust the selected channel's tone. Only touch EQ if the sound is genuinely too harsh or muddy — small cuts are almost always better than big boosts.

STEP 5 — SET MASTER VOLUME
Start at 50% and increase slowly. Keep under 75% to protect your hearing.

STEP 6 — SET THE LIMITER
Set a safe ceiling before the service starts. Treat this as a non-negotiable step every single time.`,
      },
    ],
  },
  {
    id: 3,
    title: 'Safety & Real World',
    description: 'Protect your hearing and handle common on-stage situations confidently.',
    milestones: [
      {
        id: 1,
        title: 'Hearing Safety',
        content: `⚠️ HEARING WARNING
In-ear monitors deliver sound directly into your ear canal. Long services at high volume cause permanent, irreversible hearing damage. Use the LIMITER knob to set a ceiling, and reduce volume immediately if you feel ringing after rehearsal.

VOLUME LIMIT
Keep master VOLUME below 75%. Louder does not mean better — it means faster hearing damage.

USE THE LIMITER
Set the LIMITER knob before every service. It acts as a safety ceiling for sudden peaks — a loud intro or drummer hit can spike far above your normal listening level.

TAKE BREAKS
During long rehearsals, remove your IEMs for a few minutes every hour. Let your ears recover.

WATCH FOR RINGING
If your ears ring after rehearsal, that is a warning sign. Reduce your volume next time. Tinnitus (ringing) is cumulative damage.

FIT MATTERS
A good IEM seal blocks ambient stage noise, which means you don't need to fight volume with more volume. Invest in well-fitting earpieces — it protects your hearing and improves your mix quality.`,
      },
      {
        id: 2,
        title: 'Real-World Scenarios',
        content: `Here are common situations you'll face and how to fix them on the P16-M:

CAN'T HEAR THE CLICK TRACK
Problem: You keep losing the beat because the click is buried.
Fix: Press channel 15 (CLICK). Raise the fader. If still buried, slightly lower all other channels so the click cuts through. It should be clearly audible without being painfully loud.

IEMs SOUND TOO HARSH
Problem: The mix is uncomfortably bright — cymbals and vocals are piercing.
Fix: Press MAIN, then slightly reduce TREBLE in the EQ section. If that's not enough, use MID and FREQ together: sweep FREQ while cutting MID to pinpoint and reduce the harsh frequency.

CAN'T HEAR YOURSELF PLAYING
Problem: Your instrument is completely lost in the mix.
Fix: Press your channel (e.g., Ch.09 GTR1) and raise the fader significantly. Then slightly reduce channels you don't need as much to make room in your headphone mix.

MIX IS TOO QUIET OVERALL
Problem: Even with VOLUME up, everything sounds too soft.
Fix: Press MAIN and check the main volume. Verify your IEM cable is fully plugged in. Check the LEVEL knob (output trim) and raise it if needed. Do NOT raise individual channels to max — that causes distortion.

NO SOUND AT ALL
Problem: You plug in but hear absolutely nothing.
Fix (check in order):
1. Is the Ultranet/AES50 cable connected to the unit?
2. Is VOLUME above 0?
3. Are your IEMs fully plugged in?
4. Is the unit powered on? (ULTRANET indicator light should be green)`,
      },
      {
        id: 3,
        title: 'Common Mistakes to Avoid',
        content: `MAXING THE VOLUME KNOB
This damages your hearing and causes distortion. Start at 50% and work up gradually.

BOOSTING ALL EQ BANDS
Boosting bass, mid, and treble together just raises the volume — not clarity. The rule: cut what is bad rather than boosting everything.

PULLING A MIC CHANNEL TOO HIGH
Can create uncomfortable resonance. Keep mic channels (especially overhead/room mics) at moderate levels.

SKIPPING SOUNDCHECK
Always dial in your mix before the service with your IEMs physically in place. The mix sounds very different in your ears vs. open air — what sounds balanced in a quiet room may feel completely wrong on stage.

NOT RESETTING BETWEEN USERS
If someone else used your unit, always start from scratch. Their mix is calibrated for their ears and their instrument — not yours.

IGNORING THE LIMITER
Set it every time. It takes 5 seconds and protects your hearing for a lifetime.`,
      },
    ],
  },
  {
    id: 4,
    title: 'Knowledge Check',
    description: 'Test your understanding with a quiz, then review the quick reference.',
    milestones: [
      {
        id: 1,
        title: 'Quiz — 5 Questions',
        content: 'Answer all 5 questions correctly to complete this milestone. Select an answer for each question, then press CHECK ANSWERS.',
        quiz: [
          {
            question: 'Which control adjusts the treble frequencies for your entire mix?',
            options: [
              'Channel fader',
              'TREBLE knob in the EQ section',
              'Master VOLUME knob',
              'LIMITER knob',
            ],
            correct: 1,
            explanation: 'The TREBLE knob in the EQ section affects high frequencies across your whole mix. Channel faders only control one channel\'s volume.',
          },
          {
            question: 'A musician says "I need the engineer to turn up the keys in my ears." What should actually happen?',
            options: [
              'The FOH engineer adjusts the main mix',
              'The musician adjusts channels 3 & 4 on their P16-M',
              'The musician raises the master VOLUME',
              'The musician presses SOLO on channels 3 & 4',
            ],
            correct: 1,
            explanation: 'The whole point of the P16-M is personal control. Channels 3 (KEYS L) and 4 (KEYS R) are the keyboard channels — adjust them yourself.',
          },
          {
            question: 'What does the LIMITER knob do?',
            options: [
              'Mutes all channels simultaneously',
              'Sets a maximum volume ceiling to protect your hearing',
              'Boosts all bass frequencies',
              'Controls the click track volume',
            ],
            correct: 1,
            explanation: 'The LIMITER sets a peak output ceiling. Set it before each service so sudden loud sounds cannot damage your hearing.',
          },
          {
            question: 'The click track is on which channel?',
            options: [
              'Channel 8',
              'Channel 13',
              'Channel 15',
              'Channel 16',
            ],
            correct: 2,
            explanation: 'Channel 15 is labeled CLICK. Drummers and bass players especially should keep this clearly audible for tight timing.',
          },
          {
            question: 'Your mix sounds boomy and muddy. Which EQ knob do you reduce?',
            options: [
              'TREBLE',
              'MID',
              'FREQ',
              'BASS',
            ],
            correct: 3,
            explanation: 'The BASS knob controls low frequencies. A muddy mix has too much bass — a small cut cleans it up significantly.',
          },
        ],
      },
      {
        id: 2,
        title: 'Quick Reference',
        content: `Keep this reference in mind during every rehearsal and service.

CONTROL QUICK REFERENCE:
BASS knob ........... Boosts/cuts low freq | Use when: mix sounds boomy (cut) or thin (boost)
MID knob ............ Boosts/cuts midrange | Use when: mix sounds harsh or honky
FREQ knob ........... Sweeps mid frequency | Use when: pair with MID to find the harsh freq
TREBLE knob ......... Boosts/cuts high freq | Use when: too bright (cut) or dull (boost)
LIMITER ............. Sets max volume ceiling | Use when: BEFORE every single service
LEVEL ............... Output trim | Use when: one side louder than the other
PAN/BAL ............. Stereo positioning | Use when: setting up stereo pairs like drums/keys
VOLUME .............. Master loudness | Use when: overall mix too quiet or too loud
Channel fader ....... Individual channel volume | Use when: ANY time — this is your main tool
CH 15 (CLICK) ....... Metronome click track | Use when: raise when you lose the beat
CH 13 (ALL VCL) ..... All vocals blend | Use when: need to hear melody or lyrics clearly

NO SOUND? CHECK IN ORDER:
1. Ultranet/AES50 cable is connected to the unit
2. VOLUME knob is above 0
3. IEMs/headphones are fully plugged in
4. Unit is powered on — ULTRANET indicator light should be green
5. At least one channel fader is raised above 0

PRO TIP: Practice on the simulator at p16-simulator.cloud before your next rehearsal. Explore each channel and knob until the layout feels completely natural.`,
      },
    ],
  },
]
