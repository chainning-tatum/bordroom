'use client'
import { useState } from 'react'
import Link from 'next/link'

type Finding = { type: 'danger' | 'warn' | 'ok' | 'info'; text: string }
type Result = {
  verdict: string
  score_efficiency: number
  score_decisions: number
  score_clarity: number
  summary: string
  findings: Finding[]
  recommendations: string[]
  could_be_email: boolean
  split_suggestion: string | null
  missing: string[]
}

const SAMPLE = `Weekly product sync - May 27, 2026
Attendees: Priya (PM), Jordan (Eng), Sam (Design), Alex (Marketing), Tina (QA), Marcus (Sales), Leo (Dev), Nina (Support)
Duration: 90 minutes

Agenda:
1. Q2 roadmap status update
2. Bug triage for release 3.2
3. Brand refresh discussion
4. New onboarding flow review

Notes:
- Priya gave a 25-min update on Q2 roadmap. No decisions made, same info as last week's email.
- Bug triage: Jordan said 3 bugs are blocked on design. Sam wasn't sure about two of them, said she would look into it later.
- Brand refresh: Alex showed 4 color palettes. Group could not agree. No decision reached. Will revisit next week.
- Onboarding flow: Sam showed wireframes. Good feedback from Marcus. Leo raised a technical concern. No resolution.
- Marcus asked about the sales deck update. Nobody knew the status.
- Tina listed 7 QA findings verbally. No written summary provided.
- Meeting ran 20 minutes over.

Action items:
- Sam: look into the design bugs (no deadline set)
- Priya: schedule another meeting for brand decision
- Leo: investigate animation performance (sometime before next release)`

const pillColors: Record<string, { bg: string; color: string; border: string }> = {
  danger: { bg: '#fdf0ee', color: '#a32d1d', border: '#f5c5be' },
  warn:   { bg: '#fdf6e8', color: '#7a5000', border: '#f5dfa0' },
  ok:     { bg: '#eef5ee', color: '#2d5a3a', border: '#b8d9be' },
  info:   { bg: '#eef3fb', color: '#1a4a80', border: '#b8ccf0' },
}

function scoreColor(n: number) {
  if (n >= 8) return '#2d6a3f'
  if (n >= 5) return '#8a5a00'
  return '#c8371a'
}

export default function AnalyzePage() {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')

  async function analyze() {
    if (notes.trim().length < 30) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Something went wrong')
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResult(null)
    setNotes('')
    setError('')
  }

  const mono = "'DM Mono', monospace"
  const ink = '#0a0a0a'
  const ink2 = '#3a3a3a'
  const ink3 = '#888'
  const paper = '#f7f4ef'
  const accent = '#c8371a'
  const border = 'rgba(10,10,10,0.12)'
  const borderStrong = 'rgba(10,10,10,0.25)'

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px 80px', minHeight: '100vh' }}>
      <nav style={{ padding: '28px 0', borderBottom: `1px solid ${border}`, marginBottom: 48 }}>
        <Link href="/" style={{ fontFamily: mono, fontSize: 13, fontWeight: 500, letterSpacing: '0.12em', textDecoration: 'none', color: ink }}>
          BORDROOM
        </Link>
      </nav>

      {!result && !loading && (
        <div style={{ animation: 'fadeUp 0.3s ease' }}>
          <h1 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 8 }}>Paste your meeting notes</h1>
          <p style={{ fontSize: 15, color: ink3, marginBottom: 24 }}>Minutes, agendas, scribbled notes. Whatever you have.</p>

          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Attendees, agenda, what was discussed, decisions made, action items..."
            rows={12}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, gap: 12 }}>
            <button onClick={() => setNotes(SAMPLE)} style={{ fontSize: 13, color: ink3, textDecoration: 'underline', textUnderlineOffset: 3 }}>
              load a sample meeting
            </button>
            <button
              onClick={analyze}
              disabled={notes.trim().length < 30}
              style={{
                background: notes.trim().length < 30 ? ink3 : ink,
                color: paper, fontSize: 14, fontWeight: 500,
                padding: '12px 24px', borderRadius: 4,
                opacity: notes.trim().length < 30 ? 0.4 : 1,
                cursor: notes.trim().length < 30 ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
              }}
            >
              Render verdict
            </button>
          </div>

          {error && (
            <p style={{ marginTop: 16, fontSize: 13, color: accent, background: 'rgba(200,55,26,0.07)', padding: '10px 14px', borderRadius: 4 }}>
              {error}
            </p>
          )}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '120px 0', color: ink3 }}>
          <div style={{
            width: 24, height: 24, border: `2px solid ${borderStrong}`,
            borderTopColor: ink, borderRadius: '50%',
            animation: 'spin 0.65s linear infinite', margin: '0 auto 16px'
          }} />
          <p style={{ fontSize: 14, fontStyle: 'italic' }}>Reading the room</p>
        </div>
      )}

      {result && (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          {/* Verdict block */}
          <div style={{ padding: '40px 0 36px', borderBottom: `1px solid ${border}`, marginBottom: 32 }}>
            <div style={{
              display: 'inline-block',
              fontFamily: mono, fontSize: 11, fontWeight: 500, letterSpacing: '0.15em',
              padding: '5px 12px', border: `2px solid ${result.could_be_email ? accent : '#2d6a3f'}`,
              borderRadius: 3, marginBottom: 20,
              color: result.could_be_email ? accent : '#2d6a3f',
              background: result.could_be_email ? 'rgba(200,55,26,0.05)' : 'rgba(45,106,63,0.05)',
              animation: 'stampIn 0.4s ease forwards',
            }}>
              {result.could_be_email ? 'COULD HAVE BEEN AN EMAIL' : 'MEETING JUSTIFIED'}
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 16 }}>
              {result.verdict}
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.65, color: ink2, maxWidth: 520 }}>{result.summary}</p>
          </div>

          {/* Scores */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
            {[
              { label: 'Efficiency', val: result.score_efficiency },
              { label: 'Decisions', val: result.score_decisions },
              { label: 'Clarity', val: result.score_clarity },
            ].map(s => (
              <div key={s.label} style={{ background: 'white', border: `1px solid ${border}`, borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1, color: scoreColor(s.val) }}>
                  {s.val}<span style={{ fontSize: 14, color: '#bbb' }}>/10</span>
                </span>
                <span style={{ fontFamily: mono, fontSize: 12, color: ink3, letterSpacing: '0.05em' }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Findings */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: ink3, marginBottom: 12 }}>findings</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {result.findings.map((f, i) => {
                const c = pillColors[f.type] || pillColors.info
                return (
                  <span key={i} style={{ fontSize: 13, padding: '6px 14px', borderRadius: 99, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                    {f.text}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Unresolved */}
          {result.missing?.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: ink3, marginBottom: 12 }}>unresolved</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {result.missing.map((m, i) => (
                  <span key={i} style={{ fontSize: 13, padding: '6px 14px', borderRadius: 99, background: '#fdf6e8', color: '#7a5000', border: '1px solid #f5dfa0' }}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Split suggestion */}
          {result.split_suggestion && (
            <div style={{ marginBottom: 28, background: 'white', border: `1px solid ${border}`, borderRadius: 8, padding: 20 }}>
              <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: ink3, marginBottom: 12 }}>split this meeting</p>
              <p style={{ fontSize: 15, color: ink2, lineHeight: 1.6 }}>{result.split_suggestion}</p>
            </div>
          )}

          {/* Recommendations */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: ink3, marginBottom: 12 }}>recommendations</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {result.recommendations.map((r, i) => (
                <li key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', fontSize: 15, color: ink2, lineHeight: 1.55 }}>
                  <span style={{ fontFamily: mono, fontSize: 11, color: accent, fontWeight: 500, paddingTop: 3, flexShrink: 0 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <button onClick={reset} style={{ fontSize: 13, color: ink3, textDecoration: 'underline', textUnderlineOffset: 3, marginTop: 8 }}>
            analyze another meeting
          </button>
        </div>
      )}
    </main>
  )
}
