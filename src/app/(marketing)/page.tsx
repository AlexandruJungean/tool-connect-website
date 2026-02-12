'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  MapPin, Users, Globe, Check, ArrowRight, Mail, FileText, Shield,
  Sparkles, Handshake, MessageCircle, Rocket
} from 'lucide-react'
import dynamic from 'next/dynamic'

// Lazy load marketing components to reduce initial bundle size
const MarketingHeader = dynamic(() => import('@/components/marketing').then(mod => ({ default: mod.MarketingHeader })), { ssr: true })
const MarketingFooter = dynamic(() => import('@/components/marketing').then(mod => ({ default: mod.MarketingFooter })), { ssr: true })
import { Button } from '@/components/ui'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

export default function LandingPage() {
  const { language } = useLanguage()
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [displayedText, setDisplayedText] = useState('')
  const [isTypingComplete, setIsTypingComplete] = useState(false)

  // Typewriter effect for hero title
  useEffect(() => {
    const fullText = language === 'cs' 
      ? 'Tool - Všechny služby, které potřebujete, na jednom místě.'
      : 'Tool - All the services you need, in one place.'
    
    setDisplayedText('')
    setIsTypingComplete(false)
    let currentIndex = 0

    const typeInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        setIsTypingComplete(true)
        clearInterval(typeInterval)
      }
    }, 50)

    return () => clearInterval(typeInterval)
  }, [language])

  const t = {
    hero: {
      title: language === 'cs' 
        ? 'Tool - Všechny služby, které potřebujete, na jednom místě.'
        : 'Tool - All the services you need, in one place.',
      tagline: language === 'cs'
        ? 'Pro lidi, kteří si váží svého času.'
        : 'For people who value their time.',
      subtitle: language === 'cs'
        ? 'Tool spojuje lidi se spolehlivými profesionály v jakémkoli oboru – od oprav po překlady.'
        : 'Tool links people with trusted professionals in any field – from repairs to translations.',
      installApp: language === 'cs' ? 'Nainstalujte si Tool na telefon' : 'Install Tool on your phone',
      findSpecialist: language === 'cs' ? 'Najít specialistu' : 'Find a Specialist',
      becomeProvider: language === 'cs' ? 'Nabídnout služby' : 'Offer Your Services',
    },
    features: {
      title: language === 'cs' ? 'Výkonné funkce pro každého' : 'Powerful Features for Everyone',
      subtitle: language === 'cs'
        ? 'Spojujeme klienty s profesionály — jednoduše.'
        : 'Connecting clients with professionals — made simple.',
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
    goodToKnow: {
      title: language === 'cs' ? 'Dobré vědět' : 'Good to Know',
      subtitle: language === 'cs'
        ? 'Transparentnost je základem naší komunity. Zde je pár věcí, které je dobré mít na paměti:'
        : 'Transparency is at the heart of our community. Here are a few things to keep in mind:',
      items: language === 'cs'
        ? [
            { title: 'Zdarma', description: 'Tool je aktuálně zdarma pro všechny. Později můžeme přidat prémiové funkce pro poskytovatele služeb, ale vždy vás předem upozorníme. ✨' },
            { title: 'Přímé platby', description: 'Platby si domlouváte přímo mezi sebou, ne přes aplikaci. Tool nezpracovává transakce, takže můžete platit jakýmkoli způsobem, který vám vyhovuje. 🤝' },
            { title: 'Jasná komunikace', description: 'Doporučujeme potvrdit si všechny detaily práce a ceny před osobním setkáním, aby byl zážitek hladký pro obě strany. 💬' },
            { title: 'Pomozte nám růst', description: 'Všimli jste si něčeho, co bychom mohli udělat lépe? Rádi slyšíme od našich uživatelů, jak můžeme aplikaci vylepšit. 🚀' },
          ]
        : [
            { title: 'Free to Join', description: 'Tool is currently free for everyone. We may add premium features for Service Providers later, but we\'ll always give you a heads-up first. ✨' },
            { title: 'Direct Payments', description: 'Payments are arranged directly between each other, not through the app. Tool doesn\'t process transactions, so you can pay however suits you best. 🤝' },
            { title: 'Clear Communication', description: 'We recommend confirming all job details and prices before meeting in person to ensure a smooth experience for both sides. 💬' },
            { title: 'Help Us Grow', description: 'Notice something we could do better? We love hearing from our users as we continue to improve the app. 🚀' },
          ],
    },
    about: {
      title: language === 'cs' ? 'O nás' : 'About us',
      paragraphs: language === 'cs'
        ? [
            'Tool-Connect je vytvořen a vyvíjen v České republice – s myšlenkou, že by mělo existovat jedno jednoduché místo, kde lidé mohou najít pomoc, nabídnout své dovednosti a spojit se místně.',
            'S funkcemi jako vestavěné zprávy, vyhledávání podle lokality a širokou škálou služeb je Tool-Connect vytvořen pro práci ve vesnicích i městech, napříč jazyky a kategoriemi.',
            'Náš tým věří v budování něčeho užitečného, jednoduchého a zaměřeného na komunitu.',
            'Tool Team',
          ]
        : [
            'Tool‑Connect is created and developed in Czech Republic — with the idea that there should be one simple place where people can find help, offer their skills, and connect with each other locally.',
            'With features like built‑in messaging, location-based search, and a wide variety of services, Tool‑Connect is made to work across villages and cities, and across languages and categories.',
            'Our team believes in building something useful, simple, and community focused.',
            'Tool Team',
          ],
      teamTitle: language === 'cs' ? 'Náš tým' : 'Our Team',
      teamMembers: 'Laura & Adela',
      location: language === 'cs' ? 'Vytvořeno v České republice' : 'Made in Czech Republic',
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
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            {/* Left - Text Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight min-h-[2.5em] lg:min-h-[3em]">
                {displayedText}
                {!isTypingComplete && (
                  <span className="inline-block w-[3px] h-[1em] bg-white ml-1 animate-pulse" />
                )}
              </h1>
              <p className="text-xl md:text-2xl font-medium text-white/90 mb-4">
                {t.hero.tagline}
              </p>
              <p className="text-base text-white/70 mb-6 max-w-md mx-auto lg:mx-0">
                {t.hero.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/search">
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

            {/* Center - Phone Mockup (smaller) */}
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-primary-700/20 rounded-3xl blur-3xl" />
                <Image
                  src="/assets/pictures/mockup.webp"
                  alt="Tool App Preview"
                  width={220}
                  height={400}
                  className="relative rounded-3xl shadow-2xl"
                  priority
                  loading="eager"
                  sizes="220px"
                />
              </div>
            </div>

            {/* Right - Download Section (compact with large QR) */}
            <div className="hidden lg:flex flex-col items-center">
              <div className="bg-white rounded-2xl shadow-xl p-6 text-center w-full max-w-[260px]">
                {/* QR Code - Large and centered */}
                <Image
                  src="/assets/QR codes/smartlink.webp"
                  alt="Download QR Code"
                  width={160}
                  height={160}
                  className="mx-auto rounded-xl border border-gray-200 mb-4"
                  priority
                />
                
                {/* Title */}
                <h3 className="font-bold text-gray-900 text-base mb-1">{t.download.title}</h3>
                <p className="text-xs text-gray-500 mb-4">{t.download.scanQR}</p>
                
                {/* Small icon buttons */}
                <div className="flex justify-center gap-3">
                  <a
                    href="https://apps.apple.com/us/app/tool/id6739626276"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center"
                    title="App Store"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.tool.toolappconnect"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center"
                    title="Google Play"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm3.35-4.31c.34.27.59.69.59 1.19s-.22.87-.52 1.14l-2.27 1.29-2.5-2.5 2.5-2.5 2.2 1.38zM6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z"/>
                    </svg>
                  </a>
                  <Link
                    href="/search"
                    className="w-12 h-12 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center"
                    title="Web Browser"
                  >
                    <Globe className="w-6 h-6" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: Phone + Download below text */}
          <div className="lg:hidden mt-8 flex flex-col items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-primary-700/20 rounded-3xl blur-3xl" />
              <Image
                src="/assets/pictures/mockup.webp"
                alt="Tool App Preview"
                width={180}
                height={320}
                className="relative rounded-3xl shadow-2xl"
                priority
                loading="eager"
                sizes="180px"
              />
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 text-center w-full max-w-[280px]">
              {/* QR Code - Large and centered */}
              <Image
                src="/assets/QR codes/smartlink.webp"
                alt="Download QR Code"
                width={140}
                height={140}
                className="mx-auto rounded-xl border border-gray-200 mb-4"
                priority
              />
              
              {/* Title */}
              <h3 className="font-bold text-gray-900 text-base mb-1">{t.download.title}</h3>
              <p className="text-xs text-gray-500 mb-4">{t.download.scanQR}</p>
              
              {/* Small icon buttons */}
              <div className="flex justify-center gap-3">
                <a
                  href="https://apps.apple.com/us/app/tool/id6739626276"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center"
                  title="App Store"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.tool.toolappconnect"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center"
                  title="Google Play"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm3.35-4.31c.34.27.59.69.59 1.19s-.22.87-.52 1.14l-2.27 1.29-2.5-2.5 2.5-2.5 2.2 1.38zM6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z"/>
                  </svg>
                </a>
                <Link
                  href="/search"
                  className="w-12 h-12 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center"
                  title="Web Browser"
                >
                  <Globe className="w-6 h-6" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent" />
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
          </div>
        </div>
      </section>

      {/* Good to Know Section */}
      <section id="good-to-know" className="py-20 bg-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
            {t.goodToKnow.title}
          </h2>
          <p className="text-lg text-primary-200 text-center max-w-3xl mx-auto mb-12">
            {t.goodToKnow.subtitle}
          </p>
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { icon: <Sparkles className="w-6 h-6 text-yellow-300" />, bg: 'bg-yellow-400/15', ...t.goodToKnow.items[0] },
              { icon: <Handshake className="w-6 h-6 text-green-300" />, bg: 'bg-green-400/15', ...t.goodToKnow.items[1] },
              { icon: <MessageCircle className="w-6 h-6 text-blue-300" />, bg: 'bg-blue-400/15', ...t.goodToKnow.items[2] },
              { icon: <Rocket className="w-6 h-6 text-orange-300" />, bg: 'bg-orange-400/15', ...t.goodToKnow.items[3] },
            ].map((item, index) => (
              <div key={index} className="bg-white/10 border border-white/10 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", item.bg)}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg mb-2">{item.title}</h3>
                    <p className="text-primary-200 leading-relaxed text-sm">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
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
                <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-primary-600" />
                  <span>{t.about.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Section */}
      <section id="legal" className="py-20 bg-primary-600/10">
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
      <section id="contact" className="py-20 bg-white">
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

