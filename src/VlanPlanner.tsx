import { useState, useEffect, useId } from 'react'
import { Plus, Trash2, Download, Sun, Moon, Languages, Network, AlertTriangle } from 'lucide-react'

const translations = {
  en: {
    title: 'VLAN Planner',
    subtitle: 'Plan your VLAN allocation. Detect ID conflicts and export as CSV. Everything client-side.',
    addVlan: 'Add VLAN',
    vlanId: 'VLAN ID',
    name: 'Name',
    subnet: 'Subnet',
    description: 'Description',
    actions: 'Actions',
    exportCsv: 'Export CSV',
    noVlans: 'No VLANs added yet. Click "Add VLAN" to start.',
    idPlaceholder: '1–4094',
    namePlaceholder: 'Management',
    subnetPlaceholder: '192.168.1.0/24',
    descPlaceholder: 'Optional description',
    conflictId: 'Duplicate VLAN ID detected',
    reserved: 'Reserved (1=default, 1002-1005=FDDI/Token Ring)',
    invalidId: 'ID must be between 1 and 4094',
    totalVlans: 'Total VLANs',
    conflicts: 'Conflicts',
    builtBy: 'Built by',
  },
  pt: {
    title: 'Planejador de VLANs',
    subtitle: 'Planeje sua alocacao de VLANs. Detecte conflitos de ID e exporte como CSV. Tudo no navegador.',
    addVlan: 'Adicionar VLAN',
    vlanId: 'ID da VLAN',
    name: 'Nome',
    subnet: 'Sub-rede',
    description: 'Descricao',
    actions: 'Acoes',
    exportCsv: 'Exportar CSV',
    noVlans: 'Nenhuma VLAN adicionada. Clique em "Adicionar VLAN" para comecar.',
    idPlaceholder: '1–4094',
    namePlaceholder: 'Gerenciamento',
    subnetPlaceholder: '192.168.1.0/24',
    descPlaceholder: 'Descricao opcional',
    conflictId: 'ID de VLAN duplicado detectado',
    reserved: 'Reservado (1=padrao, 1002-1005=FDDI/Token Ring)',
    invalidId: 'ID deve estar entre 1 e 4094',
    totalVlans: 'Total de VLANs',
    conflicts: 'Conflitos',
    builtBy: 'Criado por',
  },
} as const

type Lang = keyof typeof translations

interface VlanEntry {
  id: string
  vlanId: string
  name: string
  subnet: string
  description: string
}

const RESERVED = new Set([1, 1002, 1003, 1004, 1005])

const ID_COLORS = [
  'bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500',
  'bg-pink-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500',
]

function uid() { return Math.random().toString(36).slice(2) }

export default function VlanPlanner() {
  const [lang, setLang] = useState<Lang>(() => (navigator.language.startsWith('pt') ? 'pt' : 'en'))
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [vlans, setVlans] = useState<VlanEntry[]>([])
  const formId = useId()

  const t = translations[lang]
  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  const addVlan = () => {
    setVlans(v => [...v, { id: uid(), vlanId: '', name: '', subnet: '', description: '' }])
  }

  const update = (id: string, field: keyof Omit<VlanEntry, 'id'>, value: string) => {
    setVlans(v => v.map(e => e.id === id ? { ...e, [field]: value } : e))
  }

  const remove = (id: string) => setVlans(v => v.filter(e => e.id !== id))

  const idCounts = vlans.reduce<Record<string, number>>((acc, v) => {
    if (v.vlanId) acc[v.vlanId] = (acc[v.vlanId] ?? 0) + 1
    return acc
  }, {})

  const conflictCount = Object.values(idCounts).filter(n => n > 1).length

  const isInvalid = (vlanId: string) => {
    if (!vlanId) return false
    const n = Number(vlanId)
    return isNaN(n) || n < 1 || n > 4094
  }

  const isDuplicate = (vlanId: string) => vlanId !== '' && (idCounts[vlanId] ?? 0) > 1

  const isReserved = (vlanId: string) => RESERVED.has(Number(vlanId))

  const exportCsv = () => {
    const header = 'VLAN ID,Name,Subnet,Description\n'
    const rows = vlans.map(v => `${v.vlanId},${v.name},${v.subnet},${v.description}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'vlans.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const colorFor = (vlanId: string) => {
    const n = Number(vlanId)
    return isNaN(n) ? ID_COLORS[0] : ID_COLORS[n % ID_COLORS.length]
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <Network size={18} className="text-white" />
            </div>
            <span className="font-semibold">VLAN Planner</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />{lang.toUpperCase()}
            </button>
            <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/vlan-planner" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          {/* Stats */}
          <div className="flex gap-4 flex-wrap">
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 flex items-center gap-2">
              <Network size={14} className="text-teal-500" />
              <span className="text-sm">{t.totalVlans}: <strong className="tabular-nums">{vlans.length}</strong></span>
            </div>
            {conflictCount > 0 && (
              <div className="rounded-lg border border-red-200 dark:border-red-800 px-4 py-2.5 flex items-center gap-2 bg-red-50 dark:bg-red-900/20">
                <AlertTriangle size={14} className="text-red-500" />
                <span className="text-sm text-red-600 dark:text-red-400">{t.conflicts}: <strong className="tabular-nums">{conflictCount}</strong></span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <button onClick={addVlan} className="flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-600 transition-colors">
              <Plus size={15} />{t.addVlan}
            </button>
            {vlans.length > 0 && (
              <button onClick={exportCsv} className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <Download size={15} />{t.exportCsv}
              </button>
            )}
          </div>

          {/* Table */}
          {vlans.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 px-6 py-16 text-center text-zinc-400">
              {t.noVlans}
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                      <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400 w-28">{t.vlanId}</th>
                      <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">{t.name}</th>
                      <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">{t.subnet}</th>
                      <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">{t.description}</th>
                      <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400 w-16">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vlans.map(v => {
                      const hasConflict = isDuplicate(v.vlanId)
                      const hasInvalid = isInvalid(v.vlanId)
                      const hasReserved = isReserved(v.vlanId) && !hasInvalid
                      return (
                        <tr key={v.id} className={`border-b border-zinc-100 dark:border-zinc-800 last:border-0 transition-colors ${hasConflict ? 'bg-red-50 dark:bg-red-900/10' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50'}`}>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              {v.vlanId && !hasInvalid && !hasConflict && (
                                <span className={`w-2 h-2 rounded-full shrink-0 ${colorFor(v.vlanId)}`} />
                              )}
                              {hasConflict && <AlertTriangle size={12} className="text-red-500 shrink-0" />}
                              <input
                                id={`${formId}-id-${v.id}`}
                                type="number" min={1} max={4094}
                                value={v.vlanId}
                                onChange={e => update(v.id, 'vlanId', e.target.value)}
                                placeholder={t.idPlaceholder}
                                className={`w-20 font-mono text-xs px-2 py-1.5 rounded border focus:outline-none focus:ring-2 ${hasConflict || hasInvalid ? 'border-red-400 focus:ring-red-400 bg-red-50 dark:bg-red-900/20' : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-teal-500'}`}
                              />
                            </div>
                            {hasInvalid && <p className="text-[10px] text-red-500 mt-0.5">{t.invalidId}</p>}
                            {hasConflict && <p className="text-[10px] text-red-500 mt-0.5">{t.conflictId}</p>}
                            {hasReserved && <p className="text-[10px] text-amber-500 mt-0.5">{t.reserved}</p>}
                          </td>
                          <td className="px-4 py-2.5">
                            <input type="text" value={v.name} onChange={e => update(v.id, 'name', e.target.value)} placeholder={t.namePlaceholder}
                              className="w-full px-2 py-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500" />
                          </td>
                          <td className="px-4 py-2.5">
                            <input type="text" value={v.subnet} onChange={e => update(v.id, 'subnet', e.target.value)} placeholder={t.subnetPlaceholder}
                              className="w-full px-2 py-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-teal-500" />
                          </td>
                          <td className="px-4 py-2.5">
                            <input type="text" value={v.description} onChange={e => update(v.id, 'description', e.target.value)} placeholder={t.descPlaceholder}
                              className="w-full px-2 py-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500" />
                          </td>
                          <td className="px-4 py-2.5">
                            <button onClick={() => remove(v.id)} className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-zinc-400">
          <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-teal-500 transition-colors">Gabriel Mowses</a></span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  )
}
