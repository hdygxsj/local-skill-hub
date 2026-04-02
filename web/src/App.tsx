import { useState, useEffect, useRef } from 'react'
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

// Custom Project Selector
function ProjectSelector({ 
  projects, 
  selected, 
  onSelect 
}: { 
  projects: Project[] 
  selected: string | null
  onSelect: (name: string | null) => void 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 px-2 py-1.5 text-sm font-medium rounded-md transition-all ${
          isOpen 
            ? 'bg-white text-gray-900 shadow-sm' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <span className="truncate max-w-24">{selected || 'Select project...'}</span>
        <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
          <div className="px-3 pb-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            <button
              onClick={() => { onSelect(null); setIsOpen(false); setSearch('') }}
              className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 ${!selected ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}
            >
              <span className="w-4">{!selected && <Check className="w-4 h-4" />}</span>
              <span>Select project...</span>
            </button>
            {filteredProjects.map((proj) => (
              <button
                key={proj.name}
                onClick={() => { onSelect(proj.name); setIsOpen(false); setSearch('') }}
                className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 ${selected === proj.name ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}
              >
                <span className="w-4">{selected === proj.name && <Check className="w-4 h-4" />}</span>
                <Folder className="w-4 h-4 text-gray-400" />
                <span className="truncate">{proj.name}</span>
              </button>
            ))}
            {filteredProjects.length === 0 && (
              <div className="px-3 py-4 text-sm text-gray-400 text-center">No projects found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
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
      // No fallback data - show empty state
      setPackages([])
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
              {/* Project Selector - integrated into segmented control */}
              {scope === 'project' && (
                <ProjectSelector
                  projects={projects}
                  selected={selectedProject}
                  onSelect={setSelectedProject}
                />
              )}
            </div>
            
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
        <p className="text-sm text-blue-700 mb-3">
          Tell your AI Agent to read and follow the installation guide:
        </p>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium text-blue-700">Qoder:</span>
            <div className="mt-1 p-2 bg-blue-100 rounded font-mono text-xs text-blue-800">
              Fetch and follow instructions from<br/>
              https://raw.githubusercontent.com/hdygxsj/easy-skills/master/skills/qoder/INSTALL.md
            </div>
          </div>
          <div>
            <span className="font-medium text-blue-700">Cursor:</span>
            <div className="mt-1 p-2 bg-blue-100 rounded font-mono text-xs text-blue-800">
              Fetch and follow instructions from<br/>
              https://raw.githubusercontent.com/hdygxsj/easy-skills/master/skills/cursor/INSTALL.md
            </div>
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
                  Components
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
                {/* Install */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <PackageIcon className="w-5 h-5 text-blue-500" />
                    Install Skills
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Tell your AI Agent to read and follow the installation guide:
                  </p>
                  <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm space-y-3">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">For Qoder:</p>
                      <p className="text-blue-600 text-xs">Fetch and follow instructions from</p>
                      <p className="text-blue-600 text-xs pl-2">https://raw.githubusercontent.com/hdygxsj/easy-skills/master/web/public/qoder/INSTALL.md</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">For Cursor:</p>
                      <p className="text-blue-600 text-xs">Fetch and follow instructions from</p>
                      <p className="text-blue-600 text-xs pl-2">https://raw.githubusercontent.com/hdygxsj/easy-skills/master/web/public/cursor/INSTALL.md</p>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">
                    The AI Agent will automatically install CLI, start the Hub, and register the skill.
                  </p>
                </section>

                {/* Manage via AI */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-500" />
                    Manage via AI
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Tell AI Agent to manage skills (use natural language):
                  </p>
                  <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm space-y-2">
                    <p className="text-gray-500"># Browse packages</p>
                    <p className="text-purple-600">/easy-skills 列出 qoder 可用的 packages</p>
                    <p className="text-gray-500 mt-2"># View details</p>
                    <p className="text-purple-600">/easy-skills 看看 superpowers 包有哪些 skills</p>
                    <p className="text-gray-500 mt-2"># Install</p>
                    <p className="text-purple-600">/easy-skills 帮我安装 superpowers 到 qoder</p>
                    <p className="text-gray-500 mt-2"># Uninstall</p>
                    <p className="text-purple-600">/easy-skills 卸载这个 package</p>
                    <p className="text-gray-500 mt-2"># Upgrade</p>
                    <p className="text-purple-600">/easy-skills 升级 superpowers 到最新版本</p>
                    <p className="text-gray-500 mt-2"># Version history</p>
                    <p className="text-purple-600">/easy-skills 查看 superpowers 的版本历史</p>
                    <p className="text-gray-500 mt-2"># Rollback</p>
                    <p className="text-purple-600">/easy-skills 回滚 superpowers 到某个版本</p>
                    <p className="text-gray-500 mt-2"># Reinstall</p>
                    <p className="text-purple-600">/easy-skills 重新安装这个 package</p>
                    <p className="text-gray-500 mt-2"># Check status</p>
                    <p className="text-orange-600">easy-skills status --ide qoder</p>
                  </div>
                </section>

                {/* View Packages */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-500" />
                    View Packages
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Browse installed packages and their components in this GUI.
                  </p>
                </section>

                {/* Web GUI */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Anchor className="w-5 h-5 text-orange-500" />
                    Start GUI
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Start the web interface via CLI:
                  </p>
                  <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm space-y-1">
                    <p className="text-gray-500"># Start GUI server</p>
                    <p className="text-orange-600">easy-skills serve</p>
                    <p className="text-gray-500"># Restart server</p>
                    <p className="text-orange-600">easy-skills restart</p>
                    <p className="text-gray-500"># Open http://localhost:27842</p>
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
