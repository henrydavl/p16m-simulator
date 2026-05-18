export default function SongSelector({ songs, currentSongId, onSongChange, isLoading }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8 }}>
      <span style={{
        color: '#555', fontSize: 8, fontFamily: 'monospace', letterSpacing: '0.2em',
        whiteSpace: 'nowrap',
      }}>
        SONG
      </span>

      <div style={{ position: 'relative', flex: 1 }}>
        <select
          value={currentSongId ?? ''}
          onChange={(e) => onSongChange?.(e.target.value)}
          disabled={songs.length === 0}
          style={{
            width: '100%', height: 26, paddingInline: '8px 24px',
            background: '#111',
            border: '1px solid #2a2a2a',
            borderRadius: 3,
            color: songs.length === 0 ? '#444' : '#888',
            fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.08em',
            cursor: songs.length === 0 ? 'default' : 'pointer',
            appearance: 'none', WebkitAppearance: 'none',
            outline: 'none',
          }}
        >
          {songs.length === 0 ? (
            <option value="">{isLoading ? '· · ·' : 'No songs found'}</option>
          ) : (
            songs.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))
          )}
        </select>
        <span style={{
          position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
          pointerEvents: 'none', color: '#444', fontSize: 7,
        }}>▼</span>
      </div>

      {isLoading && (
        <span style={{
          color: '#5a4000', fontSize: 9, fontFamily: 'monospace',
          letterSpacing: '0.15em', whiteSpace: 'nowrap',
        }}>
          · · ·
        </span>
      )}
    </div>
  )
}
