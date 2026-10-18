export type Category = 'ia' | 'consumer' | 'jeux' | 'clients' | 'pm' | 'outils'

export type Shot = { src: string; alt: string; frame: 'desktop' | 'mobile' }

export type Project = {
  id: string
  title: string
  tagline: string
  description: string
  category: Category
  stack: string[]
  status: string
  link?: string
  repo?: string
  shots: Shot[]
  highlight?: string
}

export const CATEGORIES: { id: Category; label: string; kanji: string; intro: string }[] = [
  { id: 'ia', label: 'IA & agents', kanji: '知能', intro: 'Des agents qui lisent, cherchent et agissent.' },
  { id: 'consumer', label: 'Produits consumer', kanji: '日常', intro: 'Des apps pensées pour le quotidien, testées sur moi d’abord.' },
  { id: 'jeux', label: 'Jeux & passions', kanji: '情熱', intro: 'Là où je code ce que j’aime.' },
  { id: 'clients', label: 'Clients & freelance', kanji: '依頼', intro: 'Des sites et outils pensés pour des commerces et artisans du coin.' },
  { id: 'pm', label: 'Métier de PM', kanji: '設計', intro: 'Diagnostic, priorisation, métriques : le cœur du job.' },
  { id: 'outils', label: 'Outils & expériences', kanji: '工房', intro: 'Les petits outils qui me font gagner du temps.' },
]

const m = (file: string) => `/media/projets/${file}.webp`
const shot = (file: string, alt: string, frame: Shot['frame'] = 'desktop'): Shot => ({ src: m(file), alt, frame })

export const PROJECTS: Project[] = [
  {
    id: 'chatbot-cv',
    title: 'Méca-Riyan',
    tagline: 'Mon CV ne répond plus, alors je l’ai remplacé par un agent.',
    description:
      'Agent conversationnel en RAG qui connaît tout mon parcours et répond en citant ses sources. Base de connaissance vectorisée dans Supabase (pgvector), génération avec Gemini Flash, interface Next.js.',
    category: 'ia',
    stack: ['Next.js', 'Gemini Flash', 'Supabase pgvector', 'RAG'],
    status: 'En ligne',
    link: 'https://riyan-cv-chatbot.vercel.app',
    repo: 'https://github.com/Deady31/riyan-cv-chatbot',
    shots: [shot('riyan-cv-chatbot', 'Écran d’accueil du chatbot Méca-Riyan')],
    highlight: 'Projet à la une',
  },
  {
    id: 'lifeos',
    title: 'LifeOS',
    tagline: 'Un tableau de bord de vie, avec un coach IA dedans.',
    description:
      'Score global, objectifs, fitness, nutrition, carrière, habitudes et journal réunis dans une seule app. Les données vivent dans Supabase et l’API Claude sert de coach.',
    category: 'ia',
    stack: ['Next.js', 'Claude API', 'Supabase', 'Tailwind'],
    status: 'Prototype',
    shots: [
      shot('lifeos-desktop', 'Hub LifeOS avec score global et objectifs'),
      shot('lifeos-fitness-desktop', 'Page fitness de LifeOS'),
      shot('lifeos-career-desktop', 'Page carrière de LifeOS'),
      shot('lifeos-goals-desktop', 'Page objectifs de LifeOS'),
    ],
  },
  {
    id: 'departs',
    title: 'Départs',
    tagline: 'Un agent qui trouve les meilleurs vols autour de Toulouse.',
    description:
      'On tape « naples fin oct 4-5j 150€ » : l’agent interroge Google Flights sur six aéroports à la fois et sort un top 3 en cartes d’embarquement. Premier test : 552 € depuis Toulouse, 155 € aller-retour direct depuis Barcelone. Aucun prix inventé : l’IA comprend la demande, le classement est du code testé.',
    category: 'ia',
    stack: ['Python', 'FastAPI', 'SerpApi', 'LLM'],
    status: 'Fonctionnel',
    repo: 'https://github.com/Deady31/Travel-Agent',
    shots: [shot('travel-agent', 'Cartes d’embarquement générées par Départs')],
  },
  {
    id: 'lio',
    title: 'LIO, en mieux',
    tagline: 'Les horaires de cars de Haute-Garonne, en une phrase.',
    description:
      'Concept d’assistant IA intégré à l’appli de transport régionale : prochains passages et trajets directs en langage courant, recherche d’arrêt tolérante aux fautes, abréviations et phonétique. Concept non officiel.',
    category: 'ia',
    stack: ['Next.js', 'Tailwind', 'LLM'],
    status: 'En ligne',
    link: 'https://lio-ameliore.vercel.app',
    repo: 'https://github.com/Deady31/LIO-AMELIORE',
    shots: [shot('lio-ameliore-mobile', 'Assistant horaires LIO sur mobile', 'mobile')],
  },
  {
    id: 'rag-converteo',
    title: 'Copilote RAG Converteo',
    tagline: 'Retrouver une mission passée en une question.',
    description:
      'Idée préparée pour un entretien d’AI Product Manager : un copilote interne qui retrouve les missions similaires. Faute d’accès aux données internes, je le calibre sur mes propres données.',
    category: 'ia',
    stack: ['RAG', 'Claude Code'],
    status: 'Cadrage',
    shots: [
      shot('code-rag-converteo', 'Prompt de cadrage du copilote RAG'),
    ],
  },
  {
    id: 'ai-news',
    title: 'AI News Agent',
    tagline: 'Ma veille IA, triée et envoyée deux fois par jour.',
    description:
      'Collecte des actus IA et produit, dédoublonnage, sélection des plus fortes avec Gemini, newsletter HTML envoyée par e-mail.',
    category: 'ia',
    stack: ['Python', 'Gemini'],
    status: 'Fonctionnel',
    shots: [
      shot('code-ai-news', 'Code du pipeline de newsletter IA'),
    ],
  },
  {
    id: 'alertes-emploi',
    title: 'Bots alertes emploi',
    tagline: 'Les offres VIE et product, directement sur Discord.',
    description: 'Deux bots séparés, chacun avec son canal Discord : offres VIE de Business France et offres product.',
    category: 'ia',
    stack: ['Node.js', 'Playwright', 'Discord'],
    status: 'Fonctionnel',
    shots: [
      shot('code-alertes-emploi', 'Boucle de veille des offres VIE'),
    ],
  },
  {
    id: 'mx5',
    title: 'MX-5 Hunter',
    tagline: 'Le jour où la bonne MX-5 sort, je le sais.',
    description: 'Surveille les annonces de Mazda MX-5 NC (2009-2015, moins de 12 000 €) et envoie une alerte Discord.',
    category: 'outils',
    stack: ['Node.js', 'Playwright', 'Discord'],
    status: 'Fonctionnel',
    shots: [
      shot('code-mx5', 'Cycle de scraping du MX-5 Hunter'),
    ],
  },
  {
    id: 'wandr',
    title: 'WANDR',
    tagline: 'Transforme ta ville en terrain de jeu.',
    description:
      'Exploration urbaine gamifiée : on marche, on découvre des lieux, on collecte des stamps et on grimpe au classement. Carte révélée en temps réel autour de soi.',
    category: 'consumer',
    stack: ['Expo', 'React Native', 'Firebase', 'Maps'],
    status: 'MVP',
    shots: [shot('wandr-mobile', 'Onboarding de WANDR', 'mobile')],
  },
  {
    id: 'fooder',
    title: 'FOODER',
    tagline: 'On mange quoi ce soir ? Swipe.',
    description: 'Le Tinder des restos : onboarding de goûts et de budget, swipe, wishlist et mode « surprends-moi ».',
    category: 'consumer',
    stack: ['Next.js', 'Tailwind'],
    status: 'Prototype',
    shots: [
      shot('fooder-swipe-mobile', 'Écran de swipe de FOODER', 'mobile'),
      shot('fooder-onboarding-mobile', 'Onboarding de FOODER', 'mobile'),
      shot('fooder-wishlist-mobile', 'Wishlist de FOODER', 'mobile'),
    ],
  },
  {
    id: 'tinder-voyages',
    title: 'TinderVoyages',
    tagline: 'Où partir avec ton budget ?',
    description: 'Swipe de destinations adaptées à ton portefeuille. Front Next.js, back FastAPI.',
    category: 'consumer',
    stack: ['Next.js', 'FastAPI'],
    status: 'Prototype',
    shots: [shot('tinder-voyages-mobile', 'Accueil de TinderVoyages', 'mobile')],
  },
  {
    id: 'fit-progress',
    title: 'Fit Progress',
    tagline: 'Ton avatar monte de niveau quand tu t’entraînes.',
    description: 'Suivi de séances avec mécaniques de RPG pour tenir sur la durée.',
    category: 'consumer',
    stack: ['Expo', 'React Native', 'SQLite', 'Zustand'],
    status: 'MVP',
    shots: [],
  },
  {
    id: 'cineappmovies',
    title: 'Cinéappmovies',
    tagline: 'Tous les films à l’affiche à Toulouse, plateformes comprises.',
    description: 'Films en salle par cinéma et sorties Netflix, Prime Video et Disney+, avec fiches détaillées et recommandations.',
    category: 'consumer',
    stack: ['Next.js', 'TMDB API'],
    status: 'Fonctionnel',
    repo: 'https://github.com/Deady31/Cineappmovies',
    shots: [shot('cineappmovies-desktop', 'Films à l’affiche dans Cinéappmovies')],
  },
  {
    id: 'rpg-life',
    title: 'RPG Life',
    tagline: 'Des quêtes quotidiennes pour la vraie vie.',
    description: 'Quêtes Body, Mind, Career et Social qui rapportent de l’XP.',
    category: 'consumer',
    stack: ['Next.js', 'Tailwind'],
    status: 'Prototype',
    shots: [shot('rpg-life-mobile', 'Quêtes du jour dans RPG Life', 'mobile')],
  },
  {
    id: 'kawaii',
    title: 'Kawaii.world',
    tagline: 'Un tamagotchi maximaliste.',
    description: 'Exercice de style maximaliste : un petit compagnon à nourrir, faire jouer et soigner.',
    category: 'consumer',
    stack: ['Next.js', 'Tailwind'],
    status: 'Prototype',
    shots: [shot('kawaii-app-mobile', 'Compagnon de Kawaii.world', 'mobile')],
  },
  {
    id: 'natsukashii',
    title: 'Natsukashii',
    tagline: 'La nostalgie d’un Japon de cassette VHS.',
    description: 'Expérience web immersive : nuits pluvieuses de Tokyo, grain VHS et intérieurs japonais.',
    category: 'jeux',
    stack: ['Next.js', 'Images générées'],
    status: 'Prototype',
    shots: [shot('natsukashii-desktop', 'Scène de nuit pluvieuse dans Natsukashii')],
  },
  {
    id: 'derniere-note',
    title: 'Dernière Note',
    tagline: 'Un polar au rythme du jazz.',
    description:
      'Roguelike néo-noir en pixel art : un détective traverse trois quartiers tenus par le clan de Big Sal. Mécanique signature « le Swing » : tirer, dasher ou recharger sur le temps de la musique (même tes propres morceaux) remplit une jauge qui déclenche le Solo.',
    category: 'jeux',
    stack: ['Godot 4', 'GDScript'],
    status: 'En développement',
    shots: [
      shot('godot-derniere-note-menu', 'Menu principal de Dernière Note'),
      shot('godot-derniere-note-gameplay', 'Quartier 1 de Dernière Note'),
    ],
    highlight: 'Jeu',
  },
  {
    id: 'one-piece',
    title: 'One Piece Gigant Battle 2 en français',
    tagline: 'Un jeu DS sorti uniquement au Japon, désormais en français.',
    description:
      'Patch de traduction complet : extraction de la ROM (2 519 fichiers), outils Python maison, polices et graphismes refaits, livré en patch xdelta sans toucher à la ROM originale.',
    category: 'jeux',
    stack: ['Python', 'Rétro-ingénierie', 'Nintendo DS'],
    status: 'Patch livré',
    shots: [shot('one-piece-traduction-fr', 'Menu Options du jeu traduit en français')],
    highlight: 'Rétro-ingénierie',
  },
  {
    id: 'overwatch-nexus',
    title: 'Overwatch Nexus',
    tagline: 'Quel héros jouer face à cette équipe ?',
    description: 'Compagnon de partie classée : on saisit la composition adverse et la map, l’app recommande un pick.',
    category: 'jeux',
    stack: ['Next.js', 'Python', 'Streamlit'],
    status: 'Fonctionnel',
    repo: 'https://github.com/Deady31/Overwatch-Nexus',
    shots: [shot('overwatch-nexus-desktop', 'Configuration de match dans Overwatch Nexus')],
  },
  {
    id: 'undercover',
    title: 'Undercover Manga',
    tagline: 'Trouvez l’imposteur parmi vos amis.',
    description: 'Jeu de déduction jusqu’à 12 joueurs sur 10 univers manga, avec des mots cohérents et piégeux.',
    category: 'jeux',
    stack: ['Next.js', 'Tailwind'],
    status: 'Jouable',
    shots: [shot('undercover-manga-desktop', 'Accueil de Undercover Manga')],
  },
  {
    id: 'scintila',
    title: 'Le Scintila',
    tagline: 'Restaurant, bar et événements à Aussonne.',
    description: 'Site vitrine pour un restaurant de 120 couverts : carte, salle, privatisation et réservation.',
    category: 'clients',
    stack: ['HTML', 'CSS', 'JS'],
    status: 'Site vitrine',
    shots: [shot('site-scinetia-desktop', 'Accueil du site Le Scintila')],
  },
  {
    id: '245th',
    title: 'Le 245th',
    tagline: 'Tacos, burgers, kebabs.',
    description: 'Site d’un fast-food d’Aussonne pensé pour la commande en un clic.',
    category: 'clients',
    stack: ['HTML', 'CSS', 'JS'],
    status: 'Site vitrine',
    shots: [shot('site-245th-burger-desktop', 'Accueil du site Le 245th')],
  },
  {
    id: 'cul-de-bouteille',
    title: 'Au cul de bouteille',
    tagline: 'Le site d’un bar de quartier.',
    description: 'Site vitrine d’un bar : ambiance, carte et accès.',
    category: 'clients',
    stack: ['HTML', 'CSS', 'JS'],
    status: 'Site vitrine',
    shots: [shot('site-au-cul-de-bouteille-desktop', 'Accueil du site Au cul de bouteille')],
  },
  {
    id: 'flo-wear',
    title: 'Flo Wear Boutic',
    tagline: 'Une boutique de vêtements en ligne.',
    description: 'Site vitrine d’une boutique de prêt-à-porter.',
    category: 'clients',
    stack: ['HTML', 'CSS', 'JS'],
    status: 'Site vitrine',
    shots: [shot('site-flo-wear-desktop', 'Accueil du site Flo Wear Boutic')],
  },
  {
    id: 'plomberie',
    title: 'Plomberie Yass',
    tagline: 'Devis, factures et clients pour un artisan.',
    description: 'SaaS B2B mobile-first : tableau de bord, fiches clients, devis et factures.',
    category: 'clients',
    stack: ['Next.js', 'Prisma', 'Supabase'],
    status: 'Prototype',
    shots: [
      shot('plomberie-mobile', 'Tableau de bord de Plomberie Yass', 'mobile'),
      shot('plomberie-devis-mobile', 'Devis dans Plomberie Yass', 'mobile'),
    ],
  },
  {
    id: 'spotify',
    title: 'Spotify Social',
    tagline: 'Réenchanter le partage musical.',
    description: 'Étude de cas produit complète : discovery, diagnostic, marché, MVP, priorisation RICE, roadmap, go-to-market, métriques et risques.',
    category: 'pm',
    stack: ['Case study', 'RICE', 'Roadmap'],
    status: 'Livré',
    shots: [shot('spotify-case-study-desktop', 'Couverture de l’étude de cas Spotify Social')],
  },
  {
    id: 'trainer-pm',
    title: 'Trainer PM',
    tagline: 'Je m’entraîne aux métriques comme on s’entraîne au sport.',
    description: 'Exercices interactifs : lire un funnel, cohortes et rétention, vanity metrics, North Star Metric.',
    category: 'pm',
    stack: ['HTML', 'JS'],
    status: 'Fonctionnel',
    shots: [shot('trainer-pm-desktop', 'Exercice de lecture de funnel dans Trainer PM')],
  },
  {
    id: 'tiktok-shop',
    title: 'Case study TikTok Shop',
    tagline: 'L’API TikTok Shop dans l’OMS de Shippingbo, de zéro à la prod.',
    description:
      'Chez Shippingbo, intégration de l’API TikTok Shop en tant que partenaire officiel 3P, pour synchroniser commandes, stock et retours en temps réel. Rôle PM/PO, 3 mois du design à la prod : architecture event-driven par webhooks, PRD de A à Z, gestion des erreurs (retries, dead letter queue). Résultats : 95 % de commandes synchronisées, −60 % d’erreurs de traitement, webhooks sous 2 secondes.',
    category: 'pm',
    stack: ['API REST', 'Webhooks', 'OMS', 'PRD'],
    status: 'Livré',
    shots: [
      shot('tiktok-shop-retro', 'Retour d’expérience de l’étude de cas TikTok Shop'),
      shot('tiktok-shop-erreurs', 'Matrice de gestion des erreurs de l’intégration TikTok Shop'),
    ],
  },
  {
    id: 'portfolios',
    title: 'Portfolios v3 et v4',
    tagline: 'Les versions précédentes de ce site.',
    description: 'Une v3 sombre et citron vert, une v4 en bureau macOS avec fenêtres déplaçables. Elles m’ont appris ce qu’il ne fallait plus faire.',
    category: 'pm',
    stack: ['HTML', 'React', 'GSAP'],
    status: 'Archivé',
    repo: 'https://github.com/Deady31/PortFolio',
    shots: [
      shot('portfolio-v4-desktop', 'Écran d’accueil du portfolio v4'),
      shot('portfolio-v3-desktop', 'Portfolio v3 sombre et citron vert'),
    ],
  },
  {
    id: 'garage-dream',
    title: 'Garage Dream',
    tagline: 'Mon garage idéal, en une page.',
    description: 'Page one-shot sur le thème automobile.',
    category: 'outils',
    stack: ['HTML', 'CSS'],
    status: 'Livré',
    shots: [
      shot('garage-dream-desktop', 'Accueil de la page Dream Garage'),
    ],
  },
  {
    id: 'design-system',
    title: 'Design system façon Apple',
    tagline: 'Les règles pour prototyper propre, vite.',
    description: 'Couleurs, typographie et composants spécifiés en markdown pour guider mes prototypes.',
    category: 'outils',
    stack: ['Markdown', 'Design'],
    status: 'Livré',
    shots: [
      shot('code-design-system', 'Spécification du design system en markdown'),
    ],
  },
  {
    id: 'cv-generator',
    title: 'Générateur de CV et guide emploi',
    tagline: 'Un CV adapté à chaque offre.',
    description: 'Petits outils HTML pour générer des CV et structurer ma recherche.',
    category: 'outils',
    stack: ['HTML', 'JS'],
    status: 'Fonctionnel',
    shots: [
      shot('cv-generator-desktop', 'Générateur de CV avec aperçu en direct'),
      shot('guide-emploi-desktop', 'Accueil du guide emploi'),
    ],
  },
  {
    id: 'job-finder',
    title: 'Job finder',
    tagline: 'Chercher moins, postuler mieux.',
    description: 'Outil de recherche d’offres construit pendant ma recherche d’emploi.',
    category: 'outils',
    stack: ['Node.js'],
    status: 'Prototype',
    shots: [
      shot('job-finder-desktop', 'Hub d’offres d’emploi avec filtres'),
    ],
  },
  {
    id: 'vinted-factory',
    title: 'Vinted Factory',
    tagline: 'Un projet qui démarre.',
    description: 'Projet tout juste lancé.',
    category: 'outils',
    stack: ['Node.js'],
    status: 'Démarrage',
    shots: [
      shot('code-vinted-factory', 'Dépendances du projet Vinted Factory'),
    ],
  },
  {
    id: 'scripts',
    title: 'Dino JEV et Recherche bagnole',
    tagline: 'Des scripts Python du quotidien.',
    description: 'Petits scripts pour automatiser des recherches perso.',
    category: 'outils',
    stack: ['Python'],
    status: 'Fonctionnel',
    shots: [
      shot('code-scripts', 'Scraper Python de Recherche bagnole'),
      shot('code-dino-jev', 'Script de test Dino JEV'),
    ],
  },
]

export const AI_SPOTLIGHT_ORDER = ['chatbot-cv', 'lifeos', 'departs', 'lio'] as const

export const byCategory = (c: Category) => PROJECTS.filter((p) => p.category === c)
export const byId = (id: string) => PROJECTS.find((p) => p.id === id)
