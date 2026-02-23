import type { MatchResult } from '../services/anthropic'

interface Props {
  result: MatchResult
  reportedName: string
  onReset: () => void
}

const confidenceColors = {
  High: 'bg-green-100 text-green-800 border-green-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Low: 'bg-red-100 text-red-800 border-red-200',
}

const jpScaleLabels: Record<number, string> = {
  1: 'Unreached',
  2: 'Unreached',
  3: 'Minimally Reached',
  4: 'Partially Reached',
  5: 'Significantly Reached',
}

export default function ResultDisplay({ result, reportedName, onReset }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Match Found</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Reported: <span className="italic">"{reportedName}"</span>
          </p>
        </div>
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full border ${confidenceColors[result.confidence]}`}
        >
          {result.confidence} Confidence
        </span>
      </div>

      <div className="bg-slate-50 rounded-xl p-5 mb-5">
        <div className="flex items-baseline gap-2 mb-1">
          <h3 className="text-lg font-semibold text-slate-900">{result.matchedName}</h3>
          {result.frontier === 'Y' && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
              Frontier
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 font-mono">ID: {result.peopleID3}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <Field label="Country" value={result.country} />
        <Field label="Language" value={result.language} />
        <Field label="Religion" value={result.religion} />
        <Field
          label="JP Scale"
          value={result.jpScale ? `${result.jpScale} — ${jpScaleLabels[result.jpScale] ?? ''}` : '—'}
        />
      </div>

      {result.reasoning && (
        <div className="border-t border-slate-100 pt-4 mb-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
            Claude's Reasoning
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">{result.reasoning}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          New Search
        </button>
        {result.peopleID3 && (
          <a
            href={`https://joshuaproject.net/people_groups/${result.peopleID3}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center border border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-800 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
          >
            View on JP ↗
          </a>
        )}
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-lg px-3 py-2">
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm text-slate-800 mt-0.5">{value || '—'}</p>
    </div>
  )
}
