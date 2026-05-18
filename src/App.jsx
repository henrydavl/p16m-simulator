import { useState, useEffect } from 'react'
import MixerBoard from './components/MixerBoard'

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('p16_theme') ?? 'dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('p16_theme', theme)
  }, [theme])

  const dark = theme === 'dark'

  return (
    <>
      <button
        onClick={() => setTheme(dark ? 'light' : 'dark')}
        style={{
          position: 'fixed', top: 14, right: 14, zIndex: 300,
          height: 26, paddingInline: 10,
          background: dark ? '#141414' : '#d0d0d0',
          border: `1px solid ${dark ? '#2a2a2a' : '#b0b0b0'}`,
          borderRadius: 3,
          color: dark ? '#555' : '#666',
          fontSize: 8, fontFamily: 'monospace', letterSpacing: '0.14em',
          cursor: 'pointer',
        }}
      >
        {dark ? '◐ LIGHT' : '◑ DARK'}
      </button>
      <MixerBoard />
    </>
  )
}
