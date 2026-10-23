import { useLang, type Lang } from '../i18n/LangProvider'

const BASE = {
  name: 'Riyan Besseghir',
  role: 'AI Product Manager',
  location: 'Toulouse · Paris · Remote',
  email: 'riyan.besseghir@gmail.com',
  links: {
    linkedin: 'https://www.linkedin.com/in/riyan-besseghir-8514a425b/',
    github: 'https://github.com/Deady31',
    cv: '/media/cv-riyan-besseghir.pdf',
  },
}

const HACKATHON_PHOTO = '/media/hauts-faits/hackathon-bpce-ia4impact-scene.webp'

const CONTENT = {
  fr: {
    profile: { ...BASE, availability: 'Ouvert aux opportunités · CDI ou freelance' },
    impact: {
      company: 'Shippingbo',
      context: 'SaaS B2B de logistique e-commerce (OMS, WMS, TMS)',
      role: 'Product Manager / Product Owner, jusqu’à 3 feature teams en parallèle',
      stats: [
        { value: 56, prefix: '−', suffix: ' %', label: 'de tickets support N1', note: 'en production, grâce à l’assistant IA' },
        { value: 4, label: 'features IA', note: 'livrées de bout en bout' },
        { value: 3, label: 'feature teams', note: 'pilotées en parallèle' },
        { value: 10, label: 'mois', note: 'de stage puis CDD' },
      ],
      features: [
        { name: 'Naia, l’assistante IA', text: 'Assistante conversationnelle sur l’API Claude, connectée en temps réel aux données du compte : stocks, commandes, retours en langage naturel. Seul PM de la discovery au lancement, 4 grands comptes interviewés : −56 % de tickets support N1 en production.' },
        { name: 'Analyses IA', text: 'Des audits lisibles, sans montage Excel : ventes, produits, retours et transports analysés automatiquement pour faire ressortir anomalies, dérives et priorités.' },
        { name: 'Classes de ventes', text: 'Segmentation ABCD automatique des références selon leur rotation réelle : produits stratégiques, dormants et SKU à surveiller.' },
        { name: 'Commandes identiques', text: 'Détection automatique des doublons pour fiabiliser les opérations.' },
      ],
      product: {
        name: 'Shippingbo Intelligence',
        tagline: 'La couche IA de Shippingbo : moins chercher, mieux comprendre, agir plus vite.',
        facts: [
          ['Rôle', 'Product Manager lead, de la discovery à la roadmap'],
          ['Équipe', '1 designer, 1 dev front, 2 devs back'],
          ['Période', 'Juil. 2025 → avr. 2026'],
        ],
        link: 'https://www.shippingbo.com/solutions/shippingbo-intelligence/',
        linkLabel: 'Voir la page officielle',
        credit: 'Visuel © Shippingbo',
        alt: 'Interface de Shippingbo Intelligence : analyse des commandes générée par IA, avec Naia, la mascotte abeille',
      },
      roadmap: {
        title: 'Roadmap que j’ai conçue, livrée depuis',
        badge: 'Livré en sept. 2026',
        items: [
          { name: 'Import intelligent de documents', text: 'Naia lit PDF et images pour créer commandes et attendus de réception, sans ressaisie.' },
          { name: 'Compétences réutilisables', text: 'Des instructions enregistrées, relancées et partagées avec l’équipe.' },
          { name: 'NAIA Action', text: 'Naia agit dans Shippingbo : créer un attendu de réception, ajouter ou modifier un produit.' },
        ],
      },
      extra: 'Intégration de l’API TikTok Shop dans le cadre du partenariat officiel 3P : flows multi-marchés, mapping du catalogue, commandes B2C.',
    },
    feats: {
      hackathon: {
        event: 'Hackathon IA for Impact · La Mêlée Numérique · défi BPCE Solutions informatiques',
        date: 'Octobre 2026',
        duration: '30 heures',
        brief: 'Un assistant conversationnel de confiance pour guider clients et prospects vers la bonne réponse, la bonne action et le bon relais humain.',
        role: 'PM et pitcher d’une équipe de 5',
        delivered: [
          'Défini le MVP d’un chatbot IA bancaire : simulations de crédit dans le chat, aucune action risquée, accessibilité très paramétrable',
          'Prototypé le MVP avec Claude Code',
          'Conçu le parcours et la démo, puis pitché devant le jury',
        ],
        outcome: 'Pas de podium, mais une expérience inoubliable : 30 heures pour passer d’un besoin à un produit qui tourne.',
        photo: HACKATHON_PHOTO,
      },
      teasers: [
        { title: 'Intervenant IA', hint: 'À venir', file: 'Dossier 01' },
        { title: 'Organisateur de hackathon IA', hint: 'À venir', file: 'Dossier 02' },
      ],
    },
  },
  en: {
    profile: { ...BASE, availability: 'Open to opportunities · Full-time or freelance' },
    impact: {
      company: 'Shippingbo',
      context: 'a B2B e-commerce logistics SaaS (OMS, WMS, TMS)',
      role: 'Product Manager / Product Owner, leading up to 3 feature teams in parallel',
      stats: [
        { value: 56, prefix: '−', suffix: '%', label: 'level-1 support tickets', note: 'in production, thanks to the AI assistant' },
        { value: 4, label: 'AI features', note: 'shipped end to end' },
        { value: 3, label: 'feature teams', note: 'led in parallel' },
        { value: 10, label: 'months', note: 'internship, then fixed-term contract' },
      ],
      features: [
        { name: 'Naia, the AI assistant', text: 'A conversational assistant on the Claude API, connected in real time to account data: stock, orders and returns in plain language. Sole PM from discovery to launch, 4 key accounts interviewed: −56% level-1 support tickets in production.' },
        { name: 'AI Analyses', text: 'Readable audits without spreadsheet work: sales, products, returns and shipping analysed automatically to surface anomalies, drifts and priorities.' },
        { name: 'Sales Classes', text: 'Automatic ABCD segmentation of SKUs by real turnover: strategic products, dormant items and SKUs to watch.' },
        { name: 'Duplicate orders', text: 'Automatic duplicate detection to make operations more reliable.' },
      ],
      product: {
        name: 'Shippingbo Intelligence',
        tagline: 'Shippingbo’s AI layer: search less, understand better, act faster.',
        facts: [
          ['Role', 'Lead Product Manager, from discovery to roadmap'],
          ['Team', '1 designer, 1 front-end dev, 2 back-end devs'],
          ['Period', 'Jul 2025 → Apr 2026'],
        ],
        link: 'https://www.shippingbo.com/solutions/shippingbo-intelligence/',
        linkLabel: 'See the official page',
        credit: 'Visual © Shippingbo',
        alt: 'Shippingbo Intelligence interface: AI-generated order analysis, with Naia, the bee mascot',
      },
      roadmap: {
        title: 'Roadmap I designed, shipped since',
        badge: 'Shipped Sept 2026',
        items: [
          { name: 'Smart document import', text: 'Naia reads PDFs and images to create orders and inbound receipts, with no re-keying.' },
          { name: 'Reusable skills', text: 'Saved instructions you can rerun and share with the team.' },
          { name: 'NAIA Action', text: 'Naia acts inside Shippingbo: create an inbound receipt, add or edit a product.' },
        ],
      },
      extra: 'TikTok Shop API integration under the official 3P partnership: multi-market flows, catalogue mapping, B2C orders.',
    },
    feats: {
      hackathon: {
        event: 'AI for Impact hackathon · La Mêlée Numérique · BPCE Solutions informatiques challenge',
        date: 'October 2026',
        duration: '30 hours',
        brief: 'A trustworthy conversational assistant that guides customers and prospects to the right answer, the right action and the right human contact.',
        role: 'PM and pitcher in a team of 5',
        delivered: [
          'Defined the MVP of a banking AI chatbot: loan simulations in the chat, no risky actions, highly configurable accessibility',
          'Prototyped the MVP with Claude Code',
          'Designed the journey and the demo, then pitched to the jury',
        ],
        outcome: 'No podium, but an unforgettable experience: 30 hours to go from a need to a product that runs.',
        photo: HACKATHON_PHOTO,
      },
      teasers: [
        { title: 'AI speaker', hint: 'Coming soon', file: 'File 01' },
        { title: 'AI hackathon organiser', hint: 'Coming soon', file: 'File 02' },
      ],
    },
  },
} satisfies Record<Lang, unknown>

export const PROFILE = CONTENT.fr.profile

export const useContent = () => CONTENT[useLang().lang]
