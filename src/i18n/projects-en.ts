import type { Category } from '../data/projects'

type Override = { title?: string; tagline: string; description: string }

export const STATUS_EN: Record<string, string> = {
  'En ligne': 'Live',
  Prototype: 'Prototype',
  Fonctionnel: 'Working',
  Cadrage: 'Scoping',
  MVP: 'MVP',
  'En développement': 'In development',
  'Patch livré': 'Patch shipped',
  Jouable: 'Playable',
  'Site vitrine': 'Showcase site',
  Livré: 'Shipped',
  Archivé: 'Archived',
  Démarrage: 'Just started',
  'Bientôt lancé': 'Launching soon',
  Bêta: 'Beta',
}

export const CATEGORIES_EN: Record<Category, { label: string; intro: string }> = {
  ia: { label: 'AI & agents', intro: 'Agents that read, search and act.' },
  consumer: { label: 'Consumer products', intro: 'Everyday apps, tested on myself first.' },
  jeux: { label: 'Games & passions', intro: 'Where I build what I love.' },
  clients: { label: 'Clients & freelance', intro: 'Sites and tools for local businesses and tradespeople.' },
  pm: { label: 'Product craft', intro: 'Diagnosis, prioritisation, metrics: the core of the job.' },
  outils: { label: 'Tools & experiments', intro: 'Small tools that save me time.' },
}

export const PROJECTS_EN: Record<string, Override> = {
  'chatbot-cv': {
    tagline: 'My résumé stopped answering, so I replaced it with an agent.',
    description: 'A RAG conversational agent that knows my whole background and answers in the first person, without making anything up. Knowledge base vectorised in Supabase (pgvector), generation on Groq with Gemini as a fallback and a model cascade to survive quotas. Every unanswered question pings me on Discord, and a dashboard shows me the conversations so I can enrich the base.',
  },
  lifeos: {
    tagline: 'A life dashboard with an AI coach inside.',
    description: 'Overall score, goals, fitness, nutrition, career, habits and journal in a single app. Data lives in Supabase and the Claude API acts as a coach.',
  },
  departs: {
    tagline: 'An agent that finds the best flights around Toulouse.',
    description: 'Type “naples late oct 4-5d €150”: the agent queries Google Flights across six airports at once and returns a top 3 as boarding passes. First test: €552 from Toulouse, €155 return direct from Barcelona. No made-up prices: AI understands the request, ranking is tested code.',
  },
  'assistant-bancaire': {
    title: 'Accessible banking assistant',
    tagline: 'An assistant that turns an intent into an action, by keyboard, screen reader or voice.',
    description: 'Prototype from the BPCE-SI IA4Impact 2026 hackathon, in a team of five. The customer states a need in their own words; sensitive actions go through guided flows where nothing runs without a click, other questions get a sourced answer, and an advisor is always within reach. I built the front end, the personalised agent (a simulated, read-only information system), the guardrails that mask IBAN, card and codes before any model, the voice and the accessibility. The repository is private: the demo below is a simulated version, with an invented bank and data.',
  },
  lio: {
    title: 'LIO, upgraded',
    tagline: 'Regional bus times in Haute-Garonne, in one sentence.',
    description: 'Concept of an AI assistant inside the regional transport app: next departures and direct trips in plain language, stop search tolerant to typos, abbreviations and phonetics. Unofficial concept.',
  },
  'rag-converteo': {
    title: 'Converteo RAG copilot',
    tagline: 'Find a past engagement with one question.',
    description: 'An idea prepared for an AI Product Manager interview: an internal copilot that retrieves similar past engagements. With no access to internal data, I calibrate it on my own.',
  },
  'ai-news': {
    tagline: 'My AI watch, curated and sent twice a day.',
    description: 'Collects AI and product news, removes duplicates, picks the strongest with Gemini, and emails an HTML newsletter.',
  },
  'alertes-emploi': {
    title: 'Job alert bots',
    tagline: 'VIE and product job offers, straight to Discord.',
    description: 'Two separate bots, each with its own Discord channel: Business France VIE offers and product roles.',
  },
  mx5: {
    tagline: 'The day the right MX-5 is listed, I know.',
    description: 'Monitors listings for Mazda MX-5 NC (2009–2015, under €12,000) and sends a Discord alert.',
  },
  wandr: {
    tagline: 'Turn your city into a playground.',
    description: 'Gamified urban exploration: walk, discover places, collect stamps and climb the leaderboard. The map reveals itself around you in real time.',
  },
  fooder: {
    tagline: 'Where are we eating tonight? Swipe. Eat. Repeat.',
    description: 'My most complete product, in open beta and on its way to a real launch. You swipe restaurants like profiles: YUM / MEH stamps, a detail sheet with menu and directions, a map in the app’s colours, favourites. Around it, a full retention loop: Food DNA computed from likes, XP, levels, streaks, trophies, Wrapped, friend challenges and group votes. Freemium at 20 swipes a day, installable PWA, home-made “Bubbly Maximalism” art direction.',
  },
  finger: {
    title: 'Hands workshop',
    tagline: 'Driving a 3D interface with your hands, no keyboard.',
    description: 'Five webcam-driven experiments and a J.A.R.V.I.S.-style hologram: spin a 3D car with one hand, zoom with two, explode it into 50 parts with a held fist. One shared gesture engine, ported to Python to drive the real Windows mouse and change slides by hand. Everything runs locally: no image leaves the machine.',
  },
  'qg-hermes': {
    title: 'AI HQ',
    tagline: 'All my AIs share one memory, and Hermes answers me on Telegram.',
    description: 'Hermes Agent (Nous Research) runs at home with a Telegram bot, wired to Claude. Around it, a single memory read by all my AIs, Claude Code, Hermes, OpenCode and DeepSeek Harness: each has a ten-line pointer (AGENTS.md, CLAUDE.md, SOUL.md) to the same brief, and writes its decisions to an append-only journal. A script-generated cockpit page tracks my applications, and a script provisions a VPS to keep Hermes running.',
  },
  'ps2-skater': {
    title: 'PS2 skater',
    tagline: 'A Jet Set Radio-style low-poly character, generated by AI in Blender.',
    description: 'A cel-shaded character in the Dreamcast and PS2 spirit, built by script in Blender driven by an AI agent through MCP: modelling, outlines, poses and renders.',
  },
  'cv-factory': {
    title: 'Résumé factory',
    tagline: 'One résumé per job offer, without ever touching the layout.',
    description: 'All my content lives in one source-of-truth JSON, tagged and prioritised, with an English overlay. A script builds the HTML then the A4 PDF, another checks page count and fill. Six résumés ready across three job families, in French and English.',
  },
  'tinder-voyages': {
    tagline: 'Where can you go on your budget?',
    description: 'Swipe through destinations that fit your wallet. Next.js front end, FastAPI back end.',
  },
  'fit-progress': {
    tagline: 'Your avatar levels up when you train.',
    description: 'Workout tracking with RPG mechanics to stay motivated over time.',
  },
  cineappmovies: {
    tagline: 'Every film showing in Toulouse, streaming included.',
    description: 'Films in theatres by cinema plus new releases on Netflix, Prime Video and Disney+, with detailed pages and recommendations.',
  },
  'rpg-life': {
    tagline: 'Daily quests for real life.',
    description: 'Body, Mind, Career and Social quests that earn XP.',
  },
  kawaii: {
    tagline: 'A maximalist tamagotchi.',
    description: 'A maximalist style exercise: a small companion to feed, play with and look after.',
  },
  natsukashii: {
    tagline: 'Nostalgia for a VHS-tape Japan.',
    description: 'An immersive web experience: rainy Tokyo nights, VHS grain and Japanese interiors.',
  },
  'derniere-note': {
    tagline: 'A noir thriller set to jazz.',
    description: 'A neo-noir pixel-art roguelike: a detective crosses three districts ruled by Big Sal’s clan. Signature mechanic, “the Swing”: shooting, dashing or reloading on the beat of the music (even your own tracks) fills a gauge that triggers the Solo.',
  },
  'one-piece': {
    title: 'One Piece Gigant Battle 2, in French',
    tagline: 'A Japan-only DS game, now playable in French.',
    description: 'A complete translation patch: ROM extraction (2,519 files), custom Python tools, rebuilt fonts and graphics, shipped as an xdelta patch without touching the original ROM.',
  },
  'overwatch-nexus': {
    tagline: 'Which hero should I play against this team?',
    description: 'A ranked-match companion: enter the enemy composition and the map, and the app recommends a pick.',
  },
  undercover: {
    tagline: 'Find the impostor among your friends.',
    description: 'A deduction game for up to 12 players across 10 manga universes, with consistent and tricky words.',
  },
  scintila: {
    tagline: 'Restaurant, bar and events in Aussonne.',
    description: 'Showcase site for a 120-seat restaurant: menu, venue, private hire and booking.',
  },
  '245th': {
    tagline: 'Tacos, burgers, kebabs.',
    description: 'Website for a fast-food spot in Aussonne, designed for one-tap ordering.',
  },
  'cul-de-bouteille': {
    tagline: 'A neighbourhood bar’s website.',
    description: 'Showcase site for a bar: atmosphere, menu and directions.',
  },
  'flo-wear': {
    tagline: 'An online clothing boutique.',
    description: 'Showcase site for a ready-to-wear boutique.',
  },
  plomberie: {
    tagline: 'Quotes, invoices and clients for a plumber.',
    description: 'A mobile-first B2B SaaS: dashboard, client records, quotes and invoices.',
  },
  spotify: {
    tagline: 'Bringing the magic back to music sharing.',
    description: 'A complete product case study: discovery, diagnosis, market, MVP, RICE prioritisation, roadmap, go-to-market, metrics and risks.',
  },
  'trainer-pm': {
    tagline: 'I train on metrics the way you train at the gym.',
    description: 'Interactive exercises: reading a funnel, cohorts and retention, vanity metrics, North Star Metric.',
  },
  'tiktok-shop': {
    title: 'TikTok Shop case study',
    tagline: 'The TikTok Shop API inside Shippingbo’s OMS.',
    description: 'At Shippingbo, integrating the TikTok Shop API as part of the official 3P partnership: multi-market flows, catalogue mapping and B2C orders.',
  },
  portfolios: {
    title: 'Portfolios v3 & v4',
    tagline: 'Previous versions of this site.',
    description: 'A dark, lime-green v3, and a macOS-desktop v4 with draggable windows. They taught me what not to do.',
  },
  'garage-dream': {
    tagline: 'My dream garage, on one page.',
    description: 'A one-shot automotive page.',
  },
  'design-system': {
    title: 'Apple-style design system',
    tagline: 'Rules to prototype clean, fast.',
    description: 'Colours, typography and components specified in Markdown to guide my prototypes.',
  },
  'cv-generator': {
    title: 'CV generator & job guide',
    tagline: 'A résumé tailored to each offer.',
    description: 'Small HTML tools to generate résumés and structure my job search.',
  },
  'job-finder': {
    tagline: 'Search less, apply better.',
    description: 'A job-search tool built during my own search.',
  },
  'vinted-factory': {
    tagline: 'A project just getting started.',
    description: 'A freshly started project.',
  },
  scripts: {
    title: 'Dino JEV & car search',
    tagline: 'Everyday Python scripts.',
    description: 'Small scripts to automate personal searches.',
  },
}
