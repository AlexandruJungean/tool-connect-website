'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MarketingHeader, MarketingFooter } from '@/components/marketing'
import { Button } from '@/components/ui'
import { useLanguage } from '@/contexts/LanguageContext'

export default function PrivacyPolicyPage() {
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
    title: language === 'cs' ? 'Zásady ochrany osobních údajů' : 'Privacy Policy',
    lastUpdated: language === 'cs' ? 'Poslední aktualizace: Duben 2025' : 'Last Updated: April 2025',
    intro: language === 'cs'
      ? 'Tool se zavazuje chránit vaše soukromí v souladu s Obecným nařízením o ochraně osobních údajů (GDPR). Tyto Zásady ochrany osobních údajů vysvětlují, jak shromažďujeme, používáme a chráníme vaše osobní údaje.'
      : 'Tool is committed to protecting your privacy in compliance with the General Data Protection Regulation (GDPR). This Privacy Policy explains how we collect, use, and protect your personal data.',
    backToHome: language === 'cs' ? 'Zpět na hlavní stránku' : 'Back to Home',
  }

  const sections = language === 'cs' ? [
    {
      title: '1. Údaje, které shromažďujeme',
      content: null,
      subsections: [
        {
          title: 'Pro klienty:',
          items: [
            'Jméno, email, heslo, telefonní číslo (Hesla a telefonní čísla jsou bezpečně hashována a uložena pomocí standardních bezpečnostních opatření, což znamená, že nejsou viditelná pro nikoho).',
          ],
        },
        {
          title: 'Pro poskytovatele služeb:',
          items: [
            'Jméno, email, heslo, telefonní číslo (emaily, hesla a telefonní čísla jsou bezpečně hashována a uložena pomocí standardních bezpečnostních opatření, což znamená, že nejsou viditelná pro nikoho).',
            'Obchodní údaje, nabízené služby a jakékoli další údaje, které se poskytovatel služeb rozhodne zveřejnit ve svém profilu.',
          ],
        },
      ],
    },
    {
      title: '2. Jak používáme vaše údaje',
      content: 'Vaše údaje zpracováváme pro následující účely:',
      items: [
        'Spojování klientů s poskytovateli služeb.',
        'Zajištění bezpečnosti platformy.',
        'Zlepšování uživatelské zkušenosti.',
        'Analytika: Shromažďujeme anonymní data o aktivitě uživatelů (jako je používání aplikace, počet návštěv a interakce) pro optimalizaci platformy a zlepšení našich služeb.',
        'Marketingová a propagační komunikace (pouze se souhlasem uživatele).',
        'Zavazujeme se nikdy neprodávat vaše údaje.',
      ],
    },
    {
      title: '3. Bezpečnostní opatření pro údaje',
      content: null,
      items: [
        'Všechna uživatelská data jsou bezpečně uložena pomocí infrastruktury React Native Expo, která implementuje standardní šifrování a bezpečnostní protokoly.',
        'Přístup k osobním údajům je omezen pouze na oprávněný personál.',
      ],
    },
    {
      title: '4. Sdílení údajů',
      content: null,
      items: [
        'Neprodáváme uživatelská data.',
        'Data mohou být sdílena s právními orgány, pokud to vyžaduje zákon.',
      ],
    },
    {
      title: '5. Práva uživatelů (soulad s GDPR)',
      content: 'Podle GDPR mají uživatelé právo na:',
      items: [
        'Přístup ke svým údajům.',
        'Požadovat smazání svého účtu a osobních údajů.',
        'Aktualizovat nebo opravit své osobní informace.',
        'Vznést námitku proti zpracování údajů pro konkrétní účely.',
      ],
      footer: 'Pro uplatnění těchto práv nás kontaktujte na info@tool-connect.com.',
    },
    {
      title: '6. Uchovávání údajů',
      content: null,
      items: [
        'Osobní údaje (jako je email a informace o profilu) jsou uchovávány po dobu, kdy je účet aktivní.',
        'Smazané nebo neaktivní účty budou mít své osobní údaje vymazány do 365 dnů, s výjimkou případů vyžadovaných zákonem.',
        'Uchovávání zpráv: Zprávy mezi klienty a poskytovateli služeb budou uloženy i po smazání uživatelem, ale po smazání nebudou uživatelům přístupné. Tyto záznamy jsou uchovávány pro bezpečnostní účely a účely dodržování předpisů po dobu 365 dnů.',
      ],
    },
    {
      title: '7. Cookies a sledovací technologie',
      content: null,
      items: [
        'Cookies. Můžeme používat sledovací technologie, jako je místní úložiště a nástroje pro analýzu aplikací, ke zlepšení uživatelské zkušenosti.',
        'Uživatelé mohou spravovat preference sledování v nastavení svého zařízení.',
      ],
    },
    {
      title: '8. Aktualizace těchto Zásad ochrany osobních údajů',
      content: 'Vyhrazujeme si právo aktualizovat tyto Zásady ochrany osobních údajů. Uživatelé budou informováni o významných změnách.',
      footer: 'Pro jakékoli dotazy nás kontaktujte na info@tool-connect.com',
    },
  ] : [
    {
      title: '1. Data We Collect',
      content: null,
      subsections: [
        {
          title: 'For Clients:',
          items: [
            'Name, email, password, phone number (Passwords and phone numbers are securely hashed and stored using industry-standard security measures, meaning they are not visible to anyone).',
          ],
        },
        {
          title: 'For Service Providers:',
          items: [
            'Name, email, password, phone number (emails, passwords and phone numbers are securely hashed and stored using industry-standard security measures, meaning they are not visible to anyone).',
            'The business details, services offered, and any other details the service provider chooses to disclose in their profile.',
          ],
        },
      ],
    },
    {
      title: '2. How We Use Your Data',
      content: 'We process your data for the following purposes:',
      items: [
        'Connecting Clients with Service Providers.',
        'Ensuring platform security.',
        'Improving user experience.',
        'Analytics: We collect anonymous data on user activity (such as app usage, number of visits, and interactions) to optimize the platform and improve our services.',
        'Marketing and promotional communications (only with user consent).',
        'We commit to never selling your data.',
      ],
    },
    {
      title: '3. Data Security Measures',
      content: null,
      items: [
        'All user data is securely stored using React Native Expo infrastructure, which implements industry-standard encryption and security protocols.',
        'Access to personal data is restricted to authorized personnel only.',
      ],
    },
    {
      title: '4. Sharing of Data',
      content: null,
      items: [
        'We do not sell user data.',
        'Data may be shared with legal authorities when required by law.',
      ],
    },
    {
      title: '5. User Rights (GDPR Compliance)',
      content: 'Under GDPR, users have the right to:',
      items: [
        'Access their data.',
        'Request deletion of their account and personal data.',
        'Update or correct their personal information.',
        'Object to data processing for specific purposes.',
      ],
      footer: 'To exercise these rights, contact us at info@tool-connect.com.',
    },
    {
      title: '6. Data Retention',
      content: null,
      items: [
        'Personal data (such as email and profile information) is stored as long as the account remains active.',
        'Deleted or inactive accounts will have their personal data erased within 365 days, except where legally required.',
        'Message data retention: Messages between Clients and Service Providers will be stored even if deleted by the user but will not be accessible to users after deletion. These records are retained for security and compliance purposes for 365 days.',
      ],
    },
    {
      title: '7. Cookies and Tracking Technologies',
      content: null,
      items: [
        'Cookies. We may use tracking technologies, such as local storage and app analytics tools, to enhance user experience.',
        'Users can manage tracking preferences in their device settings.',
      ],
    },
    {
      title: '8. Updates to This Privacy Policy',
      content: 'We reserve the right to update this Privacy Policy. Users will be notified of significant changes.',
      footer: 'For any questions, contact us at info@tool-connect.com',
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
                    <p className="text-gray-700 mb-4">{section.content}</p>
                  )}
                  {section.subsections && section.subsections.map((subsection, subIndex) => (
                    <div key={subIndex} className="mb-4">
                      <h3 className="font-medium text-gray-900 mb-2">{subsection.title}</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
                        {subsection.items.map((item, itemIndex) => (
                          <li key={itemIndex}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {section.items && (
                    <ul className="list-disc list-inside space-y-2 text-gray-700 pl-4">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.footer && (
                    <p className="text-gray-700 mt-4">{section.footer}</p>
                  )}
                </div>
              ))}
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

