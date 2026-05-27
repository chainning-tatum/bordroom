import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter (per IP, resets on server restart)
// For production, swap this for Upstash Redis — see README
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10       // requests per window
const RATE_WINDOW = 60_000  // 1 minute in ms
const MAX_CHARS = 15_000    // ~3000 words — plenty for any meeting notes

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

const SYSTEM_PROMPT = `You are BORDROOM, a brutally honest but constructive meeting analyzer.
Analyze meeting notes and return ONLY a JSON object — no markdown, no preamble, no explanation.
Be specific to the actual content. Do not give generic advice.`

const USER_PROMPT = (notes: string) => `Analyze these meeting notes and return ONLY this JSON structure:

{
  "verdict": "short punchy verdict phrase (e.g. 'could\\'ve been an email', 'make this two meetings', 'surprisingly productive', 'decisions? never heard of them', 'action item graveyard', 'where was the agenda?', 'a meeting about scheduling meetings')",
  "verdict_emoji": "single relevant emoji",
  "score_efficiency": <number 1-10>,
  "score_decisions": <number 1-10>,
  "score_clarity": <number 1-10>,
  "summary": "2-3 sentences honest assessment of what actually happened",
  "findings": [
    { "type": "danger|warn|ok|info", "text": "specific finding under 8 words" }
  ],
  "recommendations": ["specific actionable recommendation"],
  "could_be_email": <true|false>,
  "split_suggestion": null or "concrete description of how to split this meeting",
  "missing": ["what was notably absent or unresolved"]
}

Rules:
- findings: 3-5 items, specific to these notes
- recommendations: 2-4 items, concrete not generic
- missing: 2-4 items
- verdict must be punchy and memorable, not bland

Meeting notes:
${notes}`

export async function POST(req: NextRequest) {
  const ip = getIp(req)

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Try again in a minute.' }, { status: 429 })
  }

  let notes: string
  try {
    const body = await req.json()
    notes = body.notes?.toString()?.trim() || ''
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  if (notes.length < 30) {
    return NextResponse.json({ error: 'Notes are too short.' }, { status: 400 })
  }
  if (notes.length > MAX_CHARS) {
    return NextResponse.json({ error: `Notes too long. Max ${MAX_CHARS} characters.` }, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Server not configured.' }, { status: 500 })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: USER_PROMPT(notes) }],
      }),
    })

    const data = await response.json()
    const raw = data.content?.map((b: { text?: string }) => b.text || '').join('') || ''
    const clean = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 })
  }
}
