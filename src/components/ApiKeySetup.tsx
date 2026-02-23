import { useState } from 'react'

interface Props {
  onSave: () => void
}

export default function ApiKeySetup({ onSave }: Props) {
  const [jpKey, setJpKey] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [error, setError] = useState('')

  function handleSave() {
    if (!jpKey.trim() || !anthropicKey.trim()) {
      setError('Both API keys are required.')
      return
    }
    localStorage.setItem('jp_api_key', jpKey.trim())
    localStorage.setItem('anthropic_api_key', anthropicKey.trim())
    onSave()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-800">PG Lookup</h1>
          <p className="text-slate-500 mt-1 text-sm">People Group Matcher</p>
        </div>

        <p className="text-slate-600 text-sm mb-6">
          Enter your API keys to get started. These are saved in your browser only and never
          transmitted to any server other than the respective APIs.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Joshua Project API Key
            </label>
            <input
              type="password"
              value={jpKey}
              onChange={(e) => setJpKey(e.target.value)}
              placeholder="Your Joshua Project API key"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Anthropic API Key
            </label>
            <input
              type="password"
              value={anthropicKey}
              onChange={(e) => setAnthropicKey(e.target.value)}
              placeholder="Your Anthropic API key (sk-ant-...)"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

        <button
          onClick={handleSave}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Save & Continue
        </button>

        <p className="text-xs text-slate-400 mt-4 text-center">
          Keys are stored in your browser's localStorage.
        </p>
      </div>
    </div>
  )
}
