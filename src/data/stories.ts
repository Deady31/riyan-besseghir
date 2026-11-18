/**
 * Le récit de chaque projet : pourquoi je l'ai créé, comment ça marche, ce que j'ai décidé.
 * Règle : uniquement des faits présents dans mes fichiers (README, PRD, historique git, code, captures).
 * Quand un chiffre n'est pas documenté, il n'est pas écrit.
 */
export type Story = {
  period?: string
  why: string
  how: string[]
  decisions?: string[]
  proof?: { label: string; value: string }[]
  next?: string
}

type Pair = { fr: Story; en: Story }

export const STORIES: Record<string, Pair> = {
  'assistant-bancaire': {
    fr: {
      period: 'Octobre 2026',
      why: `Un client bancaire arrive avec un besoin concret, dit avec ses mots, et ne connaît pas l’organisation du site : il parcourt des pages, reformule, répète, change de canal, puis abandonne. Le défi : l’aider à passer de « je cherche une information » à « je sais quoi faire ensuite ».`,
      how: [
        `Le client écrit ou dit son besoin librement ; un garde-fou masque IBAN, numéro de carte, codes et coordonnées avant que rien n’atteigne un modèle.`,
        `Les actions sensibles (carte perdue, réclamation, code, crédit) suivent des parcours guidés avec une carte de confirmation : rien ne s’exécute sans un clic.`,
        `Les autres questions passent par un RAG sur 921 fiches de FAQ publiques et par cinq fonctions en lecture seule d’un système d’information simulé ; la réponse cite ses sources.`,
        `Un conseiller humain reste accessible à tout moment, et l’interface fonctionne au clavier, au lecteur d’écran, en grand texte et à la voix.`,
      ],
      decisions: [
        `Routage hybride : des scénarios écrits pour les actions, l’IA générative pour le reste.`,
        `Le client est fixé par la session : le modèle ne peut pas choisir de qui il lit les données.`,
        `Données fictives et tarifs étiquetés « de démonstration » partout, pour ne jamais être pris pour une vraie banque.`,
        `Sans clé d’IA, la démo fonctionne quand même (scénarios et réponses extraites de la FAQ).`,
      ],
      proof: [
        { label: 'Fiches FAQ indexées', value: '921' },
        { label: 'Fonctions du SI simulé', value: '5' },
        { label: 'Hit@3 du RAG (équipe)', value: '95 %' },
      ],
      next: `Prototype étudiant non officiel : aucune intégration réelle. En production, les contenus viendraient de BPCE et le masquage s’appuierait sur un outil dédié, avec des modèles hébergés par la banque.`,
    },
    en: {
      period: 'October 2026',
      why: `A banking customer arrives with a concrete need, in their own words, and doesn’t know how the site is organised: they browse pages, rephrase, repeat themselves, switch channels, then give up. The challenge: help them go from "I’m looking for information" to "I know what to do next".`,
      how: [
        `The customer writes or says their need freely; a guardrail masks IBAN, card number, codes and contact details before anything reaches a model.`,
        `Sensitive actions (lost card, complaint, code, loan) follow guided flows with a confirmation card: nothing runs without a click.`,
        `Other questions go through a RAG over 921 public FAQ entries and five read-only functions of a simulated information system; the answer cites its sources.`,
        `A human advisor is reachable at any time, and the interface works by keyboard, with a screen reader, in large text and by voice.`,
      ],
      decisions: [
        `Hybrid routing: written scenarios for actions, generative AI for the rest.`,
        `The customer is fixed by the session: the model cannot choose whose data it reads.`,
        `Fictional data and prices labelled "demo" everywhere, so it is never mistaken for a real bank.`,
        `Without an AI key the demo still works (scenarios and answers pulled from the FAQ).`,
      ],
      proof: [
        { label: 'FAQ entries indexed', value: '921' },
        { label: 'Simulated IS functions', value: '5' },
        { label: 'RAG Hit@3 (team)', value: '95%' },
      ],
      next: `Unofficial student prototype: no real integration. In production the content would come from BPCE and masking would rely on a dedicated tool, with models hosted by the bank.`,
    },
  },
  'chatbot-cv': {
    fr: {
      period: '10 → 22 sept. 2026',
      why: `Un CV en PDF ne répond pas aux questions d’un recruteur. Je voulais qu’il puisse les poser directement et obtenir des réponses sourcées, formulées comme je les formulerais moi-même.`,
      how: [
        `Le recruteur pose sa question dans le chat.`,
        `Elle est comparée à ma base de connaissances (9 fichiers vectorisés dans Supabase pgvector) et les 7 passages les plus proches sont retrouvés.`,
        `Le modèle répond à la première personne, en 2 à 3 phrases, en citant sa source. Groq est le modèle principal, Gemini prend le relais.`,
        `Une question sans réponse m’alerte sur Discord et reste visible dans un tableau de bord d’administration.`,
      ],
      decisions: [
        `Longueur imposée : 2 à 3 phrases sur une question fermée, 5 au maximum sur une question ouverte.`,
        `Garde-fou : s’il manque un fait, l’agent le dit au lieu de l’inventer.`,
        `Cascade de modèles pour survivre aux quotas et aux dépréciations.`,
        `Correctif de recherche : 13 questions de FAQ étaient fusionnées en un seul bloc, je les ai redécoupées, ce qui fait passer de 5 à 7 les passages retrouvés.`,
      ],
      proof: [
        { label: 'Commits', value: '20' },
        { label: 'Coût à trafic personnel', value: '0 €' },
      ],
      next: `Les chiffres d’usage (conversations, questions sans réponse) sont dans le tableau de bord mais pas encore exportés : c’est ce qui me manque pour en faire une étude complète.`,
    },
    en: {
      period: 'Sep 10 → 22, 2026',
      why: `A PDF résumé can’t answer a recruiter’s questions. I wanted them to ask directly and get sourced answers, said the way I’d say them.`,
      how: [
        `The recruiter asks a question in the chat.`,
        `It is matched against my knowledge base (9 files vectorised in Supabase pgvector) and the 7 closest passages are retrieved.`,
        `The model answers in the first person, in 2 to 3 sentences, citing its source. Groq is the main model, Gemini steps in as a fallback.`,
        `An unanswered question pings me on Discord and stays visible in an admin dashboard.`,
      ],
      decisions: [
        `Enforced length: 2 to 3 sentences on a closed question, 5 at most on an open one.`,
        `Guardrail: if a fact is missing, the agent says so instead of making it up.`,
        `A model cascade to survive quotas and deprecations.`,
        `Retrieval fix: 13 FAQ entries had been merged into one block, I split them again; retrieved passages raised from 5 to 7.`,
      ],
      proof: [
        { label: 'Commits', value: '20' },
        { label: 'Cost at personal traffic', value: '€0' },
      ],
      next: `Usage figures (conversations, unanswered questions) live in the dashboard but aren’t exported yet: that’s what I need for a full case study.`,
    },
  },

  departs: {
    fr: {
      period: '24 sept. 2026',
      why: `Trouver un vol depuis Toulouse oblige à ouvrir 3 ou 4 comparateurs, tester plusieurs aéroports et plusieurs dates, puis recalculer le prix réel. Je voulais le faire en une phrase.`,
      how: [
        `Je tape « naples fin oct 4-5j 150€ ».`,
        `Un parseur déterministe, sans IA, lit la demande.`,
        `Travelpayouts explore les prix, SerpApi (Google Flights) les vérifie en direct sur six aéroports.`,
        `Les résultats sont classés par un score pondéré et affichés en cartes d’embarquement, chaque prix avec sa source.`,
      ],
      decisions: [
        `Benchmark de 7 sources : Amadeus Self-Service (fermé le 17 juillet 2026) et Kiwi écartés, Skyscanner réservé aux partenaires, scraping de Ryanair écarté (conditions d’utilisation).`,
        `Zéro prix inventé : l’IA reste hors du calcul des prix.`,
        `Score pondéré : prix 50 %, durée 22 %, escales 17 %, horaires 11 %.`,
        `Budget de 0 € par mois : au plus 2 appels SerpApi par recherche, pour un quota de 250 par mois.`,
      ],
      proof: [{ label: 'Test réel', value: 'Toulouse → Naples 552 €, contre 155 € aller-retour direct depuis Barcelone' }],
      next: `Les 10 recherches de validation prévues, comparées à une recherche manuelle (objectif : au plus 5 % d’écart sur 8 cas), ne sont pas encore documentées.`,
    },
    en: {
      period: 'Sep 24, 2026',
      why: `Finding a flight from Toulouse means opening 3 or 4 comparison sites, testing several airports and dates, then recomputing the real price. I wanted to do it in one sentence.`,
      how: [
        `I type "naples late oct 4-5d 150€".`,
        `A deterministic parser, no AI, reads the request.`,
        `Travelpayouts explores prices, SerpApi (Google Flights) verifies them live across six airports.`,
        `Results are ranked by a weighted score and shown as boarding passes, each price with its source.`,
      ],
      decisions: [
        `Benchmark of 7 sources: Amadeus Self-Service (closed July 17, 2026) and Kiwi ruled out, Skyscanner is partner-only, scraping Ryanair ruled out (terms of use).`,
        `Zero invented prices: AI stays out of price computation.`,
        `Weighted score: price 50%, duration 22%, stops 17%, schedule 11%.`,
        `€0 per month budget: at most 2 SerpApi calls per search, against a 250-per-month quota.`,
      ],
      proof: [{ label: 'Real test', value: 'Toulouse → Naples €552, versus €155 direct return from Barcelona' }],
      next: `The 10 planned validation searches, compared with a manual search (target: within 5% on 8 cases), are not documented yet.`,
    },
  },

  lio: {
    fr: {
      period: '1 → 2 oct. 2026',
      why: `Connaître le prochain car d’une ligne de Haute-Garonne demande de naviguer dans des fiches horaires. Je voulais simplement le demander en une phrase.`,
      how: [
        `L’usager écrit « Prochain 362 à Blagnac ».`,
        `Groq (llama-3.3-70b) se limite à extraire l’intention en JSON : ligne, arrêt, sens, heure.`,
        `Les horaires sont calculés par le code à partir des fiches horaires.`,
        `Si l’IA échoue (quota, délai de 4 s), un mode sans IA, à base de règles, prend le relais.`,
      ],
      decisions: [
        `L’IA ne calcule jamais un horaire : elle comprend la demande, le code répond.`,
        `Recherche d’arrêt tolérante : abréviations, fautes, phonétique.`,
        `« Horaires théoriques » affiché partout, et bandeau « données factices » tant que le vrai GTFS n’est pas branché.`,
        `Temps réel volontairement désactivé, périmètre limité aux lignes 362 et 330. Concept non officiel, sans logo.`,
      ],
      proof: [
        { label: 'Arrêts indexés', value: 'environ 4 800' },
        { label: 'Recherche d’arrêt', value: 'moins de 100 ms (cache phonétique)' },
      ],
      next: `Les horaires sont factices : le jeu de données réel n’était pas accessible pendant le développement. Il reste à le brancher et à tester avec de vrais usagers de la ligne.`,
    },
    en: {
      period: 'Oct 1 → 2, 2026',
      why: `Finding the next coach on a Haute-Garonne line means digging through timetables. I just wanted to ask in one sentence.`,
      how: [
        `The rider writes "Next 362 to Blagnac".`,
        `Groq (llama-3.3-70b) only extracts the intent as JSON: line, stop, direction, time.`,
        `Times are computed by code from the timetable files.`,
        `If the AI fails (quota, 4 s timeout), a rule-based no-AI mode takes over.`,
      ],
      decisions: [
        `The AI never computes a time: it understands the request, the code answers.`,
        `Forgiving stop search: abbreviations, typos, phonetics.`,
        `"Theoretical timetable" shown everywhere, plus a "sample data" banner until the real GTFS is connected.`,
        `Real-time deliberately off, scope limited to lines 362 and 330. Unofficial concept, no logo.`,
      ],
      proof: [
        { label: 'Stops indexed', value: 'about 4,800' },
        { label: 'Stop search', value: 'under 100 ms (phonetic cache)' },
      ],
      next: `Times are sample data: the real dataset was unreachable during development. Next: connect it and test with real riders.`,
    },
  },

  finger: {
    fr: {
      why: `Voir ce qu’on peut faire d’une simple webcam : piloter une interface 3D avec les mains, sans rien envoyer à un serveur.`,
      how: [
        `MediaPipe détecte la main directement dans le navigateur.`,
        `Un moteur de gestes partagé, aux seuils validés, reconnaît pincement, poing et main ouverte.`,
        `Cinq expériences courtes et un hologramme l’utilisent.`,
        `Un portage Python pilote la vraie souris de Windows et change de diapositive à la main.`,
      ],
      decisions: [
        `Tout reste en local : aucune image ne quitte la machine, la caméra ne s’allume qu’après un clic.`,
        `Un seul moteur de mains et un seul serveur local pour toutes les expériences.`,
        `Chaque expérience a un mode démo qui simule des mains, pour être testée sans caméra.`,
      ],
      proof: [
        { label: 'Expériences', value: '5, plus l’hologramme' },
        { label: 'Vérification (version Python)', value: '169 assertions sur des poses réelles' },
      ],
      next: `L’éclairage décide de tout : une main à contre-jour n’est pas vue. À tester sur d’autres webcams et d’autres lumières.`,
    },
    en: {
      why: `To see what a plain webcam can do: drive a 3D interface with your hands, without sending anything to a server.`,
      how: [
        `MediaPipe detects the hand right in the browser.`,
        `A shared gesture engine with validated thresholds recognises pinch, fist and open hand.`,
        `Five short experiments and a hologram use it.`,
        `A Python port drives the real Windows mouse and changes slides by hand.`,
      ],
      decisions: [
        `Everything stays local: no image leaves the machine, and the camera only starts after a click.`,
        `One hand engine and one local server for all experiments.`,
        `Each experiment has a demo mode that simulates hands, so it can be tested without a camera.`,
      ],
      proof: [
        { label: 'Experiments', value: '5, plus the hologram' },
        { label: 'Checks (Python version)', value: '169 assertions on real poses' },
      ],
      next: `Lighting decides everything: a backlit hand isn’t seen. Next: test on other webcams and lighting.`,
    },
  },

  'qg-hermes': {
    fr: {
      why: `Je travaille avec plusieurs IA : Claude Code, Hermes, OpenCode, DeepSeek Harness. Chacune repartait de zéro. Je voulais une seule mémoire que toutes lisent.`,
      how: [
        `Un dossier de mémoire contient un brief, mon profil, mes projets et ma recherche d’emploi.`,
        `Chaque outil a un pointeur de dix lignes (AGENTS.md, CLAUDE.md, SOUL.md) qui renvoie vers ce brief.`,
        `Avant de finir, chaque IA ajoute ses décisions à un journal en ajout seul.`,
        `Hermes tourne avec un bot Telegram, et un script prépare un serveur pour le garder allumé.`,
      ],
      decisions: [
        `Aucune duplication : les pointeurs renvoient vers la mémoire, ils ne la recopient pas.`,
        `Journal en ajout seul : on n’efface rien.`,
        `Une page cockpit générée par script suit mes candidatures.`,
      ],
      next: `Le résumé quotidien automatique (Hermes en tâche planifiée à 8 h) est prévu, pas encore en place.`,
    },
    en: {
      why: `I work with several AIs: Claude Code, Hermes, OpenCode, DeepSeek Harness. Each started from scratch. I wanted a single memory they all read.`,
      how: [
        `A memory folder holds a brief, my profile, my projects and my job search.`,
        `Each tool has a ten-line pointer (AGENTS.md, CLAUDE.md, SOUL.md) to that brief.`,
        `Before finishing, each AI appends its decisions to an append-only journal.`,
        `Hermes runs with a Telegram bot, and a script provisions a server to keep it on.`,
      ],
      decisions: [
        `No duplication: pointers refer to the memory, they never copy it.`,
        `Append-only journal: nothing is erased.`,
        `A script-generated cockpit page tracks my applications.`,
      ],
      next: `The automatic daily digest (Hermes on a schedule at 8 am) is planned, not live yet.`,
    },
  },

  'rag-converteo': {
    fr: {
      period: '15 sept. 2026',
      why: `Préparation d’un entretien d’AI PM chez Converteo : montrer une idée de copilote interne qui retrouve les missions passées semblables.`,
      how: [
        `Les documents de mission seraient vectorisés localement (Chroma).`,
        `Une question retrouverait les missions les plus proches.`,
        `La réponse citerait ses sources, et ajouter un document reviendrait à ajouter un fichier.`,
      ],
      decisions: [
        `La traçabilité des sources est jugée la clé du produit.`,
        `Une base vectorielle locale suffit pour un prototype.`,
        `Architecture modulaire : ajouter un type de document ne change rien au reste.`,
      ],
      next: `Il s’agit d’un cadrage : aucun code. Méca-Riyan montre déjà un RAG complet, en ligne.`,
    },
    en: {
      period: 'Sep 15, 2026',
      why: `Preparing an AI PM interview at Converteo: pitching an internal copilot that finds similar past missions.`,
      how: [
        `Mission documents would be vectorised locally (Chroma).`,
        `A question would retrieve the closest missions.`,
        `The answer would cite its sources, and adding a document would just mean adding a file.`,
      ],
      decisions: [
        `Source traceability is judged to be the heart of the product.`,
        `A local vector store is enough for a prototype.`,
        `Modular architecture: a new document type changes nothing else.`,
      ],
      next: `This is scoping only: no code. Méca-Riyan already shows a complete, live RAG.`,
    },
  },

  'ai-news': {
    fr: {
      period: '12 → 17 mars 2026',
      why: `Suivre l’actualité de l’IA et du produit sans parcourir chaque source à la main.`,
      how: [
        `Le script collecte 3 subreddits, GitHub Trending et Product Hunt.`,
        `Gemini classe les sujets en 5 catégories.`,
        `Les doublons sont supprimés (seuil de similarité 0,82) et les tendances sont repérées.`,
        `Une newsletter HTML part par e-mail, deux éditions par jour (7 h et 19 h) grâce à GitHub Actions.`,
      ],
      decisions: [`Si une source est indisponible, les autres continuent.`],
      next: `Je n’ai pas conservé de trace des envois effectués : à mesurer avant d’en parler comme d’un produit utilisé.`,
    },
    en: {
      period: 'Mar 12 → 17, 2026',
      why: `Following AI and product news without browsing every source by hand.`,
      how: [
        `The script collects 3 subreddits, GitHub Trending and Product Hunt.`,
        `Gemini sorts topics into 5 categories.`,
        `Duplicates are removed (0.82 similarity threshold) and trends are spotted.`,
        `An HTML newsletter goes out by email, twice a day (7 am and 7 pm) via GitHub Actions.`,
      ],
      decisions: [`If one source is down, the others keep going.`],
      next: `I kept no record of sends: to measure before presenting it as a used product.`,
    },
  },

  'alertes-emploi': {
    fr: {
      period: '28 juil. → 16 août 2026',
      why: `Ne pas rater les offres de VIE et de product pendant ma recherche d’emploi.`,
      how: [
        `Des scripts interrogent Business France (API JSON), HelloWork, LinkedIn et Welcome to the Jungle.`,
        `Les offres déjà vues sont ignorées grâce à des fichiers de déduplication.`,
        `Chaque nouvelle offre arrive sur un salon Discord dédié à sa source.`,
      ],
      decisions: [
        `PRD écrit avant le code : périmètre V1, et exclusions repoussées à la V2 (filtres par utilisateur, commandes slash).`,
        `Abandon du scraping HTML au profit de l’API JSON de Business France.`,
        `Webhook Discord plutôt qu’un bot permanent.`,
      ],
      proof: [{ label: 'Offres déjà traitées', value: '234 (100 VIE, 111 HelloWork, 23 LinkedIn)' }],
      next: `Je ne mesure pas encore les candidatures ou entretiens obtenus grâce aux alertes.`,
    },
    en: {
      period: 'Jul 28 → Aug 16, 2026',
      why: `Not missing VIE and product job offers during my job search.`,
      how: [
        `Scripts query Business France (JSON API), HelloWork, LinkedIn and Welcome to the Jungle.`,
        `Offers already seen are skipped thanks to deduplication files.`,
        `Each new offer lands in a Discord channel dedicated to its source.`,
      ],
      decisions: [
        `PRD written before the code: V1 scope, with exclusions pushed to V2 (per-user filters, slash commands).`,
        `Dropped HTML scraping in favour of Business France’s JSON API.`,
        `Discord webhook instead of a permanent bot.`,
      ],
      proof: [{ label: 'Offers already processed', value: '234 (100 VIE, 111 HelloWork, 23 LinkedIn)' }],
      next: `I don’t yet measure the applications or interviews the alerts led to.`,
    },
  },

  mx5: {
    fr: {
      period: '13 avr. 2026',
      why: `Repérer les bonnes affaires sur une Mazda MX-5 sans refaire les mêmes recherches chaque jour.`,
      how: [
        `Trois scrapers parcourent Leboncoin, La Centrale et AutoScout24.`,
        `Chaque annonce reçoit un score comparé à un prix de référence de 8 500 € (une estimation).`,
        `Les meilleures partent sur Discord.`,
      ],
      proof: [{ label: 'Annonces trouvées', value: '3 (fichier de résultats)' }],
      next: `Le prix de référence est estimé, pas mesuré. Scraper des sites d’annonces pose aussi la question de leurs conditions d’utilisation.`,
    },
    en: {
      period: 'Apr 13, 2026',
      why: `Spotting good deals on a Mazda MX-5 without redoing the same searches every day.`,
      how: [
        `Three scrapers go through Leboncoin, La Centrale and AutoScout24.`,
        `Each listing gets a score against a €8,500 reference price (an estimate).`,
        `The best ones go to Discord.`,
      ],
      proof: [{ label: 'Listings found', value: '3 (results file)' }],
      next: `The reference price is estimated, not measured. Scraping listing sites also raises the question of their terms of use.`,
    },
  },

  lifeos: {
    fr: {
      period: '11 mai → 2 juil. 2026',
      why: `Réunir au même endroit objectifs, sport, nutrition, carrière, habitudes et journal, avec un coach IA.`,
      how: [
        `Huit pages : tableau de bord, fitness, nutrition, carrière, objectifs, habitudes, journal, réglages.`,
        `Un système d’XP récompense chaque action.`,
        `Le modèle Claude (Haiku) produit des insights qui sont stockés.`,
        `Des connecteurs Google Agenda et Open Food Facts sont écrits dans le code.`,
      ],
      next: `L’interface tourne sur des données factices, sans déploiement ni cadrage écrit. Je ne le présente donc que comme un prototype.`,
    },
    en: {
      period: 'May 11 → Jul 2, 2026',
      why: `Bringing goals, fitness, nutrition, career, habits and journal into one place, with an AI coach.`,
      how: [
        `Eight pages: dashboard, fitness, nutrition, career, goals, habits, journal, settings.`,
        `An XP system rewards each action.`,
        `The Claude model (Haiku) produces insights that are stored.`,
        `Google Calendar and Open Food Facts connectors are written in the code.`,
      ],
      next: `The interface runs on sample data, with no deployment or written scoping, so I only present it as a prototype.`,
    },
  },

  wandr: {
    fr: {
      why: `Donner envie de marcher dans sa ville en transformant l’exploration en jeu.`,
      how: [
        `La carte se révèle au fil de la position.`,
        `On collecte des tampons en visitant des lieux.`,
        `L’XP alimente un classement.`,
      ],
      decisions: [
        `L’app fonctionne sans backend : stockage local et lieux préchargés.`,
        `Firebase (auth anonyme et Firestore) reste optionnel, pour la sauvegarde cloud et le classement.`,
      ],
      next: `Pas encore de test sur le terrain ni de mesure de rétention.`,
    },
    en: {
      why: `Making you want to walk your city by turning exploration into a game.`,
      how: [
        `The map reveals itself as your position moves.`,
        `You collect stamps by visiting places.`,
        `XP feeds a leaderboard.`,
      ],
      decisions: [
        `The app works without a backend: local storage and preloaded places.`,
        `Firebase (anonymous auth and Firestore) stays optional, for cloud save and the leaderboard.`,
      ],
      next: `No field test yet and no retention measurement.`,
    },
  },

  fooder: {
    fr: {
      why: `« On mange où ce soir ? » : on ne sait jamais. Je voulais qu’on trouve un resto qui donne envie en quelques swipes, sans prise de tête.`,
      how: [
        `Un onboarding court recueille les goûts, les régimes et le budget.`,
        `Le paquet propose des restos ouverts à cet instant, autour de la position et du rayon choisis.`,
        `MIAM ou BOF : à droite on garde, à gauche on passe.`,
        `Les coups de cœur vont dans Favoris, en liste ou sur une carte, avec l’itinéraire.`,
      ],
      decisions: [
        `Aucune fausse donnée : les fiches de démonstration sont retirées du vrai paquet, et aucun « partenaire » n’est affiché sans contrat.`,
        `Le paquet ne montre que des restos confirmés ouverts. Coût mesuré : 53 % des fiches n’ont pas d’horaires connus et disparaissent.`,
        `La carte est fusionnée dans Favoris : 4 onglets (Découvrir, Fil, Favoris, Profil).`,
        `Les bons « Mes cadeaux » sont étiquetés « exemple » et sans bouton « Utiliser » tant qu’aucun restaurant n’est partenaire.`,
        `Méthode : un chantier à la fois, avec validation avant le code (audit, spec, UX, UI, développement, QA).`,
      ],
      proof: [
        { label: 'Fiches présentables à Toulouse', value: '3 228' },
        { label: 'Icônes de plats', value: '52, couvrant 97,1 % des fiches' },
        { label: 'Offre gratuite', value: '20 swipes par jour' },
      ],
      next: `La bêta est en ligne. Il me manque les métriques d’usage, et le Premium est simulé : aucun paiement réel pour l’instant.`,
    },
    en: {
      why: `"Where do we eat tonight?": we never know. I wanted people to find a restaurant they crave in a few swipes, no fuss.`,
      how: [
        `A short onboarding collects tastes, diets and budget.`,
        `The deck offers restaurants open right now, around the chosen position and radius.`,
        `YUM or MEH: right to keep, left to pass.`,
        `Favourites go into a list or a map view, with directions.`,
      ],
      decisions: [
        `No fake data: demo cards are out of the real deck, and no "partner" is shown without a contract.`,
        `The deck only shows restaurants confirmed open. Measured cost: 53% of listings have no known hours and drop out.`,
        `The map is merged into Favourites: 4 tabs (Discover, Feed, Favourites, Profile).`,
        `"My gifts" vouchers are labelled "example" and have no "Use" button until a restaurant partners.`,
        `Method: one workstream at a time, validated before code (audit, spec, UX, UI, development, QA).`,
      ],
      proof: [
        { label: 'Presentable listings in Toulouse', value: '3,228' },
        { label: 'Dish icons', value: '52, covering 97.1% of listings' },
        { label: 'Free tier', value: '20 swipes a day' },
      ],
      next: `The beta is live. I’m missing usage metrics, and Premium is simulated: no real payment yet.`,
    },
  },

  'tinder-voyages': {
    fr: {
      why: `Choisir où partir quand on sait seulement qu’on veut partir quelque part, avec son budget.`,
      how: [
        `Une interface de swipe de destinations.`,
        `Un backend FastAPI interroge plusieurs fournisseurs (Amadeus, Kiwi, données factices) derrière un cache.`,
      ],
      next: `Amadeus Self-Service et Kiwi ont fermé : ce prototype ne peut plus tourner sur de vraies données. Départs reprend le même problème avec une source vivante.`,
    },
    en: {
      why: `Choosing where to go when you only know you want to go somewhere, on a budget.`,
      how: [
        `A destination-swiping interface.`,
        `A FastAPI backend queries several providers (Amadeus, Kiwi, sample data) behind a cache.`,
      ],
      next: `Amadeus Self-Service and Kiwi have shut down: this prototype can no longer run on real data. Départs picks up the same problem with a live source.`,
    },
  },

  'fit-progress': {
    fr: {
      period: '27 avr. 2026',
      why: `Rester motivé pour s’entraîner en faisant évoluer un avatar à chaque séance.`,
      how: [`Les séances sont enregistrées en local (SQLite).`, `L’avatar gagne des niveaux.`, `Des notifications rappellent la prochaine séance.`],
      next: `Pas de capture ni de mesure d’usage pour l’instant.`,
    },
    en: {
      period: 'Apr 27, 2026',
      why: `Staying motivated to train by evolving an avatar after each session.`,
      how: [`Sessions are stored locally (SQLite).`, `The avatar levels up.`, `Notifications remind you of the next session.`],
      next: `No screenshot and no usage measurement yet.`,
    },
  },

  cineappmovies: {
    fr: {
      period: '10 mai 2026',
      why: `Voir au même endroit les films à l’affiche à Toulouse et les plateformes où les trouver (Netflix, Prime Video, Disney+).`,
      how: [
        `Les films viennent de l’API TMDB.`,
        `Des filtres par plateforme et un tri par date, popularité ou note.`,
        `Une fiche détaillée et des recommandations.`,
      ],
      next: `L’intégration des séances en salle n’existe pas dans le code : le type est prévu, l’appel ne l’est pas.`,
    },
    en: {
      period: 'May 10, 2026',
      why: `Seeing in one place the films showing in Toulouse and the platforms where to watch them (Netflix, Prime Video, Disney+).`,
      how: [
        `Films come from the TMDB API.`,
        `Filters by platform and sorting by date, popularity or rating.`,
        `A detail page and recommendations.`,
      ],
      next: `Cinema showtime integration doesn’t exist in the code: the type is there, the call isn’t.`,
    },
  },

  'rpg-life': {
    fr: {
      period: '11 mai 2026',
      why: `Transformer la vie quotidienne en RPG : une tâche faite devient de l’expérience gagnée.`,
      how: [`Des quêtes du jour.`, `Chaque quête rapporte de l’XP.`, `L’XP fait monter de niveau.`],
      decisions: [
        `Direction artistique tranchée : Jet Set Radio × JoJo.`,
        `Liste écrite de ce que l’app n’est pas : ni dashboard gris, ni gamification enfantine.`,
        `Règle d’arbitrage écrite entre les consignes de design quand elles se contredisent.`,
      ],
    },
    en: {
      period: 'May 11, 2026',
      why: `Turning daily life into an RPG: a finished task becomes earned experience.`,
      how: [`Daily quests.`, `Each quest earns XP.`, `XP levels you up.`],
      decisions: [
        `A bold art direction: Jet Set Radio × JoJo.`,
        `A written list of what the app is not: no grey dashboard, no childish gamification.`,
        `A written tie-break rule between design guidelines when they conflict.`,
      ],
    },
  },

  kawaii: {
    fr: {
      period: '16 mai 2026',
      why: `Une exploration visuelle : un tamagotchi maximaliste, pour tester une direction artistique très chargée.`,
      how: [`Un compagnon virtuel vit dans l’interface.`, `Tout le décor est pensé comme un univers kawaii.`],
    },
    en: {
      period: 'May 16, 2026',
      why: `A visual exploration: a maximalist tamagotchi, to test a very busy art direction.`,
      how: [`A virtual companion lives in the interface.`, `The whole setting is built as a kawaii universe.`],
    },
  },

  natsukashii: {
    fr: {
      period: '15 mai 2026',
      why: `Une exploration visuelle d’une ambiance nostalgique, avec des images générées.`,
      how: [`Une scène de nuit pluvieuse en ouverture.`, `Les visuels sont générés par IA puis intégrés dans le site.`],
    },
    en: {
      period: 'May 15, 2026',
      why: `A visual exploration of a nostalgic mood, with generated images.`,
      how: [`A rainy night scene opens the site.`, `Visuals are AI-generated, then integrated into the site.`],
    },
  },

  'derniere-note': {
    fr: {
      period: '29 → 30 sept. 2026',
      why: `Un jeu où agir en rythme sur la musique est la mécanique centrale, même avec un morceau que le joueur ajoute lui-même.`,
      how: [
        `« Le Swing » : chaque action se joue sur le temps de la musique.`,
        `Trois quartiers à parcourir.`,
        `Les sprites pixel art sont générés en local (ComfyUI, SDXL et LoRA, palette Resurrect 64), puis normalisés par une chaîne d’outils maison.`,
      ],
      decisions: [
        `Piliers écrits : le combat d’abord, un polish poussé.`,
        `Outils 100 % gratuits et aucun plugin externe.`,
        `Les musiques protégées par le droit d’auteur restent réservées au prototype personnel ; les effets sonores sont libres (CC0).`,
      ],
      proof: [
        { label: 'Commits', value: '14' },
        { label: 'Version', value: '0.5' },
      ],
      next: `Pas encore de playtests : il me faut des retours de joueurs.`,
    },
    en: {
      period: 'Sep 29 → 30, 2026',
      why: `A game where acting on the beat is the core mechanic, even with a track the player adds themselves.`,
      how: [
        `"The Swing": each action is played on the beat.`,
        `Three districts to explore.`,
        `Pixel-art sprites are generated locally (ComfyUI, SDXL and LoRA, Resurrect 64 palette), then normalised by a home-made toolchain.`,
      ],
      decisions: [
        `Written pillars: combat first, heavy polish.`,
        `100% free tools and no external plugin.`,
        `Copyrighted music stays reserved for the personal prototype; sound effects are free (CC0).`,
      ],
      proof: [
        { label: 'Commits', value: '14' },
        { label: 'Version', value: '0.5' },
      ],
      next: `No playtests yet: I need player feedback.`,
    },
  },

  'one-piece': {
    fr: {
      period: '4 → 5 oct. 2026',
      why: `Un jeu DS sorti uniquement au Japon, injouable pour les fans francophones.`,
      how: [
        `J’extrais les 2 519 fichiers de la ROM.`,
        `9 134 textes uniques (12 825 emplacements, environ 298 Ko en Shift-JIS) sont extraits, traduits par 61 lots, puis réinsérés.`,
        `1 778 images sont décodées et ré-encodées en français.`,
        `Je livre un patch xdelta avec un mode d’emploi grand public.`,
      ],
      decisions: [
        `La ROM originale n’est jamais modifiée : on livre un patch, pas le jeu.`,
        `Les images sont traduites en plus des textes.`,
        `Un mode d’emploi pour le grand public (LISEZMOI).`,
      ],
      proof: [
        { label: 'Fichiers', value: '2 519' },
        { label: 'Textes uniques', value: '9 134' },
        { label: 'Images retraduites', value: '1 778' },
      ],
      next: `Pas encore de retours de joueurs, ni de mesure de la part relue à la main.`,
    },
    en: {
      period: 'Oct 4 → 5, 2026',
      why: `A DS game released only in Japan, unplayable for French-speaking fans.`,
      how: [
        `I extract the ROM’s 2,519 files.`,
        `9,134 unique texts (12,825 slots, about 298 KB in Shift-JIS) are extracted, translated in 61 batches, then reinserted.`,
        `1,778 images are decoded and re-encoded in French.`,
        `I ship an xdelta patch with a plain-language guide.`,
      ],
      decisions: [
        `The original ROM is never modified: we ship a patch, not the game.`,
        `Images are translated as well as text.`,
        `A plain-language guide for the general public (README).`,
      ],
      proof: [
        { label: 'Files', value: '2,519' },
        { label: 'Unique texts', value: '9,134' },
        { label: 'Images retranslated', value: '1,778' },
      ],
      next: `No player feedback yet, and no measure of how much was hand-reviewed.`,
    },
  },

  'ps2-skater': {
    fr: {
      why: `Voir si un agent IA qui pilote Blender peut produire un personnage low-poly dans l’esprit Dreamcast et PS2.`,
      how: [
        `Un serveur MCP relie l’agent à Blender.`,
        `Le personnage est construit par script (environ 1 800 triangles) : jambes fines, énormes chaussures roller, lunettes shutter shades.`,
        `Rendu en cel-shading avec contours, selon la technique de la coque inversée.`,
      ],
      decisions: [`Ce skater a servi de référence au personnage pixel art animé de ce portfolio (généré avec PixelLab).`],
      next: `Il reste un prototype : pas d’animation 3D ni de jeu autour.`,
    },
    en: {
      why: `To see whether an AI agent driving Blender can produce a low-poly character in the Dreamcast and PS2 spirit.`,
      how: [
        `An MCP server connects the agent to Blender.`,
        `The character is built by script (about 1,800 triangles): thin legs, huge roller skates, shutter shades.`,
        `Rendered in cel-shading with outlines, using the inverted-hull technique.`,
      ],
      decisions: [`This skater served as the reference for this portfolio’s animated pixel-art character (generated with PixelLab).`],
      next: `It remains a prototype: no 3D animation and no game around it.`,
    },
  },

  'overwatch-nexus': {
    fr: {
      period: '10 → 15 mai 2026',
      why: `Choisir vite un héros adapté à la composition adverse en partie classée.`,
      how: [
        `On renseigne la map, le rôle et la composition adverse.`,
        `Les recommandations pondèrent la map, le rôle et les statistiques.`,
        `Chaque héros affiche un score, une confiance, un winrate et les raisons du choix.`,
      ],
      next: `La provenance des winrates n’est pas documentée et la qualité des recommandations n’est pas mesurée.`,
    },
    en: {
      period: 'May 10 → 15, 2026',
      why: `Quickly picking a hero suited to the enemy team in ranked play.`,
      how: [
        `You enter the map, your role and the enemy composition.`,
        `Recommendations weigh map, role and stats.`,
        `Each hero shows a score, a confidence, a win rate and the reasons for the pick.`,
      ],
      next: `The source of the win rates isn’t documented and the quality of the picks isn’t measured.`,
    },
  },

  undercover: {
    fr: {
      period: '11 → 19 mai 2026',
      why: `Un jeu de soirée d’imposteur pour les fans de manga.`,
      how: [`10 univers manga et 520 noms de personnages.`, `Jusqu’à 12 joueurs.`, `Des paires de mots cohérentes mais piégeuses.`],
    },
    en: {
      period: 'May 11 → 19, 2026',
      why: `A party game of hidden impostors for manga fans.`,
      how: [`10 manga universes and 520 character names.`, `Up to 12 players.`, `Word pairs that are coherent but tricky.`],
    },
  },

  scintila: {
    fr: {
      period: '22 mai 2026',
      why: `Une maquette de site vitrine pour un commerce local d’Aussonne.`,
      how: [`Une page unique en HTML, CSS et JavaScript.`, `Le ton et le contenu sont pensés pour le commerce.`],
    },
    en: {
      period: 'May 22, 2026',
      why: `A showcase site mock-up for a local business in Aussonne.`,
      how: [`A single page in HTML, CSS and JavaScript.`, `Tone and content are tailored to the business.`],
    },
  },
  '245th': {
    fr: {
      period: '22 mai 2026',
      why: `Une maquette de site vitrine pour un commerce local d’Aussonne.`,
      how: [`Une page unique en HTML, CSS et JavaScript.`, `Le ton et le contenu sont pensés pour le commerce.`],
    },
    en: {
      period: 'May 22, 2026',
      why: `A showcase site mock-up for a local business in Aussonne.`,
      how: [`A single page in HTML, CSS and JavaScript.`, `Tone and content are tailored to the business.`],
    },
  },
  'cul-de-bouteille': {
    fr: {
      period: '22 mai 2026',
      why: `Une maquette de site vitrine pour un commerce local d’Aussonne.`,
      how: [`Une page unique en HTML, CSS et JavaScript.`, `Le ton et le contenu sont pensés pour le commerce.`],
    },
    en: {
      period: 'May 22, 2026',
      why: `A showcase site mock-up for a local business in Aussonne.`,
      how: [`A single page in HTML, CSS and JavaScript.`, `Tone and content are tailored to the business.`],
    },
  },
  'flo-wear': {
    fr: {
      period: '22 mai 2026',
      why: `Une maquette de site vitrine pour une boutique locale.`,
      how: [`Une page unique en HTML, CSS et JavaScript.`, `Le ton et le contenu sont pensés pour la boutique.`],
    },
    en: {
      period: 'May 22, 2026',
      why: `A showcase site mock-up for a local shop.`,
      how: [`A single page in HTML, CSS and JavaScript.`, `Tone and content are tailored to the shop.`],
    },
  },

  plomberie: {
    fr: {
      why: `Un artisan plombier a besoin de gérer ses clients, ses devis et ses factures. Je voulais un outil taillé pour son métier.`,
      how: [
        `Un catalogue de prestations prédéfinies.`,
        `Un devis se compose de lignes de prestations pour un client.`,
        `Une facture reprend la même structure de lignes.`,
      ],
      decisions: [`Un modèle de données centré sur le métier : utilisateur, prestations, clients, devis, factures et leurs lignes.`, `Interface pensée d’abord pour le mobile.`],
      proof: [{ label: 'Modèles de données', value: '7' }],
      next: `L’usage réel par l’artisan et le temps gagné par devis ne sont pas documentés.`,
    },
    en: {
      why: `A plumber needs to manage clients, quotes and invoices. I wanted a tool shaped for the trade.`,
      how: [
        `A catalogue of predefined services.`,
        `A quote is made of service lines for a client.`,
        `An invoice reuses the same line structure.`,
      ],
      decisions: [`A trade-centred data model: user, services, clients, quotes, invoices and their lines.`, `Mobile-first interface.`],
      proof: [{ label: 'Data models', value: '7' }],
      next: `Real use by the tradesman and time saved per quote are not documented.`,
    },
  },

  spotify: {
    fr: {
      period: '17 → 27 avr. 2026',
      why: `Un exercice de cas produit : le partage social sur Spotify est jugé « cassé » par ses utilisateurs les plus engagés.`,
      how: [
        `Diagnostic, cartographie des parties prenantes, persona.`,
        `Trois fonctionnalités priorisées en RICE : Vibe Share, Sound Moment, Friend Pulse.`,
        `Un plan en 3 sprints de 2 semaines, avec bêta fermée puis déploiement progressif.`,
      ],
      decisions: [
        `Priorisation chiffrée : Vibe Share 6 400, Sound Moment 1 200, Friend Pulse 1 200.`,
        `North Star visée : +18 % de streams générés par le partage (un objectif, pas un résultat).`,
        `Garde-fous : vie privée, performance, streams organiques.`,
      ],
      next: `Exercice hypothétique : tous les chiffres sont des objectifs. Le document cite 8 entretiens avec des power users et une statistique externe, à sourcer précisément.`,
    },
    en: {
      period: 'Apr 17 → 27, 2026',
      why: `A product case exercise: social sharing on Spotify is judged "broken" by its most engaged users.`,
      how: [
        `Diagnosis, stakeholder map, persona.`,
        `Three features prioritised with RICE: Vibe Share, Sound Moment, Friend Pulse.`,
        `A plan in 3 two-week sprints, with a closed beta then a gradual rollout.`,
      ],
      decisions: [
        `Scored prioritisation: Vibe Share 6,400, Sound Moment 1,200, Friend Pulse 1,200.`,
        `Target North Star: +18% streams generated by sharing (a goal, not a result).`,
        `Guardrails: privacy, performance, organic streams.`,
      ],
      next: `Hypothetical exercise: every figure is a target. The document cites 8 power-user interviews and an external statistic, both to be precisely sourced.`,
    },
  },

  'trainer-pm': {
    fr: {
      period: '15 sept. 2026',
      why: `M’entraîner aux notions de métriques produit : funnel, cohortes, vanity metrics, North Star.`,
      how: [`Des exercices de lecture de funnel.`, `Des cohortes et de la rétention.`, `Distinguer les vanity metrics des métriques utiles.`],
    },
    en: {
      period: 'Sep 15, 2026',
      why: `Practising product-metrics concepts: funnel, cohorts, vanity metrics, North Star.`,
      how: [`Funnel-reading exercises.`, `Cohorts and retention.`, `Telling vanity metrics from useful ones.`],
    },
  },

  'tiktok-shop': {
    fr: {
      why: `Synchroniser commandes, stock et retours entre TikTok Shop et l’OMS de Shippingbo.`,
      how: [
        `Intégration de l’API TikTok Shop dans le cadre du partenariat officiel 3P de Shippingbo.`,
        `Flux multi-marchés, mapping du catalogue et commandes B2C.`,
      ],
      next: `Les chiffres de résultat de ce cas ne sont pas encore sourcés : je les retire tant que je ne peux pas les prouver.`,
    },
    en: {
      why: `Syncing orders, stock and returns between TikTok Shop and Shippingbo’s OMS.`,
      how: [
        `Integration of the TikTok Shop API as part of Shippingbo’s official 3P partnership.`,
        `Multi-market flows, catalogue mapping and B2C orders.`,
      ],
      next: `This case’s result figures aren’t sourced yet: I’m leaving them out until I can prove them.`,
    },
  },

  portfolios: {
    fr: {
      period: '7 → 13 mai 2026 (v4)',
      why: `Chaque version de ce site m’a appris ce qu’il ne fallait plus faire.`,
      how: [`La v3, sombre et citron vert.`, `La v4, en bureau macOS aux fenêtres déplaçables (48 commits).`, `Puis cette version, repensée à partir de ce que je voulais vraiment montrer.`],
      proof: [{ label: 'Commits de la v4', value: '48' }],
    },
    en: {
      period: 'May 7 → 13, 2026 (v4)',
      why: `Each version of this site taught me what not to do again.`,
      how: [`v3, dark and lime.`, `v4, a macOS desktop with draggable windows (48 commits).`, `Then this version, rebuilt around what I really wanted to show.`],
      proof: [{ label: 'v4 commits', value: '48' }],
    },
  },

  'cv-factory': {
    fr: {
      why: `Adapter mon CV à chaque offre sans jamais toucher à la mise en page.`,
      how: [
        `Tout mon contenu vit dans un JSON source de vérité, tagué et priorisé, avec une traduction anglaise en surcouche.`,
        `Un script génère le HTML puis le PDF A4 avec Chrome.`,
        `Un second script contrôle le nombre de pages et le remplissage.`,
        `Une offre précise se fabrique en écrivant un petit JSON.`,
      ],
      proof: [{ label: 'CV prêts', value: '6 : 3 familles de poste, en français et en anglais' }],
    },
    en: {
      why: `Tailoring my résumé to each job without ever touching the layout.`,
      how: [
        `All my content lives in one source-of-truth JSON, tagged and prioritised, with an English overlay.`,
        `A script builds the HTML then the A4 PDF with Chrome.`,
        `A second script checks page count and fill.`,
        `A specific offer is made by writing a small JSON.`,
      ],
      proof: [{ label: 'Résumés ready', value: '6: 3 job families, in French and English' }],
    },
  },

  'garage-dream': {
    fr: {
      period: '7 avr. 2026',
      why: `Une page one-shot autour de l’automobile, pour mon garage idéal.`,
      how: [`Une page HTML unique.`],
    },
    en: {
      period: 'Apr 7, 2026',
      why: `A one-shot page about cars, for my dream garage.`,
      how: [`A single HTML page.`],
    },
  },

  'design-system': {
    fr: {
      period: '28 avr. 2026',
      why: `Prototyper propre et vite : fixer une fois pour toutes couleurs, typographie et composants.`,
      how: [`Un document markdown spécifie les règles.`, `Il guide mes prototypes, dans l’esprit d’un design system à la Apple.`],
    },
    en: {
      period: 'Apr 28, 2026',
      why: `Prototyping cleanly and fast: fixing colours, typography and components once.`,
      how: [`A markdown document specifies the rules.`, `It guides my prototypes, in the spirit of an Apple-style design system.`],
    },
  },

  'cv-generator': {
    fr: {
      period: '5 → 6 avr. 2026',
      why: `Générer des CV et structurer ma recherche d’emploi avec de petits outils à moi.`,
      how: [`Un générateur de CV avec aperçu en direct.`, `Un guide emploi pour organiser les candidatures.`],
    },
    en: {
      period: 'Apr 5 → 6, 2026',
      why: `Generating résumés and structuring my job search with small tools of my own.`,
      how: [`A résumé generator with live preview.`, `A job-search guide to organise applications.`],
    },
  },

  'job-finder': {
    fr: {
      period: '5 → 6 avr. 2026',
      why: `Chercher moins et postuler mieux pendant ma recherche d’emploi.`,
      how: [`Lecture de mon CV.`, `Collecte d’offres.`, `Score de correspondance entre l’offre et mon profil.`, `Adaptation du CV à l’offre.`],
      next: `Je n’ai pas de trace d’un usage suivi : il reste un prototype.`,
    },
    en: {
      period: 'Apr 5 → 6, 2026',
      why: `Searching less and applying better during my job search.`,
      how: [`Reading my résumé.`, `Collecting offers.`, `Scoring how well an offer matches my profile.`, `Adapting the résumé to the offer.`],
      next: `I have no record of tracked use: it remains a prototype.`,
    },
  },

  'vinted-factory': {
    fr: {
      why: `Un projet tout juste démarré autour de la revente.`,
      how: [`Pour l’instant, seul le squelette Node.js du projet existe.`],
    },
    en: {
      why: `A project that has only just started, around resale.`,
      how: [`For now, only the Node.js skeleton of the project exists.`],
    },
  },

  scripts: {
    fr: {
      period: '21 → 22 sept. 2026',
      why: `Automatiser de petites recherches personnelles.`,
      how: [`« Recherche bagnole » : un scraper Python pour les annonces.`, `« Dino JEV » : un script de test.`],
    },
    en: {
      period: 'Sep 21 → 22, 2026',
      why: `Automating small personal searches.`,
      how: [`"Car search": a Python scraper for listings.`, `"Dino JEV": a test script.`],
    },
  },
}
