import Link from 'next/link'

const chips = [
  'could have been an email',
  'make this two meetings',
  'surprisingly productive',
  'no decisions were made',
  'action item graveyard',
  'nobody knew the agenda',
]

export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '48px 0 0', display: 'flex', alignItems: 'baseline', gap: 16 }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500, letterSpacing: '0.12em' }}>BORDROOM</span>
        <span style={{ fontSize: 12, color: '#888', fontStyle: 'italic' }}>a meeting verdict machine</span>
      </header>

      <section style={{ padding: '80px 0 64px', borderBottom: '1px solid rgba(10,10,10,0.12)' }}>
        <h1 style={{ fontSize: 'clamp(40px, 7vw, 64px)', fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 24 }}>
          Was this meeting<br />
          <span style={{ color: '#c8371a' }}>actually necessary?</span>
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: '#3a3a3a', maxWidth: 480, marginBottom: 36 }}>
          Paste your notes. We'll tell you what went wrong and how to fix it next time.
        </p>
        <Link href="/analyze" style={{
          display: 'inline-block', background: '#0a0a0a', color: '#f7f4ef',
          fontSize: 15, fontWeight: 500, padding: '14px 28px', borderRadius: 4,
          textDecoration: 'none', letterSpacing: '-0.01em'
        }}>
          Render a verdict
        </Link>
      </section>

      <section style={{ padding: '48px 0', borderBottom: '1px solid rgba(10,10,10,0.12)' }}>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.1em', color: '#888', textTransform: 'uppercase', marginBottom: 20 }}>
          possible verdicts include
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {chips.map(c => (
            <span key={c} style={{
              background: 'white', border: '1px solid rgba(10,10,10,0.25)',
              borderRadius: 99, padding: '8px 16px', fontSize: 13, color: '#3a3a3a'
            }}>{c}</span>
          ))}
        </div>
      </section>

      <section style={{ padding: '48px 0', borderBottom: '1px solid rgba(10,10,10,0.12)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {[
          { n: '01', t: 'Paste your meeting notes, minutes, or agenda' },
          { n: '02', t: 'We analyzes decisions, clarity, and efficiency' },
          { n: '03', t: 'Get a blunt verdict and concrete next steps' },
        ].map((s, i) => (
          <>
            <div key={s.n} style={{ flex: 1 }}>
              <span style={{ display: 'block', fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.1em', color: '#c8371a', marginBottom: 8 }}>{s.n}</span>
              <p style={{ fontSize: 14, color: '#3a3a3a', lineHeight: 1.5 }}>{s.t}</p>
            </div>
            {i < 2 && <span style={{ fontSize: 18, color: '#bbb', paddingTop: 4, flexShrink: 0 }}>→</span>}
          </>
        ))}
      </section>

      <footer style={{ padding: '32px 0 48px', fontSize: 12, color: '#bbb', marginTop: 'auto' }}>
        Your notes are never stored. Powered by Claude.
      </footer>
    </main>
  )
}
