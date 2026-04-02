import { useState, useEffect } from 'react'
import { 
  Package as PackageIcon,
  Target,
  Bot,
  Ruler,
  Anchor,
  Check,
  Loader2,
  Folder,
  FolderOpen,
  Clock,
  ChevronDown,
  HelpCircle,
  X
} from 'lucide-react'

interface Package {
  id: string
  name: string
  target: string
  version: string
  source?: string
  installed: boolean
  installPath: string
  scope: 'user' | 'project'
  projectName?: string // 项目目录名，如 "my-project"
  installedAt?: string
  components: Component[]
}

interface Component {
  id: string
  name: string
  type: 'skill' | 'agent' | 'hook' | 'rule'
  packageName?: string
  installed?: boolean
  installPath?: string
  installedAt?: string
}

interface Project {
  name: string
  path: string
}

function App() {
  const [target, setTarget] = useState<'qoder' | 'cursor'>('qoder')
  const [scope, setScope] = useState<'user' | 'project'>('user')
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [view, setView] = useState<'packages' | 'components'>('packages')
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    fetchProjects()
    fetchPackages()
  }, [target, scope, selectedProject])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data.projects || [])
    } catch (err) {
      console.error('Failed to fetch projects:', err)
      // Fallback to mock
      setProjects([
        { name: 'local-skill-hub', path: '/Users/zhongyangyang/PycharmProjects/local-skill-hub' },
        { name: 'my-project', path: '/Users/zhongyangyang/projects/my-project' },
        { name: 'api-server', path: '/Users/zhongyangyang/projects/api-server' },
      ])
    }
  }

  const fetchPackages = async () => {
    setLoading(true)
    
    try {
      const res = await fetch(`/api/packages?target=${target}`)
      const data = await res.json()
      
      // Transform CLI output to our format
      const packages: Package[] = (data.packages || []).map((p: any) => ({
        id: p.package?.id || '',
        name: p.package?.name || '',
        target: p.package?.target || target,
        version: p.current_version?.metadata ? JSON.parse(p.current_version.metadata).version || 'v1' : 'v1',
        installed: true,
        installPath: '~/.local/easy-skills',
        scope: 'user' as const,
        projectName: undefined,
        installedAt: p.current_version?.created_at || '',
        components: (p.components || []).map((c: any) => ({
          id: c.id || '',
          name: c.name || '',
          type: c.type as 'skill' | 'agent' | 'hook' | 'rule',
          packageName: p.package?.name,
          installed: true,
          installPath: c.path || '',
          installedAt: '',
        })),
      }))
      
      setPackages(packages)
    } catch (err) {
      console.error('Failed to fetch packages:', err)
      // Fallback to mock data
      const qoderPackages: Package[] = [
        {
          id: '1',
          name: 'superpowers',
          target: 'qoder',
          version: 'v1.0.0',
          installed: true,
          installPath: '~/.qoder/skills/superpowers',
          scope: 'user',
          projectName: undefined,
          installedAt: '2024-01-15 10:30',
          components: [
            { id: '1', name: 'brainstorming', type: 'skill', packageName: 'superpowers', installed: true, installPath: '~/.qoder/skills/superpowers/brainstorming', installedAt: '2024-01-15 10:30' },
            { id: '2', name: 'writing-plans', type: 'skill', packageName: 'superpowers', installed: true, installPath: '~/.qoder/skills/superpowers/writing-plans', installedAt: '2024-01-15 10:30' },
          ]
        },
        {
          id: '2',
          name: 'open-spec',
          target: 'qoder',
          version: 'v2.0.0',
          installed: true,
          installPath: '.qoder/skills/open-spec',
          scope: 'project',
          projectName: 'local-skill-hub',
          installedAt: '2024-02-20 14:15',
          components: [
            { id: '5', name: 'api-design', type: 'skill', packageName: 'open-spec', installed: true, installPath: '.qoder/skills/open-spec/api-design', installedAt: '2024-02-20 14:15' },
          ]
        }
      ]
      
      const cursorPackages: Package[] = [
        {
          id: '3',
          name: 'cursor-tools',
          target: 'cursor',
          version: 'v1.5.0',
          installed: true,
          installPath: '~/.cursorrules/cursor-tools',
          scope: 'user',
          projectName: undefined,
          installedAt: '2024-03-01 09:00',
          components: [
            { id: '7', name: 'cursor-skill', type: 'skill', packageName: 'cursor-tools', installed: true, installPath: '~/.cursorrules/cursor-tools/cursor-skill', installedAt: '2024-03-01 09:00' },
          ]
        }
      ]
      
      let allPackages = target === 'qoder' ? qoderPackages : cursorPackages
      
      if (scope === 'user') {
        allPackages = allPackages.filter(p => p.scope === 'user')
      } else if (scope === 'project' && selectedProject) {
        allPackages = allPackages.filter(p => 
          p.scope === 'user' || (p.scope === 'project' && p.projectName === selectedProject)
        )
      } else if (scope === 'project' && !selectedProject) {
        allPackages = allPackages.filter(p => p.scope === 'user')
      }
      
      setPackages(allPackages)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Easy Skills Hub</h1>
            <button
              onClick={() => setShowHelp(true)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="How to use"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            {/* Scope Selector */}
            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-1">
              <button
                onClick={() => {
                  setScope('user')
                  setSelectedProject(null)
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  scope === 'user'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                User
              </button>
              <button
                onClick={() => setScope('project')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  scope === 'project'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Project
              </button>
            </div>
            
            {/* Project Selector (only show when scope is project) */}
            {scope === 'project' && (
              <div className="relative">
                <select
                  value={selectedProject || ''}
                  onChange={(e) => setSelectedProject(e.target.value || null)}
                  className="appearance-none pl-3 pr-8 py-1.5 text-sm font-medium rounded-lg border border-gray-200 bg-white cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select project...</option>
                  {projects.map((proj) => (
                    <option key={proj.name} value={proj.name}>
                      {proj.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            )}
            
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
        </div>
      </header>

      {/* Install Guide Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg m-6 p-4">
        <h2 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <PackageIcon className="w-5 h-5" />
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
          <div className="space-y-6">
            {/* User Scope Packages */}
            {scope === 'project' && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  User Scope (Inherited)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {packages.filter(p => p.scope === 'user').map((pkg) => (
                    <div key={pkg.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 opacity-80">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{pkg.name}</h3>
                          <p className="text-sm text-gray-500 mt-0.5">v{pkg.version}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                          pkg.installed 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          <Check className="w-3 h-3" />
                          {pkg.installed ? 'Installed' : 'Not Installed'}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <Folder className="w-4 h-4 text-gray-400" />
                        <code className="text-gray-600 text-xs truncate">{pkg.installPath || 'N/A'}</code>
                      </div>
                      {pkg.installed && pkg.installedAt && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{pkg.installedAt}</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">{pkg.components.length} components</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Project Scope Packages */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                {scope === 'project' ? (
                  <>
                    <FolderOpen className="w-4 h-4" />
                    Project Scope ({selectedProject})
                  </>
                ) : (
                  <>
                    <Folder className="w-4 h-4" />
                    User Scope
                  </>
                )}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.filter(p => scope === 'user' || p.scope === 'project').map((pkg) => (
                  <div key={pkg.id} className={`bg-gray-50 rounded-lg p-4 border ${
                    pkg.scope === 'project' ? 'border-purple-200' : 'border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{pkg.name}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">v{pkg.version}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                        pkg.installed 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        <Check className="w-3 h-3" />
                        {pkg.installed ? 'Installed' : 'Not Installed'}
                      </span>
                    </div>
                    
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      {pkg.scope === 'user' ? (
                        <Folder className="w-4 h-4 text-gray-400" />
                      ) : (
                        <FolderOpen className="w-4 h-4 text-purple-400" />
                      )}
                      <code className="text-gray-600 text-xs truncate">{pkg.installPath || 'N/A'}</code>
                      {pkg.scope === 'project' && pkg.projectName && (
                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                          {pkg.projectName}
                        </span>
                      )}
                    </div>
                    
                    {pkg.installed && pkg.installedAt && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{pkg.installedAt}</span>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-400 mt-2">{pkg.components.length} components</p>
                  </div>
                ))}
              </div>
            </div>
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
                <div className="space-y-2">
                  {packages.flatMap(pkg => 
                    pkg.components
                      .filter((c: Component) => c.type === 'skill')
                      .map((comp: Component) => (
                        <div key={comp.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              <span className="text-sm font-medium">{comp.name}</span>
                            </div>
                            <span className={`px-2 py-0.5 text-xs rounded ${
                              comp.installed 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-200 text-gray-500'
                            }`}>
                              {comp.installed ? 'Installed' : 'Not Installed'}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                            <code className="truncate">{comp.installPath || 'N/A'}</code>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs text-gray-400">from {comp.packageName}</span>
                            {comp.installed && comp.installedAt && (
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <Clock className="w-3 h-3" />
                                {comp.installedAt}
                              </span>
                            )}
                          </div>
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
                <div className="space-y-2">
                  {packages.flatMap(pkg => 
                    pkg.components
                      .filter((c: Component) => c.type === 'agent')
                      .map((comp: Component) => (
                        <div key={comp.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                              <span className="text-sm font-medium">{comp.name}</span>
                            </div>
                            <span className={`px-2 py-0.5 text-xs rounded ${
                              comp.installed 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-200 text-gray-500'
                            }`}>
                              {comp.installed ? 'Installed' : 'Not Installed'}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                            <code className="truncate">{comp.installPath || 'N/A'}</code>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs text-gray-400">from {comp.packageName}</span>
                            {comp.installed && comp.installedAt && (
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <Clock className="w-3 h-3" />
                                {comp.installedAt}
                              </span>
                            )}
                          </div>
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
                <div className="space-y-2">
                  {packages.flatMap(pkg => 
                    pkg.components
                      .filter((c: Component) => c.type === 'rule')
                      .map((comp: Component) => (
                        <div key={comp.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                              <span className="text-sm font-medium">{comp.name}</span>
                            </div>
                            <span className={`px-2 py-0.5 text-xs rounded ${
                              comp.installed 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-200 text-gray-500'
                            }`}>
                              {comp.installed ? 'Installed' : 'Not Installed'}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                            <code className="truncate">{comp.installPath || 'N/A'}</code>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs text-gray-400">from {comp.packageName}</span>
                            {comp.installed && comp.installedAt && (
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <Clock className="w-3 h-3" />
                                {comp.installedAt}
                              </span>
                            )}
                          </div>
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
                <div className="space-y-2">
                  {packages.flatMap(pkg => 
                    pkg.components
                      .filter((c: Component) => c.type === 'hook')
                      .map((comp: Component) => (
                        <div key={comp.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                              <span className="text-sm font-medium">{comp.name}</span>
                            </div>
                            <span className={`px-2 py-0.5 text-xs rounded ${
                              comp.installed 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-200 text-gray-500'
                            }`}>
                              {comp.installed ? 'Installed' : 'Not Installed'}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                            <code className="truncate">{comp.installPath || 'N/A'}</code>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs text-gray-400">from {comp.packageName}</span>
                            {comp.installed && comp.installedAt && (
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <Clock className="w-3 h-3" />
                                {comp.installedAt}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">How to Use Skills</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-72px)]">
              <div className="space-y-6">
                {/* Install Skills */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <PackageIcon className="w-5 h-5 text-blue-500" />
                    Install Skills
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Ask AI Agent to install skills from Easy Skills Hub:
                  </p>
                  <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm space-y-1">
                    <p className="text-gray-500"># Install a skill to Qoder</p>
                    <p className="text-purple-600">Fetch and follow instructions from https://raw.githubusercontent.com/hdygxsj/superpowers/refs/heads/main/.qoder/INSTALL.md</p>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">
                    This will install the skill to your IDE and register it in the Skill Hub.
                  </p>
                </section>

                {/* Skill Types */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-500" />
                    Skill
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Skills provide specialized capabilities. Use them by mentioning their name:
                  </p>
                  <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm">
                    <p className="text-gray-500"># Activate a skill</p>
                    <p className="text-green-600">/brainstorming</p>
                    <p className="text-gray-500 mt-2"># Or let AI Agent know what you need</p>
                    <p className="text-green-600">"I need help with project planning"</p>
                  </div>
                </section>

                {/* Agent */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-500" />
                    Agent
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Agents are specialized AI subagents for specific tasks:
                  </p>
                  <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm">
                    <p className="text-gray-500"># AI Agent will automatically use agents</p>
                    <p className="text-purple-600">"Review this code for security issues"</p>
                  </div>
                </section>

                {/* Hook */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Anchor className="w-5 h-5 text-orange-500" />
                    Hook
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Hooks automatically run at specific points (e.g., before commit):
                  </p>
                  <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm">
                    <p className="text-gray-500"># Hooks run automatically</p>
                    <p className="text-orange-600">git commit -m "fix: resolve issue"</p>
                    <p className="text-gray-500 mt-1">→ pre-commit hook runs automatically</p>
                  </div>
                </section>

                {/* Rule */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-red-500" />
                    Rule
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Rules define coding standards and best practices:
                  </p>
                  <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm">
                    <p className="text-gray-500"># Rules are applied automatically</p>
                    <p className="text-red-600">"Write a React component"</p>
                    <p className="text-gray-500 mt-1">→ AI follows TypeScript rules automatically</p>
                  </div>
                </section>

                {/* More Info */}
                <section className="pt-4 border-t border-gray-200">
                  <p className="text-gray-500 text-sm">
                    For more information, see the{' '}
                    <a href="https://github.com/hdygxsj/easy-skills" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      Easy Skills documentation
                    </a>
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
