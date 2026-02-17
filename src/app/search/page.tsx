'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import { ServiceProviderProfile } from '@/types/database'
import { LANGUAGES } from '@/constants/categories'
import { useCategories } from '@/contexts/CategoriesContext'
import { renderCategoryIcon } from '@/lib/icons'
import { ProviderCard } from '@/components/cards/ProviderCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { LocationInput } from '@/components/forms'
import { Search, Filter, X, Loader2, SlidersHorizontal, ArrowLeft, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { language, t } = useLanguage()
  const { categories, getCategoryLabel, getSubcategoryLabel } = useCategories()
  
  const [providers, setProviders] = useState<ServiceProviderProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [showFilters, setShowFilters] = useState(true) // Show filters by default
  
  // Category picker state - show first if no category in URL
  const hasFiltersFromURL = !!searchParams.get('category')
  const [showCategoryPicker, setShowCategoryPicker] = useState(!hasFiltersFromURL)
  const [pickerCategory, setPickerCategory] = useState<string | null>(null)
  const [pickerSubcategories, setPickerSubcategories] = useState<string[]>([])
  
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
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [pricePeriod, setPricePeriod] = useState('')

  const selectedCategory = categories.find(cat => cat.value === category)
  const subcategoriesForCategory = selectedCategory?.subcategories || []
  
  // Get picker category data
  const getPickerCategoryData = () => {
    return categories.find(cat => cat.value === pickerCategory)
  }
  
  // Category picker handlers
  const handlePickerCategorySelect = (categoryValue: string) => {
    if (pickerCategory === categoryValue) {
      setPickerCategory(null)
      setPickerSubcategories([])
    } else {
      setPickerCategory(categoryValue)
      setPickerSubcategories([])
    }
  }
  
  const handlePickerSubcategoryToggle = (subcategoryValue: string) => {
    setPickerSubcategories(prev => {
      if (prev.includes(subcategoryValue)) {
        return prev.filter(s => s !== subcategoryValue)
      } else {
        return [...prev, subcategoryValue]
      }
    })
  }
  
  const handlePickerConfirm = () => {
    if (pickerCategory) {
      setCategory(pickerCategory)
      setSelectedSubcategories(pickerSubcategories)
      setShowCategoryPicker(false)
    }
  }
  
  const handleShowAllProviders = () => {
    setCategory('')
    setSelectedSubcategories([])
    setShowCategoryPicker(false)
  }

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
        // First, find subcategory values that match the keywords
        const matchingSubcategoryValues: string[] = []
        const keywordsLower = keywords.toLowerCase()
        
        categories.forEach(cat => {
          cat.subcategories.forEach(sub => {
            if (
              sub.label.toLowerCase().includes(keywordsLower) ||
              sub.labelCS.toLowerCase().includes(keywordsLower) ||
              sub.value.toLowerCase().includes(keywordsLower)
            ) {
              matchingSubcategoryValues.push(sub.value)
            }
          })
        })

        // Build search query - search in name, category, about_me, and matching subcategories
        if (matchingSubcategoryValues.length > 0) {
          // If keywords match subcategories, we need to combine text search with service overlap
          query = query.or(`name.ilike.%${keywords}%,category.ilike.%${keywords}%,about_me.ilike.%${keywords}%,services.ov.{${matchingSubcategoryValues.join(',')}}`)
        } else {
          query = query.or(`name.ilike.%${keywords}%,category.ilike.%${keywords}%,about_me.ilike.%${keywords}%`)
        }
      }
      if (selectedLanguages.length > 0) {
        query = query.overlaps('languages', selectedLanguages)
      }
      if (priceMin) {
        query = query.gte('hourly_rate_min', parseFloat(priceMin))
      }
      if (priceMax) {
        query = query.lte('hourly_rate_min', parseFloat(priceMax))
      }
      if (pricePeriod) {
        query = query.eq('price_period', pricePeriod)
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
  }, [category, selectedSubcategories, providerType, location, keywords, selectedLanguages, priceMin, priceMax, pricePeriod])

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
    setPriceMin('')
    setPriceMax('')
    setPricePeriod('')
    router.push('/search')
  }

  const hasActiveFilters = category || selectedSubcategories.length > 0 || providerType || location || selectedLanguages.length > 0 || priceMin || priceMax || pricePeriod

  // Only show categories that have at least one provider
  const categoryOptions = [
    { value: '', label: t('search.allCategories') },
    ...categories
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

  // Show category picker view
  if (showCategoryPicker) {
    return (
      <div className="min-h-screen">
        {/* Search Header */}
        <div className="backdrop-blur-sm sticky top-16 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <form onSubmit={(e) => { e.preventDefault(); if (keywords.trim()) { setShowCategoryPicker(false) } }} className="flex gap-3">
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
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {language === 'cs' ? 'Vyberte kategorii' : 'Select a Category'}
            </h1>
            <p className="text-gray-600">
              {language === 'cs' 
                ? 'Vyberte kategorii a služby, které hledáte'
                : 'Choose a category and services you are looking for'
              }
            </p>
          </div>

          {!pickerCategory ? (
            // Show main categories grid
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 mb-8">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => handlePickerCategorySelect(cat.value)}
                    className="flex flex-col items-center justify-center p-4 sm:p-6 bg-white rounded-xl border border-gray-200 hover:border-primary-400 hover:shadow-lg transition-all group"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary-100 flex items-center justify-center mb-3 text-primary-700 group-hover:bg-primary-200 transition-colors">
                      {renderCategoryIcon(cat.icon, 'w-7 h-7 text-primary-700 group-hover:text-primary-800')}
                    </div>
                    <span className="text-sm sm:text-base font-medium text-gray-900 text-center">
                      {language === 'cs' ? cat.labelCS : cat.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Show all providers button */}
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={handleShowAllProviders}
                  leftIcon={<Search className="w-5 h-5" />}
                >
                  {language === 'cs' ? 'Zobrazit všechny poskytovatele' : 'Show All Providers'}
                </Button>
              </div>
            </>
          ) : (
            // Show subcategories for selected category
            <div className="bg-white rounded-2xl p-6 shadow-card">
              {/* Back button */}
              <button
                onClick={() => setPickerCategory(null)}
                className="flex items-center gap-2 text-primary-700 hover:text-primary-800 mb-6 px-4 py-2 bg-primary-50 rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">
                  {language === 'cs' ? getPickerCategoryData()?.labelCS : getPickerCategoryData()?.label}
                </span>
              </button>

              {/* Subcategories grid */}
              <div className="flex flex-wrap gap-3 mb-8">
                {getPickerCategoryData()?.subcategories.map((subcategory) => (
                  <button
                    key={subcategory.value}
                    onClick={() => handlePickerSubcategoryToggle(subcategory.value)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all border-2",
                      pickerSubcategories.includes(subcategory.value)
                        ? "bg-primary-700 text-white border-primary-700"
                        : "bg-white text-gray-700 border-gray-200 hover:border-primary-400"
                    )}
                  >
                    {language === 'cs' ? subcategory.labelCS : subcategory.label}
                    {pickerSubcategories.includes(subcategory.value) && (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </div>

              {/* Confirm button */}
              <Button 
                onClick={handlePickerConfirm}
                size="lg"
                className="w-full"
                leftIcon={<Search className="w-5 h-5" />}
              >
                {language === 'cs' ? 'Zobrazit poskytovatele' : 'Show Providers'}
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Search Header */}
      <div className="backdrop-blur-sm sticky top-16 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
        {/* Back to categories button */}
        <button
          onClick={() => {
            setShowCategoryPicker(true)
            setPickerCategory(null)
            setPickerSubcategories([])
          }}
          className="flex items-center gap-2 text-primary-700 hover:text-primary-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          {language === 'cs' ? 'Zpět na kategorie' : 'Back to categories'}
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className={cn(
            "lg:w-72 flex-shrink-0",
            showFilters ? "block" : "hidden"
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
                    {language === 'cs' ? 'Cenový rozsah (Kč)' : 'Price Range (CZK)'}
                  </label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder={language === 'cs' ? 'Od' : 'Min'}
                      type="text"
                      inputMode="numeric"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value.replace(/\D/g, ''))}
                    />
                    <Input
                      placeholder={language === 'cs' ? 'Do' : 'Max'}
                      type="text"
                      inputMode="numeric"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'hour', label: language === 'cs' ? 'Hodina' : 'Hour' },
                      { value: 'day', label: language === 'cs' ? 'Den' : 'Day' },
                      { value: 'week', label: language === 'cs' ? 'Týden' : 'Week' },
                      { value: 'month', label: language === 'cs' ? 'Měsíc' : 'Month' },
                    ].map((period) => (
                      <button
                        key={period.value}
                        onClick={() => setPricePeriod(pricePeriod === period.value ? '' : period.value)}
                        className={cn(
                          "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                          pricePeriod === period.value
                            ? "bg-primary-700 text-white border-primary-700"
                            : "bg-white text-gray-700 border-gray-200 hover:border-primary-300"
                        )}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>
                </div>

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-700" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}

