'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MarketingHeader, MarketingFooter } from '@/components/marketing'
import { Button } from '@/components/ui'
import { useLanguage } from '@/contexts/LanguageContext'

export default function TermsConditionsPage() {
  const { language } = useLanguage()

  const navItems = [
    { label: language === 'cs' ? 'Domů' : 'Home', href: '/' },
    { label: language === 'cs' ? 'Výhody' : 'Benefits', href: '/#benefits' },
    { label: language === 'cs' ? 'Jak to funguje' : 'How It Works', href: '/#how-it-works' },
    { label: language === 'cs' ? 'Služby' : 'Services', href: '/#categories' },
    { label: language === 'cs' ? 'Stáhnout' : 'Download', href: '/#download' },
    { label: language === 'cs' ? 'Kontakt' : 'Contact', href: '/#contact' },
  ]

  const t = {
    title: language === 'cs' ? 'Podmínky použití' : 'Terms and Conditions',
    lastUpdated: language === 'cs' ? 'Poslední aktualizace: Duben 2025' : 'Last Updated: April 2025',
    intro: language === 'cs'
      ? 'Vítejte v Tool! Tyto Podmínky použití stanovují pravidla a předpisy pro používání naší platformy, která spojuje klienty s poskytovateli služeb. Registrací a používáním aplikace souhlasíte s těmito podmínkami.'
      : 'Welcome to Tool! These Terms and Conditions outline the rules and regulations for using our platform, which connects clients with service providers. By signing up and using the app, you agree to these terms.',
    backToHome: language === 'cs' ? 'Zpět na hlavní stránku' : 'Back to Home',
    contactTitle: language === 'cs' ? 'Kontaktní informace' : 'Contact Information',
    contactText: language === 'cs' 
      ? 'Pro dotazy ohledně těchto Podmínek nás prosím kontaktujte na info@tool-connect.com'
      : 'For questions about these Terms and Conditions, please contact us at info@tool-connect.com',
    agreement: language === 'cs'
      ? 'Používáním Tool potvrzujete, že jste si přečetli a porozuměli těmto Podmínkám použití a souhlasíte s jejich dodržováním.'
      : 'By using Tool, you acknowledge that you have read and understood these Terms and Conditions and agree to abide by them.',
  }

  const sections = language === 'cs' ? [
    {
      title: '1. Definice',
      items: [
        '"Platforma" označuje aplikaci Tool a webové stránky.',
        '"Klient" označuje uživatele hledající služby.',
        '"Poskytovatel služeb" označuje jednotlivce nebo firmy nabízející služby.',
        '"Uživatel" označuje jak klienty, tak poskytovatele služeb.',
      ],
    },
    {
      title: '2. Registrace účtu a způsobilost',
      items: [
        'Uživatelé musí při registraci poskytnout přesné informace.',
        'Poskytovatelé služeb musí být právně způsobilí nabízet své služby.',
        'Uživatelé musí být starší 18 let.',
        'Tool pozastaví nebo ukončí účty, pokud jsou poskytnuty nepravdivé informace nebo pokud uživatelé poruší tyto podmínky.',
      ],
    },
    {
      title: '3. Používání platformy',
      items: [
        'Klienti mohou procházet a kontaktovat poskytovatele služeb.',
        'Poskytovatelé služeb musí poskytovat čestné a profesionální služby.',
        'Tool nezprostředkovává rezervace ani platby; uživatelé si je musí domluvit samostatně.',
        'Uživatelům je zakázáno zapojovat se do podvodných nebo nezákonných aktivit.',
        'Vestavěný systém zpráv umožňuje klientům a poskytovatelům služeb komunikovat. Zprávy mohou být uživateli smazány, ale zůstávají uloženy v naší databázi pro bezpečnostní účely a účely dodržování předpisů.',
        'Uživatelé souhlasí, že nebudou kopírovat, distribuovat ani zneužívat jakýkoli obsah nalezený na platformě.',
      ],
    },
    {
      title: '4. Platby a poplatky',
      items: [
        'Prostřednictvím platformy nejsou zpracovávány žádné platby; transakce musí být prováděny přímo mezi uživateli.',
        'Tool může v budoucnu zavést předplatné pro poskytovatele služeb.',
      ],
    },
    {
      title: '5. Ochrana údajů a soukromí',
      items: [
        'Uživatelská data bezpečně uchováváme pomocí infrastruktury React Native Expo, která používá standardní šifrování a bezpečnostní protokoly.',
        'Zprávy mezi uživateli zůstávají uloženy v naší databázi, i když je uživatelé smažou.',
        'Uživatelé jsou zodpovědní za zachování důvěrnosti svých přihlašovacích údajů.',
        'Podle českého práva budou doby uchovávání osobních údajů, jako jsou údaje profilu, emailové adresy a hesla, v souladu s platnými předpisy. Data smažeme nebo anonymizujeme, když již nebudou potřebná.',
      ],
    },
    {
      title: '6. Omezení odpovědnosti',
      items: [
        'Tool nenese odpovědnost za kvalitu služeb poskytovaných poskytovateli služeb.',
        'Uživatelé souhlasí s řešením sporů mezi sebou bez zásahu Tool.',
        'Platforma je poskytována "tak, jak je" bez záruk, což znamená, že Tool nezaručuje nepřetržitou, bezchybnou službu ani žádné konkrétní výsledky z používání platformy.',
      ],
    },
    {
      title: '7. Duševní vlastnictví a autorská práva',
      items: [
        'Tool vlastní veškeré značky, obsah, ochranné známky a duševní vlastnictví související s platformou.',
        'Uživatelé nesmí bez předchozího písemného souhlasu kopírovat, reprodukovat, distribuovat ani upravovat jakoukoli část platformy.',
      ],
    },
    {
      title: '8. Daně pro poskytovatele služeb',
      content: 'Je odpovědností každého poskytovatele služeb dodržovat daňové předpisy a registrovat se k dani.',
    },
    {
      title: '9. Ukončení a deaktivace účtu',
      items: [
        'Uživatelé mohou kdykoli deaktivovat své účty.',
        'Tool si vyhrazuje právo odstranit uživatele, kteří poruší tyto podmínky.',
      ],
    },
    {
      title: '10. Rozhodné právo a řešení sporů',
      items: [
        'Tyto Podmínky se řídí právem České republiky.',
        'Spory budou řešeny prostřednictvím arbitráže v Praze, Česká republika.',
      ],
    },
    {
      title: '11. Aktualizace těchto podmínek',
      content: 'Vyhrazujeme si právo tyto Podmínky aktualizovat a pokračující používání aplikace znamená přijetí jakýchkoli změn.',
    },
  ] : [
    {
      title: '1. Definitions',
      items: [
        '"Platform" refers to the Tool application and website.',
        '"Client" refers to users seeking services.',
        '"Service Provider" refers to individuals or businesses offering services.',
        '"User" refers to both Clients and Service Providers.',
      ],
    },
    {
      title: '2. Account Registration & Eligibility',
      items: [
        'Users must provide accurate information when registering.',
        'Service Providers must be legally eligible to offer their services.',
        'Users must be at least 18 years old.',
        'Tool will suspend or terminate accounts if false information is provided or if users violate these terms.',
      ],
    },
    {
      title: '3. Use of the Platform',
      items: [
        'Clients can browse and contact Service Providers.',
        'Service Providers must provide honest and professional services.',
        'Tool does not facilitate booking or payment; Users must arrange these independently.',
        'Users are prohibited from engaging in fraudulent or illegal activities.',
        'The built-in messaging system allows Clients and Service Providers to communicate. Messages can be deleted by users, but they remain stored in our database for security and compliance purposes.',
        'Users agree not to copy, distribute, or misuse any content found on the platform.',
      ],
    },
    {
      title: '4. Payments and Fees',
      items: [
        'No payments are processed through the platform; transactions must be handled directly between Users.',
        'Tool may introduce subscription fees for Service Providers in the future.',
      ],
    },
    {
      title: '5. Data Protection & Privacy',
      items: [
        'We store user data securely using React Native Expo infrastructure, which employs industry-standard encryption and security protocols.',
        'Messages between users remain stored in our database even if deleted by users.',
        'Users are responsible for maintaining the confidentiality of their account details.',
        'According to Czech law, data retention periods for personal information, such as profile details, email addresses, and passwords, will comply with applicable regulations. We will delete or anonymize data when it is no longer necessary.',
      ],
    },
    {
      title: '6. Limitation of Liability',
      items: [
        'Tool is not responsible for the quality of services provided by Service Providers.',
        'Users agree to resolve disputes between themselves without Tool intervention.',
        'The Platform is provided "as is" without warranties, meaning Tool does not guarantee uninterrupted, error-free service or any specific outcomes from using the platform.',
      ],
    },
    {
      title: '7. Intellectual Property & Copyright',
      items: [
        'Tool owns all branding, content, trademarks, and intellectual property related to the platform.',
        'Users may not copy, reproduce, distribute, or modify any part of the platform without prior written consent.',
      ],
    },
    {
      title: '8. Taxation for Service Providers',
      content: 'It is the responsibility of each Service Provider to comply with tax regulations and register for taxation.',
    },
    {
      title: '9. Termination & Account Deactivation',
      items: [
        'Users can deactivate their accounts at any time.',
        'Tool reserves the right to remove users who violate these terms.',
      ],
    },
    {
      title: '10. Governing Law & Dispute Resolution',
      items: [
        'These Terms are governed by the laws of the Czech Republic.',
        'Disputes shall be resolved through arbitration in Prague, Czech Republic.',
      ],
    },
    {
      title: '11. Updates to These Terms',
      content: 'We reserve the right to update these Terms, and continued use of the app implies acceptance of any modifications.',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader navItems={navItems} />

      {/* Content */}
      <section className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.title}
            </h1>
            <p className="text-gray-500 font-medium mb-6">{t.lastUpdated}</p>
            <p className="text-gray-700 mb-8 leading-relaxed">{t.intro}</p>

            <div className="space-y-8">
              {sections.map((section, index) => (
                <div key={index}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{section.title}</h2>
                  {section.content && (
                    <p className="text-gray-700">{section.content}</p>
                  )}
                  {section.items && (
                    <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {/* Agreement */}
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
                <p className="text-gray-900 font-medium">{t.agreement}</p>
              </div>

              {/* Contact */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.contactTitle}</h2>
                <p className="text-gray-700">{t.contactText}</p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <Link href="/">
                <Button variant="outline" size="lg">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  {t.backToHome}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}

