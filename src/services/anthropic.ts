import type { PeopleGroupCandidate } from './joshuaProject'

export interface MatchResult {
  matchedName: string
  peopleID3: string
  country: string
  language: string
  religion: string
  jpScale: number
  frontier: string
  confidence: 'High' | 'Medium' | 'Low'
  reasoning: string
}

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-haiku-4-5-20251001'

function buildPrompt(
  reportedName: string,
  country: string,
  city: string,
  religion: string,
  candidates: PeopleGroupCandidate[],
): string {
  const context = [
    country ? `Country: ${country}` : null,
    city ? `City/Region: ${city}` : null,
    religion ? `Religion: ${religion}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const candidateList = candidates
    .map(
      (c, i) =>
        `${i + 1}. Name: "${c.PeopNameInCountry}" (also known as "${c.PeopNameAcrossCountries}") | Country: ${c.Ctry} | Religion: ${c.PrimaryReligion} | Language: ${c.PrimaryLanguageName} | PeopleID3: ${c.PeopleID3} | JPScale: ${c.JPScale} | Frontier: ${c.Frontier}`,
    )
    .join('\n')

  return `I need to match a reported people group name to its official Joshua Project record.

Reported name: "${reportedName}"
${context ? `\nAdditional context:\n${context}` : ''}

Joshua Project candidates (${candidates.length} results):
${candidateList}

Based on the reported name and any context provided, identify the single best matching Joshua Project people group.

Respond in exactly this format (replace bracketed values):
MATCH: [exact PeopNameInCountry from candidate list]
PEOPLE_ID3: [PeopleID3 value]
COUNTRY: [country name]
LANGUAGE: [language name]
RELIGION: [religion]
JP_SCALE: [number]
FRONTIER: [Y or N]
CONFIDENCE: [High, Medium, or Low]
REASONING: [one or two sentences explaining why this is the best match]`
}

function parseResponse(text: string, candidates: PeopleGroupCandidate[]): MatchResult {
  const get = (key: string) => {
    const match = text.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))
    return match ? match[1].trim() : ''
  }

  const matchedName = get('MATCH')
  const peopleID3 = get('PEOPLE_ID3')
  const country = get('COUNTRY')
  const language = get('LANGUAGE')
  const religion = get('RELIGION')
  const jpScaleStr = get('JP_SCALE')
  const frontier = get('FRONTIER')
  const confidenceRaw = get('CONFIDENCE') as 'High' | 'Medium' | 'Low'
  const reasoning = get('REASONING')

  const confidence = ['High', 'Medium', 'Low'].includes(confidenceRaw)
    ? confidenceRaw
    : 'Low'

  // Try to enrich from candidate data if Claude didn't parse all fields
  const candidate = candidates.find(
    (c) => c.PeopleID3 === peopleID3 || c.PeopNameInCountry === matchedName,
  )

  return {
    matchedName: matchedName || candidate?.PeopNameInCountry || 'Unknown',
    peopleID3: peopleID3 || candidate?.PeopleID3 || '',
    country: country || candidate?.Ctry || '',
    language: language || candidate?.PrimaryLanguageName || '',
    religion: religion || candidate?.PrimaryReligion || '',
    jpScale: Number(jpScaleStr) || candidate?.JPScale || 0,
    frontier: frontier || candidate?.Frontier || '',
    confidence,
    reasoning,
  }
}

export async function findBestMatch(
  reportedName: string,
  country: string,
  city: string,
  religion: string,
  candidates: PeopleGroupCandidate[],
): Promise<MatchResult> {
  const apiKey = localStorage.getItem('anthropic_api_key')
  if (!apiKey) throw new Error('Anthropic API key not set.')

  if (candidates.length === 0) {
    throw new Error('No Joshua Project candidates found to match against.')
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 512,
      system:
        'You are an expert in global peoples classification for Christian missions work, with deep knowledge of Joshua Project people group data. Your task is to match reported people group names to the correct official Joshua Project record. Be precise and follow the response format exactly.',
      messages: [
        {
          role: 'user',
          content: buildPrompt(reportedName, country, city, religion, candidates),
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    const msg = (err as { error?: { message?: string } }).error?.message ?? response.statusText
    throw new Error(`Anthropic API error ${response.status}: ${msg}`)
  }

  const data = await response.json()
  const text: string = data?.content?.[0]?.text ?? ''
  return parseResponse(text, candidates)
}
