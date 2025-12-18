'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Wrench, ArrowRight, Users, Star, Shield, Globe } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

export default function WelcomePage() {
  const router = useRouter()
  const { language, setLanguage } = useLanguage()

  const t = {
    title: 'Tool Connect',
    tagline: language === 'cs' 
      ? 'Spojujeme vás s profesionály'
      : 'Connecting you with professionals',
    description: language === 'cs'
      ? 'Najděte spolehlivé poskytovatele služeb ve vašem okolí. Od řemeslníků po učitele - všichni na jednom místě.'
      : 'Find reliable service providers in your area. From craftsmen to tutors - all in one place.',
    getStarted: language === 'cs' ? 'Začít' : 'Get Started',
    login: language === 'cs' ? 'Přihlásit se' : 'Log In',
    browseProviders: language === 'cs' ? 'Procházet poskytovatele' : 'Browse Providers',
    features: [
      {
        icon: Users,
        title: language === 'cs' ? 'Ověření profesionálové' : 'Verified Professionals',
        description: language === 'cs'
          ? 'Všichni poskytovatelé prošli ověřením'
          : 'All providers go through verification',
      },
      {
        icon: Star,
        title: language === 'cs' ? 'Recenze a hodnocení' : 'Reviews & Ratings',
        description: language === 'cs'
          ? 'Čtěte zkušenosti ostatních uživatelů'
          : 'Read experiences from other users',
      },
      {
        icon: Shield,
        title: language === 'cs' ? 'Bezpečná komunikace' : 'Secure Messaging',
        description: language === 'cs'
          ? 'Komunikujte přímo a bezpečně'
          : 'Communicate directly and securely',
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-600 via-primary-700 to-primary-900 flex flex-col">
      {/* Language Toggle */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => setLanguage(language === 'cs' ? 'en' : 'cs')}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <Globe className="w-4 h-4" />
          {language === 'cs' ? 'English' : 'Čeština'}
        </button>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        {/* Logo */}
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <Wrench className="w-10 h-10 text-primary-600" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white text-center mb-2">
          {t.title}
        </h1>
        <p className="text-xl text-white/80 text-center mb-4">
          {t.tagline}
        </p>
        <p className="text-white/60 text-center max-w-md mb-10">
          {t.description}
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 gap-4 w-full max-w-sm mb-10">
          {t.features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4"
              >
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">{feature.title}</p>
                  <p className="text-sm text-white/60">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <Button
            onClick={() => router.push('/onboarding')}
            size="lg"
            className="w-full bg-white text-primary-700 hover:bg-gray-100"
          >
            {t.getStarted}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <Button
            onClick={() => router.push('/login')}
            variant="outline"
            size="lg"
            className="w-full border-white/30 text-white hover:bg-white/10"
          >
            {t.login}
          </Button>

          <Link
            href="/search"
            className="text-center text-sm text-white/70 hover:text-white mt-2"
          >
            {t.browseProviders}
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-6 text-white/40 text-sm">
        © {new Date().getFullYear()} Tool Connect
      </div>
    </div>
  )
}

