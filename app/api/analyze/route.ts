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

const STAMPS = `
Pick the single most accurate stamp from this list based on what actually happened in the meeting:

- "COULD HAVE BEEN AN EMAIL" — information was presented with no real discussion or decisions needed. Could have been sent as a summary.
- "MAKE THIS TWO MEETINGS" — two clearly distinct topics or audiences were forced into one session. People sat through things irrelevant to them.
- "MAKE THIS THREE MEETINGS" — three or more distinct topics or audiences were crammed together with no coherent thread.
- "SURPRISINGLY PRODUCTIVE" — real decisions were made, the right people were there, time was used well.
- "NO DECISIONS WERE MADE" — discussion happened but nothing was resolved or agreed upon. Everyone left in the same position they arrived.
- "ACTION ITEM GRAVEYARD" — action items were assigned but vague, undated, or unowned. They will not get done.
- "NOBODY KNEW THE AGENDA" — the meeting lacked clear purpose or structure. Topics wandered. People were unprepared.
- "WRONG PEOPLE IN THE ROOM" — key decision-makers were absent, or too many irrelevant attendees were present.
- "RAN OVER FOR NO REASON" — the meeting exceeded its time without producing proportional value.
- "NEEDS A COMPLETE RETHINK" — the meeting was structurally broken in multiple ways. Not just inefficient but the wrong format entirely.
- "MOSTLY WASTED" — some value was produced but the majority of time and attendance was not justified.
- "MEETING JUSTIFIED" — use this only when decisions were clearly made, the right people attended, and outcomes were concrete. Reserve for genuinely well-run meetings.
`

const USER_PROMPT = (notes: string) => `Analyze these meeting notes and return ONLY this JSON structure:

{
  "stamp": "one stamp chosen from the provided list",
  "verdict": "a short punchy phrase that elaborates on the stamp in plain language, specific to this meeting",
  "score_efficiency": <number 1-10>,
  "score_decisions": <number 1-10>,
  "score_clarity": <number 1-10>,
  "summary": "2-3 sentences, honest and direct, written like a person not a robot. No em dashes. No emojis.",
  "findings": [
    { "type": "danger|warn|ok|info", "text": "specific finding, under 8 words, no em dashes" }
  ],
  "recommendations": ["specific actionable recommendation, written naturally, no em dashes"],
  "split_suggestion": null or "concrete plain-English description of how to split this meeting, only include if the stamp is MAKE THIS TWO MEETINGS or MAKE THIS THREE MEETINGS",
  "missing": ["what was notably absent or unresolved, short phrase"]
}

Stamp guidance:
${STAMPS}

Rules:
- findings: 3-5 items, specific to these notes
- recommendations: 2-4 items, concrete not generic  
- missing: 2-4 items
- verdict must be punchy and specific to this meeting, not a restatement of the stamp
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
