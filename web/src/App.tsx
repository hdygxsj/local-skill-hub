import { useState, useEffect } from 'react'

interface Package {
  id: string
  name: string
  target: string
  source?: string
}

interface Component {
  id: string
  name: string
  type: string
  packageName?: string
  installed?: boolean
}

function App() {
  const [target, setTarget] = useState<'qoder' | 'cursor'>('qoder')
  const [view, setView] = useState<'packages' | 'skills'>('packages')
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPackages()
  }, [target])

  const fetchPackages = async () => {
    setLoading(true)
    // TODO: Replace with actual API call
    // For now, show sample data
    setPackages([
      {
        name: 'superpowers',
        target: target,
        version: 'v1.0.0',
        components: ['brainstorming', 'writing-plans', 'test-driven-development']
      },
      {
        name: 'open-spec',
        target: target,
        version: 'v2.0.0',
        components: ['api-design', 'db-schema']
      }
    ])
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Easy Skills Hub</h1>
          <select 
            value={target}
            onChange={(e) => setTarget(e.target.value as 'qoder' | 'cursor')}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="qoder">Qoder</option>
            <option value="cursor">Cursor</option>
          </select>
        </div>
      </header>

      {/* Install Guide Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg m-6 p-4">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Install Easy Skills in Your AI IDE</h2>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium text-blue-700">Qoder:</span>
            <code className="ml-2 px-2 py-1 bg-blue-100 rounded text-blue-800">
              /easy-skills Fetch and follow instructions from http://localhost:27842/qoder/easy-skills.md
            </code>
          </div>
          <div>
            <span className="font-medium text-blue-700">Cursor:</span>
            <code className="ml-2 px-2 py-1 bg-blue-100 rounded text-blue-800">
              Fetch and follow instructions from http://localhost:27842/cursor/easy-skills.md
            </code>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-gray-200">
        <nav className="flex space-x-4">
          <button
            onClick={() => setView('packages')}
            className={`py-3 px-1 border-b-2 font-medium ${
              view === 'packages'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Packages
          </button>
          <button
            onClick={() => setView('skills')}
            className={`py-3 px-1 border-b-2 font-medium ${
              view === 'skills'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Skills
          </button>
        </nav>
      </div>

      {/* Content */}
      <main className="p-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : view === 'packages' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <div key={pkg.name} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-lg">{pkg.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{pkg.version}</p>
                <p className="text-sm text-gray-600 mt-2">{pkg.components.length} components</p>
                <div className="mt-3 flex gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                    ✓ Installed
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {packages.map((pkg) => (
              <div key={pkg.name} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                  <span className="font-medium">{pkg.name}</span>
                  <span className="text-sm text-gray-500">{pkg.components.length} skills</span>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    {pkg.components.map((comp: string) => (
                      <div key={comp} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-sm">{comp}</span>
                        <span className="text-xs text-gray-400">← {pkg.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
