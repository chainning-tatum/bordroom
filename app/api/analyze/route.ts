import { NextRequest, NextResponse } from 'next/server'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10
const RATE_WINDOW = 60_000
const MAX_CHARS = 15_000

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
Analyze meeting notes and return ONLY a JSON object. No markdown, no preamble, no explanation.
Be specific to the actual content. Do not give generic advice.
Do not use em dashes anywhere in your output. Use regular dashes or rewrite the sentence naturally.
Do not use emojis anywhere in your output.`

const USER_PROMPT = (notes: string) => `Analyze these meeting notes and return ONLY this JSON structure:

{
  "verdict": "short punchy verdict phrase, written like a human (e.g. 'could have been an email', 'make this two meetings', 'surprisingly productive', 'no decisions were made', 'action item graveyard', 'nobody knew the agenda')",
  "score_efficiency": <number 1-10>,
  "score_decisions": <number 1-10>,
  "score_clarity": <number 1-10>,
  "summary": "2-3 sentences, honest and direct, written like a person not a robot. No em dashes. No emojis.",
  "findings": [
    { "type": "danger|warn|ok|info", "text": "specific finding, under 8 words, no em dashes" }
  ],
  "recommendations": ["specific actionable recommendation, written naturally, no em dashes"],
  "could_be_email": <true|false>,
  "split_suggestion": null or "concrete plain-English description of how to split this meeting",
  "missing": ["what was notably absent or unresolved, short phrase"]
}

Rules:
- findings: 3-5 items, specific to these notes
- recommendations: 2-4 items, concrete not generic
- missing: 2-4 items
- verdict must be punchy and direct, not bland
- no em dashes anywhere
- no emojis anywhere

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

    if (!response.ok) {
      console.error('Anthropic error:', JSON.stringify(data))
      return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 })
    }

    const raw = data.content?.map((b: { text?: string }) => b.text || '').join('') || ''
    const clean = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    return NextResponse.json(result)
  } catch (err) {
    console.error('Error:', err)
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 })
  }
}
