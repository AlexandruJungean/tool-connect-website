'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  MessageCircle, Megaphone, MapPin, Languages, Users, Globe, Star, Smartphone,
  Check, UserPlus, Search, Handshake, ArrowRight, ChevronDown, Mail,
  Home, Wrench, Bug, TreePine, Key, Briefcase, HardHat, Sparkles, Laptop,
  Gavel, Car, Calendar, GraduationCap, Music, Palette, Dumbbell, Heart, Hand,
  FileText, Shield
} from 'lucide-react'
import { MarketingHeader, MarketingFooter } from '@/components/marketing'
import { Button } from '@/components/ui'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

export default function LandingPage() {
  const { language } = useLanguage()
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const t = {
    hero: {
      title: language === 'cs' 
        ? 'Tool- Jedna aplikace pro všechny služby. Kdykoliv. Kdekoliv v České republice.'
        : 'Tool- One app for all services. Anytime. Anywhere in the Czech Republic.',
      subtitle: language === 'cs'
        ? 'Tool spojuje lidi se spolehlivými profesionály v jakémkoli oboru – od oprav po překlady.'
        : 'Tool links people with trusted professionals in any field – from repairs to translations.',
      findSpecialist: language === 'cs' ? 'Najít specialistu' : 'Find a Specialist',
      becomeProvider: language === 'cs' ? 'Nabídnout služby' : 'Offer Your Services',
    },
    benefits: {
      title: language === 'cs' ? 'Proč si vybrat Tool Connect?' : 'Why Choose Tool Connect?',
      items: [
        {
          icon: MessageCircle,
          title: language === 'cs' ? 'Vestavěné zprávy' : 'Built-In Messaging',
          description: language === 'cs' 
            ? 'Komunikujte přímo v aplikaci, sdílejte fotky a potvrzujte dohody.' 
            : 'Chat directly in the app to discuss details, share photos, and confirm arrangements.',
        },
        {
          icon: Megaphone,
          title: language === 'cs' ? 'Zvyšte svou viditelnost' : 'Boost Your Visibility',
          description: language === 'cs'
            ? 'Poskytovatelé služeb mohou propagovat své nabídky a snadno oslovit více klientů.'
            : 'Service providers can promote their offerings and reach more clients easily.',
        },
        {
          icon: MapPin,
          title: language === 'cs' ? 'Hledání podle lokality' : 'Search by Location',
          description: language === 'cs'
            ? 'Rychle najděte poskytovatele ve vašem okolí pro pohodlnější služby.'
            : 'Quickly find nearby providers for faster, more convenient service.',
        },
        {
          icon: Languages,
          title: language === 'cs' ? 'Hledání podle jazyka' : 'Search by Language',
          description: language === 'cs'
            ? 'Spojte se s poskytovateli, kteří mluví vaším preferovaným jazykem.'
            : 'Connect with providers who speak your preferred language.',
        },
        {
          icon: Users,
          title: language === 'cs' ? 'Dvojí role' : 'Dual Roles',
          description: language === 'cs'
            ? 'Plynule přepínejte mezi rolí klienta a poskytovatele služeb.'
            : 'Switch seamlessly between being a client and a service provider.',
        },
        {
          icon: Globe,
          title: language === 'cs' ? 'Dvojjazyčné rozhraní' : 'Bilingual Interface',
          description: language === 'cs'
            ? 'K dispozici v češtině a angličtině – ideální pro místní i expaty.'
            : 'Available in Czech and English—ideal for locals and expats as well.',
        },
        {
          icon: Star,
          title: language === 'cs' ? 'Hodnocení a důvěra' : 'Ratings & Trust',
          description: language === 'cs'
            ? 'Klienti hodnotí poskytovatele pro budování důvěryhodnosti.'
            : 'Clients rate providers to build credibility and confidence.',
        },
        {
          icon: Smartphone,
          title: language === 'cs' ? 'Dostupné kdekoliv' : 'Accessible Anywhere',
          description: language === 'cs'
            ? 'Používejte Tool na mobilu nebo webu pro maximální flexibilitu.'
            : 'Use the tool on mobile or web for maximum flexibility.',
        },
      ],
    },
    features: {
      title: language === 'cs' ? 'Výkonné funkce pro každého' : 'Powerful Features for Everyone',
      subtitle: language === 'cs'
        ? 'Naše platforma je navržena tak, aby bylo hledání a spojování s profesionály co nejjednodušší.'
        : 'Our platform is designed to make finding and connecting with professionals as simple as possible.',
      list: language === 'cs' 
        ? [
            'Integrovaný chat a systém zpráv',
            'Pokročilé vyhledávání podle lokality a dovedností',
            'Podpora více jazyků',
            'Komplexní systém hodnocení a recenzí',
            'Vizuální portfolia pro každého profesionála',
            'Systém oznámení v reálném čase',
          ]
        : [
            'Integrated chat and messaging system',
            'Advanced search by location and skills',
            'Multi-language support',
            'Comprehensive rating and review system',
            'Visual portfolios for each professional',
            'Real-time notification system',
          ],
      tryWebApp: language === 'cs' ? 'Vyzkoušet webovou aplikaci' : 'Try Web App Now',
    },
    about: {
      title: language === 'cs' ? 'Proč Tool' : 'Why Tool',
      paragraphs: language === 'cs'
        ? [
            'Tool-Connect je vytvořen a vyvíjen v České republice – s myšlenkou, že by mělo existovat jedno jednoduché místo, kde lidé mohou najít pomoc, nabídnout své dovednosti a spojit se místně.',
            'S funkcemi jako vestavěné zprávy, vyhledávání podle lokality a širokou škálou služeb je Tool-Connect vytvořen pro práci ve vesnicích i městech, napříč jazyky a kategoriemi.',
            'Náš tým věří v budování něčeho užitečného, jednoduchého a zaměřeného na komunitu.',
            'Teprve začínáme a těšíme se na růst s vaší pomocí.',
          ]
        : [
            'Tool‑Connect is created and developed in Czech Republic — with the idea that there should be one simple place where people can find help, offer their skills, and connect with each other locally.',
            'With features like built‑in messaging, location-based search, and a wide variety of services, Tool‑Connect is made to work across villages and cities, and across languages and categories.',
            'Our team believes in building something useful, simple, and community focused.',
            "We're just getting started, and we're excited to grow it with your help.",
          ],
      teamTitle: language === 'cs' ? 'Náš tým' : 'Our Team',
      teamMembers: 'Laura & Adela',
      location: language === 'cs' ? 'Vytvořeno v České republice' : 'Made in Czech Republic',
    },
    howItWorks: {
      title: language === 'cs' ? 'Jak to funguje' : 'How It Works',
      steps: [
        {
          icon: UserPlus,
          title: language === 'cs' ? 'Vytvořte účet' : 'Create an Account',
          description: language === 'cs' ? 'Zaregistrujte se rychle a jednoduše' : 'Sign up quickly and easily to get started',
        },
        {
          icon: Search,
          title: language === 'cs' ? 'Najděte poskytovatele' : 'Find a Provider',
          description: language === 'cs' ? 'Vyhledejte vhodné poskytovatele služeb' : 'Search and browse suitable service providers',
        },
        {
          icon: Handshake,
          title: language === 'cs' ? 'Spojte se a domluvte' : 'Connect & Discuss',
          description: language === 'cs' ? 'Pošlete zprávy a proberte detaily' : 'Send messages and discuss project details',
        },
        {
          icon: Star,
          title: language === 'cs' ? 'Zanechte recenzi' : 'Leave a Review',
          description: language === 'cs' ? 'Ohodnoťte zkušenost a pomozte ostatním' : 'Rate your experience and help others',
        },
      ],
    },
    categories: {
      title: language === 'cs' ? 'Kategorie služeb' : 'Service Categories',
      description: language === 'cs'
        ? 'Od domácích oprav po digitální služby, kreativní projekty po osobní péči - objevte spolehlivé profesionály v široké škále kategorií.'
        : 'From home repairs to digital services, creative projects to personal care - discover trusted professionals across a wide range of categories.',
      showMore: language === 'cs' ? 'Zobrazit více kategorií' : 'Show More Categories',
      showLess: language === 'cs' ? 'Zobrazit méně' : 'Show Less',
      items: [
        { icon: Users, label: language === 'cs' ? 'Rodina a péče o mazlíčky' : 'Family and Pet Care' },
        { icon: Home, label: language === 'cs' ? 'Domácnost' : 'Home' },
        { icon: Wrench, label: language === 'cs' ? 'Řemeslníci' : 'Craftsmen' },
        { icon: Bug, label: language === 'cs' ? 'Deratizace' : 'Pests Management' },
        { icon: TreePine, label: language === 'cs' ? 'Venkovní práce' : 'Outdoors' },
        { icon: Key, label: language === 'cs' ? 'Zámečník' : 'Locksmith' },
        { icon: Briefcase, label: language === 'cs' ? 'Opravy osobních věcí' : 'Personal Items Repairs', hidden: true },
        { icon: HardHat, label: language === 'cs' ? 'Stavba domu' : 'New House Building', hidden: true },
        { icon: Sparkles, label: language === 'cs' ? 'Krása' : 'Beauty', hidden: true },
        { icon: Laptop, label: language === 'cs' ? 'Počítač a telefon' : 'Computer & Phone', hidden: true },
        { icon: Globe, label: language === 'cs' ? 'Digitální svět' : 'Digital World', hidden: true },
        { icon: Gavel, label: language === 'cs' ? 'Finance a právo' : 'Financial or Legal', hidden: true },
        { icon: Car, label: language === 'cs' ? 'Auto' : 'Auto', hidden: true },
        { icon: Calendar, label: language === 'cs' ? 'Události' : 'Events', hidden: true },
        { icon: GraduationCap, label: language === 'cs' ? 'Školní doučování' : 'School Tutoring', hidden: true },
        { icon: Languages, label: language === 'cs' ? 'Jazykové lekce' : 'Languages Lessons', hidden: true },
        { icon: Music, label: language === 'cs' ? 'Hudební lekce' : 'Music Lessons', hidden: true },
        { icon: Palette, label: language === 'cs' ? 'Hobby kurzy' : 'Hobby Classes', hidden: true },
        { icon: Dumbbell, label: language === 'cs' ? 'Tanec, sport a fitness' : 'Dance, Sports & Fitness', hidden: true },
        { icon: Heart, label: language === 'cs' ? 'Wellness' : 'Wellbeing', hidden: true },
        { icon: Hand, label: language === 'cs' ? 'Duchovní vedení' : 'Spiritual Guidance', hidden: true },
      ],
    },
    download: {
      title: language === 'cs' ? 'Stáhněte si Tool Connect' : 'Download Tool Connect',
      subtitle: language === 'cs' 
        ? 'Stáhněte si aplikaci a začněte se spojovat s profesionály ještě dnes!' 
        : 'Get the app and start connecting with professionals today!',
      appStore: 'App Store',
      googlePlay: 'Google Play',
      webBrowser: language === 'cs' ? 'Webový prohlížeč' : 'Web Browser',
      scanQR: language === 'cs' ? 'Naskenujte telefonem' : 'Scan with your phone camera',
    },
    legal: {
      title: language === 'cs' ? 'Podmínky a zásady ochrany osobních údajů' : 'Terms & Conditions and Privacy Policy',
      description: language === 'cs'
        ? 'Přečtěte si naše podmínky použití a zásady ochrany osobních údajů.'
        : 'Please review our Terms & Conditions and Privacy Policy to understand how we protect your data and govern the use of our platform.',
      terms: language === 'cs' ? 'Podmínky použití' : 'Terms & Conditions',
      termsDesc: language === 'cs' ? 'Přečtěte si naše podmínky služby' : 'Read our terms of service and user agreement',
      privacy: language === 'cs' ? 'Zásady ochrany osobních údajů' : 'Privacy Policy',
      privacyDesc: language === 'cs' ? 'Zjistěte, jak shromažďujeme a chráníme vaše data' : 'Learn how we collect, use, and protect your personal data',
    },
    contact: {
      title: language === 'cs' ? 'Kontaktujte nás' : 'Get in Touch',
      details: language === 'cs' ? 'Kontaktní údaje' : 'Contact Details',
      email: 'info@tool-connect.com',
      namePlaceholder: language === 'cs' ? 'Vaše jméno' : 'Your Name',
      emailPlaceholder: language === 'cs' ? 'Váš email' : 'Your Email',
      messagePlaceholder: language === 'cs' ? 'Vaše zpráva' : 'Your Message',
      send: language === 'cs' ? 'Odeslat zprávu' : 'Send Message',
      success: language === 'cs' ? 'Zpráva byla odeslána!' : 'Message sent successfully!',
      error: language === 'cs' ? 'Nepodařilo se odeslat zprávu. Zkuste to prosím znovu.' : 'Failed to send message. Please try again.',
    },
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormStatus('sending')
    
    const form = e.currentTarget
    const formData = new FormData(form)
    
    try {
      const response = await fetch('https://formspree.io/f/mjkrgnwk', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      })
      
      if (response.ok) {
        setFormStatus('success')
        form.reset()
      } else {
        setFormStatus('error')
      }
    } catch {
      setFormStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader transparent />

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {t.hero.title}
              </h1>
              <p className="text-xl text-white/80 mb-8 max-w-xl mx-auto lg:mx-0">
                {t.hero.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="#how-it-works">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-primary-700 hover:bg-gray-100">
                    {t.hero.findSpecialist}
                  </Button>
                </Link>
                <Link href="/service-providers">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
                    {t.hero.becomeProvider}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-primary-700/20 rounded-3xl blur-3xl" />
                <Image
                  src="/assets/pictures/picture 3.png"
                  alt="Tool App Preview"
                  width={400}
                  height={600}
                  className="relative rounded-3xl shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            {t.benefits.title}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.benefits.items.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-primary-200 transition-all group"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-600 transition-colors">
                    <Icon className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t.features.title}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {t.features.subtitle}
              </p>
              <ul className="space-y-4 mb-8">
                {t.features.list.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/search">
                <Button size="lg">
                  {t.features.tryWebApp}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <Link href="/search" className="block group">
                <div className="relative overflow-hidden rounded-2xl shadow-xl">
                  <Image
                    src="/assets/pictures/web-preview.png"
                    alt="Tool Web Platform Preview"
                    width={600}
                    height={400}
                    className="w-full transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-primary-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-semibold text-lg flex items-center gap-2">
                      <ArrowRight className="w-5 h-5" />
                      {t.features.tryWebApp}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            {t.about.title}
          </h2>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {t.about.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-gray-600 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 text-center">
                <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{t.about.teamTitle}</h4>
                <p className="text-primary-600 font-medium text-lg mb-4">{t.about.teamMembers}</p>
                <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-primary-600" />
                  <span>{t.about.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
            {t.howItWorks.title}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.howItWorks.steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="relative">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center h-full">
                    <div className="w-8 h-8 bg-white text-primary-600 rounded-full flex items-center justify-center font-bold text-sm mb-4 mx-auto">
                      {index + 1}
                    </div>
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg text-white mb-2">{step.title}</h3>
                    <p className="text-white/70 text-sm">{step.description}</p>
                  </div>
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                      <ArrowRight className="w-6 h-6 text-white/40" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            {t.categories.title}
          </h2>
          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
            {t.categories.description}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {t.categories.items.map((category, index) => {
              const Icon = category.icon
              const isHidden = category.hidden && !showAllCategories
              return (
                <div
                  key={index}
                  className={cn(
                    'bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-200 rounded-xl p-4 text-center transition-all cursor-pointer group',
                    isHidden && 'hidden'
                  )}
                >
                  <Icon className="w-8 h-8 text-primary-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-700">{category.label}</span>
                </div>
              )
            })}
          </div>
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors"
            >
              {showAllCategories ? t.categories.showLess : t.categories.showMore}
              <ChevronDown className={cn('w-5 h-5 transition-transform', showAllCategories && 'rotate-180')} />
            </button>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t.download.title}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {t.download.subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://apps.apple.com/us/app/tool/id6739626276"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs opacity-80">Download on the</div>
                    <div className="font-semibold">{t.download.appStore}</div>
                  </div>
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.tool.toolappconnect"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm3.35-4.31c.34.27.59.69.59 1.19s-.22.87-.52 1.14l-2.27 1.29-2.5-2.5 2.5-2.5 2.2 1.38zM6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs opacity-80">Get it on</div>
                    <div className="font-semibold">{t.download.googlePlay}</div>
                  </div>
                </a>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-3 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors"
                >
                  <Globe className="w-8 h-8" />
                  <div className="text-left">
                    <div className="text-xs opacity-80">Try it on the</div>
                    <div className="font-semibold">{t.download.webBrowser}</div>
                  </div>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <Image
                  src="/assets/QR codes/smartlink.png"
                  alt="Download QR Code"
                  width={200}
                  height={200}
                  className="mx-auto mb-4"
                />
                <p className="font-medium text-gray-900">{t.download.title}</p>
                <p className="text-sm text-gray-500">{t.download.scanQR}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Section */}
      <section id="legal" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            {t.legal.title}
          </h2>
          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
            {t.legal.description}
          </p>
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Link
              href="/terms-conditions"
              className="flex items-center gap-4 bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-200 rounded-xl p-6 transition-all group"
            >
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                <FileText className="w-7 h-7 text-primary-600 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{t.legal.terms}</h3>
                <p className="text-sm text-gray-600">{t.legal.termsDesc}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
            </Link>
            <Link
              href="/privacy-policy"
              className="flex items-center gap-4 bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-200 rounded-xl p-6 transition-all group"
            >
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                <Shield className="w-7 h-7 text-primary-600 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{t.legal.privacy}</h3>
                <p className="text-sm text-gray-600">{t.legal.privacyDesc}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            {t.contact.title}
          </h2>
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">{t.contact.details}</h3>
              <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary-600" />
                </div>
                <span className="text-gray-700">{t.contact.email}</span>
              </div>
            </div>
            <div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {formStatus === 'success' && (
                  <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl">
                    {t.contact.success}
                  </div>
                )}
                {formStatus === 'error' && (
                  <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl">
                    {t.contact.error}
                  </div>
                )}
                <input
                  type="text"
                  name="name"
                  placeholder={t.contact.namePlaceholder}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                />
                <input
                  type="email"
                  name="email"
                  placeholder={t.contact.emailPlaceholder}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                />
                <textarea
                  name="message"
                  placeholder={t.contact.messagePlaceholder}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all resize-none"
                />
                <Button type="submit" size="lg" isLoading={formStatus === 'sending'} className="w-full">
                  {t.contact.send}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}

