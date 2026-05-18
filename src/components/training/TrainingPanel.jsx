import { useState, useEffect, useRef, useCallback } from 'react'
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

  // Background
  ctx.fillStyle = '#080808'
  ctx.fillRect(0, 0, W, H)

  // Outer amber border
  ctx.strokeStyle = '#c07018'
  ctx.lineWidth = 3
  ctx.strokeRect(14, 14, W - 28, H - 28)

  // Inner dark border
  ctx.strokeStyle = '#7a4a0a'
  ctx.lineWidth = 1
  ctx.strokeRect(22, 22, W - 44, H - 44)

  // Corner accents
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

  // Header label
  ctx.fillStyle = '#c07018'
  ctx.font = '600 10px monospace'
  ctx.textAlign = 'center'
  ctx.letterSpacing = '0.22em'
  ctx.fillText('BEHRINGER POWERPLAY P16-M SIMULATOR', W / 2, 68)

  // Divider
  ctx.strokeStyle = '#3a2200'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(120, 84)
  ctx.lineTo(W - 120, 84)
  ctx.stroke()

  // Main title
  ctx.fillStyle = '#f0f0f0'
  ctx.font = 'bold 40px Georgia, serif'
  ctx.letterSpacing = '0.05em'
  ctx.fillText('CERTIFICATE', W / 2, 148)

  ctx.fillStyle = '#888'
  ctx.font = '300 16px Georgia, serif'
  ctx.letterSpacing = '0.25em'
  ctx.fillText('OF  COMPLETION', W / 2, 174)

  // Awarded to
  ctx.fillStyle = '#444'
  ctx.font = '10px monospace'
  ctx.letterSpacing = '0.18em'
  ctx.fillText('AWARDED TO', W / 2, 232)

  // Recipient name
  ctx.fillStyle = '#f0a030'
  ctx.font = `bold ${Math.min(48, 1200 / (userName.length || 1))}px Georgia, serif`
  ctx.letterSpacing = '0.02em'
  ctx.fillText(userName, W / 2, 288)

  // Underline
  const nameWidth = ctx.measureText(userName).width
  ctx.strokeStyle = '#7a4a0a'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(W / 2 - nameWidth / 2 - 20, 300)
  ctx.lineTo(W / 2 + nameWidth / 2 + 20, 300)
  ctx.stroke()

  // Body text
  ctx.fillStyle = '#777'
  ctx.font = '13px Georgia, serif'
  ctx.letterSpacing = '0.02em'
  ctx.fillText('has successfully completed the P16-M Self-Training Program', W / 2, 338)
  ctx.fillText('and demonstrated proficiency with the Behringer Powerplay P16-M', W / 2, 358)
  ctx.fillText('16-Channel Digital Personal Monitor Mixer.', W / 2, 378)

  // Date section
  ctx.fillStyle = '#3a3a3a'
  ctx.font = '10px monospace'
  ctx.letterSpacing = '0.15em'
  ctx.textAlign = 'left'
  ctx.fillText('ISSUED ON', 160, 448)
  ctx.fillStyle = '#888'
  ctx.font = '13px monospace'
  ctx.letterSpacing = '0.05em'
  ctx.fillText(dateStr, 160, 466)

  // Program
  ctx.fillStyle = '#3a3a3a'
  ctx.font = '10px monospace'
  ctx.letterSpacing = '0.15em'
  ctx.textAlign = 'right'
  ctx.fillText('PROGRAM', W - 160, 448)
  ctx.fillStyle = '#888'
  ctx.font = '13px monospace'
  ctx.letterSpacing = '0.05em'
  ctx.fillText('P16 Training', W - 160, 466)

  // Footer
  ctx.fillStyle = '#2a2a2a'
  ctx.font = '9px monospace'
  ctx.letterSpacing = '0.12em'
  ctx.textAlign = 'center'
  ctx.fillText('p16-simulator.cloud', W / 2, 526)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TrainingPanel({ open, onToggle }) {
  const [stored, setStored] = useState(loadState)
  const [view, setView] = useState('modules') // 'modules' | 'milestone' | 'cert-prompt' | 'certificate'
  const [activeModule, setActiveModule] = useState(null)
  const [activeMilestone, setActiveMilestone] = useState(null)
  const [expandedModules, setExpandedModules] = useState({ 1: true })
  const [nameInput, setNameInput] = useState('')
  const canvasRef = useRef(null)

  const { progress, userName } = stored

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
    setActiveModule(mId)
    setActiveMilestone(msId)
    setView('milestone')
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

  // Draw certificate when view switches to it
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
        <div style={{ padding: '10px 16px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ color: '#555', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.15em' }}>PROGRESS</span>
            <span style={{ color: '#777', fontSize: 9, fontFamily: 'monospace' }}>{completedCount} / {totalMilestones}</span>
          </div>
          <div style={{ height: 3, background: '#1a1a1a', borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${(completedCount / totalMilestones) * 100}%`, background: '#c07018', borderRadius: 2, transition: 'width 0.4s' }} />
          </div>
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
                <span style={{ width: 14, color: '#444', fontSize: 9, flexShrink: 0 }}>{expanded ? '▾' : '▸'}</span>
                <span style={{ flex: 1, color: modDone ? '#c07018' : '#bbb', fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                  MODULE {mod.id}
                </span>
                {modDone && <span style={{ color: '#c07018', fontSize: 10 }}>✓</span>}
              </button>
              {expanded && (
                <div style={{ paddingLeft: 38 }}>
                  <div style={{ color: '#444', fontSize: 9, fontFamily: 'sans-serif', padding: '0 16px 6px 0', lineHeight: 1.4 }}>
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
                          padding: '7px 16px 7px 0', background: isActive ? '#1a1200' : 'none',
                          border: 'none', cursor: 'pointer', textAlign: 'left',
                          borderLeft: isActive ? '2px solid #c07018' : '2px solid transparent',
                        }}
                      >
                        <span style={{
                          width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                          background: done ? '#c07018' : '#1e1e1e',
                          border: `1px solid ${done ? '#c07018' : '#333'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {done && <span style={{ color: '#000', fontSize: 7, lineHeight: 1 }}>✓</span>}
                        </span>
                        <span style={{ color: done ? '#7a5010' : isActive ? '#f0a030' : '#777', fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
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
          <div style={{ margin: '16px', padding: '12px', background: '#1a1200', border: '1px solid #7a4a0a', borderRadius: 4 }}>
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
      </div>
    )
  }

  function renderMilestone() {
    const mod = MODULES.find(m => m.id === activeModule)
    const ms = mod?.milestones.find(ms => ms.id === activeMilestone)
    if (!mod || !ms) return null
    const done = isDone(mod.id, ms.id)

    // Find next milestone
    const allMilestones = MODULES.flatMap(m => m.milestones.map(ms => ({ mId: m.id, msId: ms.id, title: ms.title })))
    const currentIdx = allMilestones.findIndex(x => x.mId === activeModule && x.msId === activeMilestone)
    const next = allMilestones[currentIdx + 1]

    return (
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Back */}
        <button
          onClick={() => setView('modules')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.12em' }}
        >
          ← BACK
        </button>

        <div style={{ padding: '0 16px 20px', flex: 1 }}>
          {/* Breadcrumb */}
          <div style={{ color: '#3a3a3a', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 6 }}>
            MODULE {mod.id} — MILESTONE {ms.id}
          </div>

          {/* Title */}
          <div style={{ color: '#ddd', fontSize: 14, fontFamily: 'monospace', letterSpacing: '0.06em', marginBottom: 14, fontWeight: 600 }}>
            {ms.title}
          </div>

          {/* Content */}
          <div style={{ color: '#666', fontSize: 11, fontFamily: 'sans-serif', lineHeight: 1.7, background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 4, padding: 14, marginBottom: 20 }}>
            {ms.content}
          </div>

          {/* Complete button */}
          {!done ? (
            <button
              onClick={() => {
                markComplete(mod.id, ms.id)
                if (next) openMilestone(next.mId, next.msId)
                else setView('modules')
              }}
              style={{
                width: '100%', padding: '10px 0', background: '#0a1c0a',
                border: '1px solid #163016', borderRadius: 3, color: '#22c55e',
                fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.14em',
                cursor: 'pointer',
              }}
            >
              ✓ MARK AS COMPLETE
            </button>
          ) : (
            <div style={{ textAlign: 'center', color: '#3a6a3a', fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em', padding: '10px 0' }}>
              ✓ COMPLETED
              {next && (
                <button
                  onClick={() => openMilestone(next.mId, next.msId)}
                  style={{ display: 'block', width: '100%', marginTop: 8, padding: '8px 0', background: 'none', border: '1px solid #2a2a2a', borderRadius: 3, color: '#555', fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.1em', cursor: 'pointer' }}
                >
                  NEXT: {next.title} →
                </button>
              )}
            </div>
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
        <div style={{ color: '#666', fontSize: 11, fontFamily: 'monospace', lineHeight: 1.6, marginBottom: 24, textAlign: 'center' }}>
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
              background: '#0d0d0d', border: '1px solid #333', borderRadius: 3,
              color: '#ddd', fontSize: 13, fontFamily: 'monospace',
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
          style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.12em' }}
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
          background: '#111', border: '1px solid #2a2a2a',
          borderLeft: open ? '1px solid #2a2a2a' : 'none',
          borderRadius: open ? '0 3px 3px 0' : '0 3px 3px 0',
          color: '#555', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.14em',
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
          background: '#0d0d0d',
          borderRight: '1px solid #1e1e1e',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          display: 'flex', flexDirection: 'column',
          overflowX: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #1a1a1a', flexShrink: 0 }}>
          <div style={{ color: '#c07018', fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.2em', fontWeight: 700 }}>
            P16 TRAINING
          </div>
          <div style={{ color: '#3a3a3a', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.1em', marginTop: 3 }}>
            SELF-LEARNING MODULE
          </div>
        </div>

        {/* Nav tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1a1a1a', flexShrink: 0 }}>
          {[
            { id: 'modules', label: 'MODULES' },
            { id: 'certificate', label: 'CERTIFICATE' },
          ].map(tab => {
            const active = view === 'modules' || view === 'milestone' ? tab.id === 'modules' : tab.id === 'certificate'
            const isModulesTab = tab.id === 'modules'
            const isCertTab = tab.id === 'certificate'
            const certActive = view === 'cert-prompt' || view === 'certificate'

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
                  borderBottom: (isModulesTab ? !certActive : certActive) ? '2px solid #c07018' : '2px solid transparent',
                  color: (isModulesTab ? !certActive : certActive) ? '#c07018' : allDone || isModulesTab ? '#555' : '#2a2a2a',
                  fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.12em',
                  cursor: tab.id === 'certificate' && !allDone ? 'default' : 'pointer',
                }}
              >
                {tab.label}
                {isCertTab && allDone && <span style={{ marginLeft: 4, color: '#c07018' }}>●</span>}
              </button>
            )
          })}
        </div>

        {/* Content area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {(view === 'modules') && renderModules()}
          {view === 'milestone' && renderMilestone()}
          {view === 'cert-prompt' && renderCertPrompt()}
          {view === 'certificate' && renderCertificate()}
        </div>
      </div>
    </>
  )
}
