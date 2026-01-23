/**
 * Service Categories and Options
 */

export interface OptionSet {
  value: string
  label: string
  labelCS: string
}

export interface ServiceCategory {
  value: string
  label: string
  labelCS: string
  icon: string
  subcategories: OptionSet[]
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    value: 'family_pet_care',
    label: 'Family and Pet Care',
    labelCS: 'Rodina a péče o domácí mazlíčky',
    icon: 'users',
    subcategories: [
      { value: 'babysitter', label: 'Babysitter', labelCS: 'Chůva' },
      { value: 'elderly_caregiver', label: 'Elderly caregiver', labelCS: 'Pečovatel o seniory' },
      { value: 'personal_assistant', label: 'Personal assistant', labelCS: 'Osobní asistent' },
      { value: 'personal_chef', label: 'Personal chef /Cook', labelCS: 'Osobní kuchař' },
      { value: 'house_cleaner', label: 'House Cleaner', labelCS: 'Uklízeč' },
      { value: 'caterer', label: 'Caterer', labelCS: 'Catering' },
      { value: 'dog_walker', label: 'Dog walker', labelCS: 'Venčitel psů' },
      { value: 'pet_sitter', label: 'Pet sitter', labelCS: 'Hlídání domácích mazlíčků' },
      { value: 'pet_groomer', label: 'Pet groomer', labelCS: 'Péče o zvířata' },
      { value: 'any', label: 'Others', labelCS: 'Ostatní' },
    ],
  },
  {
    value: 'home',
    label: 'Home',
    labelCS: 'Domov',
    icon: 'home',
    subcategories: [
      { value: 'handyman', label: 'Handyman', labelCS: 'Údržbář' },
      { value: 'plumber', label: 'Plumber', labelCS: 'Instalatér' },
      { value: 'electrician', label: 'Electrician', labelCS: 'Elektrikář' },
      { value: 'hvac_technician', label: 'HVAC technician', labelCS: 'Technik HVAC' },
      { value: 'security_system', label: 'Security system', labelCS: 'Bezpečnostní systém' },
      { value: 'wall_painter', label: 'Wall Painter', labelCS: 'Malíř' },
      { value: 'flooring_specialist', label: 'Flooring specialist', labelCS: 'Specialista na podlahy' },
      { value: 'windows_installer', label: 'Windows installer', labelCS: 'Instalatér oken' },
      { value: 'appliances_repair', label: 'Appliances repair', labelCS: 'Oprava spotřebičů' },
      { value: 'interior_designer', label: 'Interior designer', labelCS: 'Interiérový designér' },
      { value: 'any', label: 'Others', labelCS: 'Ostatní' },
    ],
  },
  {
    value: 'craftsmen',
    label: 'Craftsmen',
    labelCS: 'Řemeslníci',
    icon: 'hammer',
    subcategories: [
      { value: 'carpenter', label: 'Carpenter', labelCS: 'Truhlář' },
      { value: 'blacksmith', label: 'Blacksmith', labelCS: 'Kovář' },
      { value: 'leatherworker', label: 'Leatherworker', labelCS: 'Kožedělník' },
      { value: 'stone_mason', label: 'Stone mason', labelCS: 'Kameník' },
      { value: 'any', label: 'Others', labelCS: 'Ostatní' },
    ],
  },
  {
    value: 'pests_management',
    label: 'Pests Management',
    labelCS: 'Hubení škůdců',
    icon: 'bug',
    subcategories: [
      { value: 'pest_control', label: 'Pest control specialist', labelCS: 'Specialista na hubení škůdců' },
      { value: 'disinfection', label: 'Disinfection specialist', labelCS: 'Specialista na dezinfekci' },
      { value: 'deratization', label: 'Deratization specialist', labelCS: 'Specialista na deratizaci' },
      { value: 'any', label: 'Others', labelCS: 'Ostatní' },
    ],
  },
  {
    value: 'outdoors',
    label: 'Outdoors',
    labelCS: 'Venkovní práce',
    icon: 'trees',
    subcategories: [
      { value: 'gardening', label: 'Gardening Specialist', labelCS: 'Zahradník' },
      { value: 'landscape', label: 'Landscape specialist', labelCS: 'Krajinář' },
      { value: 'any', label: 'Others', labelCS: 'Ostatní' },
    ],
  },
  {
    value: 'locksmith',
    label: 'Locksmith',
    labelCS: 'Zámečník',
    icon: 'key',
    subcategories: [
      { value: 'emergency_lockout', label: 'Emergency lockout service', labelCS: 'Nouzové odemykání' },
      { value: 'lock_installation', label: 'Lock installation & replacement', labelCS: 'Instalace a výměna zámků' },
      { value: 'car_locksmith', label: 'Car locksmith', labelCS: 'Automobilový zámečník' },
      { value: 'any', label: 'Others', labelCS: 'Ostatní' },
    ],
  },
  {
    value: 'personal_items_repairs',
    label: 'Personal Items Repairs',
    labelCS: 'Opravy osobních předmětů',
    icon: 'wrench',
    subcategories: [
      { value: 'jewelry_repairs', label: 'Jewelry repairs', labelCS: 'Opravy šperků' },
      { value: 'watches_repairs', label: 'Watches repairs', labelCS: 'Opravy hodinek' },
      { value: 'shoes_repair', label: 'Shoes repair', labelCS: 'Opravy obuvi' },
      { value: 'tailor', label: 'Tailor / Seamstress', labelCS: 'Krejčí / Švadlena' },
      { value: 'any', label: 'Others', labelCS: 'Ostatní' },
    ],
  },
  {
    value: 'new_house_building',
    label: 'New House Building',
    labelCS: 'Stavba nového domu',
    icon: 'building',
    subcategories: [
      { value: 'architect', label: 'Architect', labelCS: 'Architekt' },
      { value: 'civil_engineer', label: 'Civil engineer', labelCS: 'Stavební inženýr' },
      { value: 'construction_supervisor', label: 'Construction supervisor', labelCS: 'Stavbyvedoucí' },
      { value: 'geodetic_surveyor', label: 'Geodetic surveyor', labelCS: 'Geodet' },
      { value: 'hydrogeological_surveyor', label: 'Hydrogeological surveyor', labelCS: 'Hydrogeolog' },
      { value: 'property_inspector', label: 'Property inspector', labelCS: 'Inspektor nemovitostí' },
      { value: 'excavation_operator', label: 'Excavation / Groundwork operator', labelCS: 'Operátor výkopů' },
      { value: 'any', label: 'Others', labelCS: 'Ostatní' },
    ],
  },
  {
    value: 'beauty',
    label: 'Beauty',
    labelCS: 'Krása',
    icon: 'sparkles',
    subcategories: [
      { value: 'hairdresser', label: 'Hairdresser', labelCS: 'Kadeřník' },
      { value: 'barber', label: 'Barber', labelCS: 'Holič' },
      { value: 'cosmetician', label: 'Cosmetician', labelCS: 'Kosmetička' },
      { value: 'waxing', label: 'Waxing/deplilation', labelCS: 'Depilace' },
      { value: 'brow_lash', label: 'Brow & Lash technician', labelCS: 'Technik obočí a řas' },
      { value: 'makeup_artist', label: 'Makeup artist', labelCS: 'Vizážista' },
      { value: 'massage_therapist', label: 'Massage therapist', labelCS: 'Masér' },
      { value: 'any', label: 'Others', labelCS: 'Ostatní' },
    ],
  },
  {
    value: 'computer_phone',
    label: 'Computer & Phone',
    labelCS: 'Počítače a telefony',
    icon: 'laptop',
    subcategories: [
      { value: 'computer_repair', label: 'Computer repair', labelCS: 'Oprava počítačů' },
      { value: 'phone_repair', label: 'Phone repair', labelCS: 'Oprava telefonů' },
      { value: 'any', label: 'Others', labelCS: 'Ostatní' },
    ],
  },
  {
    value: 'digital_world',
    label: 'Digital World',
    labelCS: 'Digitální svět',
    icon: 'globe',
    subcategories: [
      { value: 'developer', label: 'Developer (software, app, or web)', labelCS: 'Vývojář' },
      { value: 'graphic_designer', label: 'Graphic designer', labelCS: 'Grafický designér' },
      { value: 'digital_marketing', label: 'Digital marketing specialist', labelCS: 'Specialista digitálního marketingu' },
      { value: 'virtual_assistant', label: 'Virtual assistant', labelCS: 'Virtuální asistent' },
      { value: 'any', label: 'Others', labelCS: 'Ostatní' },
    ],
  },
  {
    value: 'financial_legal',
    label: 'Financial or Legal',
    labelCS: 'Finance nebo právní služby',
    icon: 'scale',
    subcategories: [
      { value: 'accountant', label: 'Accountant / Tax consultant', labelCS: 'Účetní / Daňový poradce' },
      { value: 'lawyer', label: 'Lawyer / Attorney', labelCS: 'Právník / Advokát' },
      { value: 'notary', label: 'Notary public', labelCS: 'Notář' },
      { value: 'any', label: 'Others', labelCS: 'Ostatní' },
    ],
  },
  {
    value: 'auto',
    label: 'Auto',
    labelCS: 'Auto',
    icon: 'car',
    subcategories: [
      { value: 'car_mechanic', label: 'Car mechanic', labelCS: 'Automechanik' },
      { value: 'car_wash', label: 'Car wash specialist', labelCS: 'Specialista mytí aut' },
      { value: 'bike_repair', label: 'Bike /E-bike repair', labelCS: 'Oprava kol /E-kol' },
      { value: 'driving_instructor', label: 'Driving instructor', labelCS: 'Instruktor řízení' },
      { value: 'personal_driver', label: 'Personal driver', labelCS: 'Osobní řidič' },
      { value: 'any', label: 'Others', labelCS: 'Ostatní' },
    ],
  },
  {
    value: 'events',
    label: 'Events',
    labelCS: 'Události',
    icon: 'calendar',
    subcategories: [
      { value: 'event_planner', label: 'Event planner', labelCS: 'Organizátor akcí' },
      { value: 'wedding_planner', label: 'Wedding planner', labelCS: 'Svatební koordinátor' },
      { value: 'photographer', label: 'Photographer', labelCS: 'Fotograf' },
      { value: 'videographer', label: 'Videographer', labelCS: 'Kameraman' },
      { value: 'dj', label: 'DJ', labelCS: 'DJ' },
      { value: 'chef', label: 'Chef', labelCS: 'Šéfkuchař' },
      { value: 'caterer_events', label: 'Caterer', labelCS: 'Catering' },
      { value: 'any', label: 'Others', labelCS: 'Ostatní' },
    ],
  },
  {
    value: 'school_tutoring',
    label: 'School Tutoring',
    labelCS: 'Školní doučování',
    icon: 'graduation-cap',
    subcategories: [
      { value: 'czech_language', label: 'Czech language', labelCS: 'Český jazyk' },
      { value: 'sciences', label: 'Sciences (math, physics, etc)', labelCS: 'Vědy' },
      { value: 'informatics', label: 'Informatics', labelCS: 'Informatika' },
      { value: 'english_language', label: 'English language', labelCS: 'Anglický jazyk' },
      { value: 'other_foreign_languages', label: 'Other foreign languages', labelCS: 'Další cizí jazyky' },
      { value: 'geography_history', label: 'Geography & History', labelCS: 'Zeměpis & Historie' },
      { value: 'any', label: 'Others', labelCS: 'Ostatní' },
    ],
  },
  {
    value: 'languages_lessons',
    label: 'Languages Lessons',
    labelCS: 'Jazykové lekce',
    icon: 'languages',
    subcategories: [
      { value: 'czech_for_foreigners', label: 'Czech for foreigners', labelCS: 'Čeština pro cizince' },
      { value: 'english', label: 'English', labelCS: 'Angličtina' },
      { value: 'german', label: 'German', labelCS: 'Němčina' },
      { value: 'other_languages', label: 'Other foreign languages', labelCS: 'Další cizí jazyky' },
      { value: 'sign_language', label: 'Sign language', labelCS: 'Znakový jazyk' },
      { value: 'any', label: 'Others', labelCS: 'Ostatní' },
    ],
  },
  {
    value: 'music_lessons',
    label: 'Music Lessons',
    labelCS: 'Hudební lekce',
    icon: 'music',
    subcategories: [
      { value: 'piano', label: 'Piano', labelCS: 'Klavír' },
      { value: 'guitar', label: 'Guitar', labelCS: 'Kytara' },
      { value: 'violin', label: 'Violin', labelCS: 'Housle' },
      { value: 'vocal', label: 'Vocal / Singing', labelCS: 'Zpěv' },
      { value: 'drums', label: 'Drums', labelCS: 'Bicí' },
      { value: 'any', label: 'Others', labelCS: 'Ostatní' },
    ],
  },
  {
    value: 'hobby_classes',
    label: 'Hobby Classes',
    labelCS: 'Hobby kurzy',
    icon: 'palette',
    subcategories: [
      { value: 'drawing_painting', label: 'Drawing /Painting', labelCS: 'Kreslení /Malování' },
      { value: 'digital_art', label: 'Digital art /Graphic design', labelCS: 'Digitální umění' },
      { value: 'photography_hobby', label: 'Photography', labelCS: 'Fotografie' },
      { value: 'sculpting', label: 'Sculpting', labelCS: 'Sochařství' },
      { value: 'acting', label: 'Acting', labelCS: 'Herectví' },
      { value: 'pottery', label: 'Pottery', labelCS: 'Hrnčířství' },
      { value: 'cooking', label: 'Cooking', labelCS: 'Vaření' },
      { value: 'any', label: 'Others', labelCS: 'Ostatní' },
    ],
  },
  {
    value: 'dance_sports_fitness',
    label: 'Dance, Sports & Fitness',
    labelCS: 'Tanec, sporty a fitness',
    icon: 'dumbbell',
    subcategories: [
      { value: 'dance', label: 'Dance', labelCS: 'Tanec' },
      { value: 'sport_classes', label: 'Sport classes', labelCS: 'Sportovní lekce' },
      { value: 'martial_arts', label: 'Martial arts', labelCS: 'Bojová umění' },
      { value: 'personal_trainer', label: 'Personal Trainer', labelCS: 'Osobní trenér' },
      { value: 'any', label: 'Others', labelCS: 'Ostatní' },
    ],
  },
  {
    value: 'wellbeing',
    label: 'Wellbeing',
    labelCS: 'Pohoda',
    icon: 'heart',
    subcategories: [
      { value: 'yoga_pilates', label: 'Yoga /Pilates instructor', labelCS: 'Instruktor jógy /Pilates' },
      { value: 'meditation', label: 'Meditation instructor', labelCS: 'Instruktor meditace' },
      { value: 'nutritionist', label: 'Nutritionist', labelCS: 'Nutriční terapeut' },
      { value: 'wellness_consultant', label: 'Wellness consultant', labelCS: 'Wellness konzultant' },
      { value: 'physiotherapist', label: 'Physiotherapist', labelCS: 'Fyzioterapeut' },
      { value: 'speech_therapy', label: 'Speech therapy', labelCS: 'Logoped' },
      { value: 'psychologist', label: 'Psychologist', labelCS: 'Psycholog' },
      { value: 'any', label: 'Others', labelCS: 'Ostatní' },
    ],
  },
  {
    value: 'spiritual_guidance',
    label: 'Spiritual Guidance',
    labelCS: 'Duchovní vedení',
    icon: 'sparkle',
    subcategories: [
      { value: 'spiritual_coach', label: 'Spiritual coach', labelCS: 'Duchovní kouč' },
      { value: 'energy_healer', label: 'Energy healer / Reiki practitioner', labelCS: 'Energetický léčitel' },
      { value: 'astrologist', label: 'Astrologist', labelCS: 'Astrolog' },
      { value: 'tarot_reader', label: 'Tarot reader', labelCS: 'Čtení tarot' },
      { value: 'any', label: 'Others', labelCS: 'Ostatní' },
    ],
  },
]

export const LANGUAGES: OptionSet[] = [
  { value: 'english', label: 'English', labelCS: 'Angličtina' },
  { value: 'arabic', label: 'Arabic', labelCS: 'Arabština' },
  { value: 'bulgarian', label: 'Bulgarian', labelCS: 'Bulharština' },
  { value: 'catalan', label: 'Catalan', labelCS: 'Katalánština' },
  { value: 'chinese_simplified', label: 'Chinese (Simplified)', labelCS: 'Čínština (zjednodušená)' },
  { value: 'chinese_traditional', label: 'Chinese (Traditional)', labelCS: 'Čínština (tradiční)' },
  { value: 'croatian', label: 'Croatian', labelCS: 'Chorvatština' },
  { value: 'czech', label: 'Czech', labelCS: 'Čeština' },
  { value: 'danish', label: 'Danish', labelCS: 'Dánština' },
  { value: 'dutch', label: 'Dutch', labelCS: 'Holandština' },
  { value: 'filipino', label: 'Filipino', labelCS: 'Filipínština' },
  { value: 'finnish', label: 'Finnish', labelCS: 'Finština' },
  { value: 'french', label: 'French', labelCS: 'Francouzština' },
  { value: 'georgian', label: 'Georgian', labelCS: 'Gruzínština' },
  { value: 'german', label: 'German', labelCS: 'Němčina' },
  { value: 'greek', label: 'Greek', labelCS: 'Řečtina' },
  { value: 'hebrew', label: 'Hebrew', labelCS: 'Hebrejština' },
  { value: 'hindi', label: 'Hindi', labelCS: 'Hindština' },
  { value: 'hungarian', label: 'Hungarian', labelCS: 'Maďarština' },
  { value: 'icelandic', label: 'Icelandic', labelCS: 'Islandština' },
  { value: 'indonesian', label: 'Indonesian', labelCS: 'Indonéština' },
  { value: 'italian', label: 'Italian', labelCS: 'Italština' },
  { value: 'japanese', label: 'Japanese', labelCS: 'Japonština' },
  { value: 'korean', label: 'Korean', labelCS: 'Korejština' },
  { value: 'malay', label: 'Malay', labelCS: 'Malajština' },
  { value: 'norwegian', label: 'Norwegian', labelCS: 'Norština' },
  { value: 'polish', label: 'Polish', labelCS: 'Polština' },
  { value: 'portuguese', label: 'Portuguese', labelCS: 'Portugalština' },
  { value: 'punjabi', label: 'Punjabi', labelCS: 'Paňdžábština' },
  { value: 'romanian', label: 'Romanian', labelCS: 'Rumunština' },
  { value: 'russian', label: 'Russian', labelCS: 'Ruština' },
  { value: 'serbian', label: 'Serbian', labelCS: 'Srbština' },
  { value: 'slovenian', label: 'Slovenian', labelCS: 'Slovinština' },
  { value: 'spanish', label: 'Spanish', labelCS: 'Španělština' },
  { value: 'swahili', label: 'Swahili', labelCS: 'Svahilština' },
  { value: 'swedish', label: 'Swedish', labelCS: 'Švédština' },
  { value: 'thai', label: 'Thai', labelCS: 'Thajština' },
  { value: 'turkish', label: 'Turkish', labelCS: 'Turečtina' },
  { value: 'ukrainian', label: 'Ukrainian', labelCS: 'Ukrajinština' },
  { value: 'vietnamese', label: 'Vietnamese', labelCS: 'Vietnamština' },
]

export const ACCOUNT_TYPES: OptionSet[] = [
  { value: 'company', label: 'Company', labelCS: 'Společnost' },
  { value: 'self-employed', label: 'Self-Employed', labelCS: 'OSVČ' },
]

// Helper functions
export const getCategoryLabel = (value: string, locale: 'en' | 'cs' = 'en'): string => {
  if (!value) return ''
  const normalizedValue = value.toLowerCase().trim()
  const category = SERVICE_CATEGORIES.find((cat) => cat.value.toLowerCase() === normalizedValue)
  return category ? (locale === 'cs' ? category.labelCS : category.label) : value
}

export const getSubcategoryLabel = (
  categoryValue: string,
  subcategoryValue: string,
  locale: 'en' | 'cs' = 'en'
): string => {
  if (!categoryValue || !subcategoryValue) return subcategoryValue || ''
  const normalizedCatValue = categoryValue.toLowerCase().trim()
  const normalizedSubValue = subcategoryValue.toLowerCase().trim()
  const category = SERVICE_CATEGORIES.find((cat) => cat.value.toLowerCase() === normalizedCatValue)
  if (!category) return subcategoryValue
  const subcategory = category.subcategories.find((sub) => sub.value.toLowerCase() === normalizedSubValue)
  return subcategory ? (locale === 'cs' ? subcategory.labelCS : subcategory.label) : subcategoryValue
}

export const getLanguageLabel = (value: string, locale: 'en' | 'cs' = 'en'): string => {
  if (!value) return ''
  const normalizedValue = value.toLowerCase().trim()
  const language = LANGUAGES.find((lang) => lang.value.toLowerCase() === normalizedValue)
  return language ? (locale === 'cs' ? language.labelCS : language.label) : value
}

