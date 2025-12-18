'use client'

import React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { SERVICE_CATEGORIES, getCategoryLabel } from '@/constants/categories'
import { Button } from '@/components/ui/Button'
import { 
  Search, 
  Users, 
  MessageSquare, 
  Star, 
  MapPin, 
  Globe,
  ArrowRight,
  CheckCircle,
  Briefcase
} from 'lucide-react'

export default function HomePage() {
  const { language, t } = useLanguage()

  const features = [
    { icon: MessageSquare, title: 'Built-In Messaging', titleCS: 'Vestavěné zprávy', desc: 'Chat directly in the app', descCS: 'Chatujte přímo v aplikaci' },
    { icon: MapPin, title: 'Search by Location', titleCS: 'Hledat podle lokace', desc: 'Find nearby providers', descCS: 'Najděte blízké poskytovatele' },
    { icon: Globe, title: 'Bilingual Interface', titleCS: 'Dvojjazyčné rozhraní', desc: 'Czech and English', descCS: 'Čeština a angličtina' },
    { icon: Star, title: 'Ratings & Reviews', titleCS: 'Hodnocení a recenze', desc: 'Build trust with reviews', descCS: 'Budujte důvěru recenzemi' },
  ]

  const topCategories = SERVICE_CATEGORIES.slice(0, 8)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM1QjIxQjYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              <span className="text-primary-700">Tool</span> - 
              <span className="block">One app for all services.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 leading-relaxed">
              {language === 'cs' 
                ? 'Tool propojuje lidi s důvěryhodnými profesionály v jakémkoli oboru – od oprav po překlady. Najděte specialisty podle lokace a jazyka.'
                : 'Tool Connect links people with trusted professionals in any field – from repairs to translations. Find specialists by location and language.'
              }
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/search" prefetch={false}>
                <Button size="lg" leftIcon={<Search className="w-5 h-5" />}>
                  {language === 'cs' ? 'Najít specialistu' : 'Find a Specialist'}
                </Button>
              </Link>
              <a href="/service-providers.html">
                <Button variant="outline" size="lg" leftIcon={<Briefcase className="w-5 h-5" />}>
                  {language === 'cs' ? 'Nabídnout služby' : 'Offer Your Services'}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {language === 'cs' ? 'Proč si vybrat Tool Connect?' : 'Why Choose Tool Connect?'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-6 bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {language === 'cs' ? feature.titleCS : feature.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === 'cs' ? feature.descCS : feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {language === 'cs' ? 'Kategorie služeb' : 'Service Categories'}
            </h2>
            <Link href="/search" prefetch={false} className="text-primary-700 hover:text-primary-800 font-medium flex items-center gap-1">
              {t('common.seeAll')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {topCategories.map((category) => (
              <Link 
                key={category.value}
                href={`/search?category=${category.value}`}
                className="p-4 bg-white rounded-xl border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all duration-300 group"
              >
                <h3 className="font-medium text-gray-900 group-hover:text-primary-700 transition-colors">
                  {getCategoryLabel(category.value, language)}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {category.subcategories.length} {language === 'cs' ? 'služeb' : 'services'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {language === 'cs' ? 'Jak to funguje' : 'How It Works'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, title: language === 'cs' ? 'Vytvořte účet' : 'Create an Account', desc: language === 'cs' ? 'Zaregistrujte se rychle a snadno' : 'Sign up quickly and easily' },
              { step: 2, title: language === 'cs' ? 'Najděte poskytovatele' : 'Find a Provider', desc: language === 'cs' ? 'Vyhledejte vhodné poskytovatele' : 'Search and browse providers' },
              { step: 3, title: language === 'cs' ? 'Spojte se' : 'Connect & Discuss', desc: language === 'cs' ? 'Pošlete zprávy a dohodněte detaily' : 'Send messages and discuss details' },
              { step: 4, title: language === 'cs' ? 'Ohodnoťte' : 'Leave a Review', desc: language === 'cs' ? 'Ohodnoťte svou zkušenost' : 'Rate your experience' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-primary-700 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {language === 'cs' ? 'Připraveni začít?' : 'Ready to Get Started?'}
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            {language === 'cs' 
              ? 'Připojte se k tisícům spokojených uživatelů a najděte profesionály pro vaše potřeby.'
              : 'Join thousands of satisfied users and find professionals for your needs.'
            }
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/search" prefetch={false}>
              <Button variant="secondary" size="lg">
                {language === 'cs' ? 'Procházet služby' : 'Browse Services'}
              </Button>
            </Link>
            <Link href="/login" prefetch={false}>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-700">
                {t('nav.signIn')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

