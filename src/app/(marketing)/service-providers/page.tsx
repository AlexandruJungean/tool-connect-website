'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Users, Star, Smartphone, Handshake, Camera, Clock, Medal, Heart,
  Mail, Download, ArrowRight, Apple, Globe
} from 'lucide-react'
import { MarketingHeader, MarketingFooter } from '@/components/marketing'
import { Button } from '@/components/ui'
import { useLanguage } from '@/contexts/LanguageContext'

export default function ServiceProvidersPage() {
  const { language } = useLanguage()

  const t = {
    hero: {
      title: language === 'cs' ? 'Rozviňte své podnikání s Tool' : 'Grow Your Business with Tool',
      subtitle: language === 'cs'
        ? 'Připojte se k tisícům profesionálů, kteří věří Tool při rozšiřování svého dosahu, spojování s novými klienty a budování své reputace.'
        : 'Join thousands of professionals who trust Tool to expand their reach, connect with new clients, and build their reputation.',
    },
    benefits: {
      title: language === 'cs' ? 'Proč si poskytovatelé služeb vybírají Tool' : 'Why Service Providers Choose Tool',
      items: [
        {
          icon: Users,
          title: language === 'cs' ? 'Rozšiřte svou klientelu' : 'Expand Your Client Base',
          description: language === 'cs'
            ? 'Oslovte tisíce potenciálních zákazníků aktivně hledajících vaše služby.'
            : 'Reach thousands of potential customers actively searching for your services in your area and beyond.',
        },
        {
          icon: Star,
          title: language === 'cs' ? 'Budujte svou reputaci' : 'Build Your Reputation',
          description: language === 'cs'
            ? 'Prezentujte svou práci prostřednictvím portfolií a sbírejte autentické recenze.'
            : 'Showcase your work through portfolios and collect genuine reviews that build trust with future clients.',
        },
        {
          icon: Smartphone,
          title: language === 'cs' ? 'Mobilní zkušenost' : 'Mobile-First Experience',
          description: language === 'cs'
            ? 'Spravujte své podnikání na cestách pomocí naší mobilní aplikace.'
            : 'Manage your business on the go with our mobile app, responding to clients anytime, anywhere.',
        },
        {
          icon: Handshake,
          title: language === 'cs' ? 'Přímá komunikace' : 'Direct Communication',
          description: language === 'cs'
            ? 'Spojte se přímo s klienty prostřednictvím integrovaného systému zpráv.'
            : 'Connect directly with clients through our integrated messaging system without sharing personal contact information.',
        },
      ],
    },
    gettingStarted: {
      title: language === 'cs' ? 'Jak začít jako poskytovatel služeb' : 'How to Get Started as a Service Provider',
      steps: [
        {
          title: language === 'cs' ? 'Vytvořte si profesionální profil' : 'Create Your Professional Profile',
          description: language === 'cs'
            ? 'Zaregistrujte se a doplňte svůj profil o dovednosti, zkušenosti a oblasti služeb.'
            : 'Sign up and complete your profile with your skills, experience, and service areas. Add professional photos and certifications to stand out.',
          items: language === 'cs'
            ? ['Nahrajte kvalitní fotografie své práce', 'Uveďte své dovednosti a specializace', 'Nastavte oblasti služeb a dostupnost', 'Přidejte profesní certifikáty']
            : ['Upload high-quality photos of your work', 'List your skills and specializations', 'Set your service areas and availability', 'Add professional certifications'],
        },
        {
          title: language === 'cs' ? 'Nastavte služby a ceny' : 'Set Up Your Services & Pricing',
          description: language === 'cs'
            ? 'Definujte, jaké služby nabízíte, a nastavte konkurenční ceny.'
            : 'Define what services you offer and set competitive pricing. Be clear about what\'s included in each service package.',
          items: language === 'cs'
            ? ['Vytvořte podrobné popisy služeb', 'Nastavte transparentní cenovou strukturu', 'Definujte balíčky služeb', 'Specifikujte politiku materiálů']
            : ['Create detailed service descriptions', 'Set transparent pricing structure', 'Define service packages and add-ons', 'Specify materials and equipment policies'],
        },
        {
          title: language === 'cs' ? 'Začněte přijímat poptávky' : 'Start Receiving Requests',
          description: language === 'cs'
            ? 'Jakmile bude váš profil schválen, začnete dostávat poptávky od klientů.'
            : 'Once your profile is approved, you\'ll start receiving client requests. Respond promptly to build your reputation.',
          items: language === 'cs'
            ? ['Odpovídejte na poptávky co nejdříve', 'Ptejte se na upřesňující otázky', 'Poskytujte přesné časové odhady', 'Udržujte profesionální komunikaci']
            : ['Respond to requests as soon as possible', 'Ask clarifying questions about the project', 'Provide accurate time estimates', 'Maintain professional communication'],
        },
        {
          title: language === 'cs' ? 'Dodávejte excelenci a sbírejte recenze' : 'Deliver Excellence & Build Reviews',
          description: language === 'cs'
            ? 'Zaměřte se na dodávání kvalitní práce a výjimečný zákaznický servis.'
            : 'Focus on delivering quality work and exceptional customer service to earn positive reviews and repeat business.',
          items: language === 'cs'
            ? ['Přicházejte včas a připraveni', 'Komunikujte během projektu', 'Po dokončení práce ukliďte', 'Sledujte spokojenost klienta']
            : ['Arrive on time and prepared', 'Communicate throughout the project', 'Clean up after completing work', 'Follow up to ensure satisfaction'],
        },
      ],
    },
    successTips: {
      title: language === 'cs' ? 'Tipy pro úspěch na Tool' : 'Tips for Success on Tool',
      items: [
        {
          icon: Camera,
          title: language === 'cs' ? 'Profesionální fotografie' : 'Professional Photos',
          description: language === 'cs'
            ? 'Používejte kvalitní fotografie před/po k prezentaci své práce.'
            : 'Use high-quality before/after photos to showcase your work. Visual proof builds trust and attracts more clients.',
        },
        {
          icon: Clock,
          title: language === 'cs' ? 'Rychlá odezva' : 'Quick Response Time',
          description: language === 'cs'
            ? 'Odpovídejte na zprávy klientů během několika hodin.'
            : 'Respond to client messages within a few hours. Fast responses show professionalism and increase booking rates.',
        },
        {
          icon: Medal,
          title: language === 'cs' ? 'Konkurenční ceny' : 'Competitive Pricing',
          description: language === 'cs'
            ? 'Prozkoumejte místní sazby a ceňte konkurenceschopně.'
            : 'Research local market rates and price competitively. Offer different service levels to attract various client budgets.',
        },
        {
          icon: Heart,
          title: language === 'cs' ? 'Vynikající služby' : 'Excellent Service',
          description: language === 'cs'
            ? 'Jděte nad rámec pro své klienty.'
            : 'Go above and beyond for your clients. Exceptional service leads to positive reviews and word-of-mouth referrals.',
        },
      ],
    },
    support: {
      title: language === 'cs' ? 'Jsme tu, abychom vám pomohli' : 'We are Here to Assist You',
      contactTitle: language === 'cs' ? 'Potřebujete pomoc se začátkem?' : 'Need Help Getting Started?',
      contactDescription: language === 'cs'
        ? 'Neváhejte nás kontaktovat, pokud potřebujete pomoc s nastavením profilu poskytovatele služeb.'
        : 'Feel free to contact us if you need help with setting up your service provider profile or have any questions/suggestions.',
      contactButton: language === 'cs' ? 'Kontaktovat podporu' : 'Contact Support',
    },
    documentation: {
      title: language === 'cs' ? 'Kompletní průvodce pro poskytovatele služeb' : 'Complete Service Provider Guide',
      description: language === 'cs'
        ? 'Stáhněte si náš komplexní průvodce, který pokrývá vše, co potřebujete vědět o úspěchu jako poskytovatel služeb na Tool.'
        : 'Download our comprehensive guide that covers everything you need to know about succeeding as a service provider on Tool. This detailed documentation includes best practices, policies, and advanced strategies.',
      downloadButton: language === 'cs' ? 'Stáhnout dokumentaci poskytovatele služeb' : 'Download Service Provider Documentation',
      note: language === 'cs' ? 'PDF formát • Pravidelně aktualizováno' : 'PDF format • Updated regularly with latest information',
    },
    download: {
      appStore: 'App Store',
      googlePlay: 'Google Play',
      webBrowser: language === 'cs' ? 'Webový prohlížeč' : 'Web Browser',
      scanQR: language === 'cs' ? 'Naskenujte telefonem' : 'Scan with your phone camera',
    },
  }

  const navItems = [
    { label: language === 'cs' ? 'Domů' : 'Home', href: '/' },
    { label: language === 'cs' ? 'Výhody' : 'Benefits', href: '#benefits' },
    { label: language === 'cs' ? 'Začínáme' : 'Getting Started', href: '#getting-started' },
    { label: language === 'cs' ? 'Tipy pro úspěch' : 'Success Tips', href: '#success-tips' },
    { label: language === 'cs' ? 'Podpora' : 'Support', href: '#support' },
    { label: language === 'cs' ? 'Dokumentace' : 'Documentation', href: '#documentation' },
  ]

  const handleDownloadDoc = () => {
    const urls = {
      en: 'https://drive.google.com/file/d/19GJHyPuhPu_x-UDfr1F7ezf4aw1L6Dhf/view?usp=drive_link',
      cs: 'https://drive.google.com/file/d/11SzgmHWf4myiFwO6m6rxFLwz6Ku82UIr/view?usp=drive_link',
    }
    window.open(urls[language] || urls.en, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader navItems={navItems} transparent />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t.hero.title}
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-10">
            {t.hero.subtitle}
          </p>
          
          {/* Download Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <a
              href="https://apps.apple.com/us/app/tool/id6739626276"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white text-gray-900 px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Apple className="w-6 h-6" />
              <div className="text-left">
                <div className="text-xs opacity-70">Download on the</div>
                <div className="font-semibold">{t.download.appStore}</div>
              </div>
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.tool.toolappconnect"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white text-gray-900 px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm3.35-4.31c.34.27.59.69.59 1.19s-.22.87-.52 1.14l-2.27 1.29-2.5-2.5 2.5-2.5 2.2 1.38zM6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z"/>
              </svg>
              <div className="text-left">
                <div className="text-xs opacity-70">Get it on</div>
                <div className="font-semibold">{t.download.googlePlay}</div>
              </div>
            </a>
            <Link
              href="/search"
              className="inline-flex items-center gap-3 bg-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-colors"
            >
              <Globe className="w-6 h-6" />
              <div className="text-left">
                <div className="text-xs opacity-70">Try it on the</div>
                <div className="font-semibold">{t.download.webBrowser}</div>
              </div>
            </Link>
          </div>

          {/* QR Code */}
          <div className="inline-block bg-white rounded-2xl p-6">
            <Image
              src="/assets/QR codes/smartlink.png"
              alt="Download QR Code"
              width={150}
              height={150}
              className="mx-auto mb-2"
            />
            <p className="text-sm text-gray-500">{t.download.scanQR}</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            {t.benefits.title}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.benefits.items.map((item, index) => {
              const Icon = item.icon
              return (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-primary-200 transition-all group"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-600 transition-colors">
                    <Icon className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section id="getting-started" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            {t.gettingStarted.title}
          </h2>
          <div className="space-y-8">
            {t.gettingStarted.steps.map((step, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {step.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center gap-2 text-gray-700">
                          <div className="w-1.5 h-1.5 bg-primary-600 rounded-full" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Tips Section */}
      <section id="success-tips" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            {t.successTips.title}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.successTips.items.map((item, index) => {
              const Icon = item.icon
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 text-center"
                >
                  <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section id="support" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            {t.support.title}
          </h2>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{t.support.contactTitle}</h3>
            <p className="text-gray-600 mb-6">{t.support.contactDescription}</p>
            <div className="flex items-center justify-center gap-2 text-gray-700 mb-6">
              <Mail className="w-5 h-5 text-primary-600" />
              <span>info@tool-connect.com</span>
            </div>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSf4GGErKbq82OjpkcxuLUQySMlFRD5_Ej2T64HwY3rYbjayVg/viewform?usp=header"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg">
                <Mail className="w-5 h-5 mr-2" />
                {t.support.contactButton}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Documentation Section */}
      <section id="documentation" className="py-20 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t.documentation.title}
          </h2>
          <p className="text-lg text-white/80 mb-8">
            {t.documentation.description}
          </p>
          <Button
            size="lg"
            onClick={handleDownloadDoc}
            className="bg-white text-primary-700 hover:bg-gray-100"
          >
            <Download className="w-5 h-5 mr-2" />
            {t.documentation.downloadButton}
          </Button>
          <p className="text-white/60 text-sm mt-4">{t.documentation.note}</p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}

