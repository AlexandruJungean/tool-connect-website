'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { renderCategoryIcon, AVAILABLE_ICONS } from '@/lib/icons'
import { LoadingSpinner } from '@/components/ui'
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical,
  ArrowUp,
  ArrowDown,
  X,
  Check,
  Search,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Subcategory {
  id: string
  category_id: string
  value: string
  label: string
  label_cs: string
  is_active: boolean
  display_order: number
}

interface Category {
  id: string
  value: string
  label: string
  label_cs: string
  icon: string
  is_active: boolean
  display_order: number
  subcategories: Subcategory[]
  provider_count: number
  request_count: number
}

interface DeleteConfirm {
  type: 'category' | 'subcategory'
  id: string
  name: string
  usageCount: number
}

interface CategoryFormData {
  value: string
  label: string
  label_cs: string
  icon: string
  is_active: boolean
}

interface SubcategoryFormData {
  value: string
  label: string
  label_cs: string
  is_active: boolean
}

// ─── Cascade Helpers ─────────────────────────────────────────────────────────

async function getCategoryUsageCount(categoryValue: string) {
  const [providers, requests, clients] = await Promise.all([
    supabase.from('service_provider_profiles').select('id', { count: 'exact', head: true }).eq('category', categoryValue),
    supabase.from('work_requests').select('id', { count: 'exact', head: true }).eq('category', categoryValue),
    supabase.from('client_profiles').select('id', { count: 'exact', head: true }).eq('preferred_category', categoryValue),
  ])
  return (providers.count || 0) + (requests.count || 0) + (clients.count || 0)
}

async function cascadeCategoryValueChange(oldValue: string, newValue: string) {
  await Promise.all([
    supabase.from('service_provider_profiles').update({ category: newValue }).eq('category', oldValue),
    supabase.from('work_requests').update({ category: newValue }).eq('category', oldValue),
    supabase.from('client_profiles').update({ preferred_category: newValue }).eq('preferred_category', oldValue),
  ])
}

async function getSubcategoryUsageCount(subcategoryValue: string) {
  const [providerServices, requestSubs, clientPrefs] = await Promise.all([
    supabase.from('service_provider_profiles').select('id', { count: 'exact', head: true }).contains('services', [subcategoryValue]),
    supabase.from('work_requests').select('id', { count: 'exact', head: true }).like('subcategory', `%${subcategoryValue}%`),
    supabase.from('client_profiles').select('id', { count: 'exact', head: true }).contains('preferred_subcategories', [subcategoryValue]),
  ])
  return (providerServices.count || 0) + (requestSubs.count || 0) + (clientPrefs.count || 0)
}

async function cascadeSubcategoryValueChange(oldValue: string, newValue: string) {
  // For arrays in service_provider_profiles.services
  const { data: providers } = await supabase
    .from('service_provider_profiles')
    .select('id, services')
    .contains('services', [oldValue])
  if (providers) {
    for (const p of providers) {
      const updated = (p.services || []).map((s: string) => (s === oldValue ? newValue : s))
      await supabase.from('service_provider_profiles').update({ services: updated }).eq('id', p.id)
    }
  }

  // For comma-separated subcategory in work_requests
  const { data: requests } = await supabase
    .from('work_requests')
    .select('id, subcategory')
    .like('subcategory', `%${oldValue}%`)
  if (requests) {
    for (const r of requests) {
      const updated = r.subcategory
        .split(',')
        .map((s: string) => (s.trim() === oldValue ? newValue : s.trim()))
        .join(',')
      await supabase.from('work_requests').update({ subcategory: updated }).eq('id', r.id)
    }
  }

  // For preferred_subcategories array in client_profiles
  const { data: clients } = await supabase
    .from('client_profiles')
    .select('id, preferred_subcategories')
    .contains('preferred_subcategories', [oldValue])
  if (clients) {
    for (const c of clients) {
      const updated = (c.preferred_subcategories || []).map((s: string) => (s === oldValue ? newValue : s))
      await supabase.from('client_profiles').update({ preferred_subcategories: updated }).eq('id', c.id)
    }
  }
}

// ─── Value Helper ────────────────────────────────────────────────────────────

function toValue(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminCategoriesPage() {
  // Core state
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  // Modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<(Subcategory & { parentCategoryId: string }) | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<DeleteConfirm | null>(null)

  // Icon picker state
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [iconSearch, setIconSearch] = useState('')

  // Form state
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({
    value: '',
    label: '',
    label_cs: '',
    icon: 'circle',
    is_active: true,
  })
  const [subcategoryForm, setSubcategoryForm] = useState<SubcategoryFormData>({
    value: '',
    label: '',
    label_cs: '',
    is_active: true,
  })
  const [parentCategoryId, setParentCategoryId] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [cascadeWarning, setCascadeWarning] = useState<{ count: number; type: 'category' | 'subcategory' } | null>(null)

  // ─── Fetch ───────────────────────────────────────────────────────────────

  const fetchCategories = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: cats, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true })

      if (catErr) throw catErr

      const enriched: Category[] = await Promise.all(
        (cats || []).map(async (cat: any) => {
          const { data: subs } = await supabase
            .from('subcategories')
            .select('*')
            .eq('category_id', cat.id)
            .order('display_order', { ascending: true })

          const { count: providerCount } = await supabase
            .from('service_provider_profiles')
            .select('id', { count: 'exact', head: true })
            .eq('category', cat.value)

          const { count: requestCount } = await supabase
            .from('work_requests')
            .select('id', { count: 'exact', head: true })
            .eq('category', cat.value)

          return {
            ...cat,
            subcategories: subs || [],
            provider_count: providerCount || 0,
            request_count: requestCount || 0,
          }
        })
      )

      setCategories(enriched)
    } catch (err: any) {
      console.error('Error fetching categories:', err)
      setError(err.message || 'Failed to load categories')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // ─── Reorder ─────────────────────────────────────────────────────────────

  const reorderCategory = async (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= categories.length) return

    const a = categories[index]
    const b = categories[swapIndex]

    await Promise.all([
      supabase.from('categories').update({ display_order: b.display_order }).eq('id', a.id),
      supabase.from('categories').update({ display_order: a.display_order }).eq('id', b.id),
    ])
    fetchCategories()
  }

  const reorderSubcategory = async (categoryId: string, index: number, direction: 'up' | 'down') => {
    const cat = categories.find((c) => c.id === categoryId)
    if (!cat) return
    const subs = cat.subcategories
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= subs.length) return

    const a = subs[index]
    const b = subs[swapIndex]

    await Promise.all([
      supabase.from('subcategories').update({ display_order: b.display_order }).eq('id', a.id),
      supabase.from('subcategories').update({ display_order: a.display_order }).eq('id', b.id),
    ])
    fetchCategories()
  }

  // ─── Toggle Active ───────────────────────────────────────────────────────

  const toggleCategoryActive = async (cat: Category) => {
    await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id)
    fetchCategories()
  }

  const toggleSubcategoryActive = async (sub: Subcategory) => {
    await supabase.from('subcategories').update({ is_active: !sub.is_active }).eq('id', sub.id)
    fetchCategories()
  }

  // ─── Open Category Modal ─────────────────────────────────────────────────

  const openAddCategory = () => {
    setEditingCategory(null)
    setCategoryForm({ value: '', label: '', label_cs: '', icon: 'circle', is_active: true })
    setCascadeWarning(null)
    setShowIconPicker(false)
    setIconSearch('')
    setShowCategoryModal(true)
  }

  const openEditCategory = (cat: Category) => {
    setEditingCategory(cat)
    setCategoryForm({
      value: cat.value,
      label: cat.label || '',
      label_cs: cat.label_cs || '',
      icon: cat.icon,
      is_active: cat.is_active,
    })
    setCascadeWarning(null)
    setShowIconPicker(false)
    setIconSearch('')
    setShowCategoryModal(true)
  }

  // ─── Open Subcategory Modal ──────────────────────────────────────────────

  const openAddSubcategory = (categoryId: string) => {
    setEditingSubcategory(null)
    setParentCategoryId(categoryId)
    setSubcategoryForm({ value: '', label: '', label_cs: '', is_active: true })
    setCascadeWarning(null)
    setShowSubcategoryModal(true)
  }

  const openEditSubcategory = (sub: Subcategory, categoryId: string) => {
    setEditingSubcategory({ ...sub, parentCategoryId: categoryId })
    setParentCategoryId(categoryId)
    setSubcategoryForm({
      value: sub.value,
      label: sub.label || '',
      label_cs: sub.label_cs || '',
      is_active: sub.is_active,
    })
    setCascadeWarning(null)
    setShowSubcategoryModal(true)
  }

  // ─── Save Category ───────────────────────────────────────────────────────

  const saveCategory = async () => {
    setSaving(true)
    try {
      if (editingCategory) {
        // Editing
        const valueChanged = editingCategory.value !== categoryForm.value
        if (valueChanged) {
          await cascadeCategoryValueChange(editingCategory.value, categoryForm.value)
        }
        const { error: updErr } = await supabase
          .from('categories')
          .update({
            value: categoryForm.value,
            label: categoryForm.label,
            label_cs: categoryForm.label_cs,
            icon: categoryForm.icon,
            is_active: categoryForm.is_active,
          })
          .eq('id', editingCategory.id)
        if (updErr) throw updErr
      } else {
        // Adding
        const maxOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.display_order)) : 0
        const { error: insErr } = await supabase.from('categories').insert({
          value: categoryForm.value,
          label: categoryForm.label,
          label_cs: categoryForm.label_cs,
          icon: categoryForm.icon,
          is_active: categoryForm.is_active,
          display_order: maxOrder + 1,
        })
        if (insErr) throw insErr
      }
      setShowCategoryModal(false)
      fetchCategories()
    } catch (err: any) {
      console.error('Error saving category:', err)
      setError(err.message || 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  // ─── Save Subcategory ────────────────────────────────────────────────────

  const saveSubcategory = async () => {
    setSaving(true)
    try {
      if (editingSubcategory) {
        const valueChanged = editingSubcategory.value !== subcategoryForm.value
        if (valueChanged) {
          await cascadeSubcategoryValueChange(editingSubcategory.value, subcategoryForm.value)
        }
        const { error: updErr } = await supabase
          .from('subcategories')
          .update({
            value: subcategoryForm.value,
            label: subcategoryForm.label,
            label_cs: subcategoryForm.label_cs,
            is_active: subcategoryForm.is_active,
          })
          .eq('id', editingSubcategory.id)
        if (updErr) throw updErr
      } else {
        const cat = categories.find((c) => c.id === parentCategoryId)
        const maxOrder = cat && cat.subcategories.length > 0 ? Math.max(...cat.subcategories.map((s) => s.display_order)) : 0
        const { error: insErr } = await supabase.from('subcategories').insert({
          category_id: parentCategoryId,
          value: subcategoryForm.value,
          label: subcategoryForm.label,
          label_cs: subcategoryForm.label_cs,
          is_active: subcategoryForm.is_active,
          display_order: maxOrder + 1,
        })
        if (insErr) throw insErr
      }
      setShowSubcategoryModal(false)
      fetchCategories()
    } catch (err: any) {
      console.error('Error saving subcategory:', err)
      setError(err.message || 'Failed to save subcategory')
    } finally {
      setSaving(false)
    }
  }

  // ─── Delete ──────────────────────────────────────────────────────────────

  const openDeleteCategory = async (cat: Category) => {
    const count = await getCategoryUsageCount(cat.value)
    setShowDeleteConfirm({ type: 'category', id: cat.id, name: cat.label || '', usageCount: count })
  }

  const openDeleteSubcategory = async (sub: Subcategory) => {
    const count = await getSubcategoryUsageCount(sub.value)
    setShowDeleteConfirm({ type: 'subcategory', id: sub.id, name: sub.label || '', usageCount: count })
  }

  const confirmDelete = async () => {
    if (!showDeleteConfirm || showDeleteConfirm.usageCount > 0) return
    try {
      if (showDeleteConfirm.type === 'category') {
        // Delete all subcategories first
        await supabase.from('subcategories').delete().eq('category_id', showDeleteConfirm.id)
        await supabase.from('categories').delete().eq('id', showDeleteConfirm.id)
      } else {
        await supabase.from('subcategories').delete().eq('id', showDeleteConfirm.id)
      }
      setShowDeleteConfirm(null)
      fetchCategories()
    } catch (err: any) {
      console.error('Error deleting:', err)
      setError(err.message || 'Failed to delete')
    }
  }

  // ─── Category form label → value auto-generation ─────────────────────────

  const handleCategoryLabelEnChange = (val: string) => {
    setCategoryForm((prev) => ({
      ...prev,
      label: val,
      // Auto-generate value only when adding
      ...(!editingCategory ? { value: toValue(val) } : {}),
    }))
  }

  const handleSubcategoryLabelEnChange = (val: string) => {
    setSubcategoryForm((prev) => ({
      ...prev,
      label: val,
      ...(!editingSubcategory ? { value: toValue(val) } : {}),
    }))
  }

  // ─── Check cascade on value change (editing) ────────────────────────────

  useEffect(() => {
    if (!showCategoryModal || !editingCategory) {
      setCascadeWarning(null)
      return
    }
    if (categoryForm.value !== editingCategory.value && categoryForm.value.trim()) {
      getCategoryUsageCount(editingCategory.value).then((count) => {
        setCascadeWarning(count > 0 ? { count, type: 'category' } : null)
      })
    } else {
      setCascadeWarning(null)
    }
  }, [categoryForm.value, editingCategory, showCategoryModal])

  useEffect(() => {
    if (!showSubcategoryModal || !editingSubcategory) {
      setCascadeWarning(null)
      return
    }
    if (subcategoryForm.value !== editingSubcategory.value && subcategoryForm.value.trim()) {
      getSubcategoryUsageCount(editingSubcategory.value).then((count) => {
        setCascadeWarning(count > 0 ? { count, type: 'subcategory' } : null)
      })
    } else {
      setCascadeWarning(null)
    }
  }, [subcategoryForm.value, editingSubcategory, showSubcategoryModal])

  // ─── Filtered Icons ──────────────────────────────────────────────────────

  const filteredIcons = AVAILABLE_ICONS.filter((i) => i.name.toLowerCase().includes(iconSearch.toLowerCase()))

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories Management</h1>
          <p className="text-gray-400">Manage service categories and subcategories</p>
        </div>
        <button
          onClick={openAddCategory}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No categories found. Add one to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium w-24">Order</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium w-16">Icon</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Name (EN)</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Name (CS)</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Value</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium w-28">Subcategories</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium w-20">Active</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {categories.map((cat, idx) => (
                  <React.Fragment key={cat.id}>
                    {/* Category Row */}
                    <tr className={`hover:bg-gray-700/30 ${!cat.is_active ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <GripVertical className="w-4 h-4 text-gray-500" />
                          <button
                            onClick={() => reorderCategory(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => reorderCategory(idx, 'down')}
                            disabled={idx === categories.length - 1}
                            className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-primary-400">{renderCategoryIcon(cat.icon, 'w-6 h-6')}</div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                          className="flex items-center gap-2 text-white font-medium hover:text-primary-400 transition-colors"
                        >
                          {expandedCategory === cat.id ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                          {cat.label}
                        </button>
                        <div className="flex gap-3 mt-1 text-xs text-gray-500 ml-6">
                          <span>{cat.provider_count} providers</span>
                          <span>{cat.request_count} requests</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{cat.label_cs}</td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-gray-900 text-gray-400 px-2 py-1 rounded">{cat.value}</code>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-300">{cat.subcategories.length}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleCategoryActive(cat)} title={cat.is_active ? 'Deactivate' : 'Activate'}>
                          {cat.is_active ? (
                            <ToggleRight className="w-7 h-7 text-green-400" />
                          ) : (
                            <ToggleLeft className="w-7 h-7 text-gray-500" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditCategory(cat)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteCategory(cat)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Subcategories (expanded) */}
                    {expandedCategory === cat.id && (
                      <>
                        {cat.subcategories.map((sub, subIdx) => (
                          <tr
                            key={sub.id}
                            className={`bg-gray-850 hover:bg-gray-700/20 ${!sub.is_active ? 'opacity-50' : ''}`}
                            style={{ backgroundColor: 'rgba(17,24,39,0.4)' }}
                          >
                            <td className="px-4 py-2.5 pl-10">
                              <div className="flex items-center gap-1">
                                <GripVertical className="w-3.5 h-3.5 text-gray-600" />
                                <button
                                  onClick={() => reorderSubcategory(cat.id, subIdx, 'up')}
                                  disabled={subIdx === 0}
                                  className="p-0.5 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Move up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => reorderSubcategory(cat.id, subIdx, 'down')}
                                  disabled={subIdx === cat.subcategories.length - 1}
                                  className="p-0.5 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Move down"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-2.5">
                              {/* No icon for subcategories */}
                            </td>
                            <td className="px-4 py-2.5 text-gray-300 text-sm pl-10">{sub.label}</td>
                            <td className="px-4 py-2.5 text-gray-400 text-sm">{sub.label_cs}</td>
                            <td className="px-4 py-2.5">
                              <code className="text-xs bg-gray-900 text-gray-500 px-2 py-0.5 rounded">{sub.value}</code>
                            </td>
                            <td className="px-4 py-2.5">{/* empty */}</td>
                            <td className="px-4 py-2.5">
                              <button onClick={() => toggleSubcategoryActive(sub)} title={sub.is_active ? 'Deactivate' : 'Activate'}>
                                {sub.is_active ? (
                                  <ToggleRight className="w-6 h-6 text-green-400" />
                                ) : (
                                  <ToggleLeft className="w-6 h-6 text-gray-500" />
                                )}
                              </button>
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => openEditSubcategory(sub, cat.id)}
                                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => openDeleteSubcategory(sub)}
                                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {/* Add Subcategory Row */}
                        <tr style={{ backgroundColor: 'rgba(17,24,39,0.4)' }}>
                          <td colSpan={8} className="px-4 py-2.5 pl-10">
                            <button
                              onClick={() => openAddSubcategory(cat.id)}
                              className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              Add Subcategory
                            </button>
                          </td>
                        </tr>
                      </>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Category Modal ──────────────────────────────────────────────── */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Label EN */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Label (EN) *</label>
                <input
                  type="text"
                  value={categoryForm.label}
                  onChange={(e) => handleCategoryLabelEnChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  placeholder="e.g. Home Repair"
                />
              </div>

              {/* Label CS */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Label (CS) *</label>
                <input
                  type="text"
                  value={categoryForm.label_cs}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, label_cs: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  placeholder="e.g. Opravy domu"
                />
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Value (DB key)</label>
                <input
                  type="text"
                  value={categoryForm.value}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, value: toValue(e.target.value) }))}
                  className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-400 font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  placeholder="auto_generated_from_label"
                />
              </div>

              {/* Cascade warning */}
              {cascadeWarning && cascadeWarning.type === 'category' && (
                <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-300">
                    <p className="font-medium">Value change will cascade</p>
                    <p className="text-yellow-400/80 mt-0.5">
                      {cascadeWarning.count} record{cascadeWarning.count !== 1 ? 's' : ''} (providers, requests, clients) will be updated
                      from &quot;{editingCategory?.value}&quot; to &quot;{categoryForm.value}&quot;.
                    </p>
                  </div>
                </div>
              )}

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Icon</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-900 border border-gray-700 rounded-lg text-primary-400">
                    {renderCategoryIcon(categoryForm.icon, 'w-6 h-6')}
                  </div>
                  <span className="text-gray-400 text-sm font-mono">{categoryForm.icon}</span>
                  <button
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                  >
                    {showIconPicker ? 'Close' : 'Change'}
                  </button>
                </div>

                {/* Icon Picker */}
                {showIconPicker && (
                  <div className="mt-3 p-3 bg-gray-900 border border-gray-700 rounded-lg">
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={iconSearch}
                        onChange={(e) => setIconSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500"
                        placeholder="Search icons..."
                      />
                    </div>
                    <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                      {filteredIcons.map((icon) => {
                        const IconComp = icon.component
                        const isSelected = categoryForm.icon === icon.name
                        return (
                          <button
                            key={icon.name}
                            onClick={() => {
                              setCategoryForm((prev) => ({ ...prev, icon: icon.name }))
                              setShowIconPicker(false)
                              setIconSearch('')
                            }}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                              isSelected
                                ? 'bg-primary-600/30 border border-primary-500 text-primary-400'
                                : 'hover:bg-gray-800 border border-transparent text-gray-400 hover:text-white'
                            }`}
                            title={icon.name}
                          >
                            <IconComp className="w-5 h-5" />
                            <span className="text-[10px] truncate w-full text-center">{icon.name}</span>
                          </button>
                        )
                      })}
                      {filteredIcons.length === 0 && (
                        <p className="col-span-6 text-center text-gray-500 text-sm py-4">No icons match &quot;{iconSearch}&quot;</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Active */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">Active</label>
                <button onClick={() => setCategoryForm((prev) => ({ ...prev, is_active: !prev.is_active }))}>
                  {categoryForm.is_active ? (
                    <ToggleRight className="w-8 h-8 text-green-400" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-700">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveCategory}
                disabled={saving || !categoryForm.value.trim() || !categoryForm.label.trim() || !categoryForm.label_cs.trim()}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                {saving ? <LoadingSpinner size="sm" /> : <Check className="w-4 h-4" />}
                {editingCategory ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Subcategory Modal ───────────────────────────────────────────── */}
      {showSubcategoryModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">
                {editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}
              </h2>
              <button
                onClick={() => setShowSubcategoryModal(false)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Label EN */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Label (EN) *</label>
                <input
                  type="text"
                  value={subcategoryForm.label}
                  onChange={(e) => handleSubcategoryLabelEnChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  placeholder="e.g. Plumbing"
                />
              </div>

              {/* Label CS */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Label (CS) *</label>
                <input
                  type="text"
                  value={subcategoryForm.label_cs}
                  onChange={(e) => setSubcategoryForm((prev) => ({ ...prev, label_cs: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  placeholder="e.g. Instalatérství"
                />
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Value (DB key)</label>
                <input
                  type="text"
                  value={subcategoryForm.value}
                  onChange={(e) => setSubcategoryForm((prev) => ({ ...prev, value: toValue(e.target.value) }))}
                  className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-gray-400 font-mono text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500"
                  placeholder="auto_generated_from_label"
                />
              </div>

              {/* Cascade warning */}
              {cascadeWarning && cascadeWarning.type === 'subcategory' && (
                <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-300">
                    <p className="font-medium">Value change will cascade</p>
                    <p className="text-yellow-400/80 mt-0.5">
                      {cascadeWarning.count} record{cascadeWarning.count !== 1 ? 's' : ''} (provider services, requests, client preferences)
                      will be updated from &quot;{editingSubcategory?.value}&quot; to &quot;{subcategoryForm.value}&quot;.
                    </p>
                  </div>
                </div>
              )}

              {/* Active */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">Active</label>
                <button onClick={() => setSubcategoryForm((prev) => ({ ...prev, is_active: !prev.is_active }))}>
                  {subcategoryForm.is_active ? (
                    <ToggleRight className="w-8 h-8 text-green-400" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-700">
              <button
                onClick={() => setShowSubcategoryModal(false)}
                className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveSubcategory}
                disabled={saving || !subcategoryForm.value.trim() || !subcategoryForm.label.trim() || !subcategoryForm.label_cs.trim()}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                {saving ? <LoadingSpinner size="sm" /> : <Check className="w-4 h-4" />}
                {editingSubcategory ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ───────────────────────────────────── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Delete {showDeleteConfirm.type}</h3>
                  <p className="text-sm text-gray-400">&quot;{showDeleteConfirm.name}&quot;</p>
                </div>
              </div>

              {showDeleteConfirm.usageCount > 0 ? (
                <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-4">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-300">
                    <p className="font-medium">Cannot delete</p>
                    <p className="text-yellow-400/80 mt-0.5">
                      This {showDeleteConfirm.type} is used by {showDeleteConfirm.usageCount} record
                      {showDeleteConfirm.usageCount !== 1 ? 's' : ''}. You must reassign them before deleting.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 mb-4">
                  Are you sure you want to delete this {showDeleteConfirm.type}? This action cannot be undone.
                </p>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={showDeleteConfirm.usageCount > 0}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
