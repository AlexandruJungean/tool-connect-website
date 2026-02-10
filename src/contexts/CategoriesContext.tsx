'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import supabase from '@/lib/supabase'
import type { OptionSet, ServiceCategory } from '@/constants/categories'

// Re-use existing types
export type { OptionSet, ServiceCategory } from '@/constants/categories'

// Raw DB row shapes
export interface CategoryRow {
  id: string
  value: string
  label: string
  label_cs: string
  icon: string
  display_order: number
  is_active: boolean
}

export interface SubcategoryRow {
  id: string
  category_id: string
  value: string
  label: string
  label_cs: string
  display_order: number
  is_active: boolean
}

// Context value
interface CategoriesContextValue {
  categories: ServiceCategory[]
  allCategories: CategoryRow[]
  allSubcategories: SubcategoryRow[]
  isLoading: boolean
  getCategoryLabel: (value: string, locale?: 'en' | 'cs') => string
  getSubcategoryLabel: (categoryValue: string, subcategoryValue: string, locale?: 'en' | 'cs') => string
  refreshCategories: () => Promise<void>
}

const CategoriesContext = createContext<CategoriesContextValue>({
  categories: [],
  allCategories: [],
  allSubcategories: [],
  isLoading: true,
  getCategoryLabel: (value: string) => value,
  getSubcategoryLabel: (_categoryValue: string, subcategoryValue: string) => subcategoryValue,
  refreshCategories: async () => {},
})

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [allCategories, setAllCategories] = useState<CategoryRow[]>([])
  const [allSubcategories, setAllSubcategories] = useState<SubcategoryRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchCategories = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      const { data: subData } = await supabase
        .from('subcategories')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      // Store raw rows
      setAllCategories(catData || [])
      setAllSubcategories(subData || [])

      // Shape into ServiceCategory[] format
      const shaped: ServiceCategory[] = (catData || []).map((cat: CategoryRow) => ({
        value: cat.value,
        label: cat.label,
        labelCS: cat.label_cs,
        icon: cat.icon,
        subcategories: (subData || [])
          .filter((sub: SubcategoryRow) => sub.category_id === cat.id)
          .map((sub: SubcategoryRow) => ({
            value: sub.value,
            label: sub.label,
            labelCS: sub.label_cs,
          })),
      }))

      setCategories(shaped)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const getCategoryLabel = useCallback(
    (value: string, locale: 'en' | 'cs' = 'en'): string => {
      if (!value) return ''
      const normalized = value.toLowerCase().trim()
      const cat = categories.find((c) => c.value.toLowerCase() === normalized)
      return cat ? (locale === 'cs' ? cat.labelCS : cat.label) : value
    },
    [categories]
  )

  const getSubcategoryLabel = useCallback(
    (categoryValue: string, subcategoryValue: string, locale: 'en' | 'cs' = 'en'): string => {
      if (!categoryValue || !subcategoryValue) return subcategoryValue || ''
      const normalizedCat = categoryValue.toLowerCase().trim()
      const normalizedSub = subcategoryValue.toLowerCase().trim()
      const cat = categories.find((c) => c.value.toLowerCase() === normalizedCat)
      if (!cat) return subcategoryValue
      const sub = cat.subcategories.find((s) => s.value.toLowerCase() === normalizedSub)
      return sub ? (locale === 'cs' ? sub.labelCS : sub.label) : subcategoryValue
    },
    [categories]
  )

  const value: CategoriesContextValue = {
    categories,
    allCategories,
    allSubcategories,
    isLoading,
    getCategoryLabel,
    getSubcategoryLabel,
    refreshCategories: fetchCategories,
  }

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>
}

export function useCategories() {
  const context = useContext(CategoriesContext)
  if (!context) {
    throw new Error('useCategories must be used within a CategoriesProvider')
  }
  return context
}
