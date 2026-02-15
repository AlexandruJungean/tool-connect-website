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
    lastUpdated: language === 'cs' ? 'Poslední aktualizace: Prosinec 2025' : 'Last Updated: December 2025',
    intro: language === 'cs'
      ? 'Tool Connect se zavazuje chránit vaše soukromí v souladu s Obecným nařízením o ochraně osobních údajů (GDPR). Tyto Zásady ochrany osobních údajů vysvětlují, jak shromažďujeme, používáme a chráníme vaše osobní údaje při používání naší platformy (mobilní aplikace a webových stránek).'
      : 'Tool Connect is committed to protecting your privacy in compliance with the General Data Protection Regulation (GDPR). This Privacy Policy explains how we collect, use, and protect your personal data when using our platform (mobile app and website).',
    backToHome: language === 'cs' ? 'Zpět na hlavní stránku' : 'Back to Home',
  }

  const sections = language === 'cs' ? [
    {
      title: '1. Údaje, které shromažďujeme',
      content: 'Shromažďujeme různé typy údajů v závislosti na typu vašeho účtu:',
      subsections: [
        {
          title: 'Pro všechny uživatele:',
          items: [
            'Telefonní číslo (používáno pro ověření účtu pomocí jednorázového kódu OTP)',
            'Jméno a příjmení',
            'Profilová fotografie (volitelné)',
            'Jazykové preference',
            'Údaje o poloze (město, země, GPS souřadnice pro vyhledávání v okolí)',
            'Zprávy a přílohy odesílané prostřednictvím naší platformy',
          ],
        },
        {
          title: 'Pro klienty:',
          items: [
            'Preferované kategorie služeb a vzdálenost vyhledávání',
            'Seznam oblíbených poskytovatelů služeb',
            'Pracovní poptávky (popis, rozpočet, přílohy)',
            'Recenze a hodnocení, které jste napsali',
          ],
        },
        {
          title: 'Pro poskytovatele služeb:',
          items: [
            'Obchodní údaje (název společnosti, IČO pro firmy)',
            'Specializace, kategorie a nabízené služby',
            'Popis, cenové informace a hodinové sazby',
            'Portfolio projekty (obrázky, videa, popisy)',
            'Odkazy na sociální sítě (Facebook, Instagram, YouTube, webové stránky)',
            'Profilové video a další obrázky',
          ],
        },
      ],
    },
    {
      title: '2. Jak používáme vaše údaje',
      content: 'Vaše údaje zpracováváme pro následující účely:',
      items: [
        'Ověření vaší identity prostřednictvím SMS s jednorázovým kódem (OTP)',
        'Vytváření a správa vašeho profilu',
        'Spojování klientů s poskytovateli služeb na základě lokality, kategorie a jazyka',
        'Umožnění komunikace mezi uživateli prostřednictvím našeho systému zpráv',
        'Zpracování pracovních poptávek a přihlášek',
        'Zobrazení portfolií poskytovatelů služeb potenciálním klientům',
        'Správa systému recenzí a hodnocení',
        'Odesílání oznámení o relevantních aktivitách (nové zprávy, přihlášky, recenze)',
        'Zlepšování uživatelského zážitku a funkcí platformy',
        'Analytika: Shromažďujeme anonymní data o aktivitě uživatelů pro optimalizaci platformy',
        'Zavazujeme se nikdy neprodávat vaše údaje',
      ],
    },
    {
      title: '3. Služby třetích stran',
      content: 'Pro zajištění naší služby používáme následující poskytovatele třetích stran:',
      items: [
        'Supabase: Poskytuje naši databázi, ověřování uživatelů a úložiště souborů. Vaše data jsou bezpečně uložena na serverech Supabase s šifrováním.',
        'Google Places API: Používáme pro návrhy automatického doplňování polohy. Při vyhledávání polohy jsou vaše dotazy odeslány společnosti Google.',
        'Google Translate API: Může být použito pro překlady obsahu. Text může být odeslán společnosti Google pro překlad.',
        'Formspree: Zpracovává podání kontaktního formuláře na našich webových stránkách.',
      ],
    },
    {
      title: '4. Bezpečnostní opatření pro údaje',
      content: null,
      items: [
        'Všechna uživatelská data jsou bezpečně uložena pomocí infrastruktury Supabase, která implementuje standardní šifrování.',
        'Ověřování je prováděno pomocí bezpečné SMS verifikace jednorázovým kódem.',
        'Přenos dat je chráněn pomocí šifrování HTTPS/TLS.',
        'Přístup k osobním údajům je omezen pouze na oprávněný personál.',
        'Naše webová aplikace a mobilní aplikace používají bezpečné autentizační tokeny.',
      ],
    },
    {
      title: '5. Sdílení údajů',
      content: null,
      items: [
        'Údaje profilu (jméno, fotografie, poloha, služby) jsou viditelné ostatním uživatelům podle vašeho nastavení viditelnosti.',
        'Telefonní čísla jsou viditelná pouze pokud tuto možnost povolíte v nastavení profilu.',
        'Neprodáváme uživatelská data žádným třetím stranám.',
        'Data mohou být sdílena s právními orgány, pokud to vyžaduje zákon.',
        'Anonymní agregovaná statistická data mohou být použita pro zlepšení služby.',
      ],
    },
    {
      title: '6. Práva uživatelů (soulad s GDPR)',
      content: 'Podle GDPR máte právo na:',
      items: [
        'Přístup ke svým údajům – můžete si vyžádat kopii svých osobních údajů.',
        'Opravu – aktualizovat nebo opravit své osobní informace prostřednictvím nastavení profilu.',
        'Výmaz – požádat o smazání svého účtu a osobních údajů.',
        'Námitku – vznést námitku proti zpracování údajů pro konkrétní účely.',
        'Přenositelnost – získat své údaje ve strojově čitelném formátu.',
        'Odvolání souhlasu – kdykoliv odvolat jakýkoli souhlas, který jste poskytli.',
      ],
      footer: 'Pro uplatnění těchto práv nás kontaktujte na info@tool-connect.com.',
    },
    {
      title: '7. Uchovávání údajů',
      content: null,
      items: [
        'Údaje účtu jsou uchovávány po dobu, kdy je váš účet aktivní.',
        'Po smazání účtu jsou osobní údaje vymazány do 30 dnů, s výjimkou případů vyžadovaných zákonem.',
        'Zprávy zůstávají v naší databázi pro bezpečnostní účely a účely dodržování předpisů po dobu 365 dnů po smazání, ale po smazání nejsou uživatelům přístupné.',
        'Pracovní poptávky a přihlášky mohou být uchovány pro historické účely v anonymizované podobě.',
        'Záznamy podpory jsou uchovávány po dobu 2 let pro účely zlepšování služeb.',
      ],
    },
    {
      title: '8. Cookies a místní úložiště',
      content: null,
      items: [
        'Používáme místní úložiště prohlížeče pro uchování autentizačních tokenů a uživatelských preferencí.',
        'Můžeme používat analytické nástroje pro pochopení vzorců používání.',
        'Na naší webové platformě se nepoužívají žádné reklamní sledovací cookies.',
        'Uživatelé mohou spravovat preference místního úložiště prostřednictvím nastavení prohlížeče.',
      ],
    },
    {
      title: '9. Mezinárodní přenosy údajů',
      content: 'Vaše údaje mohou být zpracovávány v zemích mimo Evropský hospodářský prostor (EHP) našimi poskytovateli služeb (Supabase, Google). Tito poskytovatelé dodržují mechanismy přenosu dat schválené GDPR, jako jsou Standardní smluvní doložky.',
    },
    {
      title: '10. Změny těchto Zásad ochrany osobních údajů',
      content: 'Můžeme tyto Zásady ochrany osobních údajů aktualizovat, abychom odráželi změny v našich postupech nebo z právních důvodů. Uživatelé budou informováni o významných změnách prostřednictvím oznámení v aplikaci nebo e-mailu.',
      footer: 'Pro jakékoli dotazy nás kontaktujte na info@tool-connect.com',
    },
  ] : [
    {
      title: '1. Data We Collect',
      content: 'We collect different types of data depending on your account type:',
      subsections: [
        {
          title: 'For All Users:',
          items: [
            'Phone number (used for account verification via one-time password OTP)',
            'First and last name',
            'Profile photo (optional)',
            'Language preferences',
            'Location data (city, country, GPS coordinates for nearby searches)',
            'Messages and attachments sent through our platform',
          ],
        },
        {
          title: 'For Clients:',
          items: [
            'Preferred service categories and search distance',
            'Favorite service providers list',
            'Work requests (description, budget, attachments)',
            'Reviews and ratings you have written',
          ],
        },
        {
          title: 'For Service Providers:',
          items: [
            'Business details (company name, IČO for businesses)',
            'Specialty, category, and services offered',
            'Bio, pricing information, and hourly rates',
            'Portfolio projects (images, videos, descriptions)',
            'Social media links (Facebook, Instagram, YouTube, website)',
            'Profile video and additional images',
          ],
        },
      ],
    },
    {
      title: '2. How We Use Your Data',
      content: 'We process your data for the following purposes:',
      items: [
        'Verifying your identity through SMS one-time password (OTP)',
        'Creating and managing your profile',
        'Connecting clients with service providers based on location, category, and language',
        'Enabling communication between users through our messaging system',
        'Processing work requests and applications',
        'Displaying service provider portfolios to potential clients',
        'Managing the review and rating system',
        'Sending notifications about relevant activities (new messages, applications, reviews)',
        'Improving user experience and platform features',
        'Analytics: We collect anonymous data on user activity to optimize the platform',
        'We commit to never selling your data',
      ],
    },
    {
      title: '3. Third-Party Services',
      content: 'We use the following third-party providers to deliver our service:',
      items: [
        'Supabase: Provides our database, user authentication, and file storage. Your data is securely stored on Supabase servers with encryption.',
        'Google Places API: Used for location autocomplete suggestions. Your location search queries are sent to Google.',
        'Google Translate API: May be used for content translations. Text may be sent to Google for translation.',
        'Formspree: Handles contact form submissions on our website.',
      ],
    },
    {
      title: '4. Data Security Measures',
      content: null,
      items: [
        'All user data is securely stored using Supabase infrastructure, which implements industry-standard encryption.',
        'Authentication is performed using secure SMS one-time password verification.',
        'Data transmission is protected using HTTPS/TLS encryption.',
        'Access to personal data is restricted to authorized personnel only.',
        'Our web app and mobile app use secure authentication tokens.',
      ],
    },
    {
      title: '5. Sharing of Data',
      content: null,
      items: [
        'Profile data (name, photo, location, services) is visible to other users based on your visibility settings.',
        'Phone numbers are only visible if you enable this option in your profile settings.',
        'We do not sell user data to any third parties.',
        'Data may be shared with legal authorities when required by law.',
        'Anonymous aggregated statistical data may be used for service improvement.',
      ],
    },
    {
      title: '6. User Rights (GDPR Compliance)',
      content: 'Under GDPR, you have the right to:',
      items: [
        'Access – request a copy of your personal data.',
        'Rectification – update or correct your personal information through profile settings.',
        'Erasure – request deletion of your account and personal data.',
        'Object – object to data processing for specific purposes.',
        'Portability – obtain your data in a machine-readable format.',
        'Withdraw consent – withdraw any consent you have given at any time.',
      ],
      footer: 'To exercise these rights, contact us at info@tool-connect.com.',
    },
    {
      title: '7. Data Retention',
      content: null,
      items: [
        'Account data is stored as long as your account remains active.',
        'Upon account deletion, personal data is erased within 30 days, except where legally required.',
        'Messages remain in our database for security and compliance purposes for 365 days after deletion, but are not accessible to users after deletion.',
        'Work requests and applications may be retained for historical purposes in anonymized form.',
        'Support tickets are retained for 2 years for service improvement purposes.',
      ],
    },
    {
      title: '8. Cookies and Local Storage',
      content: null,
      items: [
        'We use browser local storage to persist authentication tokens and user preferences.',
        'We may use analytics tools to understand usage patterns.',
        'No advertising tracking cookies are used on our web platform.',
        'Users can manage local storage preferences through browser settings.',
      ],
    },
    {
      title: '9. International Data Transfers',
      content: 'Your data may be processed in countries outside the European Economic Area (EEA) by our service providers (Supabase, Google). These providers comply with GDPR-approved data transfer mechanisms such as Standard Contractual Clauses.',
    },
    {
      title: '10. Updates to This Privacy Policy',
      content: 'We may update this Privacy Policy to reflect changes in our practices or for legal reasons. Users will be notified of significant changes via in-app notifications or email.',
      footer: 'For any questions, contact us at info@tool-connect.com',
    },
  ]

  return (
    <div className="min-h-screen">
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
