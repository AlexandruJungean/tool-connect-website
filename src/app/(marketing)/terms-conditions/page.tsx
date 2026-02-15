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
    lastUpdated: language === 'cs' ? 'Poslední aktualizace: Prosinec 2025' : 'Last Updated: December 2025',
    intro: language === 'cs'
      ? 'Vítejte v Tool Connect! Tyto Podmínky použití stanovují pravidla a předpisy pro používání naší platformy (mobilní aplikace a webových stránek), která spojuje klienty s poskytovateli služeb. Registrací a používáním platformy souhlasíte s těmito podmínkami.'
      : 'Welcome to Tool Connect! These Terms and Conditions outline the rules and regulations for using our platform (mobile app and website), which connects clients with service providers. By signing up and using the platform, you agree to these terms.',
    backToHome: language === 'cs' ? 'Zpět na hlavní stránku' : 'Back to Home',
    contactTitle: language === 'cs' ? 'Kontaktní informace' : 'Contact Information',
    contactText: language === 'cs' 
      ? 'Pro dotazy ohledně těchto Podmínek nás prosím kontaktujte na info@tool-connect.com'
      : 'For questions about these Terms and Conditions, please contact us at info@tool-connect.com',
    agreement: language === 'cs'
      ? 'Používáním Tool Connect potvrzujete, že jste si přečetli a porozuměli těmto Podmínkám použití a souhlasíte s jejich dodržováním.'
      : 'By using Tool Connect, you acknowledge that you have read and understood these Terms and Conditions and agree to abide by them.',
  }

  const sections = language === 'cs' ? [
    {
      title: '1. Definice',
      items: [
        '"Platforma" označuje mobilní aplikaci Tool Connect a webové stránky tool-connect.com.',
        '"Klient" označuje uživatele hledající služby od poskytovatelů.',
        '"Poskytovatel služeb" označuje jednotlivce nebo firmy nabízející služby prostřednictvím platformy.',
        '"Uživatel" označuje jak klienty, tak poskytovatele služeb.',
        '"Pracovní poptávka" označuje žádost o službu vytvořenou klientem.',
        '"Přihláška" označuje odpověď poskytovatele služeb na pracovní poptávku.',
        '"Portfolio" označuje prezentaci prací poskytovatele služeb.',
      ],
    },
    {
      title: '2. Registrace účtu a způsobilost',
      items: [
        'Uživatelé musí při registraci poskytnout platné telefonní číslo pro ověření SMS.',
        'Uživatelé musí být starší 18 let.',
        'Poskytovatelé služeb musí být právně způsobilí nabízet své služby v České republice.',
        'Uživatelé jsou zodpovědní za zachování přesnosti informací svého profilu.',
        'Sdílení účtů nebo vytváření více účtů jednou osobou je zakázáno.',
        'Tool Connect může pozastavit nebo ukončit účty, pokud jsou poskytnuty nepravdivé informace nebo pokud uživatelé poruší tyto podmínky.',
      ],
    },
    {
      title: '3. Používání platformy',
      content: 'Naše platforma nabízí následující funkce:',
      items: [
        'Vyhledávání a prohlížení: Klienti mohou vyhledávat poskytovatele služeb podle kategorie, lokality a jazyka.',
        'Profily: Uživatelé mohou vytvářet a spravovat své profily s osobními a obchodními informacemi.',
        'Zprávy: Vestavěný systém zpráv umožňuje komunikaci mezi klienty a poskytovateli služeb. Zprávy mohou být uživateli smazány z jejich zobrazení, ale zůstávají uloženy v naší databázi pro bezpečnostní účely.',
        'Pracovní poptávky: Klienti mohou zveřejňovat poptávky po službách včetně popisu, rozpočtu a příloh.',
        'Přihlášky: Poskytovatelé služeb mohou reagovat na pracovní poptávky se svými nabídkami.',
        'Portfolio: Poskytovatelé služeb mohou prezentovat svou práci pomocí obrázků, videí a popisů projektů.',
        'Recenze: Klienti mohou hodnotit a recenzovat poskytovatele služeb po využití jejich služeb.',
        'Oblíbené: Klienti mohou ukládat oblíbené poskytovatele služeb pro snadný přístup.',
        'Blokování: Uživatelé mohou blokovat jiné uživatele, aby jim zabránili v kontaktování.',
      ],
    },
    {
      title: '4. Pravidla chování',
      items: [
        'Uživatelům je zakázáno zapojovat se do podvodných, nezákonných nebo obtěžujících aktivit.',
        'Poskytovatelé služeb musí poskytovat čestné a profesionální služby.',
        'Uživatelé nesmí zveřejňovat nepravdivé, zavádějící nebo urážlivé informace.',
        'Spam, nevyžádané zprávy a zneužití systému zpráv jsou zakázány.',
        'Uživatelé souhlasí, že nebudou kopírovat, distribuovat ani zneužívat jakýkoli obsah nalezený na platformě.',
        'Jakákoli diskriminace založená na rase, pohlaví, náboženství nebo jiných chráněných charakteristikách je přísně zakázána.',
      ],
    },
    {
      title: '5. Platby a poplatky',
      items: [
        'Tool Connect v současnosti nezprostředkovává platby; transakce musí být prováděny přímo mezi uživateli.',
        'Všechny ceny a platební podmínky si domlouvají klienti a poskytovatelé služeb samostatně.',
        'Tool Connect nenese odpovědnost za platební spory mezi uživateli.',
        'V budoucnu můžeme zavést prémiové funkce nebo předplatné pro poskytovatele služeb.',
      ],
    },
    {
      title: '6. Obsah a duševní vlastnictví',
      items: [
        'Uživatelé si ponechávají vlastnictví obsahu, který nahrají (fotografie, popisy portfolia atd.).',
        'Nahráním obsahu udělujete Tool Connect licenci k zobrazení, distribuci a propagaci vašeho obsahu v rámci platformy.',
        'Tool Connect vlastní veškeré značky, design a duševní vlastnictví související se samotnou platformou.',
        'Uživatelé nesmí bez předchozího písemného souhlasu kopírovat, reprodukovat nebo upravovat jakoukoli část platformy.',
        'Uživatelé jsou zodpovědní za zajištění, že mají právo nahrát jakýkoli obsah, který sdílejí.',
      ],
    },
    {
      title: '7. Ochrana údajů a soukromí',
      items: [
        'Uživatelská data bezpečně uchováváme pomocí infrastruktury Supabase s šifrováním.',
        'Zprávy mezi uživateli zůstávají uloženy v naší databázi, i když jsou uživateli smazány z jejich zobrazení.',
        'Uživatelé jsou zodpovědní za zachování důvěrnosti svých přihlašovacích údajů.',
        'Podrobnosti o zpracování údajů naleznete v našich Zásadách ochrany osobních údajů.',
        'Dodržujeme GDPR a české zákony o ochraně údajů.',
      ],
    },
    {
      title: '8. Omezení odpovědnosti',
      items: [
        'Tool Connect slouží jako platforma spojující uživatele a neposkytuje žádné služby přímo.',
        'Neneseme odpovědnost za kvalitu, bezpečnost nebo legálnost služeb poskytovaných poskytovateli služeb.',
        'Uživatelé souhlasí s řešením sporů mezi sebou bez zásahu Tool Connect.',
        'Platforma je poskytována "tak, jak je" bez záruk jakéhokoli druhu.',
        'Nezaručujeme nepřetržitou, bezchybnou službu ani žádné konkrétní výsledky z používání platformy.',
        'Neneseme odpovědnost za žádné přímé, nepřímé, náhodné nebo následné škody.',
      ],
    },
    {
      title: '9. Daně pro poskytovatele služeb',
      content: 'Každý poskytovatel služeb je zodpovědný za:',
      items: [
        'Registraci a dodržování všech platných daňových předpisů v České republice.',
        'Správné hlášení příjmů z aktivit na platformě.',
        'Získání všech nezbytných podnikatelských oprávnění a licencí.',
        'Tool Connect neposkytuje daňové poradenství a není zodpovědný za daňové povinnosti uživatelů.',
      ],
    },
    {
      title: '10. Nahlašování a moderování',
      items: [
        'Uživatelé mohou nahlásit nevhodný obsah nebo chování prostřednictvím naší funkce nahlášení.',
        'Mohou být podány žádosti o podporu pro problémy s účtem nebo technické problémy.',
        'Tool Connect si vyhrazuje právo prošetřit hlášení a podniknout příslušné kroky.',
        'Rozhodnutí o moderování obsahu jsou na uvážení Tool Connect.',
      ],
    },
    {
      title: '11. Ukončení a deaktivace účtu',
      items: [
        'Uživatelé mohou kdykoli deaktivovat své účty prostřednictvím nastavení.',
        'Po smazání účtu budou osobní údaje vymazány v souladu s našimi Zásadami ochrany osobních údajů.',
        'Tool Connect si vyhrazuje právo pozastavit nebo ukončit účty, které porušují tyto podmínky.',
        'Opakované nebo závažné porušení může vést k trvalému zákazu.',
      ],
    },
    {
      title: '12. Rozhodné právo a řešení sporů',
      items: [
        'Tyto Podmínky se řídí právem České republiky.',
        'Spory budou řešeny prostřednictvím mediace nebo arbitráže v Praze, Česká republika.',
        'Pro spotřebitelské spory mají uživatelé právo využít alternativní řešení sporů.',
      ],
    },
    {
      title: '13. Změny těchto podmínek',
      content: 'Vyhrazujeme si právo tyto Podmínky aktualizovat. Uživatelé budou informováni o významných změnách prostřednictvím oznámení v aplikaci nebo e-mailu. Pokračující používání platformy po změnách znamená přijetí aktualizovaných podmínek.',
    },
  ] : [
    {
      title: '1. Definitions',
      items: [
        '"Platform" refers to the Tool Connect mobile application and website tool-connect.com.',
        '"Client" refers to users seeking services from providers.',
        '"Service Provider" refers to individuals or businesses offering services through the platform.',
        '"User" refers to both Clients and Service Providers.',
        '"Work Request" refers to a service request created by a Client.',
        '"Application" refers to a Service Provider\'s response to a Work Request.',
        '"Portfolio" refers to a Service Provider\'s showcase of their work.',
      ],
    },
    {
      title: '2. Account Registration & Eligibility',
      items: [
        'Users must provide a valid phone number for SMS verification when registering.',
        'Users must be at least 18 years old.',
        'Service Providers must be legally eligible to offer their services in the Czech Republic.',
        'Users are responsible for maintaining the accuracy of their profile information.',
        'Account sharing or creating multiple accounts by one person is prohibited.',
        'Tool Connect may suspend or terminate accounts if false information is provided or if users violate these terms.',
      ],
    },
    {
      title: '3. Use of the Platform',
      content: 'Our platform provides the following features:',
      items: [
        'Search & Browse: Clients can search for Service Providers by category, location, and language.',
        'Profiles: Users can create and manage their profiles with personal and business information.',
        'Messaging: The built-in messaging system allows communication between Clients and Service Providers. Messages can be deleted by users from their view, but remain stored in our database for security purposes.',
        'Work Requests: Clients can post service requests including description, budget, and attachments.',
        'Applications: Service Providers can respond to Work Requests with their proposals.',
        'Portfolio: Service Providers can showcase their work with images, videos, and project descriptions.',
        'Reviews: Clients can rate and review Service Providers after using their services.',
        'Favorites: Clients can save favorite Service Providers for easy access.',
        'Blocking: Users can block other users to prevent them from contacting them.',
      ],
    },
    {
      title: '4. Conduct Rules',
      items: [
        'Users are prohibited from engaging in fraudulent, illegal, or harassing activities.',
        'Service Providers must provide honest and professional services.',
        'Users must not post false, misleading, or offensive information.',
        'Spam, unsolicited messages, and abuse of the messaging system are prohibited.',
        'Users agree not to copy, distribute, or misuse any content found on the platform.',
        'Any discrimination based on race, gender, religion, or other protected characteristics is strictly prohibited.',
      ],
    },
    {
      title: '5. Payments and Fees',
      items: [
        'Tool Connect currently does not facilitate payments; transactions must be handled directly between Users.',
        'All pricing and payment terms are negotiated between Clients and Service Providers independently.',
        'Tool Connect is not responsible for payment disputes between Users.',
        'We may introduce premium features or subscription fees for Service Providers in the future.',
      ],
    },
    {
      title: '6. Content & Intellectual Property',
      items: [
        'Users retain ownership of content they upload (photos, portfolio descriptions, etc.).',
        'By uploading content, you grant Tool Connect a license to display, distribute, and promote your content within the platform.',
        'Tool Connect owns all branding, design, and intellectual property related to the platform itself.',
        'Users may not copy, reproduce, or modify any part of the platform without prior written consent.',
        'Users are responsible for ensuring they have the right to upload any content they share.',
      ],
    },
    {
      title: '7. Data Protection & Privacy',
      items: [
        'We store user data securely using Supabase infrastructure with encryption.',
        'Messages between users remain stored in our database even if deleted by users from their view.',
        'Users are responsible for maintaining the confidentiality of their account credentials.',
        'See our Privacy Policy for details on data processing.',
        'We comply with GDPR and Czech data protection laws.',
      ],
    },
    {
      title: '8. Limitation of Liability',
      items: [
        'Tool Connect acts as a platform connecting users and does not provide any services directly.',
        'We are not responsible for the quality, safety, or legality of services provided by Service Providers.',
        'Users agree to resolve disputes between themselves without Tool Connect intervention.',
        'The Platform is provided "as is" without warranties of any kind.',
        'We do not guarantee uninterrupted, error-free service or any specific outcomes from using the platform.',
        'We are not liable for any direct, indirect, incidental, or consequential damages.',
      ],
    },
    {
      title: '9. Taxation for Service Providers',
      content: 'Each Service Provider is responsible for:',
      items: [
        'Registering and complying with all applicable tax regulations in the Czech Republic.',
        'Properly reporting income from platform activities.',
        'Obtaining any necessary business permits and licenses.',
        'Tool Connect does not provide tax advice and is not responsible for users\' tax obligations.',
      ],
    },
    {
      title: '10. Reporting & Moderation',
      items: [
        'Users can report inappropriate content or behavior through our reporting feature.',
        'Support requests can be submitted for account or technical issues.',
        'Tool Connect reserves the right to investigate reports and take appropriate action.',
        'Content moderation decisions are at Tool Connect\'s discretion.',
      ],
    },
    {
      title: '11. Termination & Account Deactivation',
      items: [
        'Users can deactivate their accounts at any time through settings.',
        'Upon account deletion, personal data will be erased in accordance with our Privacy Policy.',
        'Tool Connect reserves the right to suspend or terminate accounts that violate these terms.',
        'Repeated or severe violations may result in permanent bans.',
      ],
    },
    {
      title: '12. Governing Law & Dispute Resolution',
      items: [
        'These Terms are governed by the laws of the Czech Republic.',
        'Disputes shall be resolved through mediation or arbitration in Prague, Czech Republic.',
        'For consumer disputes, users have the right to use alternative dispute resolution.',
      ],
    },
    {
      title: '13. Updates to These Terms',
      content: 'We reserve the right to update these Terms. Users will be notified of significant changes via in-app notifications or email. Continued use of the platform after changes implies acceptance of the updated terms.',
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
