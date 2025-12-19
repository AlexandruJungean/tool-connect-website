'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import { ServiceProviderProfile } from '@/types/database'
import { SERVICE_CATEGORIES, LANGUAGES, getCategoryLabel, getSubcategoryLabel } from '@/constants/categories'
import { ProviderCard } from '@/components/cards/ProviderCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { LocationInput } from '@/components/forms'
import { Search, Filter, X, Loader2, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { language, t } = useLanguage()
  
  const [providers, setProviders] = useState<ServiceProviderProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  
  // Available categories/subcategories based on actual providers
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([])
  
  // Filters - read from URL params
  const [keywords, setKeywords] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(() => {
    const subcategoriesParam = searchParams.get('subcategories')
    return subcategoriesParam ? subcategoriesParam.split(',').filter(Boolean) : []
  })
  const [providerType, setProviderType] = useState(searchParams.get('type') || '')
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])

  const selectedCategory = SERVICE_CATEGORIES.find(cat => cat.value === category)
  const subcategoriesForCategory = selectedCategory?.subcategories || []

  // Fetch available categories on mount
  useEffect(() => {
    const fetchAvailableCategories = async () => {
      try {
        const { data: catData } = await supabase
          .from('service_provider_profiles')
          .select('category')
          .eq('is_visible', true)
          .eq('is_active', true)
          .not('category', 'is', null)

        const uniqueCategories = [...new Set(catData?.map(p => p.category).filter(Boolean))]
        setAvailableCategories(uniqueCategories as string[])
      } catch (error) {
        console.error('Error fetching available categories:', error)
      }
    }

    fetchAvailableCategories()
  }, [])

  // Fetch available subcategories when category changes
  useEffect(() => {
    const fetchAvailableSubcategories = async () => {
      if (!category) {
        setAvailableSubcategories([])
        return
      }

      try {
        const { data: subData } = await supabase
          .from('service_provider_profiles')
          .select('services')
          .eq('is_visible', true)
          .eq('is_active', true)
          .eq('category', category)

        const allServices = subData?.flatMap(p => p.services || []) || []
        const uniqueServices = [...new Set(allServices)]
        setAvailableSubcategories(uniqueServices)
      } catch (error) {
        console.error('Error fetching available subcategories:', error)
      }
    }

    fetchAvailableSubcategories()
  }, [category])

  const fetchProviders = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('service_provider_profiles')
        .select('*', { count: 'exact' })
        .eq('is_visible', true)
        .eq('is_active', true)

      if (category) {
        query = query.eq('category', category)
      }
      if (selectedSubcategories.length > 0) {
        // Provider must have at least one of the selected subcategories
        query = query.overlaps('services', selectedSubcategories)
      }
      if (providerType && providerType !== 'any') {
        query = query.eq('type', providerType)
      }
      if (location) {
        query = query.or(`city.ilike.%${location}%,country.ilike.%${location}%,location.ilike.%${location}%`)
      }
      if (keywords) {
        query = query.or(`name.ilike.%${keywords}%,category.ilike.%${keywords}%,about_me.ilike.%${keywords}%`)
      }
      if (selectedLanguages.length > 0) {
        query = query.overlaps('languages', selectedLanguages)
      }

      query = query
        .order('average_rating', { ascending: false, nullsFirst: false })
        .order('total_reviews', { ascending: false, nullsFirst: false })
        .limit(50)

      const { data, error, count } = await query

      if (error) throw error
      setProviders(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error fetching providers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProviders()
  }, [category, selectedSubcategories, providerType, location, keywords, selectedLanguages])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProviders()
  }

  const clearFilters = () => {
    setKeywords('')
    setCategory('')
    setSelectedSubcategories([])
    setProviderType('')
    setLocation('')
    setSelectedLanguages([])
    router.push('/search')
  }

  const hasActiveFilters = category || selectedSubcategories.length > 0 || providerType || location || selectedLanguages.length > 0

  // Only show categories that have at least one provider
  const categoryOptions = [
    { value: '', label: t('search.allCategories') },
    ...SERVICE_CATEGORIES
      .filter(cat => availableCategories.includes(cat.value))
      .map(cat => ({
        value: cat.value,
        label: getCategoryLabel(cat.value, language)
      }))
  ]

  const toggleSubcategory = (value: string) => {
    setSelectedSubcategories(prev =>
      prev.includes(value)
        ? prev.filter(s => s !== value)
        : [...prev, value]
    )
  }

  const typeOptions = [
    { value: '', label: t('search.anyType') },
    { value: 'company', label: t('search.company') },
    { value: 'self-employed', label: t('search.selfEmployed') },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <Input
              placeholder={t('search.placeholder')}
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
              className="flex-1"
            />
            <Button type="submit" leftIcon={<Search className="w-5 h-5" />}>
              {t('common.search')}
            </Button>
            <Button
              type="button"
              variant={showFilters ? 'secondary' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<SlidersHorizontal className="w-5 h-5" />}
              className="hidden sm:flex"
            >
              {t('common.filter')}
            </Button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className={cn(
            "lg:w-72 flex-shrink-0",
            showFilters ? "block" : "hidden lg:block"
          )}>
            <div className="bg-white rounded-2xl p-6 shadow-card sticky top-36">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-gray-900">{t('common.filter')}</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-700 hover:text-primary-800"
                  >
                    {t('search.clearFilters')}
                  </button>
                )}
              </div>

              <div className="space-y-5">
                <Select
                  label={t('search.category')}
                  options={categoryOptions}
                  value={category}
                  onChange={(val) => {
                    setCategory(val)
                    setSelectedSubcategories([])
                  }}
                />

                {category && subcategoriesForCategory.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('search.subcategory')}
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                      {subcategoriesForCategory.map((sub) => (
                        <button
                          key={sub.value}
                          onClick={() => toggleSubcategory(sub.value)}
                          className={cn(
                            "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                            selectedSubcategories.includes(sub.value)
                              ? "bg-primary-700 text-white border-primary-700"
                              : "bg-white text-gray-700 border-gray-200 hover:border-primary-300"
                          )}
                        >
                          {language === 'cs' ? sub.labelCS : sub.label}
                        </button>
                      ))}
                    </div>
                    {selectedSubcategories.length > 0 && (
                      <button
                        onClick={() => setSelectedSubcategories([])}
                        className="mt-2 text-xs text-gray-500 hover:text-primary-600"
                      >
                        {language === 'cs' ? 'Zrušit výběr' : 'Clear selection'} ({selectedSubcategories.length})
                      </button>
                    )}
                  </div>
                )}

                <Select
                  label={t('search.providerType')}
                  options={typeOptions}
                  value={providerType}
                  onChange={setProviderType}
                />

                <LocationInput
                  label={t('search.location')}
                  placeholder={language === 'cs' ? 'Město nebo země' : 'City or country'}
                  value={location}
                  onChange={(value) => setLocation(value)}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('search.languages')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.slice(0, 6).map((lang) => (
                      <button
                        key={lang.value}
                        onClick={() => {
                          if (selectedLanguages.includes(lang.value)) {
                            setSelectedLanguages(selectedLanguages.filter(l => l !== lang.value))
                          } else {
                            setSelectedLanguages([...selectedLanguages, lang.value])
                          }
                        }}
                        className={cn(
                          "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                          selectedLanguages.includes(lang.value)
                            ? "bg-primary-700 text-white border-primary-700"
                            : "bg-white text-gray-700 border-gray-200 hover:border-primary-300"
                        )}
                      >
                        {language === 'cs' ? lang.labelCS : lang.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">{totalCount}</span> {t('search.results')}
              </p>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 text-primary-700"
              >
                <SlidersHorizontal className="w-5 h-5" />
                {t('common.filter')}
              </button>
            </div>

            {/* Provider Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary-700" />
              </div>
            ) : providers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {providers.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('common.noResults')}</h3>
                <p className="text-gray-500 mb-4">
                  {language === 'cs' 
                    ? 'Zkuste upravit filtry nebo vyhledávací dotaz'
                    : 'Try adjusting your filters or search query'
                  }
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    {t('search.clearFilters')}
                  </Button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-700" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}

