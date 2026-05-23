// P16-M Worship Team Training Guide
// Source: P16M_Training_Guide.pdf (EN) / P16M_Panduan_Pelatihan.pdf (ID)
//         — Kevin Award Armeldo & Henry David Lie
//
// Bilingual training content. MODULES_EN and MODULES_ID share an identical
// structure (same module/milestone ids, highlights, and quiz `correct` indices) —
// only the human-readable strings differ. The training panel picks one by language.
//
// Milestone content uses \n\n for paragraph breaks (rendered with white-space: pre-line).
// Milestones with a `quiz` array show interactive multiple-choice questions;
// all must be answered correctly before the milestone can be marked complete.
// `highlight` maps each milestone to a mixer zone: 'eq' | 'pan' | 'col3' | 'channels' | null

export const MODULES_EN = [
  {
    id: 1,
    title: 'Device Basics',
    description: 'Understand what the P16-M is and how your 16 channels are laid out.',
    milestones: [
      {
        id: 1,
        title: 'What is the P16-M?',
        highlight: null,
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
        highlight: 'channels',
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
        highlight: 'eq',
        content: `The four EQ knobs shape the tone of your monitor mix. They act on the selected channel — or on the full mix when MAIN is selected. Center position (50%) is always flat/neutral.

BASS — Low Frequency EQ | ±12 dB, shelving
Fixed low-shelf at 200 Hz. Affects all frequencies below 200 Hz equally. Boost if your mix feels thin and lacks warmth. Cut if it sounds boomy or muddy. Small adjustments go a long way.

MID — Midrange EQ | ±12 dB, semi-parametric
Semi-parametric midrange with up to 12 dB of boost or cut. Use with the FREQ knob to target a specific frequency. This is where vocals and instruments sit — a slight cut can reduce harshness; too much boost makes the mix sound "honky."

FREQ — Mid Frequency Sweep | 200 Hz to 8 kHz
Sweeps the center frequency of the MID band. Turn FREQ while boosting MID to find the problem frequency, then cut it back. This is the most surgical EQ tool on the unit — use it to zero in on harshness or muddiness.

TREBLE — High Frequency EQ | ±12 dB, shelving
Fixed high-shelf at 4 kHz. Affects all frequencies above 4 kHz equally. Boost for more "air" and clarity on cymbals or acoustic guitar. Cut if your mix is too bright or sibilant (harsh "s" sounds in vocals).

RULE OF THUMB: Cut what sounds bad rather than boosting everything. Boosting bass, mid, and treble together just raises volume — not clarity.`,
      },
      {
        id: 2,
        title: 'Volume, Limiter & Output Level',
        highlight: 'col3',
        content: `These three controls live in the OUTPUT / VOLUME section on the right side of the unit.

VOLUME — Master Mix Level
The main knob. Controls your total mix loudness in your ears. Start at 50% and adjust from there. Never max this out — protect your hearing, especially during a long service.

LIMITER — Peak Protection
Hard-limiting that clamps the signal completely once it hits the threshold, preventing any peaks above that ceiling. Set this BEFORE every service — it is your safety net against sudden loud spikes (a drummer hitting the kit hard, a mic bump, etc.).

LEVEL — Output Trim
Sets the final output level going to your IEM or headphones. This is separate from master VOLUME. Use it to fine-tune if one side of your IEMs feels louder than the other, or if your IEMs are inherently louder than your headphones.

QUICK ORDER OF OPERATIONS
1. Set LIMITER first (safety ceiling)
2. Set LEVEL for your IEM sensitivity
3. Use VOLUME as your everyday loudness control`,
      },
      {
        id: 3,
        title: 'Pan, Balance & Channel Faders',
        highlight: ['pan', 'channels'],
        content: `PAN/BAL — Stereo Position
For stereo channel pairs (like DRUM L/R or KEYS L/R), the knob acts as a balance control — it shifts the stereo image left or right. Center always restores natural stereo (L hard-left, R hard-right).

For mono channels (SYNTH, BASS, GTR 1, etc.), center is usually best unless you intentionally want that instrument positioned to one side.

STEREO IMAGING PRINCIPLE
The P16-M defaults each stereo pair to hard-left and hard-right. This preserves the original recording's stereo spread. Moving the balance control shifts the whole image — turning it counter-clockwise pulls it left, clockwise pushes it right.

CHANNEL FADERS — Individual Channel Volume
Each channel button selects that instrument. Its volume is controlled by the VOLUME knob while it is selected. This is your primary mixing tool — you will use this the most.

MIXING IN LAYERS
• Your own instrument: slightly above everything else
• Timing references (CLICK, BASS, DRUMS): clearly audible, not dominant
• Supporting parts (KEYS, SEQ, GTR): background blend
• Vocals (ALL VCL, MD): prominent enough to hear cues and lyrics

STORE / RECALL (Hardware Feature)
On the physical P16-M, STORE saves your current mix to one of 16 presets and RECALL loads it back. This is useful between rehearsals. These buttons are present on the device but are not yet implemented in this simulator.`,
      },
      {
        id: 4,
        title: 'Workflow: Dialing In Your Mix',
        highlight: null,
        content: `Follow this order every time you sit down at the P16-M during soundcheck:

STEP 1 — SELECT A CHANNEL
Press its number button at the bottom of the unit.

STEP 2 — ADJUST THE CHANNEL FADER
The VOLUME knob sets that instrument's level in your ears while the channel is selected.

STEP 3 — SET PAN / BALANCE
For stereo pairs (DRUM L/R, KEYS L/R), keep them hard-left and hard-right respectively. Only adjust balance if the stereo image feels wrong.

STEP 4 — USE EQ SPARINGLY
BASS/MID/TREBLE adjust the selected channel's tone. Only touch EQ if the sound is genuinely too harsh or muddy — small cuts are almost always better than big boosts.

STEP 5 — SET MASTER VOLUME
Press MAIN, then bring VOLUME to 50% and increase slowly. Stay under 75% to protect your hearing.

STEP 6 — SET THE LIMITER
Set a safe ceiling before the service starts. Treat this as a non-negotiable step every single time — it takes 5 seconds and protects your hearing for a lifetime.`,
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
        highlight: 'col3',
        content: `⚠️ HEARING WARNING
In-ear monitors deliver sound directly into your ear canal. Long services at high volume cause permanent, irreversible hearing damage. Use the LIMITER knob to set a ceiling, and reduce volume immediately if you feel ringing after rehearsal.

VOLUME LIMIT
Keep master VOLUME below 75%. Louder does not mean better — it means faster hearing damage.

USE THE LIMITER
Set the LIMITER knob before every service. It acts as a safety ceiling for sudden peaks — a loud intro or drummer hit can spike far above your normal listening level.

TAKE BREAKS
During long rehearsals, remove your IEMs for a few minutes every hour. Let your ears recover.

WATCH FOR RINGING
If your ears ring after rehearsal, that is a warning sign. Reduce your volume next time. Tinnitus (ringing) is cumulative damage — it does not heal.

FIT MATTERS
A good IEM seal blocks ambient stage noise, which means you don't need to fight volume with more volume. Invest in well-fitting earpieces — it protects your hearing and improves your mix quality.`,
      },
      {
        id: 2,
        title: 'Real-World Scenarios',
        highlight: null,
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
        highlight: null,
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
        highlight: null,
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
        highlight: null,
        content: `Keep this cheat sheet in mind during every rehearsal and service.

CONTROL QUICK REFERENCE:
BASS knob ........... Boosts/cuts low freq | Use when: mix sounds boomy (cut) or thin (boost)
MID knob ............ Boosts/cuts midrange | Use when: mix sounds harsh or honky
FREQ knob ........... Sweeps mid frequency | Use when: pair with MID to find the harsh freq
TREBLE knob ......... Boosts/cuts high freq | Use when: too bright (cut) or dull (boost)
LIMITER ............. Sets max volume ceiling | Use when: BEFORE every single service
LEVEL ............... Output trim | Use when: one side louder or IEMs too quiet/loud
PAN/BAL ............. Stereo positioning | Use when: setting up stereo pairs like drums/keys
VOLUME .............. Master loudness | Use when: overall mix too quiet or too loud
Channel fader ....... Individual channel volume | Use when: ANY time — this is your main tool
CH 15 (CLICK) ....... Metronome click track | Use when: raise when you lose the beat
CH 13 (ALL VCL) ..... All vocals blend | Use when: need to hear melody or lyrics clearly

PRO TIP: Practice on the simulator at p16-simulator.cloud before your next rehearsal. Explore each channel and knob until the layout feels completely natural.`,
      },
    ],
  },
]

// ─── Indonesian (ID) ───────────────────────────────────────────────────────────
// Same structure as MODULES_EN. Technical specs (EQ frequencies, etc.) are kept
// aligned with the actual simulator behaviour and the EN copy.

export const MODULES_ID = [
  {
    id: 1,
    title: 'Dasar Perangkat',
    description: 'Pahami apa itu P16-M dan bagaimana 16 channel-mu ditata.',
    milestones: [
      {
        id: 1,
        title: 'Apa itu P16-M?',
        highlight: null,
        content: `Behringer Powerplay P16-M adalah personal in-ear monitor mixer. Perangkat ini memungkinkan setiap musisi di atas panggung untuk mengatur mix headphone mereka sendiri — secara independen dari mix utama FOH (front of house).

Alih-alih meminta sound engineer untuk "naikkan drum di telingaku," kamu mengatur blend-mu sendiri langsung di perangkat ini. Perubahan yang kamu buat TIDAK memengaruhi speaker utama maupun mix monitor musisi lainnya.

BAGAIMANA P16-M MASUK DALAM SETUP GEREJAMU

1. Konsol utama mengirim semua 16 channel melalui satu kabel AES50 / Ultranet ke distributor P16-D.
2. Distributor menyalurkan sinyal ke hingga 8 unit P16-M — satu untuk setiap musisi (drummer, pemain keyboard, gitaris, dll.).
3. Setiap musisi menghubungkan in-ear monitor atau headphone mereka ke P16-M dan mengatur mix mereka sendiri.
4. Perubahan mix yang kamu buat TIDAK memengaruhi suara speaker utama atau mix monitor musisi lainnya.

TIPS: Saat pertama kali duduk, atur semua channel ke 0 dan mulai dari awal. Naikkan instrumenmu sendiri terlebih dahulu, lalu tambahkan yang kamu butuhkan untuk timing (drum/klik), kemudian blend sisanya secara perlahan.`,
      },
      {
        id: 2,
        title: 'Peta Channel-mu',
        highlight: 'channels',
        content: `Semua 16 channel telah ditetapkan ke instrumen tertentu dalam setup gerejamu. Mengetahui channel mana yang mana akan membantumu mengatur mix dengan cepat saat soundcheck.

⚠️ PENTING: Penetapan channel bisa berbeda antar kampus. Selalu konfirmasi dengan tim sound kampusmu sebelum latihan pertamamu.

CH 01 — DRUM L: Mic overhead kiri / drum room. Pan kiri untuk stereo image.
CH 02 — DRUM R: Mic overhead kanan / room. Pasangkan dengan Ch.01, pan kanan.
CH 03 — KEYS L: Output kiri keyboard/piano. Pan sedikit ke kiri.
CH 04 — KEYS R: Output kanan keyboard/piano. Pan sedikit ke kanan.
CH 05 — SEQ L: Output kiri sequencer / pemutar backing track.
CH 06 — SEQ R: Output kanan sequencer / backing track.
CH 07 — SYNTH: Synthesizer atau keyboard kedua (pad, lead). Biasanya mono.
CH 08 — BASS: Bass gitar DI. Pertahankan menonjol untuk groove dan referensi timing.
CH 09 — GTR 1: Gitar elektrik pertama. Gitaris rhythm atau worship leader.
CH 10 — GTR 2: Gitar elektrik kedua. Gitaris lead atau gitar akustik DI.
CH 11 — VIO: Biola / strings. Bisa terdengar tajam di volume IEM tinggi — jaga tetap sedang.
CH 12 — SAXO: Saxophone. Jaga di level sedang kecuali kamu pemain sax-nya.
CH 13 — ALL VCL: Bus semua vokal — blend semua mic vokal. Penting untuk cue.
CH 14 — MD: Mic Music Director — aba-aba, hitungan, dan komunikasi.
CH 15 — CLICK: Metronom click track. Sangat penting untuk timing. Jaga agar jelas!
CH 16 — ACC: Akordion atau instrumen akustik tambahan.`,
      },
    ],
  },
  {
    id: 2,
    title: 'Penjelasan Kontrol',
    description: 'Pelajari setiap knob, fader, dan tombol pada P16-M.',
    milestones: [
      {
        id: 1,
        title: 'Knob EQ',
        highlight: 'eq',
        content: `Empat knob EQ membentuk karakter suara mix monitormu. Knob bekerja pada channel yang dipilih — atau pada seluruh mix saat MAIN dipilih. Posisi tengah (50%) selalu flat/netral.

BASS — EQ Frekuensi Rendah | ±12 dB, shelving
Low-shelf tetap di 200 Hz. Memengaruhi semua frekuensi di bawah 200 Hz secara merata. Boost jika mix terasa tipis dan kurang hangat. Cut jika terdengar berdengung atau berlumpur. Penyesuaian kecil sudah sangat terasa.

MID — EQ Midrange | ±12 dB, semi-parametrik
Midrange semi-parametrik dengan boost atau cut hingga 12 dB. Gunakan bersama knob FREQ untuk menargetkan frekuensi tertentu. Di sinilah vokal dan instrumen berada — sedikit cut bisa mengurangi ketajaman; terlalu banyak boost membuat mix terdengar "sengau."

FREQ — Sapuan Frekuensi Mid | 200 Hz hingga 8 kHz
Menyapu frekuensi tengah band MID. Putar FREQ sambil boost MID untuk menemukan frekuensi bermasalah, lalu cut. Ini alat EQ paling presisi di unit ini — gunakan untuk menargetkan ketajaman atau kekeruhan.

TREBLE — EQ Frekuensi Tinggi | ±12 dB, shelving
High-shelf tetap di 4 kHz. Memengaruhi semua frekuensi di atas 4 kHz secara merata. Boost untuk menambah "udara" dan kejernihan pada simbal atau gitar akustik. Cut jika mix terlalu terang atau sibilant (bunyi "s" tajam pada vokal).

ATURAN PRAKTIS: Cut yang terdengar buruk daripada boost semuanya. Mem-boost bass, mid, dan treble bersamaan hanya menaikkan volume — bukan kejernihan.`,
      },
      {
        id: 2,
        title: 'Volume, Limiter & Level Output',
        highlight: 'col3',
        content: `Ketiga kontrol ini berada di bagian OUTPUT / VOLUME di sisi kanan unit.

VOLUME — Level Mix Master
Knob utama. Mengontrol kerasnya seluruh mix di telingamu. Mulai dari 50% lalu sesuaikan. Jangan pernah dimaksimalkan — lindungi pendengaranmu, terutama saat ibadah panjang.

LIMITER — Perlindungan Puncak
Hard-limiting yang mengunci sinyal sepenuhnya begitu mencapai ambang batas, mencegah puncak apa pun melewati batas itu. Atur ini SEBELUM setiap ibadah — ini jaring pengamanmu terhadap lonjakan keras mendadak (drummer memukul keras, mic terbentur, dll.).

LEVEL — Trim Output
Mengatur level output akhir yang dikirim ke IEM atau headphone-mu. Ini terpisah dari VOLUME master. Gunakan untuk menyesuaikan jika satu sisi IEM terasa lebih keras, atau jika IEM-mu memang lebih keras dari headphone.

URUTAN CEPAT
1. Atur LIMITER terlebih dahulu (batas keamanan)
2. Atur LEVEL sesuai sensitivitas IEM-mu
3. Gunakan VOLUME sebagai kontrol kekerasan sehari-hari`,
      },
      {
        id: 3,
        title: 'Pan, Balance & Channel Fader',
        highlight: ['pan', 'channels'],
        content: `PAN/BAL — Posisi Stereo
Untuk pasangan channel stereo (seperti DRUM L/R atau KEYS L/R), knob bekerja sebagai kontrol balance — menggeser stereo image ke kiri atau kanan. Tengah selalu mengembalikan stereo alami (L hard-left, R hard-right).

Untuk channel mono (SYNTH, BASS, GTR 1, dll.), tengah biasanya paling baik kecuali kamu sengaja ingin instrumen itu diposisikan ke satu sisi.

PRINSIP STEREO IMAGING
P16-M menetapkan setiap pasangan stereo ke hard-left dan hard-right secara default. Ini menjaga sebaran stereo asli rekaman. Menggerakkan kontrol balance menggeser seluruh image — memutar berlawanan arah jarum jam menariknya ke kiri, searah jarum jam mendorongnya ke kanan.

CHANNEL FADER — Volume Channel Individual
Setiap tombol channel memilih instrumen tersebut. Volumenya diatur oleh knob VOLUME selama channel itu dipilih. Ini alat mixing utamamu — paling sering kamu gunakan.

MIXING BERLAPIS
• Instrumenmu sendiri: sedikit di atas yang lain
• Referensi timing (CLICK, BASS, DRUM): jelas terdengar, tidak dominan
• Bagian pendukung (KEYS, SEQ, GTR): blend latar
• Vokal (ALL VCL, MD): cukup menonjol untuk mendengar cue dan lirik

STORE / RECALL (Fitur Hardware)
Pada P16-M fisik, STORE menyimpan mix-mu ke salah satu dari 16 preset dan RECALL memuatnya kembali. Berguna antar latihan. Tombol ini ada di perangkat tetapi belum diimplementasikan di simulator ini.`,
      },
      {
        id: 4,
        title: 'Alur Kerja: Mengatur Mix-mu',
        highlight: null,
        content: `Ikuti urutan ini setiap kali kamu duduk di P16-M saat soundcheck:

LANGKAH 1 — PILIH SEBUAH CHANNEL
Tekan tombol nomornya di bagian bawah unit.

LANGKAH 2 — ATUR CHANNEL FADER
Knob VOLUME mengatur level instrumen itu di telingamu selama channel dipilih.

LANGKAH 3 — ATUR PAN / BALANCE
Untuk pasangan stereo (DRUM L/R, KEYS L/R), biarkan masing-masing hard-left dan hard-right. Sesuaikan balance hanya jika stereo image terasa salah.

LANGKAH 4 — GUNAKAN EQ SECUKUPNYA
BASS/MID/TREBLE menyesuaikan karakter suara channel yang dipilih. Sentuh EQ hanya jika suara benar-benar terlalu tajam atau berlumpur — cut kecil hampir selalu lebih baik daripada boost besar.

LANGKAH 5 — ATUR VOLUME MASTER
Tekan MAIN, lalu bawa VOLUME ke 50% dan naikkan perlahan. Tetap di bawah 75% untuk melindungi pendengaranmu.

LANGKAH 6 — ATUR LIMITER
Tetapkan batas aman sebelum ibadah dimulai. Jadikan ini langkah wajib setiap saat — hanya butuh 5 detik dan melindungi pendengaranmu seumur hidup.`,
      },
    ],
  },
  {
    id: 3,
    title: 'Keselamatan & Dunia Nyata',
    description: 'Lindungi pendengaranmu dan tangani situasi panggung umum dengan percaya diri.',
    milestones: [
      {
        id: 1,
        title: 'Keselamatan Pendengaran',
        highlight: 'col3',
        content: `⚠️ PERINGATAN PENDENGARAN
In-ear monitor mengirim suara langsung ke saluran telingamu. Ibadah panjang dengan volume tinggi menyebabkan kerusakan pendengaran permanen dan tidak dapat dipulihkan. Gunakan knob LIMITER untuk menetapkan batas, dan segera turunkan volume jika telingamu berdengung setelah latihan.

BATAS VOLUME
Jaga VOLUME master di bawah 75%. Lebih keras bukan berarti lebih baik — itu berarti kerusakan pendengaran lebih cepat.

GUNAKAN LIMITER
Atur knob LIMITER sebelum setiap ibadah. Ini berfungsi sebagai batas keamanan untuk puncak mendadak — intro keras atau pukulan drummer bisa melonjak jauh di atas level dengarmu yang biasa.

AMBIL JEDA
Saat latihan panjang, lepaskan IEM-mu beberapa menit setiap jam. Biarkan telingamu pulih.

PERHATIKAN DENGING
Jika telingamu berdengung setelah latihan, itu tanda peringatan. Kurangi volume-mu lain kali. Tinnitus (denging) adalah kerusakan yang menumpuk — tidak bisa sembuh.

KESESUAIAN PENTING
Segel IEM yang baik menghalau suara panggung sekitar, sehingga kamu tidak perlu melawan volume dengan volume lebih. Investasikan pada earpiece yang pas — ini melindungi pendengaranmu sekaligus meningkatkan kualitas mix-mu.`,
      },
      {
        id: 2,
        title: 'Skenario Nyata di Lapangan',
        highlight: null,
        content: `Berikut situasi umum yang akan kamu hadapi dan cara mengatasinya di P16-M:

TIDAK BISA MENDENGAR CLICK TRACK
Masalah: Kamu terus kehilangan ketukan karena click tertutupi.
Solusi: Tekan channel 15 (CLICK). Naikkan fader-nya. Jika masih tertutupi, turunkan sedikit semua channel lain agar click menembus. Click harus jelas terdengar tanpa terasa menyakitkan.

IEM TERDENGAR TERLALU TAJAM
Masalah: Mix terlalu terang — simbal dan vokal menusuk.
Solusi: Tekan MAIN, lalu kurangi sedikit TREBLE di bagian EQ. Jika belum cukup, gunakan MID dan FREQ bersamaan: sapu FREQ sambil cut MID untuk menemukan dan mengurangi frekuensi yang tajam.

TIDAK BISA MENDENGAR DIRIMU SENDIRI BERMAIN
Masalah: Instrumenmu sama sekali tenggelam dalam mix.
Solusi: Tekan channel-mu (mis. Ch.09 GTR1) dan naikkan fader secara signifikan. Lalu turunkan sedikit channel yang tidak terlalu kamu butuhkan untuk memberi ruang dalam mix headphone-mu.

MIX TERLALU PELAN SECARA KESELURUHAN
Masalah: Meski VOLUME sudah dinaikkan, semuanya terdengar terlalu lembut.
Solusi: Tekan MAIN dan periksa volume utama. Pastikan kabel IEM-mu terpasang penuh. Periksa knob LEVEL (output trim) dan naikkan jika perlu. JANGAN naikkan channel individual ke maksimal — itu menyebabkan distorsi.

TIDAK ADA SUARA SAMA SEKALI
Masalah: Kamu menghubungkan perangkat tetapi tidak mendengar apa pun.
Solusi (periksa berurutan):
1. Apakah kabel Ultranet/AES50 terhubung ke unit?
2. Apakah VOLUME di atas 0?
3. Apakah IEM-mu terpasang penuh?
4. Apakah unit menyala? (lampu indikator ULTRANET harus hijau)`,
      },
      {
        id: 3,
        title: 'Kesalahan Umum yang Harus Dihindari',
        highlight: null,
        content: `MEMAKSIMALKAN KNOB VOLUME
Ini merusak pendengaranmu dan menyebabkan distorsi. Mulai dari 50% dan naikkan bertahap.

MEM-BOOST SEMUA BAND EQ
Mem-boost bass, mid, dan treble bersamaan hanya menaikkan volume — bukan kejernihan. Aturannya: cut yang buruk daripada boost semuanya.

MENAIKKAN CHANNEL MIC TERLALU TINGGI
Bisa menciptakan resonansi yang tidak nyaman. Jaga channel mic (terutama overhead/room mic) di level sedang.

MELEWATI SOUNDCHECK
Selalu atur mix-mu sebelum ibadah dengan IEM benar-benar terpasang. Mix terdengar sangat berbeda di telinga vs. udara terbuka — yang seimbang di ruang sunyi bisa terasa salah total di panggung.

TIDAK MERESET ANTAR PENGGUNA
Jika orang lain memakai unitmu, selalu mulai dari awal. Mix mereka dikalibrasi untuk telinga dan instrumen mereka — bukan milikmu.

MENGABAIKAN LIMITER
Atur setiap saat. Hanya butuh 5 detik dan melindungi pendengaranmu seumur hidup.`,
      },
    ],
  },
  {
    id: 4,
    title: 'Pengecekan Pemahaman',
    description: 'Uji pemahamanmu dengan kuis, lalu tinjau referensi cepat.',
    milestones: [
      {
        id: 1,
        title: 'Kuis — 5 Pertanyaan',
        highlight: null,
        content: 'Jawab kelima pertanyaan dengan benar untuk menyelesaikan tahap ini. Pilih jawaban untuk setiap pertanyaan, lalu tekan PERIKSA JAWABAN.',
        quiz: [
          {
            question: 'Kontrol mana yang mengatur frekuensi treble untuk seluruh mix-mu?',
            options: [
              'Channel fader',
              'Knob TREBLE di bagian EQ',
              'Knob VOLUME master',
              'Knob LIMITER',
            ],
            correct: 1,
            explanation: 'Knob TREBLE di bagian EQ memengaruhi frekuensi tinggi di seluruh mix-mu. Channel fader hanya mengontrol volume satu channel.',
          },
          {
            question: 'Seorang musisi berkata "Saya perlu engineer menaikkan keyboard di telinga saya." Apa yang seharusnya terjadi?',
            options: [
              'Engineer FOH menyesuaikan mix utama',
              'Musisi menyesuaikan channel 3 & 4 di P16-M mereka',
              'Musisi menaikkan VOLUME master',
              'Musisi menekan SOLO di channel 3 & 4',
            ],
            correct: 1,
            explanation: 'Inti P16-M adalah kendali personal. Channel 3 (KEYS L) dan 4 (KEYS R) adalah channel keyboard — sesuaikan sendiri.',
          },
          {
            question: 'Apa fungsi knob LIMITER?',
            options: [
              'Mute semua channel sekaligus',
              'Menetapkan batas volume maksimum untuk melindungi pendengaran',
              'Mem-boost semua frekuensi bass',
              'Mengontrol volume click track',
            ],
            correct: 1,
            explanation: 'LIMITER menetapkan batas puncak output. Atur sebelum setiap ibadah agar suara keras mendadak tidak merusak pendengaranmu.',
          },
          {
            question: 'Click track ada di channel berapa?',
            options: [
              'Channel 8',
              'Channel 13',
              'Channel 15',
              'Channel 16',
            ],
            correct: 2,
            explanation: 'Channel 15 berlabel CLICK. Drummer dan pemain bass terutama harus menjaganya tetap jelas terdengar untuk timing yang rapat.',
          },
          {
            question: 'Mix-mu terdengar berdengung dan berlumpur. Knob EQ mana yang kamu kurangi?',
            options: [
              'TREBLE',
              'MID',
              'FREQ',
              'BASS',
            ],
            correct: 3,
            explanation: 'Knob BASS mengontrol frekuensi rendah. Mix yang berlumpur punya terlalu banyak bass — cut kecil membersihkannya secara signifikan.',
          },
        ],
      },
      {
        id: 2,
        title: 'Referensi Cepat',
        highlight: null,
        content: `Ingat contekan ini saat setiap latihan dan ibadah.

REFERENSI CEPAT KONTROL:
Knob BASS ........... Boost/cut frekuensi rendah | Gunakan saat: mix berdengung (cut) atau tipis (boost)
Knob MID ............ Boost/cut midrange | Gunakan saat: mix tajam atau sengau
Knob FREQ ........... Sapu frekuensi mid | Gunakan saat: bersama MID untuk menemukan frekuensi tajam
Knob TREBLE ......... Boost/cut frekuensi tinggi | Gunakan saat: terlalu terang (cut) atau suram (boost)
LIMITER ............. Menetapkan batas volume maks | Gunakan saat: SEBELUM setiap ibadah
LEVEL ............... Trim output | Gunakan saat: satu sisi lebih keras atau IEM terlalu pelan/keras
PAN/BAL ............. Posisi stereo | Gunakan saat: menyiapkan pasangan stereo seperti drum/keys
VOLUME .............. Kekerasan master | Gunakan saat: mix keseluruhan terlalu pelan atau keras
Channel fader ....... Volume channel individual | Gunakan saat: KAPAN saja — ini alat utamamu
CH 15 (CLICK) ....... Metronom click track | Gunakan saat: naikkan saat kehilangan ketukan
CH 13 (ALL VCL) ..... Blend semua vokal | Gunakan saat: perlu mendengar melodi atau lirik jelas

TIPS: Berlatihlah di simulator p16-simulator.cloud sebelum latihan berikutnya. Jelajahi setiap channel dan knob hingga tata letaknya terasa benar-benar alami.`,
      },
    ],
  },
]

// ─── UI chrome strings (panel labels, buttons, prompts) ─────────────────────────

export const UI = {
  en: {
    subtitle: 'SELF-LEARNING MODULE',
    tabModules: 'MODULES',
    tabCertificate: 'CERTIFICATE',
    progress: 'PROGRESS',
    pdfButton: 'TRAINING GUIDE PDF',
    moduleLabel: 'MODULE',
    milestoneLabel: 'MILESTONE',
    back: '← BACK',
    markComplete: '✓ MARK AS COMPLETE',
    completed: '✓ COMPLETED',
    next: 'NEXT',
    checkAnswers: 'CHECK ANSWERS',
    tryAgain: 'TRY AGAIN',
    correct: '✓ CORRECT',
    incorrect: '✗ INCORRECT',
    reviewMsg: (n, t) => `${n} / ${t} correct — review the explanations above`,
    wellDone: (n, t) => `${n} / ${t} correct — well done!`,
    trainingComplete: '🎉 TRAINING COMPLETE',
    claimCert: 'CLAIM CERTIFICATE',
    resetProgress: '↺ RESET ALL PROGRESS',
    resetConfirm: 'Reset all training progress? This cannot be undone.',
    certPromptMsg: 'Enter your name as it should appear on your certificate.',
    namePlaceholder: 'Your full name',
    generateCert: 'GENERATE CERTIFICATE',
    downloadCert: '↓ DOWNLOAD CERTIFICATE',
    downloadPdf: '↓ DOWNLOAD TRAINING GUIDE PDF',
    pdfFile: '/P16M_Training_Guide.pdf',
    pdfDownloadName: 'P16M_Training_Guide.pdf',
    dateLocale: 'en-GB',
  },
  id: {
    subtitle: 'MODUL PEMBELAJARAN MANDIRI',
    tabModules: 'MODUL',
    tabCertificate: 'SERTIFIKAT',
    progress: 'PROGRES',
    pdfButton: 'PDF PANDUAN PELATIHAN',
    moduleLabel: 'MODUL',
    milestoneLabel: 'TAHAP',
    back: '← KEMBALI',
    markComplete: '✓ TANDAI SELESAI',
    completed: '✓ SELESAI',
    next: 'BERIKUTNYA',
    checkAnswers: 'PERIKSA JAWABAN',
    tryAgain: 'COBA LAGI',
    correct: '✓ BENAR',
    incorrect: '✗ SALAH',
    reviewMsg: (n, t) => `${n} / ${t} benar — tinjau penjelasan di atas`,
    wellDone: (n, t) => `${n} / ${t} benar — bagus sekali!`,
    trainingComplete: '🎉 PELATIHAN SELESAI',
    claimCert: 'AMBIL SERTIFIKAT',
    resetProgress: '↺ ATUR ULANG SEMUA PROGRES',
    resetConfirm: 'Atur ulang semua progres pelatihan? Tindakan ini tidak dapat dibatalkan.',
    certPromptMsg: 'Masukkan namamu seperti yang akan tampil di sertifikat.',
    namePlaceholder: 'Nama lengkapmu',
    generateCert: 'BUAT SERTIFIKAT',
    downloadCert: '↓ UNDUH SERTIFIKAT',
    downloadPdf: '↓ UNDUH PDF PANDUAN PELATIHAN',
    pdfFile: '/P16M_Panduan_Pelatihan.pdf',
    pdfDownloadName: 'P16M_Panduan_Pelatihan.pdf',
    dateLocale: 'id-ID',
  },
}

export const MODULES_BY_LANG = { en: MODULES_EN, id: MODULES_ID }

// Backward-compatible default export (English).
export const MODULES = MODULES_EN
