import { useState } from 'react'
import ApiKeySetup from './components/ApiKeySetup'
import SearchForm from './components/SearchForm'
import ResultDisplay from './components/ResultDisplay'
import type { MatchResult } from './services/anthropic'

function hasKeys() {
  return !!(localStorage.getItem('jp_api_key') && localStorage.getItem('anthropic_api_key'))
}

export default function App() {
  const [keysSet, setKeysSet] = useState(hasKeys)
  const [result, setResult] = useState<MatchResult | null>(null)
  const [reportedName, setReportedName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleKeysSaved() {
    setKeysSet(true)
  }

  function handleClearKeys() {
    localStorage.removeItem('jp_api_key')
    localStorage.removeItem('anthropic_api_key')
    setKeysSet(false)
    setResult(null)
    setError('')
  }

  function handleResult(r: MatchResult, name: string) {
    setResult(r)
    setReportedName(name)
    setError('')
  }

  function handleReset() {
    setResult(null)
    setReportedName('')
    setError('')
  }

  if (!keysSet) {
    return <ApiKeySetup onSave={handleKeysSaved} />
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {result ? (
        <ResultDisplay result={result} reportedName={reportedName} onReset={handleReset} />
      ) : (
        <div className="w-full max-w-xl">
          <SearchForm
            onResult={handleResult}
            onError={setError}
            onLoadingChange={setLoading}
            loading={loading}
            onClearKeys={handleClearKeys}
          />
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
