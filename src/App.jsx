import { useState, useEffect } from 'react'
import MixerBoard from './components/MixerBoard'

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('p16_theme') ?? 'dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('p16_theme', theme)
  }, [theme])

  return (
    <>
      <button
        onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        style={{
          position: 'fixed', top: 14, right: 14, zIndex: 300,
          height: 26, paddingInline: 10,
          background: 'var(--bg-surface)',
          border: '1px solid var(--bdr-subtle)',
          borderRadius: 3,
          color: 'var(--txt-dim)',
          fontSize: 8, fontFamily: 'monospace', letterSpacing: '0.14em',
          cursor: 'pointer',
        }}
      >
        {theme === 'dark' ? '◐ LIGHT' : '◑ DARK'}
      </button>
      <MixerBoard />
    </>
  )
}
