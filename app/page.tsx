'use client'
import { useState } from 'react'
import Link from 'next/link'
import styles from './analyze.module.css'

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
- Bug triage: Jordan said 3 bugs are blocked on design. Sam wasn't sure about two of them, said she'd look into it later.
- Brand refresh: Alex showed 4 color palettes. Group couldn't agree. No decision reached. Will revisit next week.
- Onboarding flow: Sam showed wireframes. Good feedback from Marcus. Leo raised a technical concern. No resolution.
- Marcus asked about the sales deck update. Nobody knew the status.
- Tina listed 7 QA findings verbally. No written summary provided.
- Meeting ran 20 minutes over.

Action items:
- Sam: look into the design bugs (no deadline set)
- Priya: schedule another meeting for brand decision
- Leo: investigate animation performance (sometime before next release)`

function scoreLabel(n: number) {
  if (n >= 8) return 'good'
  if (n >= 5) return 'meh'
  return 'poor'
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

  return (
    <main className={styles.main}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.navLogo}>BORDROOM</Link>
      </nav>

      {!result && !loading && (
        <div className={styles.inputSection}>
          <h1 className={styles.inputTitle}>Paste your meeting notes</h1>
          <p className={styles.inputSub}>Minutes, agendas, scribbled notes. Whatever you have.</p>

          <textarea
            className={styles.textarea}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Attendees, agenda, what was discussed, decisions made, action items..."
            rows={12}
          />

          <div className={styles.inputFooter}>
            <button className={styles.sampleBtn} onClick={() => setNotes(SAMPLE)}>
              load a sample meeting
            </button>
            <button
              className={styles.analyzeBtn}
              onClick={analyze}
              disabled={notes.trim().length < 30}
            >
              Render verdict
            </button>
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </div>
      )}

      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Reading the room</p>
        </div>
      )}

      {result && (
        <div className={styles.results}>
          <div className={styles.verdictBlock}>
            <div className={styles.stamp} data-email={result.could_be_email}>
              {result.could_be_email ? 'COULD HAVE BEEN AN EMAIL' : 'MEETING JUSTIFIED'}
            </div>
            <h2 className={styles.verdictText}>{result.verdict}</h2>
            <p className={styles.verdictSummary}>{result.summary}</p>
          </div>

          <div className={styles.scores}>
            {[
              { label: 'Efficiency', val: result.score_efficiency },
              { label: 'Decisions', val: result.score_decisions },
              { label: 'Clarity', val: result.score_clarity },
            ].map(s => (
              <div key={s.label} className={styles.scoreCard} data-level={scoreLabel(s.val)}>
                <span className={styles.scoreVal}>{s.val}<span className={styles.scoreOf}>/10</span></span>
                <span className={styles.scoreLabel}>{s.label}</span>
              </div>
            ))}
          </div>

          <div className={styles.section}>
            <p className={styles.sectionLabel}>findings</p>
            <div className={styles.pills}>
              {result.findings.map((f, i) => (
                <span key={i} className={`${styles.pill} ${styles[`pill_${f.type}`]}`}>{f.text}</span>
              ))}
            </div>
          </div>

          {result.missing?.length > 0 && (
            <div className={styles.section}>
              <p className={styles.sectionLabel}>unresolved</p>
              <div className={styles.pills}>
                {result.missing.map((m, i) => (
                  <span key={i} className={`${styles.pill} ${styles.pill_warn}`}>{m}</span>
                ))}
              </div>
            </div>
          )}

          {result.split_suggestion && (
            <div className={`${styles.section} ${styles.splitBox}`}>
              <p className={styles.sectionLabel}>split this meeting</p>
              <p className={styles.splitText}>{result.split_suggestion}</p>
            </div>
          )}

          <div className={styles.section}>
            <p className={styles.sectionLabel}>recommendations</p>
            <ul className={styles.recList}>
              {result.recommendations.map((r, i) => (
                <li key={i} className={styles.recItem}>
                  <span className={styles.recNum}>{String(i + 1).padStart(2, '0')}</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <button className={styles.resetBtn} onClick={reset}>
            analyze another meeting
          </button>
        </div>
      )}
    </main>
  )
}
