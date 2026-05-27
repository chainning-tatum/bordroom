'use client'
import Link from 'next/link'
import styles from './page.module.css'

const examples = [
  { emoji: '📧', label: 'could\'ve been an email' },
  { emoji: '✂️', label: 'make this two meetings' },
  { emoji: '😴', label: 'decisions? never heard of them' },
  { emoji: '🔥', label: 'surprisingly productive' },
  { emoji: '📋', label: 'action item graveyard' },
  { emoji: '⏱️', label: 'where was the agenda?' },
]

export default function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.logo}>BORDROOM</div>
        <div className={styles.tagline}>a meeting verdict machine</div>
      </header>

      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Was this meeting<br />
          <em>actually necessary?</em>
        </h1>
        <p className={styles.heroBody}>
          Paste your notes. We&apos;ll tell you if it could&apos;ve been an email —
          and exactly how to fix it next time.
        </p>
        <Link href="/analyze" className={styles.cta}>
          Render a verdict →
        </Link>
      </section>

      <section className={styles.verdicts}>
        <p className={styles.verdictsLabel}>possible verdicts include</p>
        <div className={styles.verdictsGrid}>
          {examples.map((v) => (
            <div key={v.label} className={styles.verdictChip}>
              <span className={styles.chipEmoji}>{v.emoji}</span>
              <span>{v.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.how}>
        <div className={styles.howStep}>
          <span className={styles.stepNum}>01</span>
          <p>Paste your meeting notes, minutes, or agenda</p>
        </div>
        <div className={styles.howDivider}>→</div>
        <div className={styles.howStep}>
          <span className={styles.stepNum}>02</span>
          <p>AI analyzes decisions, clarity, and efficiency</p>
        </div>
        <div className={styles.howDivider}>→</div>
        <div className={styles.howStep}>
          <span className={styles.stepNum}>03</span>
          <p>Get a blunt verdict and concrete next steps</p>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>Your notes are never stored. Powered by Claude.</p>
      </footer>
    </main>
  )
}
