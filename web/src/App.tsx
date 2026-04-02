import { useState, useEffect } from 'react'
import { 
  Package,          // 📦
  Target,           // 🎯
  Bot,              // 🤖
  Ruler,            // 📐
  Anchor,           // 🪝 (hook)
  Check,            // ✓
  Loader2           // Loading
} from 'lucide-react'

interface Package {
  id: string
  name: string
  target: string
  source?: string
}

interface Component {
  id: string
  name: string
  type: 'skill' | 'agent' | 'hook' | 'rule'
  packageName?: string
  installed?: boolean
}

function App() {
  const [target, setTarget] = useState<'qoder' | 'cursor'>('qoder')
  const [view, setView] = useState<'packages' | 'components'>('packages')
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPackages()
  }, [target])

  const fetchPackages = async () => {
    setLoading(true)
    
    // Simulate API call with different data based on target
    const qoderPackages = [
      {
        name: 'superpowers',
        target: 'qoder',
        version: 'v1.0.0',
        components: [
          { id: '1', name: 'brainstorming', type: 'skill', packageName: 'superpowers' },
          { id: '2', name: 'writing-plans', type: 'skill', packageName: 'superpowers' },
          { id: '3', name: 'test-driven-development', type: 'skill', packageName: 'superpowers' },
          { id: '4', name: 'subagent-driven-dev', type: 'agent', packageName: 'superpowers' },
        ]
      },
      {
        name: 'open-spec',
        target: 'qoder',
        version: 'v2.0.0',
        components: [
          { id: '5', name: 'api-design', type: 'skill', packageName: 'open-spec' },
          { id: '6', name: 'typescript-rules', type: 'rule', packageName: 'open-spec' },
        ]
      }
    ]
    
    const cursorPackages = [
      {
        name: 'cursor-tools',
        target: 'cursor',
        version: 'v1.5.0',
        components: [
          { id: '7', name: 'cursor-skill', type: 'skill', packageName: 'cursor-tools' },
          { id: '8', name: 'cursor-agent', type: 'agent', packageName: 'cursor-tools' },
        ]
      },
      {
        name: 'superpowers',
        target: 'cursor',
        version: 'v1.0.0',
        components: [
          { id: '9', name: 'brainstorming', type: 'skill', packageName: 'superpowers' },
          { id: '10', name: 'verification', type: 'skill', packageName: 'superpowers' },
        ]
      }
    ]
    
    setPackages(target === 'qoder' ? qoderPackages : cursorPackages)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Easy Skills Hub</h1>
          {/* IDE Selector - Segmented Control */}
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-1">
            <button
              onClick={() => setTarget('qoder')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                target === 'qoder'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Qoder
            </button>
            <button
              onClick={() => setTarget('cursor')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                target === 'cursor'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cursor
            </button>
          </div>
        </div>
      </header>

      {/* Install Guide Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg m-6 p-4">
        <h2 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Install Easy Skills in Your AI IDE
        </h2>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium text-blue-700">Qoder:</span>
            <code className="ml-2 px-2 py-1 bg-blue-100 rounded text-blue-800">
               Fetch and follow instructions from http://localhost:27842/qoder/easy-skills.md
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
            onClick={() => setView('components')}
            className={`py-3 px-1 border-b-2 font-medium ${
              view === 'components'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Components
          </button>
        </nav>
      </div>

      {/* Content */}
      <main className="p-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500 flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span>Loading...</span>
          </div>
        ) : view === 'packages' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <div key={pkg.name} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-lg">{pkg.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{pkg.version}</p>
                <p className="text-sm text-gray-600 mt-2">{pkg.components.length} components</p>
                <div className="mt-3 flex gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Installed
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Skills Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Skills
                  <span className="text-sm text-blue-500 font-normal">(from packages)</span>
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {packages.flatMap(pkg => 
                    pkg.components
                      .filter((c: Component) => c.type === 'skill')
                      .map((comp: Component) => (
                        <div key={comp.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-sm font-medium">{comp.name}</span>
                          </div>
                          <span className="text-xs text-gray-400">← {comp.packageName}</span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Agents Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-purple-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-purple-800 flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  Agents
                  <span className="text-sm text-purple-500 font-normal">(from packages)</span>
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {packages.flatMap(pkg => 
                    pkg.components
                      .filter((c: Component) => c.type === 'agent')
                      .map((comp: Component) => (
                        <div key={comp.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                            <span className="text-sm font-medium">{comp.name}</span>
                          </div>
                          <span className="text-xs text-gray-400">← {comp.packageName}</span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Rules Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-orange-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-orange-800 flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  Rules
                  <span className="text-sm text-orange-500 font-normal">(from packages)</span>
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {packages.flatMap(pkg => 
                    pkg.components
                      .filter((c: Component) => c.type === 'rule')
                      .map((comp: Component) => (
                        <div key={comp.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                            <span className="text-sm font-medium">{comp.name}</span>
                          </div>
                          <span className="text-xs text-gray-400">← {comp.packageName}</span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Hooks Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <Anchor className="w-4 h-4" />
                  Hooks
                  <span className="text-sm text-gray-500 font-normal">(from packages)</span>
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {packages.flatMap(pkg => 
                    pkg.components
                      .filter((c: Component) => c.type === 'hook')
                      .map((comp: Component) => (
                        <div key={comp.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                            <span className="text-sm font-medium">{comp.name}</span>
                          </div>
                          <span className="text-xs text-gray-400">← {comp.packageName}</span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
