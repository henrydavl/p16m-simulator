import { useState, useEffect, useRef } from 'react'
import { MODULES } from '../../data/trainingModules'

const STORAGE_KEY = 'p16_training'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { progress: {}, userName: null }
  } catch {
    return { progress: {}, userName: null }
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

const totalMilestones = MODULES.reduce((n, m) => n + m.milestones.length, 0)

// ─── Certificate canvas ───────────────────────────────────────────────────────

function drawCertificate(canvas, userName, dateStr) {
  const W = 800, H = 560
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#080808'
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = '#c07018'
  ctx.lineWidth = 3
  ctx.strokeRect(14, 14, W - 28, H - 28)

  ctx.strokeStyle = '#7a4a0a'
  ctx.lineWidth = 1
  ctx.strokeRect(22, 22, W - 44, H - 44)

  const corner = (x, y, dx, dy) => {
    ctx.beginPath()
    ctx.moveTo(x + dx * 20, y)
    ctx.lineTo(x, y)
    ctx.lineTo(x, y + dy * 20)
    ctx.stroke()
  }
  ctx.strokeStyle = '#c07018'
  ctx.lineWidth = 2
  corner(30, 30, 1, 1)
  corner(W - 30, 30, -1, 1)
  corner(30, H - 30, 1, -1)
  corner(W - 30, H - 30, -1, -1)

  ctx.fillStyle = '#c07018'
  ctx.font = '600 10px monospace'
  ctx.textAlign = 'center'
  ctx.letterSpacing = '0.22em'
  ctx.fillText('BEHRINGER POWERPLAY P16-M SIMULATOR', W / 2, 68)

  ctx.strokeStyle = '#3a2200'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(120, 84)
  ctx.lineTo(W - 120, 84)
  ctx.stroke()

  ctx.fillStyle = '#f0f0f0'
  ctx.font = 'bold 40px Georgia, serif'
  ctx.letterSpacing = '0.05em'
  ctx.fillText('CERTIFICATE', W / 2, 148)

  ctx.fillStyle = '#888'
  ctx.font = '300 16px Georgia, serif'
  ctx.letterSpacing = '0.25em'
  ctx.fillText('OF  COMPLETION', W / 2, 174)

  ctx.fillStyle = '#444'
  ctx.font = '10px monospace'
  ctx.letterSpacing = '0.18em'
  ctx.fillText('AWARDED TO', W / 2, 232)

  ctx.fillStyle = '#f0a030'
  ctx.font = `bold ${Math.min(48, 1200 / (userName.length || 1))}px Georgia, serif`
  ctx.letterSpacing = '0.02em'
  ctx.fillText(userName, W / 2, 288)

  const nameWidth = ctx.measureText(userName).width
  ctx.strokeStyle = '#7a4a0a'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(W / 2 - nameWidth / 2 - 20, 300)
  ctx.lineTo(W / 2 + nameWidth / 2 + 20, 300)
  ctx.stroke()

  ctx.fillStyle = '#777'
  ctx.font = '13px Georgia, serif'
  ctx.letterSpacing = '0.02em'
  ctx.fillText('has successfully completed the P16-M Self-Training Program', W / 2, 338)
  ctx.fillText('and demonstrated proficiency with the Behringer Powerplay P16-M', W / 2, 358)
  ctx.fillText('16-Channel Digital Personal Monitor Mixer.', W / 2, 378)

  ctx.fillStyle = '#3a3a3a'
  ctx.font = '10px monospace'
  ctx.letterSpacing = '0.15em'
  ctx.textAlign = 'left'
  ctx.fillText('ISSUED ON', 160, 440)
  ctx.fillStyle = '#888'
  ctx.font = '13px monospace'
  ctx.letterSpacing = '0.05em'
  ctx.fillText(dateStr, 160, 458)

  ctx.fillStyle = '#3a3a3a'
  ctx.font = '10px monospace'
  ctx.letterSpacing = '0.15em'
  ctx.textAlign = 'right'
  ctx.fillText('PROGRAM', W - 160, 440)
  ctx.fillStyle = '#888'
  ctx.font = '13px monospace'
  ctx.letterSpacing = '0.05em'
  ctx.fillText('P16 Training', W - 160, 458)

  // Authors
  ctx.fillStyle = '#3a3a3a'
  ctx.font = '9px monospace'
  ctx.letterSpacing = '0.12em'
  ctx.textAlign = 'center'
  ctx.fillText('AUTHORS: KEVIN AWARD ARMELDO & HENRY DAVID LIE', W / 2, 502)

  ctx.strokeStyle = '#1e1e1e'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(120, 512)
  ctx.lineTo(W - 120, 512)
  ctx.stroke()

  ctx.fillStyle = '#2a2a2a'
  ctx.font = '9px monospace'
  ctx.letterSpacing = '0.12em'
  ctx.fillText('p16-simulator.cloud', W / 2, 528)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TrainingPanel({ open, onToggle, theme = 'dark', onHighlight }) {
  const [stored, setStored] = useState(loadState)
  const [view, setView] = useState('modules')
  const [activeModule, setActiveModule] = useState(null)
  const [activeMilestone, setActiveMilestone] = useState(null)
  const [expandedModules, setExpandedModules] = useState({ 1: true })
  const [nameInput, setNameInput] = useState('')
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const canvasRef = useRef(null)

  const { progress, userName } = stored
  const dark = theme === 'dark'

  const T = {
    panelBg:        dark ? '#0d0d0d' : '#f4f4f4',
    panelBorder:    dark ? '#1e1e1e' : '#d0d0d0',
    headerBorder:   dark ? '#1a1a1a' : '#d8d8d8',
    subtitleText:   dark ? '#3a3a3a' : '#aaa',
    toggleBg:       dark ? '#111'    : '#e8e8e8',
    toggleBorder:   dark ? '#2a2a2a' : '#c4c4c4',
    toggleText:     dark ? '#555'    : '#666',
    progressBg:     dark ? '#1a1a1a' : '#dcdcdc',
    text1:          dark ? '#ddd'    : '#111',
    text2:          dark ? '#bbb'    : '#333',
    text3:          dark ? '#777'    : '#888',
    text4:          dark ? '#555'    : '#777',
    text5:          dark ? '#444'    : '#999',
    text6:          dark ? '#3a3a3a' : '#bbb',
    text7:          dark ? '#666'    : '#666',
    modDescription: dark ? '#444'    : '#999',
    activeMsBg:     dark ? '#1a1200' : '#fff8ec',
    dotEmpty:       dark ? '#1e1e1e' : '#e0e0e0',
    dotBorder:      dark ? '#333'    : '#c0c0c0',
    certCtaBg:      dark ? '#1a1200' : '#fff8ec',
    certCtaBorder:  dark ? '#7a4a0a' : '#d0a040',
    quizBg:         dark ? '#0d0d0d' : '#ebebeb',
    quizBorder:     dark ? '#1a1a1a' : '#d0d0d0',
    optBorder:      dark ? '#2a2a2a' : '#d0d0d0',
    optText:        dark ? '#555'    : '#888',
    optTextDim:     dark ? '#2a2a2a' : '#ccc',
    tryAgainBg:     dark ? '#0d0d0d' : '#f0f0f0',
    tryAgainBorder: dark ? '#2a2a2a' : '#d0d0d0',
    tryAgainText:   dark ? '#555'    : '#777',
    completedText:  dark ? '#3a6a3a' : '#4a8a4a',
    nextBorder:     dark ? '#2a2a2a' : '#d0d0d0',
    nextText:       dark ? '#555'    : '#888',
    contentBg:      dark ? '#0d0d0d' : '#ebebeb',
    contentBorder:  dark ? '#1a1a1a' : '#d0d0d0',
    inputBg:        dark ? '#0d0d0d' : '#ececec',
    inputBorder:    dark ? '#333'    : '#c8c8c8',
    inputText:      dark ? '#ddd'    : '#222',
    backText:       dark ? '#555'    : '#888',
    resetBg:        dark ? '#0d0808' : '#fff5f5',
    resetBorder:    dark ? '#280a0a' : '#f0c0c0',
    resetText:      dark ? '#884444' : '#cc4444',
    pdfBg:          dark ? '#0d0d0d' : '#ebebeb',
    pdfBorder:      dark ? '#2a2a2a' : '#d0d0d0',
    pdfText:        dark ? '#555'    : '#777',
  }

  const progressKey = (mId, msId) => `${mId}_${msId}`
  const isDone = (mId, msId) => !!progress[progressKey(mId, msId)]
  const completedCount = Object.values(progress).filter(Boolean).length
  const allDone = completedCount === totalMilestones

  function persist(next) {
    setStored(next)
    saveState(next)
  }

  function markComplete(mId, msId) {
    persist({ ...stored, progress: { ...progress, [progressKey(mId, msId)]: true } })
  }

  function toggleModule(mId) {
    setExpandedModules(prev => ({ ...prev, [mId]: !prev[mId] }))
  }

  function openMilestone(mId, msId) {
    const mod = MODULES.find(m => m.id === mId)
    const ms = mod?.milestones.find(ms => ms.id === msId)
    onHighlight?.(ms?.highlight ?? null)
    setActiveModule(mId)
    setActiveMilestone(msId)
    setQuizAnswers({})
    setQuizSubmitted(false)
    setView('milestone')
  }

  function goBack() {
    setView('modules')
    onHighlight?.(null)
  }

  function handleReset() {
    if (!window.confirm('Reset all training progress? This cannot be undone.')) return
    persist({ progress: {}, userName: null })
    setView('modules')
    onHighlight?.(null)
  }

  function handleClaimCert() {
    if (userName) {
      setView('certificate')
    } else {
      setNameInput('')
      setView('cert-prompt')
    }
  }

  function handleSubmitName(e) {
    e.preventDefault()
    const name = nameInput.trim()
    if (!name) return
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    persist({ ...stored, userName: name, certDate: dateStr })
    setView('certificate')
  }

  useEffect(() => {
    if (view !== 'certificate' || !canvasRef.current) return
    const dateStr = stored.certDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    drawCertificate(canvasRef.current, stored.userName || nameInput, dateStr)
  }, [view, stored.userName, stored.certDate])

  function downloadCert() {
    const link = document.createElement('a')
    link.download = `P16-Certificate-${stored.userName || 'Completion'}.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  // ── Inner views ─────────────────────────────────────────────────────────────

  function renderModules() {
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 12px' }}>
        {/* Progress bar */}
        <div style={{ padding: '10px 16px 10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ color: T.text4, fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.15em' }}>PROGRESS</span>
            <span style={{ color: T.text3, fontSize: 9, fontFamily: 'monospace' }}>{completedCount} / {totalMilestones}</span>
          </div>
          <div style={{ height: 3, background: T.progressBg, borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${(completedCount / totalMilestones) * 100}%`, background: '#c07018', borderRadius: 2, transition: 'width 0.4s' }} />
          </div>
        </div>

        {/* PDF download */}
        <div style={{ padding: '0 16px 12px' }}>
          <a
            href="/P16M_Training_Guide.pdf"
            download="P16M_Training_Guide.pdf"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              color: T.pdfText, fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.12em',
              textDecoration: 'none', background: T.pdfBg,
              border: `1px solid ${T.pdfBorder}`, borderRadius: 3, padding: '6px 10px',
            }}
          >
            <span>↓</span>
            <span>TRAINING GUIDE PDF</span>
          </a>
        </div>

        {/* Module list */}
        {MODULES.map(mod => {
          const modDone = mod.milestones.every(ms => isDone(mod.id, ms.id))
          const expanded = expandedModules[mod.id]
          return (
            <div key={mod.id}>
              <button
                onClick={() => toggleModule(mod.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 16px', background: 'none', border: 'none',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ width: 14, color: T.text5, fontSize: 9, flexShrink: 0 }}>{expanded ? '▾' : '▸'}</span>
                <span style={{ flex: 1, color: modDone ? '#c07018' : T.text2, fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                  MODULE {mod.id}
                </span>
                {modDone && <span style={{ color: '#c07018', fontSize: 10 }}>✓</span>}
              </button>
              {expanded && (
                <div style={{ paddingLeft: 38 }}>
                  <div style={{ color: T.modDescription, fontSize: 9, fontFamily: 'sans-serif', padding: '0 16px 6px 0', lineHeight: 1.4 }}>
                    {mod.title}
                  </div>
                  {mod.milestones.map(ms => {
                    const done = isDone(mod.id, ms.id)
                    const isActive = activeModule === mod.id && activeMilestone === ms.id && view === 'milestone'
                    return (
                      <button
                        key={ms.id}
                        onClick={() => openMilestone(mod.id, ms.id)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                          padding: '7px 16px 7px 0', background: isActive ? T.activeMsBg : 'none',
                          border: 'none', cursor: 'pointer', textAlign: 'left',
                          borderLeft: isActive ? '2px solid #c07018' : '2px solid transparent',
                        }}
                      >
                        <span style={{
                          width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                          background: done ? '#c07018' : T.dotEmpty,
                          border: `1px solid ${done ? '#c07018' : T.dotBorder}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {done && <span style={{ color: '#000', fontSize: 7, lineHeight: 1 }}>✓</span>}
                        </span>
                        <span style={{ color: done ? '#7a5010' : isActive ? '#f0a030' : T.text3, fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                          {ms.title}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* Certificate CTA */}
        {allDone && (
          <div style={{ margin: '16px 16px 8px', padding: '12px', background: T.certCtaBg, border: `1px solid ${T.certCtaBorder}`, borderRadius: 4 }}>
            <div style={{ color: '#c07018', fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em', marginBottom: 6 }}>
              🎉 TRAINING COMPLETE
            </div>
            <button
              onClick={handleClaimCert}
              style={{
                width: '100%', padding: '8px 0', background: '#c07018', border: 'none',
                borderRadius: 3, color: '#000', fontSize: 10, fontFamily: 'monospace',
                letterSpacing: '0.12em', cursor: 'pointer', fontWeight: 700,
              }}
            >
              CLAIM CERTIFICATE
            </button>
          </div>
        )}

        {/* Reset button */}
        {allDone && (
          <div style={{ margin: '0 16px 16px', padding: '10px 12px', background: T.resetBg, border: `1px solid ${T.resetBorder}`, borderRadius: 4 }}>
            <button
              onClick={handleReset}
              style={{
                width: '100%', padding: '7px 0', background: 'transparent', border: `1px solid ${T.resetBorder}`,
                borderRadius: 3, color: T.resetText, fontSize: 9, fontFamily: 'monospace',
                letterSpacing: '0.12em', cursor: 'pointer',
              }}
            >
              ↺ RESET ALL PROGRESS
            </button>
          </div>
        )}
      </div>
    )
  }

  function renderMilestone() {
    const mod = MODULES.find(m => m.id === activeModule)
    const ms = mod?.milestones.find(ms => ms.id === activeMilestone)
    if (!mod || !ms) return null
    const done = isDone(mod.id, ms.id)

    const allMilestones = MODULES.flatMap(m => m.milestones.map(ms => ({ mId: m.id, msId: ms.id, title: ms.title })))
    const currentIdx = allMilestones.findIndex(x => x.mId === activeModule && x.msId === activeMilestone)
    const next = allMilestones[currentIdx + 1]

    const isQuiz = Array.isArray(ms.quiz)
    const allAnswered = isQuiz && ms.quiz.every((_, i) => quizAnswers[i] !== undefined)
    const allCorrect = isQuiz && ms.quiz.every((q, i) => quizAnswers[i] === q.correct)

    function handleCompleteAndAdvance() {
      markComplete(mod.id, ms.id)
      if (next) openMilestone(next.mId, next.msId)
      else {
        setView('modules')
        onHighlight?.(null)
      }
    }

    return (
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <button
          onClick={goBack}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', color: T.backText, fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.12em' }}
        >
          ← BACK
        </button>

        <div style={{ padding: '0 16px 20px', flex: 1 }}>
          <div style={{ color: T.text6, fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 6 }}>
            MODULE {mod.id} — MILESTONE {ms.id}
          </div>

          <div style={{ color: T.text1, fontSize: 14, fontFamily: 'monospace', letterSpacing: '0.06em', marginBottom: 14, fontWeight: 600 }}>
            {ms.title}
          </div>

          {isQuiz && (
            <div style={{ color: T.text4, fontSize: 10, fontFamily: 'monospace', lineHeight: 1.6, marginBottom: 16 }}>
              {ms.content}
            </div>
          )}

          {/* ── Quiz UI ── */}
          {isQuiz && (
            <div>
              {ms.quiz.map((q, qi) => {
                const chosen = quizAnswers[qi]
                const correct = q.correct
                const isCorrect = chosen === correct
                const showResult = quizSubmitted && chosen !== undefined

                return (
                  <div
                    key={qi}
                    style={{
                      marginBottom: 16, background: T.quizBg,
                      border: `1px solid ${showResult ? (isCorrect ? '#163016' : '#3a0a0a') : T.quizBorder}`,
                      borderRadius: 4, padding: 12,
                    }}
                  >
                    <div style={{ color: T.text2, fontSize: 11, fontFamily: 'sans-serif', lineHeight: 1.5, marginBottom: 10 }}>
                      <span style={{ color: '#c07018', fontFamily: 'monospace', fontSize: 9, marginRight: 6 }}>Q{qi + 1}</span>
                      {q.question}
                    </div>

                    {q.options.map((opt, oi) => {
                      const isSelected = chosen === oi
                      const isCorrectOpt = oi === correct
                      let optColor = T.optText
                      let optBg = 'transparent'
                      let optBorder = T.optBorder
                      if (showResult) {
                        if (isCorrectOpt) { optColor = '#22c55e'; optBorder = '#163016'; optBg = '#0a1c0a' }
                        else if (isSelected && !isCorrectOpt) { optColor = '#ef4444'; optBorder = '#3a0a0a'; optBg = '#1a0505' }
                        else { optColor = T.optTextDim }
                      } else if (isSelected) {
                        optColor = '#f0a030'; optBorder = '#7a4a0a'; optBg = '#1a1200'
                      }

                      return (
                        <label
                          key={oi}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: 8,
                            padding: '7px 10px', marginBottom: 4,
                            background: optBg, border: `1px solid ${optBorder}`,
                            borderRadius: 3, cursor: quizSubmitted ? 'default' : 'pointer',
                          }}
                        >
                          <input
                            type="radio"
                            name={`q${qi}`}
                            value={oi}
                            checked={isSelected}
                            disabled={quizSubmitted}
                            onChange={() => setQuizAnswers(prev => ({ ...prev, [qi]: oi }))}
                            style={{ marginTop: 1, accentColor: '#c07018', flexShrink: 0 }}
                          />
                          <span style={{ color: optColor, fontSize: 11, fontFamily: 'sans-serif', lineHeight: 1.4 }}>
                            {opt}
                          </span>
                        </label>
                      )
                    })}

                    {showResult && (
                      <div style={{
                        marginTop: 8, padding: '8px 10px',
                        background: isCorrect ? '#050f05' : '#140505',
                        border: `1px solid ${isCorrect ? '#0d200d' : '#280a0a'}`,
                        borderRadius: 3,
                      }}>
                        <span style={{ color: isCorrect ? '#22c55e' : '#ef4444', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.1em', marginRight: 6 }}>
                          {isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
                        </span>
                        <span style={{ color: T.text4, fontSize: 10, fontFamily: 'sans-serif', lineHeight: 1.5 }}>
                          {q.explanation}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}

              {!done && !quizSubmitted && (
                <button
                  onClick={() => setQuizSubmitted(true)}
                  disabled={!allAnswered}
                  style={{
                    width: '100%', padding: '10px 0',
                    background: allAnswered ? '#1a1200' : T.tryAgainBg,
                    border: `1px solid ${allAnswered ? '#7a4a0a' : T.tryAgainBorder}`,
                    borderRadius: 3, color: allAnswered ? '#c07018' : T.optTextDim,
                    fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.14em',
                    cursor: allAnswered ? 'pointer' : 'default',
                  }}
                >
                  CHECK ANSWERS
                </button>
              )}

              {!done && quizSubmitted && !allCorrect && (
                <div>
                  <div style={{ textAlign: 'center', color: '#ef4444', fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 10 }}>
                    {ms.quiz.filter((q, i) => quizAnswers[i] === q.correct).length} / {ms.quiz.length} correct — review the explanations above
                  </div>
                  <button
                    onClick={() => setQuizSubmitted(false)}
                    style={{
                      width: '100%', padding: '10px 0', background: T.tryAgainBg,
                      border: `1px solid ${T.tryAgainBorder}`, borderRadius: 3, color: T.tryAgainText,
                      fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.14em', cursor: 'pointer',
                    }}
                  >
                    TRY AGAIN
                  </button>
                </div>
              )}

              {!done && quizSubmitted && allCorrect && (
                <div>
                  <div style={{ textAlign: 'center', color: '#22c55e', fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 10 }}>
                    {ms.quiz.length} / {ms.quiz.length} correct — well done!
                  </div>
                  <button
                    onClick={handleCompleteAndAdvance}
                    style={{
                      width: '100%', padding: '10px 0', background: '#0a1c0a',
                      border: '1px solid #163016', borderRadius: 3, color: '#22c55e',
                      fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.14em', cursor: 'pointer',
                    }}
                  >
                    ✓ MARK AS COMPLETE
                  </button>
                </div>
              )}

              {done && (
                <div style={{ textAlign: 'center', color: T.completedText, fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em', padding: '10px 0' }}>
                  ✓ COMPLETED
                  {next && (
                    <button
                      onClick={() => openMilestone(next.mId, next.msId)}
                      style={{ display: 'block', width: '100%', marginTop: 8, padding: '8px 0', background: 'none', border: `1px solid ${T.nextBorder}`, borderRadius: 3, color: T.nextText, fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.1em', cursor: 'pointer' }}
                    >
                      NEXT: {next.title} →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Plain content milestone ── */}
          {!isQuiz && (
            <>
              <div style={{ color: T.text7, fontSize: 11, fontFamily: 'sans-serif', lineHeight: 1.7, background: T.contentBg, border: `1px solid ${T.contentBorder}`, borderRadius: 4, padding: 14, marginBottom: 20, whiteSpace: 'pre-line' }}>
                {ms.content}
              </div>

              {!done ? (
                <button
                  onClick={handleCompleteAndAdvance}
                  style={{
                    width: '100%', padding: '10px 0', background: '#0a1c0a',
                    border: '1px solid #163016', borderRadius: 3, color: '#22c55e',
                    fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.14em', cursor: 'pointer',
                  }}
                >
                  ✓ MARK AS COMPLETE
                </button>
              ) : (
                <div style={{ textAlign: 'center', color: T.completedText, fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em', padding: '10px 0' }}>
                  ✓ COMPLETED
                  {next && (
                    <button
                      onClick={() => openMilestone(next.mId, next.msId)}
                      style={{ display: 'block', width: '100%', marginTop: 8, padding: '8px 0', background: 'none', border: `1px solid ${T.nextBorder}`, borderRadius: 3, color: T.nextText, fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.1em', cursor: 'pointer' }}
                    >
                      NEXT: {next.title} →
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  function renderCertPrompt() {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 20px' }}>
        <div style={{ color: '#c07018', fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.15em', marginBottom: 20, textAlign: 'center' }}>
          🎉 TRAINING COMPLETE
        </div>
        <div style={{ color: T.text7, fontSize: 11, fontFamily: 'monospace', lineHeight: 1.6, marginBottom: 24, textAlign: 'center' }}>
          Enter your name as it should appear on your certificate.
        </div>
        <form onSubmit={handleSubmitName}>
          <input
            autoFocus
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            placeholder="Your full name"
            style={{
              width: '100%', boxSizing: 'border-box', padding: '10px 12px',
              background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: 3,
              color: T.inputText, fontSize: 13, fontFamily: 'monospace',
              outline: 'none', marginBottom: 10,
            }}
          />
          <button
            type="submit"
            disabled={!nameInput.trim()}
            style={{
              width: '100%', padding: '10px 0', background: nameInput.trim() ? '#c07018' : '#2a1800',
              border: 'none', borderRadius: 3, color: nameInput.trim() ? '#000' : '#4a3000',
              fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.14em',
              cursor: nameInput.trim() ? 'pointer' : 'default', fontWeight: 700,
              transition: 'background 150ms',
            }}
          >
            GENERATE CERTIFICATE
          </button>
        </form>
      </div>
    )
  }

  function renderCertificate() {
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 20px' }}>
        <button
          onClick={() => setView('modules')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, background: 'none', border: 'none', cursor: 'pointer', color: T.backText, fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.12em' }}
        >
          ← BACK
        </button>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', borderRadius: 3, display: 'block' }}
        />
        <button
          onClick={downloadCert}
          style={{
            width: '100%', marginTop: 10, padding: '10px 0',
            background: '#c07018', border: 'none', borderRadius: 3,
            color: '#000', fontSize: 10, fontFamily: 'monospace',
            letterSpacing: '0.14em', cursor: 'pointer', fontWeight: 700,
          }}
        >
          ↓ DOWNLOAD CERTIFICATE
        </button>
        <a
          href="/P16M_Training_Guide.pdf"
          download="P16M_Training_Guide.pdf"
          style={{
            display: 'block', width: '100%', marginTop: 8, padding: '10px 0', boxSizing: 'border-box',
            background: T.pdfBg, border: `1px solid ${T.pdfBorder}`, borderRadius: 3,
            color: T.pdfText, fontSize: 10, fontFamily: 'monospace',
            letterSpacing: '0.14em', textAlign: 'center', textDecoration: 'none',
          }}
        >
          ↓ DOWNLOAD TRAINING GUIDE PDF
        </a>
      </div>
    )
  }

  // ── Panel shell ──────────────────────────────────────────────────────────────

  return (
    <>
      {/* Toggle button — always visible */}
      <button
        onClick={onToggle}
        style={{
          position: 'fixed', top: 16, left: open ? 272 : 0, zIndex: 200,
          height: 32, paddingInline: 10,
          background: T.toggleBg,
          border: `1px solid ${T.toggleBorder}`,
          borderLeft: open ? `1px solid ${T.toggleBorder}` : 'none',
          borderRadius: '0 3px 3px 0',
          color: T.toggleText, fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.14em',
          cursor: 'pointer', transition: 'left 0.25s',
          display: 'flex', alignItems: 'center', gap: 5,
        }}
      >
        {open ? '◀ HIDE' : '▶ TRAINING'}
      </button>

      {/* Sliding panel */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          width: 272, zIndex: 190,
          background: T.panelBg,
          borderRight: `1px solid ${T.panelBorder}`,
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          display: 'flex', flexDirection: 'column',
          overflowX: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${T.headerBorder}`, flexShrink: 0 }}>
          <div style={{ color: '#c07018', fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.2em', fontWeight: 700 }}>
            P16 TRAINING
          </div>
          <div style={{ color: T.subtitleText, fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.1em', marginTop: 3 }}>
            SELF-LEARNING MODULE
          </div>
        </div>

        {/* Nav tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${T.headerBorder}`, flexShrink: 0 }}>
          {[
            { id: 'modules', label: 'MODULES' },
            { id: 'certificate', label: 'CERTIFICATE' },
          ].map(tab => {
            const certActive = view === 'cert-prompt' || view === 'certificate'
            const isActive = tab.id === 'modules' ? !certActive : certActive

            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'modules') setView(view === 'milestone' ? 'milestone' : 'modules')
                  else if (allDone) handleClaimCert()
                }}
                style={{
                  flex: 1, padding: '9px 0',
                  background: 'none', border: 'none',
                  borderBottom: isActive ? '2px solid #c07018' : '2px solid transparent',
                  color: isActive ? '#c07018' : (tab.id === 'certificate' && !allDone) ? T.optTextDim : T.text4,
                  fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.12em',
                  cursor: tab.id === 'certificate' && !allDone ? 'default' : 'pointer',
                }}
              >
                {tab.label}
                {tab.id === 'certificate' && allDone && <span style={{ marginLeft: 4, color: '#c07018' }}>●</span>}
              </button>
            )
          })}
        </div>

        {/* Content area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {view === 'modules' && renderModules()}
          {view === 'milestone' && renderMilestone()}
          {view === 'cert-prompt' && renderCertPrompt()}
          {view === 'certificate' && renderCertificate()}
        </div>
      </div>
    </>
  )
}
