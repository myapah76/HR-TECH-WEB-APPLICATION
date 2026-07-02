import React, { useState, useEffect, useMemo } from 'react'
import { Plus, X, Search, Tag, Check, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import {
  getRoleAliases,
  createRoleAlias,
  deleteRoleAlias,
  renameCanonicalRole,
  deleteCanonicalRole,
  RoleAlias,
} from '@/src/services/skill.service'
import CanonicalRoleRow from './CanonicalRoleRow'
import CanonicalRoleConfirmModal from './CanonicalRoleConfirmModal'

interface CanonicalGroup {
  canonicalRole: string
  aliases: RoleAlias[]
}

interface RoleAliasesTabProps {
  skills: any[]
  onGraphUpdate: () => Promise<void>
}

const ITEMS_PER_PAGE = 8

export default function RoleAliasesTab({ skills, onGraphUpdate }: RoleAliasesTabProps) {
  const [rawAliases, setRawAliases] = useState<RoleAlias[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // Expand state for groups
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  // New canonical role form
  const [newCanonical, setNewCanonical] = useState('')
  const [isAddingCanonical, setIsAddingCanonical] = useState(false)

  // Edit canonical role state
  const [editingCanonical, setEditingCanonical] = useState<string | null>(null)
  const [editCanonicalText, setEditCanonicalText] = useState('')

  // Per-group alias input values
  const [newAliasInputs, setNewAliasInputs] = useState<Record<string, string>>({})

  // Confirm modal state
  const [confirmAction, setConfirmAction] = useState<{
    type: 'edit' | 'delete'
    canonicalRole: string
    newName?: string
    affectedNodes: string[]
    onConfirm: () => Promise<void>
  } | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await getRoleAliases()
      setRawAliases(data)
    } catch (err: any) {
      toast.error('Lỗi tải danh sách vai trò: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Group raw aliases by canonical role
  const groups = useMemo((): CanonicalGroup[] => {
    const map = new Map<string, RoleAlias[]>()
    rawAliases.forEach((item) => {
      const canonical = item.canonicalRole.trim().toLowerCase()
      if (!map.has(canonical)) map.set(canonical, [])
      map.get(canonical)!.push(item)
    })
    const list: CanonicalGroup[] = []
    map.forEach((aliasesList, canonicalRole) => list.push({ canonicalRole, aliases: aliasesList }))
    return list.sort((a, b) => a.canonicalRole.localeCompare(b.canonicalRole))
  }, [rawAliases])

  // Filter groups by search
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups
    const query = searchQuery.toLowerCase()
    return groups.filter(
      (g) =>
        g.canonicalRole.includes(query) ||
        g.aliases.some((a) => a.alias.toLowerCase().includes(query))
    )
  }, [groups, searchQuery])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const totalPages = Math.ceil(filteredGroups.length / ITEMS_PER_PAGE) || 1
  const paginatedGroups = useMemo(() => {
    return filteredGroups.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    )
  }, [filteredGroups, currentPage])

  const getAffectedSkills = (canonical: string) =>
    skills.filter(
      (s) => s.roles && s.roles.map((r: string) => r.toLowerCase()).includes(canonical.toLowerCase())
    )

  // ── Handlers ──────────────────────────────────────────────────────────────

  const toggleGroup = (canonical: string) =>
    setExpandedGroups((prev) => ({ ...prev, [canonical]: !prev[canonical] }))

  const handleCreateCanonical = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = newCanonical.trim().toLowerCase()
    if (!name) return
    if (groups.some((g) => g.canonicalRole === name)) {
      toast.warning('Vai trò chuẩn này đã tồn tại!')
      return
    }
    try {
      await createRoleAlias({ alias: name, canonicalRole: name })
      toast.success(`Đã tạo vai trò chuẩn '${name}' thành công!`)
      setNewCanonical('')
      setIsAddingCanonical(false)
      setExpandedGroups((prev) => ({ ...prev, [name]: true }))
      loadData()
      onGraphUpdate()
    } catch (err: any) {
      toast.error('Lỗi khi tạo vai trò: ' + err.message)
    }
  }

  const handleAddAlias = async (canonical: string) => {
    const aliasText = (newAliasInputs[canonical] || '').trim().toLowerCase()
    if (!aliasText) return
    if (rawAliases.some((a) => a.alias.toLowerCase() === aliasText)) {
      toast.warning(`Alias '${aliasText}' đã tồn tại trong hệ thống!`)
      return
    }
    try {
      await createRoleAlias({ alias: aliasText, canonicalRole: canonical })
      toast.success(`Đã thêm alias '${aliasText}' vào vai trò '${canonical}'`)
      setNewAliasInputs((prev) => ({ ...prev, [canonical]: '' }))
      loadData()
      onGraphUpdate()
    } catch (err: any) {
      toast.error('Không thể thêm alias: ' + err.message)
    }
  }

  const handleDeleteAlias = async (id: string, aliasName: string) => {
    try {
      await deleteRoleAlias(id)
      toast.success(`Đã xóa alias '${aliasName}'`)
      loadData()
      onGraphUpdate()
    } catch (err: any) {
      toast.error('Xóa alias thất bại: ' + err.message)
    }
  }

  const handleDeleteGroup = (group: CanonicalGroup) => {
    const affectedNames = getAffectedSkills(group.canonicalRole).map((s) => s.name)
    setConfirmAction({
      type: 'delete',
      canonicalRole: group.canonicalRole,
      affectedNodes: affectedNames,
      onConfirm: async () => {
        try {
          setLoading(true)
          await deleteCanonicalRole(group.canonicalRole)
          toast.success(`Đã xóa vai trò chuẩn '${group.canonicalRole}' và cập nhật đồ thị!`)
          loadData()
          await onGraphUpdate()
        } catch (err: any) {
          toast.error('Lỗi khi xóa vai trò: ' + err.message)
          loadData()
        } finally {
          setConfirmAction(null)
        }
      },
    })
  }

  const startEditCanonical = (e: React.MouseEvent, currentName: string) => {
    e.stopPropagation()
    setEditingCanonical(currentName)
    setEditCanonicalText(currentName)
  }

  const cancelEditCanonical = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingCanonical(null)
    setEditCanonicalText('')
  }

  const triggerRenameCanonical = (e: React.MouseEvent, oldName: string) => {
    e.stopPropagation()
    const newName = editCanonicalText.trim().toLowerCase()
    if (!newName) {
      toast.warning('Tên vai trò chuẩn không được để trống!')
      return
    }
    if (newName === oldName) {
      setEditingCanonical(null)
      return
    }
    if (groups.some((g) => g.canonicalRole === newName)) {
      toast.warning(`Vai trò chuẩn '${newName}' đã tồn tại!`)
      return
    }
    const affectedNames = getAffectedSkills(oldName).map((s) => s.name)
    setConfirmAction({
      type: 'edit',
      canonicalRole: oldName,
      newName,
      affectedNodes: affectedNames,
      onConfirm: async () => {
        try {
          setLoading(true)
          await renameCanonicalRole(oldName, newName)
          toast.success(`Đã cập nhật vai trò chuẩn thành '${newName}' ở SQL & Neo4j!`)
          setEditingCanonical(null)
          setEditCanonicalText('')
          if (expandedGroups[oldName]) {
            setExpandedGroups((prev) => {
              const next = { ...prev }
              delete next[oldName]
              next[newName] = true
              return next
            })
          }
          loadData()
          await onGraphUpdate()
        } catch (err: any) {
          toast.error('Cập nhật vai trò chuẩn thất bại: ' + err.message)
          loadData()
        } finally {
          setConfirmAction(null)
        }
      },
    })
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 bg-white rounded-3xl border border-slate-200/60 p-6 shadow-xs overflow-hidden flex flex-col min-h-0">

      {/* Header controls */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Tag className="h-6 w-6 text-violet-600" />
            Quản lý Vai trò chuẩn &amp; Alias
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Mỗi hàng đại diện cho 1 vai trò chuẩn (Canonical Role). Mở rộng để quản lý alias.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm vai trò chuẩn hoặc alias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 w-72 transition-all"
            />
          </div>

          <button
            onClick={() => setIsAddingCanonical(!isAddingCanonical)}
            className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 active:scale-95 transition-all rounded-xl shadow-xs"
          >
            {isAddingCanonical ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isAddingCanonical ? 'Hủy' : 'Tạo vai trò chuẩn'}
          </button>
        </div>
      </div>

      {/* New Canonical Role Form */}
      {isAddingCanonical && (
        <form onSubmit={handleCreateCanonical} className="mb-6 bg-slate-50 border border-slate-200/50 p-5 rounded-2xl flex flex-col sm:flex-row gap-4 items-end animate-fadeIn">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Tên vai trò chuẩn mới (Canonical Role)
            </label>
            <input
              type="text"
              placeholder="Ví dụ: devops, mobile, business analyst"
              value={newCanonical}
              onChange={(e) => setNewCanonical(e.target.value)}
              className="px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all lowercase"
              required
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl active:scale-95 transition-all h-11 flex items-center justify-center gap-1.5"
          >
            <Check className="h-4 w-4" />
            Tạo vai trò chuẩn
          </button>
        </form>
      )}

      {/* Accordion List */}
      <div className="flex-1 overflow-y-auto border border-slate-100 rounded-2xl divide-y divide-slate-100">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-violet-500 border-t-transparent mb-2"></div>
            <p className="text-sm font-bold">Đang tải danh mục...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <AlertCircle className="h-10 w-10 text-slate-300 mb-2" />
            <p className="text-sm font-bold">Không tìm thấy vai trò chuẩn nào khớp</p>
          </div>
        ) : (
          paginatedGroups.map((group) => (
            <CanonicalRoleRow
              key={group.canonicalRole}
              group={group}
              isExpanded={!!expandedGroups[group.canonicalRole]}
              isEditing={editingCanonical === group.canonicalRole}
              aliasInputValue={newAliasInputs[group.canonicalRole] || ''}
              editCanonicalText={editCanonicalText}
              onToggle={toggleGroup}
              onStartEdit={startEditCanonical}
              onCancelEdit={cancelEditCanonical}
              onConfirmRename={triggerRenameCanonical}
              onEditTextChange={setEditCanonicalText}
              onAliasInputChange={(canonical, value) =>
                setNewAliasInputs((prev) => ({ ...prev, [canonical]: value }))
              }
              onAddAlias={handleAddAlias}
              onDeleteAlias={handleDeleteAlias}
              onDeleteGroup={handleDeleteGroup}
            />
          ))
        )}
      </div>

      {/* Pagination Footer */}
      {!loading && filteredGroups.length > 0 && (
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 shrink-0">
          <span className="text-xs font-bold text-slate-500">
            Hiển thị {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredGroups.length)} -{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredGroups.length)} trên tổng số {filteredGroups.length}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    currentPage === page
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmAction && (
        <CanonicalRoleConfirmModal
          type={confirmAction.type}
          canonicalRole={confirmAction.canonicalRole}
          newName={confirmAction.newName}
          affectedNodes={confirmAction.affectedNodes}
          onConfirm={confirmAction.onConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  )
}
