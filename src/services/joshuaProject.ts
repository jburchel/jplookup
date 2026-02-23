import countriesData from '../data/countries.json'

export interface PeopleGroupCandidate {
  PeopleID3: string
  PeopNameInCountry: string
  PeopNameAcrossCountries: string
  Ctry: string
  ROG3: string
  PrimaryReligion: string
  PrimaryLanguageName: string
  JPScale: number
  Frontier: string
}

const JP_API_BASE = 'https://api.joshuaproject.net/v1'
const JP_FIELDS = [
  'PeopleID3',
  'PeopNameInCountry',
  'PeopNameAcrossCountries',
  'Ctry',
  'ROG3',
  'PrimaryReligion',
  'PrimaryLanguageName',
  'JPScale',
  'Frontier',
].join('|')

function resolveCountryCode(countryName: string): string | null {
  const key = countryName.trim().toLowerCase()
  const map = countriesData as Record<string, string>
  return map[key] ?? null
}

export async function fetchCandidates(
  reportedName: string,
  country: string,
): Promise<PeopleGroupCandidate[]> {
  const apiKey = localStorage.getItem('jp_api_key')
  if (!apiKey) throw new Error('Joshua Project API key not set.')

  const params = new URLSearchParams({
    api_key: apiKey,
    limit: '50',
    fields: JP_FIELDS,
  })

  // Add name search if provided
  if (reportedName.trim()) {
    // Use first significant word for broader matching
    const nameWords = reportedName.trim().split(/\s+/)
    params.set('name_search', nameWords[0])
  }

  // Add country filter if resolvable
  if (country.trim()) {
    const code = resolveCountryCode(country)
    if (code) params.set('countries', code)
  }

  const url = `${JP_API_BASE}/people_groups.json?${params.toString()}`

  const response = await fetch(url, {
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Joshua Project API error ${response.status}: ${text}`)
  }

  const data = await response.json()
  return Array.isArray(data) ? (data as PeopleGroupCandidate[]) : []
}
