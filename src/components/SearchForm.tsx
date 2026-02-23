import { useState } from 'react'
import { fetchCandidates } from '../services/joshuaProject'
import { findBestMatch, type MatchResult } from '../services/anthropic'

interface Props {
  onResult: (result: MatchResult, reportedName: string) => void
  onError: (msg: string) => void
  onLoadingChange: (loading: boolean) => void
  loading: boolean
  onClearKeys: () => void
}

export default function SearchForm({
  onResult,
  onError,
  onLoadingChange,
  loading,
  onClearKeys,
}: Props) {
  const [reportedName, setReportedName] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [religion, setReligion] = useState('')
  const [status, setStatus] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reportedName.trim()) return

    onLoadingChange(true)
    onError('')
    setStatus('Searching Joshua Project...')

    try {
      const candidates = await fetchCandidates(reportedName, country)

      if (candidates.length === 0) {
        throw new Error(
          'No people groups found in Joshua Project matching that search. Try a shorter or different name.',
        )
      }

      setStatus(`Found ${candidates.length} candidates. Asking Claude to find best match...`)

      const result = await findBestMatch(reportedName, country, city, religion, candidates)
      onResult(result, reportedName)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      onLoadingChange(false)
      setStatus('')
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">PG Lookup</h1>
          <p className="text-slate-500 text-sm">People Group Matcher via Joshua Project + Claude</p>
        </div>
        <button
          onClick={onClearKeys}
          title="Change API keys"
          className="text-xs text-slate-400 hover:text-slate-600 underline"
        >
          Change Keys
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Reported People Group Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={reportedName}
            onChange={(e) => setReportedName(e.target.value)}
            placeholder="e.g. Hazaras of Kabul, Northern Pashtun..."
            required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Country <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. Afghanistan"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              City / Region <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Kabul"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Religion <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={religion}
            onChange={(e) => setReligion(e.target.value)}
            placeholder="e.g. Islam, Hinduism, Buddhism..."
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !reportedName.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Searching...' : 'Find Match'}
        </button>
      </form>

      {loading && status && (
        <p className="text-sm text-slate-500 mt-4 text-center animate-pulse">{status}</p>
      )}
    </div>
  )
}
