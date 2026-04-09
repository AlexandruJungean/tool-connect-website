'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  MapPin, Users, Globe, Check, ArrowRight, Mail, FileText, Shield,
  Sparkles, Handshake, MessageCircle, Rocket, Play, ChevronDown
} from 'lucide-react'
import dynamic from 'next/dynamic'

// Lazy load marketing components to reduce initial bundle size
const MarketingHeader = dynamic(() => import('@/components/marketing').then(mod => ({ default: mod.MarketingHeader })), { ssr: true })
const MarketingFooter = dynamic(() => import('@/components/marketing').then(mod => ({ default: mod.MarketingFooter })), { ssr: true })
import { Button } from '@/components/ui'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCategories } from '@/contexts/CategoriesContext'
import { getCategoryImageUrl } from '@/lib/icons'
import { cn } from '@/lib/utils'

export default function LandingPage() {
  const { language } = useLanguage()
  const { categories } = useCategories()
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [displayedText, setDisplayedText] = useState('')
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)
  const marqueeCategories = categories.length > 0 ? [...categories, ...categories] : []

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
      faqCta: language === 'cs' ? 'Přejít na FAQ' : 'Go to FAQ',
      categoriesEyebrow: language === 'cs' ? 'Populární kategorie' : 'Popular categories',
      categoriesTitle: language === 'cs' ? 'Prohlédněte si služby na Tool Connect' : 'Explore services on Tool Connect',
      categoriesSubtitle: language === 'cs'
        ? 'Klikněte na kategorii a přejděte rovnou do vyhledávání.'
        : 'Tap a category to jump straight into search.',
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
      videoTitle: language === 'cs' ? 'Podívejte se, jak Tool funguje' : 'See how Tool works',
      videoSubtitle: language === 'cs' ? 'Krátké představení za 47 sekund' : 'A quick intro in 47 seconds',
      videoPlay: language === 'cs' ? 'Přehrát video' : 'Watch video',
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
    faq: {
      eyebrow: language === 'cs' ? 'Rychlé odpovědi' : 'Quick answers',
      title: language === 'cs' ? 'Často kladené otázky' : 'Frequently Asked Questions',
      subtitle: language === 'cs'
        ? 'Shrnuli jsme nejdůležitější informace o tom, jak Tool Connect funguje pro klienty i poskytovatele služeb.'
        : 'We collected the key information about how Tool Connect works for clients and service providers in one place.',
      stillNeedHelp: language === 'cs' ? 'Nenašli jste odpověď?' : 'Still need help?',
      items: language === 'cs'
        ? [
            {
              question: 'Co je Tool a čím se liší od jiných podobných platforem?',
              answer: [
                'Tool Connect je platforma vyvinutá v České republice, dostupná v češtině i angličtině, která propojuje lidi hledající službu s místními profesionály, kteří ji mohou poskytnout.',
                'Místo dlouhých seznamů firem s minimem informací, statických webů nebo nekonečného scrollování ve facebookových skupinách je Tool navržen tak, aby hledání i nabízení služeb bylo rychlejší, přehlednější a transparentnější díky okamžité komunikaci.',
              ],
              points: [
                'Všechny služby na jednom místě, takže je snadné jakoukoli službu najít nebo nabídnout.',
                'Vyhledávání podle lokality, abyste našli poskytovatele ve svém okolí.',
                'Dva způsoby hledání služeb: procházet profily nebo zveřejnit poptávku.',
                'Vizuální portfolia s fotkami a videi, která ukazují reálnou práci.',
                'Vestavěné zprávy s možností zviditelnit telefonní číslo.',
                'Automatický překlad zpráv mezi češtinou a angličtinou.',
                'Přístup k expat komunitě, díky kterému poskytovatelé osloví i mezinárodní klientelu.',
                'Flexibilní profily: uživatel může v jedné aplikaci přepínat mezi klientem a poskytovatelem služeb.',
              ],
            },
            {
              question: 'Proč je Tool Connect zdarma?',
              answer: [
                'Pro klienty je Tool zdarma a vždy zdarma zůstane.',
                'Pro poskytovatele služeb je současná verze aplikace základní verzí a je zdarma. V bezplatné verzi se poskytovatelé mohou zobrazovat ve výsledcích vyhledávání, když klient prochází profily.',
                'Později v tomto roce plánujeme zavést placenou prémiovou verzi pro poskytovatele služeb. Monetizace bude zaváděna postupně a s dostatečným předstihem jasně komunikována uživatelům.',
              ],
              points: [
                'Prioritní notifikace, když klienti zveřejní poptávku.',
                'Vyšší viditelnost ve výsledcích vyhledávání.',
                'Další profesionální funkce, které právě vyvíjíme.',
              ],
            },
            {
              question: 'Jaké typy služeb zde najdu?',
              answer: [
                'Tool Connect je navržen pro širokou škálu služeb, od chův a uklízeček po elektrikáře, lektory nebo účetní.',
                'Platforma aktuálně obsahuje více než 100 podkategorií služeb a tento seznam bude dále růst podle poptávky.',
                'Profil si může vytvořit kdokoli, kdo nabízí legitimní službu, ať už jako nezávislý profesionál nebo firma.',
                'Pokud služba, kterou poskytujete, není v žádné kategorii uvedena, napište nám na info@tool-connect.com a můžeme ji doplnit.',
              ],
              points: [],
            },
            {
              question: 'Proč jako klient potřebuji účet?',
              answer: [
                'Vytvoření klientského účtu nám pomáhá ověřit, že zprávy a poptávky přicházejí od skutečných uživatelů, a zároveň lépe porozumět tomu, jak je platforma používána.',
              ],
              points: [],
            },
            {
              question: 'Jak platforma funguje pro klienty?',
              answer: [
                'Klienti se registrují pomocí telefonního čísla a SMS ověření. Vytvoření detailního profilu je volitelné.',
                'Po registraci mohou klienti hledat poskytovatele, kontaktovat je přímo nebo zveřejnit poptávku a počkat na reakce poskytovatelů. Po dokončení práce mohou poskytovatele ohodnotit a napsat recenzi.',
              ],
              points: [
                'Vyhledávat poskytovatele služeb.',
                'Filtrovat podle typu služby, lokality, jazyka a ceny.',
                'Kontaktovat poskytovatele přímo.',
                'Zveřejnit pracovní poptávku a počkat na odpovědi.',
              ],
            },
            {
              question: 'Jak platforma funguje pro poskytovatele služeb?',
              answer: [
                'Poskytovatelé služeb se registrují pomocí telefonního čísla a SMS ověření a následně si vytvářejí profil.',
                'Jakmile je profil hotový, mohou být kontaktováni klienty, reagovat na poptávky, ukazovat svou práci a nastavit svou dostupnost.',
              ],
              points: [
                'Popis služeb.',
                'Kategorie služeb.',
                'Oblast, kde služby poskytují.',
                'Portfolio s fotografiemi nebo videi.',
                'Ceník, pokud ho chtějí zveřejnit.',
              ],
            },
            {
              question: 'Co mi Tool Connect přinese jako poskytovateli služeb?',
              answer: [
                'Tool Connect pomáhá poskytovatelům oslovit více klientů, prezentovat svou práci profesionálně a jednodušeji spravovat dostupnost.',
              ],
              points: [
                'Vyšší viditelnost u lidí, kteří aktivně hledají vaše služby.',
                'Lepší objevitelnost pro klienty ve vašem okolí díky filtrům podle lokality.',
                'Více pracovních příležitostí od klientů, kteří hledají právě váš typ služby.',
                'Profesionální profil, který buduje důvěru.',
                'Možnost nastavit dostupnost.',
                'Přímé zprávy s klienty přes vestavěný chat.',
                'Jednoduché a intuitivní prostředí pro rychlé navázání kontaktu.',
                'Úsporu času na marketingu, protože nemusíte své služby nabízet na více místech.',
                'Přístup z mobilu i webu pro správu profilu a zpráv.',
              ],
            },
            {
              question: 'Mohou se na Tool Connect registrovat i firmy?',
              answer: [
                'Ano. Profil a nabídku služeb si mohou na platformě vytvořit jak nezávislí profesionálové, tak firmy.',
              ],
              points: [],
            },
            {
              question: 'Řeší Tool platby mezi klienty a poskytovateli?',
              answer: [
                'Ne. Platby si domlouvají přímo mezi sebou klienti a poskytovatelé služeb.',
                'Tool Connect platby nezpracovává a nenese odpovědnost za případné platební spory.',
              ],
              points: [],
            },
            {
              question: 'Jsou telefonní čísla viditelná pro ostatní uživatele?',
              answer: [
                'Telefonní číslo je viditelné pouze tehdy, pokud se ho uživatel rozhodne zobrazit ve svém nastavení profilu.',
                'V opačném případě komunikace probíhá přes interní zprávy v aplikaci.',
              ],
              points: [],
            },
            {
              question: 'Jsou moje osobní údaje chráněné?',
              answer: [
                'Ano. Tool Connect je v souladu s GDPR a českými zákony o ochraně osobních údajů.',
                'Uživatelská data jsou ukládána bezpečně pomocí šifrované infrastruktury a chráněných spojení. Přístup k osobním údajům mají pouze oprávněné osoby.',
                'V závislosti na typu účtu můžeme shromažďovat následující údaje. Tyto informace používáme k provozu a zlepšování platformy. Uživatelská data neprodáváme.',
              ],
              points: [
                'Telefonní číslo pro SMS ověření.',
                'Jméno a volitelnou profilovou fotografii.',
                'Jazykové preference.',
                'Lokalizační údaje.',
                'Zprávy a přílohy.',
                'Portfolio a profilové informace.',
                'Pracovní poptávky a recenze.',
              ],
            },
            {
              question: 'Proč je Tool Connect obzvlášť užitečný pro expaty?',
              answer: [
                'Aplikace podporuje češtinu i angličtinu a zprávy mezi uživateli mohou být automaticky překládány, což usnadňuje komunikaci mezi lidmi, kteří mluví různými jazyky.',
                'Díky tomu mohou místní obyvatelé rychle najít profesionály v okolí a expati se mohou spojit s poskytovateli služeb i bez znalosti češtiny.',
                'Další výhodou je cenová transparentnost. Expati, kteří neznají místní trh, mohou porovnat více poskytovatelů, projít si profily a získat různé nabídky na stejnou zakázku.',
                'Současně tak místní profesionálové získávají přístup k širší klientské základně včetně mezinárodní komunity.',
              ],
              points: [],
            },
            {
              question: 'Mohu smazat svůj účet a osobní údaje?',
              answer: [
                'Ano. Svůj účet můžete deaktivovat v nastavení účtu.',
                'Osobní údaje jsou odstraňovány podle našich zásad ochrany osobních údajů a požadavků GDPR, i když některé technické záznamy mohou být dočasně uchovány z bezpečnostních nebo právních důvodů.',
              ],
              points: [],
            },
          ]
        : [
            {
              question: 'What is Tool and why is it different from other similar platforms?',
              answer: [
                'Tool Connect is a platform developed in Czech Republic, available in both Czech and English, that connects people who need a service with local professionals who can provide it.',
                'Instead of long lists of businesses with little information, static websites, or endless scrolling through Facebook groups, Tool is designed to make finding and offering services faster, clearer, and more transparent through instant communication.',
              ],
              points: [
                'All services in one place, making it easy to find or offer any type of service.',
                'Location-based discovery to help clients find service providers nearby.',
                'Two ways to find services: browse providers or post a request.',
                'Visual portfolios with photos and videos that showcase real work.',
                'Built-in messaging with optional phone contact.',
                'Automatic message translation between Czech and English.',
                'Access to the expat community, helping service providers reach international clients.',
                'Flexible profiles that let users switch between client and service provider inside the same app.',
              ],
            },
            {
              question: 'Why is Tool Connect free to use?',
              answer: [
                'For clients, Tool is and will always be free.',
                'For service providers, the current version of the app is the basic version, and it is free and will remain free. With the free version, providers can appear in search results when clients browse profiles.',
                'Later this year we plan to introduce a paid premium version for service providers. Monetization will be introduced gradually and clearly communicated to users well in advance.',
              ],
              points: [
                'Priority notifications when clients post requests.',
                'Higher visibility in search results.',
                'Additional professional features that are currently in development.',
              ],
            },
            {
              question: 'What kinds of services can I find here?',
              answer: [
                'Tool Connect is designed to cover a wide range of services, from babysitters and cleaners to electricians, tutors, and accountants.',
                'The platform currently includes more than 100 service subcategories, and this list will continue to grow as demand evolves.',
                'Anyone offering a legitimate service, whether an independent professional or a company, can create a profile and showcase their work.',
                'If the service you provide is not listed in any category, write to us at info@tool-connect.com and we can add it.',
              ],
              points: [],
            },
            {
              question: 'Why do I need an account as a client?',
              answer: [
                'Creating a client account helps us ensure that messages and requests come from real users and allows us to better understand how the platform is used.',
              ],
              points: [],
            },
            {
              question: 'How does the platform work for clients?',
              answer: [
                'Clients register using their phone number with SMS verification, while creating a detailed profile is optional.',
                'After registering, clients can search for providers, contact them directly, or post a work request and wait for providers to respond. Once a job is completed, clients can rate and review service providers.',
              ],
              points: [
                'Search for service providers.',
                'Filter by service type, location, language, and price.',
                'Contact providers directly.',
                'Post a work request and wait for providers to respond.',
              ],
            },
            {
              question: 'How does the platform work for service providers?',
              answer: [
                'Service providers register using their phone number with SMS verification and then create their profile.',
                'Once the profile is ready, providers can be contacted by clients, respond to work requests, showcase their work, and set their availability.',
              ],
              points: [
                'A description of services.',
                'Service categories.',
                'A service area.',
                'Portfolio photos or videos.',
                'Pricing information, if they want to include it.',
              ],
            },
            {
              question: 'What’s in it for me as a service provider?',
              answer: [
                'As a service provider, Tool Connect helps you reach more clients, present your work professionally, and manage your availability more easily.',
              ],
              points: [
                'Increased visibility among people who are actively looking for what you offer.',
                'Better local discovery through location filters.',
                'More job opportunities from clients searching for your type of service.',
                'A professional profile that builds trust.',
                'A simple way to set your availability.',
                'Direct messaging with clients through built-in chat.',
                'A simple and intuitive interface that makes connections faster.',
                'Less time spent on marketing across multiple places.',
                'Access from both mobile and web to manage your profile and messages.',
              ],
            },
            {
              question: 'Can companies register on Tool Connect?',
              answer: [
                'Yes. Both independent professionals and companies can create profiles and offer services on the platform.',
              ],
              points: [],
            },
            {
              question: 'Does Tool handle payments between clients and providers?',
              answer: [
                'No. Payments are arranged directly between clients and service providers.',
                'Tool Connect does not process payments and is not responsible for payment disputes.',
              ],
              points: [],
            },
            {
              question: 'Are phone numbers visible to other users?',
              answer: [
                'Phone numbers are only visible if a user chooses to make them visible in profile settings.',
                'Otherwise, communication happens through the platform messaging system.',
              ],
              points: [],
            },
            {
              question: 'Is my personal data protected?',
              answer: [
                'Yes. Tool Connect complies with GDPR and Czech data protection laws.',
                'User data is stored securely using encrypted infrastructure and protected connections. Access to personal data is restricted to authorized personnel only.',
                'Depending on the account type, we may collect the following information. This data is used to operate and improve the platform, and we do not sell user data.',
              ],
              points: [
                'Phone number for SMS verification.',
                'Name and optional profile photo.',
                'Language preferences.',
                'Location data.',
                'Messages and attachments.',
                'Portfolio and profile information.',
                'Work requests and reviews.',
              ],
            },
            {
              question: 'Why is Tool Connect especially useful for expats?',
              answer: [
                'The app supports both Czech and English, and messages between users can be automatically translated, which makes communication easier for people who speak different languages.',
                'This helps locals find nearby professionals quickly, while expats can connect with service providers even if they do not speak Czech.',
                'Another advantage is price transparency. Expats who are unfamiliar with the local market can compare multiple service providers, review profiles, and receive different proposals for the same job.',
                'At the same time, local professionals gain access to a wider client base, including the international community.',
              ],
              points: [],
            },
            {
              question: 'Can I delete my account and personal data?',
              answer: [
                'Yes. You can deactivate your account through your account settings.',
                'Personal data is removed according to our Privacy Policy and GDPR requirements, although some technical records may be temporarily retained for security or legal reasons.',
              ],
              points: [],
            },
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
    <div className="min-h-screen">
      <MarketingHeader transparent />

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <div className="mb-8 md:mb-10">
            <div className="category-marquee">
              <div className="category-marquee-track">
                {marqueeCategories.map((category, index) => {
                  const categoryLabel = language === 'cs' ? category.labelCS : category.label

                  return (
                    <Link
                      key={`${category.value}-${index}`}
                      href={`/search?category=${encodeURIComponent(category.value)}`}
                      className="group inline-flex min-w-max items-center gap-3 rounded-full border border-white/15 bg-white/95 px-5 py-3 text-sm font-medium text-gray-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:bg-white hover:text-primary-700 hover:shadow-md"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden bg-primary-50 shadow-sm">
                        <img
                          src={getCategoryImageUrl(category.value, category.imageUrl)}
                          alt={categoryLabel}
                          className="w-full h-full object-cover"
                        />
                      </span>
                      <span>{categoryLabel}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

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
              <div className="mt-4 flex justify-center lg:justify-start">
                <Link href="#faq">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="w-full sm:w-auto text-white/90 hover:bg-white/10 hover:text-white"
                  >
                    {t.hero.faqCta}
                    <ChevronDown className="w-5 h-5 ml-2" />
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
                
                {/* Store badges */}
                <div className="flex flex-col gap-2">
                  <a
                    href="https://apps.apple.com/us/app/tool/id6739626276"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <div className="text-left leading-tight">
                      <div className="text-[8px] font-normal">Download on the</div>
                      <div className="text-sm font-semibold -mt-0.5">App Store</div>
                    </div>
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.tool.toolappconnect"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
                      <path d="M3.609 1.814L13.445 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92z" fill="#4285F4"/>
                      <path d="M17.556 8.297L5.363.697a1.002 1.002 0 0 0-.523-.148c-.066 0-.13.009-.194.024L14.68 10.765l2.876-2.468z" fill="#EA4335"/>
                      <path d="M17.556 15.703L14.68 13.235 4.646 23.427c.064.015.128.024.194.024a1 1 0 0 0 .523-.148l12.193-7.6z" fill="#34A853"/>
                      <path d="M21.197 10.672l-3.641-2.375L14.68 10.765 14.68 13.235l2.876 2.468 3.641-2.375a1.318 1.318 0 0 0 0-2.656z" fill="#FBBC05"/>
                    </svg>
                    <div className="text-left leading-tight">
                      <div className="text-[8px] font-normal tracking-wider uppercase">Get it on</div>
                      <div className="text-sm font-semibold -mt-0.5">Google Play</div>
                    </div>
                  </a>
                  <Link
                    href="/search"
                    className="flex items-center gap-2 bg-primary-600 text-white rounded-lg px-4 py-2 hover:bg-primary-700 transition-colors"
                  >
                    <Globe className="w-6 h-6 flex-shrink-0" />
                    <div className="text-left leading-tight">
                      <div className="text-[8px] font-normal">Open in</div>
                      <div className="text-sm font-semibold -mt-0.5">{t.download.webBrowser}</div>
                    </div>
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
              
              {/* Store badges */}
              <div className="flex flex-col gap-2">
                <a
                  href="https://apps.apple.com/us/app/tool/id6739626276"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left leading-tight">
                    <div className="text-[8px] font-normal">Download on the</div>
                    <div className="text-sm font-semibold -mt-0.5">App Store</div>
                  </div>
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.tool.toolappconnect"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M3.609 1.814L13.445 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92z" fill="#4285F4"/>
                    <path d="M17.556 8.297L5.363.697a1.002 1.002 0 0 0-.523-.148c-.066 0-.13.009-.194.024L14.68 10.765l2.876-2.468z" fill="#EA4335"/>
                    <path d="M17.556 15.703L14.68 13.235 4.646 23.427c.064.015.128.024.194.024a1 1 0 0 0 .523-.148l12.193-7.6z" fill="#34A853"/>
                    <path d="M21.197 10.672l-3.641-2.375L14.68 10.765 14.68 13.235l2.876 2.468 3.641-2.375a1.318 1.318 0 0 0 0-2.656z" fill="#FBBC05"/>
                  </svg>
                  <div className="text-left leading-tight">
                    <div className="text-[8px] font-normal tracking-wider uppercase">Get it on</div>
                    <div className="text-sm font-semibold -mt-0.5">Google Play</div>
                  </div>
                </a>
                <Link
                  href="/search"
                  className="flex items-center gap-2 bg-primary-600 text-white rounded-lg px-4 py-2 hover:bg-primary-700 transition-colors"
                >
                  <Globe className="w-6 h-6 flex-shrink-0" />
                  <div className="text-left leading-tight">
                    <div className="text-[8px] font-normal">Open in</div>
                    <div className="text-sm font-semibold -mt-0.5">{t.download.webBrowser}</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="aspect-video rounded-2xl overflow-hidden shadow-xl relative">
              {showVideo ? (
                <VideoPlayer
                  src="/videos/jana-intro.mp4"
                  autoPlay
                  className="w-full h-full"
                />
              ) : (
                <button
                  onClick={() => setShowVideo(true)}
                  className="w-full h-full relative group cursor-pointer"
                >
                  <Image
                    src="/assets/pictures/video-thumbnail.webp"
                    alt={t.features.videoTitle}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                      <Play className="w-9 h-9 text-white ml-1" />
                    </div>
                    <div className="text-center px-4">
                      <p className="text-white font-semibold text-lg mb-1 drop-shadow-lg">
                        {t.features.videoTitle}
                      </p>
                      <p className="text-white/80 text-sm drop-shadow-lg">
                        {t.features.videoSubtitle}
                      </p>
                    </div>
                  </div>
                </button>
              )}
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

      {/* FAQ Section */}
      <section id="faq" className="scroll-mt-24 py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 mb-4">
              <MessageCircle className="w-4 h-4" />
              <span>{t.faq.eyebrow}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.faq.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t.faq.subtitle}
            </p>
          </div>

          <div className="space-y-4">
            {t.faq.items.map((item, index) => {
              const isOpen = openFaqIndex === index

              return (
                <div
                  key={item.question}
                  className={cn(
                    'overflow-hidden rounded-2xl border bg-white transition-all duration-200',
                    isOpen
                      ? 'border-primary-200 shadow-lg shadow-primary-100/50'
                      : 'border-gray-200 shadow-sm hover:border-gray-300'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span className="text-lg font-semibold text-gray-900">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        'mt-1 h-5 w-5 flex-shrink-0 text-primary-700 transition-transform duration-200',
                        isOpen && 'rotate-180'
                      )}
                    />
                  </button>

                  {isOpen && (
                    <div id={`faq-answer-${index}`} className="px-6 pb-6 animate-slide-up">
                      <div className="border-t border-gray-100 pt-5 space-y-4">
                        {item.answer.map((paragraph, paragraphIndex) => (
                          <p key={paragraphIndex} className="leading-relaxed text-gray-600">
                            {paragraph}
                          </p>
                        ))}

                        {item.points.length > 0 && (
                          <ul className="space-y-3">
                            {item.points.map((point, pointIndex) => (
                              <li key={pointIndex} className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-100">
                                  <Check className="h-4 w-4 text-primary-700" />
                                </div>
                                <span className="leading-relaxed text-gray-600">{point}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            {t.faq.stillNeedHelp}{' '}
            <a
              href={`mailto:${t.contact.email}`}
              className="font-medium text-primary-700 transition-colors hover:text-primary-800"
            >
              {t.contact.email}
            </a>
          </p>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
            {t.about.title}
          </h2>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {t.about.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-primary-100 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="flex justify-center">
              <div className="bg-white/10 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-sm">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-primary-700" />
                </div>
                <div className="inline-flex items-center gap-2 bg-white/90 rounded-full px-4 py-2 text-gray-700">
                  <MapPin className="w-4 h-4 text-primary-700" />
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

