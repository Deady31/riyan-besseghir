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
        { name: 'Miranda IA', text: 'Assistant conversationnel sur l’API Claude, connecté en temps réel aux données du compte. Seul PM de la discovery au lancement : 4 grands comptes interviewés, −56 % de tickets support N1 en production.' },
        { name: 'Audit IA', text: 'Audits ventes, produits, retours et transports générés automatiquement, avec observations, alertes et recommandations.' },
        { name: 'Classes de vente IA', text: 'Classification automatique ABCD des produits : top sellers, dormants, stratégiques.' },
        { name: 'Commandes identiques', text: 'Détection automatique des doublons pour fiabiliser les opérations.' },
      ],
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
        { title: 'Cours d’IA en école de commerce', hint: 'Former les futurs managers à travailler avec l’IA.' },
        { title: 'Hackathon IA, côté organisateur', hint: 'Cette fois, c’est moi qui écris le brief.' },
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
        { name: 'Miranda AI', text: 'A conversational assistant on the Claude API, connected in real time to account data. Sole PM from discovery to launch: 4 key accounts interviewed, −56% level-1 support tickets in production.' },
        { name: 'AI Audit', text: 'Automatically generated sales, product, returns and shipping audits, with observations, alerts and recommendations.' },
        { name: 'AI Sales Classes', text: 'Automatic ABCD product classification: top sellers, dormant items, strategic products.' },
        { name: 'Duplicate orders', text: 'Automatic duplicate detection to make operations more reliable.' },
      ],
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
        { title: 'Teaching AI at a business school', hint: 'Helping future managers work with AI.' },
        { title: 'An AI hackathon, as organiser', hint: 'This time, I’m the one writing the brief.' },
      ],
    },
  },
} satisfies Record<Lang, unknown>

export const PROFILE = CONTENT.fr.profile

export const useContent = () => CONTENT[useLang().lang]
