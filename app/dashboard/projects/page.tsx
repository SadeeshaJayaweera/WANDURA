'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Hammer, Plus, Trash2, CheckCircle, Circle, Edit, ChevronRight,
  Loader2, FolderKanban, ArrowLeft, Package, ListTodo, X, Calendar,
} from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageToggle } from '@/components/ui/LanguageToggle'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [taskInput, setTaskInput] = useState('')
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    startDate: '',
    endDate: '',
    budget: '',
  })

  useEffect(() => { fetchProjects() }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/projects')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setProjects(Array.isArray(data) ? data : [])
      // Keep selected project in sync
      if (selectedProject) {
        const updated = data.find((p: any) => p.id === selectedProject.id)
        if (updated) setSelectedProject(updated)
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load projects.' })
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create project')
      }
      toast({ title: 'Project created!', description: `"${newProject.name}" is ready.` })
      setShowCreateForm(false)
      setNewProject({ name: '', description: '', address: '', city: '', state: '', zipCode: '', startDate: '', endDate: '', budget: '' })
      fetchProjects()
    } catch (err: any) {
      toast({ title: 'Error', description: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const deleteProject = async (projectId: string, name: string) => {
    if (!confirm(`Delete project "${name}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/projects?id=${projectId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast({ title: 'Deleted', description: `"${name}" has been removed.` })
      if (selectedProject?.id === projectId) setSelectedProject(null)
      fetchProjects()
    } catch {
      toast({ title: 'Error', description: 'Failed to delete project.' })
    }
  }

  const addTask = async (projectId: string) => {
    if (!taskInput.trim()) return
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, title: taskInput.trim() }),
      })
      if (!res.ok) throw new Error('Failed to add task')
      setTaskInput('')
      fetchProjects()
    } catch {
      toast({ title: 'Error', description: 'Failed to add task.' })
    }
  }

  const toggleTask = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED'
    try {
      await fetch(`/api/tasks?id=${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      fetchProjects()
    } catch {
      toast({ title: 'Error', description: 'Failed to update task.' })
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      await fetch(`/api/tasks?id=${taskId}`, { method: 'DELETE' })
      fetchProjects()
    } catch {
      toast({ title: 'Error', description: 'Failed to delete task.' })
    }
  }

  const STATUS_STYLES: Record<string, string> = {
    ACTIVE: 'bg-green-50 text-green-700 border-green-200',
    COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200',
    CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070b14] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="rounded-xl gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </Button>
            <div className="h-4 w-px bg-gray-200 dark:bg-slate-800" />
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Hammer className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Wandura</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-gray-900">Projects</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Projects</h1>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Create form */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Create New Project</h2>
              <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={createProject} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Project Name *</Label>
                  <Input
                    id="name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="e.g. Home Renovation 2026"
                    className="h-10 rounded-xl border-gray-200 bg-gray-50"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="budget" className="text-sm font-medium text-gray-700">Budget (LKR - රුපියල්)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                    placeholder="e.g. 1500000"
                    className="h-10 rounded-xl border-gray-200 bg-gray-50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Briefly describe the project scope..."
                  rows={3}
                  className="rounded-xl border-gray-200 bg-gray-50 resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address *</Label>
                  <Input
                    id="address"
                    value={newProject.address}
                    onChange={(e) => setNewProject({ ...newProject, address: e.target.value })}
                    placeholder="123 Main St"
                    className="h-10 rounded-xl border-gray-200 bg-gray-50"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">City *</Label>
                  <Input
                    id="city"
                    value={newProject.city}
                    onChange={(e) => setNewProject({ ...newProject, city: e.target.value })}
                    placeholder="New York"
                    className="h-10 rounded-xl border-gray-200 bg-gray-50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-sm font-medium text-gray-700">State *</Label>
                  <Input
                    id="state"
                    value={newProject.state}
                    onChange={(e) => setNewProject({ ...newProject, state: e.target.value })}
                    placeholder="NY"
                    className="h-10 rounded-xl border-gray-200 bg-gray-50"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">Zip Code *</Label>
                  <Input
                    id="zipCode"
                    value={newProject.zipCode}
                    onChange={(e) => setNewProject({ ...newProject, zipCode: e.target.value })}
                    placeholder="10001"
                    className="h-10 rounded-xl border-gray-200 bg-gray-50"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                    className="h-10 rounded-xl border-gray-200 bg-gray-50"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                    className="h-10 rounded-xl border-gray-200 bg-gray-50"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Create Project
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="rounded-xl">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Two-column layout when project is selected */}
        <div className={`${selectedProject ? 'grid lg:grid-cols-2 gap-6' : ''}`}>
          {/* Projects list */}
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-500" />
                <p className="text-sm">Loading projects…</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FolderKanban className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-2">No projects yet</p>
                <p className="text-gray-500 text-sm mb-6">Create your first project to start tracking work.</p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2"
                >
                  <Plus className="h-4 w-4" /> Create Project
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 ${
                      selectedProject?.id === project.id ? 'border-blue-400 ring-1 ring-blue-200' : 'border-gray-100'
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">{project.name}</h3>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[project.status] ?? STATUS_STYLES.CANCELLED}`}>
                              {project.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {[project.city, project.state].filter(Boolean).join(', ')}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteProject(project.id, project.name)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1 ml-2 flex-shrink-0"
                          title="Delete project"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {project.description && (
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{project.description}</p>
                      )}

                      {/* Progress */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                          <span>Progress</span>
                          <span className="font-semibold text-gray-700">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                        {[
                          { label: 'Bookings', count: project._count?.bookings },
                          { label: 'Tasks', count: project._count?.tasks },
                          { label: 'Materials', count: project._count?.materials },
                        ].map(({ label, count }) => (
                          <div key={label} className="bg-gray-50 rounded-xl py-2">
                            <p className="text-base font-bold text-gray-900">{count ?? 0}</p>
                            <p className="text-xs text-gray-400">{label}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={selectedProject?.id === project.id ? 'default' : 'outline'}
                          onClick={() => setSelectedProject(selectedProject?.id === project.id ? null : project)}
                          className={`flex-1 rounded-xl gap-2 ${selectedProject?.id === project.id ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                        >
                          <ListTodo className="h-3.5 w-3.5" />
                          {selectedProject?.id === project.id ? 'Close' : 'Manage'}
                        </Button>
                        {project.budget && (
                          <div className="flex items-center px-3 py-1.5 bg-gray-50 rounded-xl text-xs font-semibold text-gray-700">
                            {formatCurrency(project.budget)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Project detail panel */}
          {selectedProject && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden self-start sticky top-24">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedProject.name}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Project Management</p>
                </div>
                <button onClick={() => setSelectedProject(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tasks */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <ListTodo className="h-4 w-4 text-blue-600" />
                  <h3 className="font-medium text-gray-900 text-sm">Tasks</h3>
                  <span className="text-xs text-gray-400">({selectedProject.tasks?.length ?? 0})</span>
                </div>

                {/* Add task */}
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Add a task…"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTask(selectedProject.id) } }}
                    className="h-9 rounded-xl border-gray-200 bg-gray-50 text-sm flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={() => addTask(selectedProject.id)}
                    disabled={!taskInput.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-3"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedProject.tasks?.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No tasks yet. Add one above.</p>
                  )}
                  {selectedProject.tasks?.map((task: any) => (
                    <div key={task.id} className="flex items-center gap-2 group">
                      <button
                        onClick={() => toggleTask(task.id, task.status)}
                        className="flex-shrink-0 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        {task.status === 'COMPLETED'
                          ? <CheckCircle className="h-4 w-4 text-green-500" />
                          : <Circle className="h-4 w-4" />
                        }
                      </button>
                      <span className={`text-sm flex-1 ${task.status === 'COMPLETED' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {task.title}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all flex-shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Materials */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-4 w-4 text-amber-500" />
                  <h3 className="font-medium text-gray-900 text-sm">Materials</h3>
                  <span className="text-xs text-gray-400">({selectedProject.materials?.length ?? 0})</span>
                </div>

                {selectedProject.materials?.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No materials logged yet.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedProject.materials.map((mat: any) => (
                      <div key={mat.id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                        <div>
                          <p className="font-medium text-gray-700">{mat.name}</p>
                          <p className="text-xs text-gray-400">{mat.quantity} {mat.unit}</p>
                        </div>
                        {mat.totalPrice && (
                          <span className="text-sm font-semibold text-blue-600">{formatCurrency(mat.totalPrice)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  size="sm"
                  asChild
                  variant="outline"
                  className="w-full mt-3 rounded-xl text-xs gap-2"
                >
                  <Link href="/stores">
                    <Package className="h-3.5 w-3.5" />
                    Order Materials
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
