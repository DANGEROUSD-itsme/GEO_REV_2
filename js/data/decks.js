/* ==========================================================================
   decks.js — the six flashcard sub-decks.
   Ported verbatim from the verified curriculum content. Every value that the
   UI shows lives here — the pages render from this data and hold no copy of
   their own, so a fact is corrected in exactly one place.
   ========================================================================== */
window.GEO = window.GEO || {};
GEO.data = GEO.data || {};

GEO.data.DECKS = [
  { id:'defs', name:'Core Definitions', icon:'book-marked', blurb:'The five terms you must be able to define precisely.',
    cards:[
      { q:'Define <em>Interconnection</em>.', a:'The relationship between all things, both animate and inanimate, and all processes, both natural and human, on Earth.' },
      { q:'Define <em>Supply Chain</em>.', a:'A complex system of organisations, people, activities, information and resources involved in moving a product or service from supplier to customer — transforming natural resources, raw materials and components into a finished product delivered to the end customer.' },
      { q:'Define <em>Logistics</em>.', a:'The detailed management of the flow of things between the point of origin and the point of consumption to meet customer or corporate requirements. It covers physical goods (food, materials, equipment) and abstract assets (time, information), and integrates transport, warehousing, inventory and packaging.' },
      { q:'Define <em>Overtourism</em>.', a:'The phenomenon whereby certain places of interest are visited by excessive numbers of tourists, causing undesirable effects and negative impacts on that place’s environment, local people, culture and infrastructure.' },
      { q:'Define <em>Perception</em> (of place).', a:'“The way in which something is regarded, understood, or interpreted.” It is shaped by age, cultural background, social background, media and expectations, and socio-economic and environmental factors.' },
      { q:'Define <em>Tourism</em>.', a:'The business of attracting, accommodating and entertaining tourists, and the business of operating tours.' }
    ] },
  { id:'criteria', name:'The Four Connection Criteria', icon:'sparkles', blurb:'Spiritual, Economic, Cultural, Historical — plus the Murujuga case study.',
    cards:[
      { q:'What is a <em>Spiritual</em> connection to place? Give the case study.', a:'A deep sacred, emotional or belief-based connection.<br><br><strong>Case study:</strong> Indigenous Australians’ connection to Murujuga (the Burrup Peninsula), Pilbara WA — sacred ancient rock art of profound spiritual significance linking custodians to ancestral Country.' },
      { q:'What is an <em>Economic</em> connection to place? Give the case study.', a:'A connection driven by employment, income, trade or resource extraction.<br><br><strong>Case study (same place, opposing lens):</strong> resource and mining corporations view the Burrup Peninsula as a major industrial hub for natural gas processing and mining exports.' },
      { q:'What is a <em>Cultural</em> connection to place?', a:'A social connection based on shared community history, traditions, language and cultural practices.' },
      { q:'What is a <em>Historical</em> connection to place?', a:'A connection established through past events, heritage buildings or ancestral lineage.' },
      { q:'What is <em>dual naming</em> and give an example.', a:'A tool used to recognise First Nations connections to place by using both names — for example Mandurah / <strong>Mandjoogoordap</strong>.' },
      { q:'Why can two groups perceive the Burrup Peninsula so differently?', a:'Because perception is shaped by background: cultural and spiritual heritage produces a sacred, non-substitutable valuation of the land, while an economic/industrial background produces a valuation measured in output, jobs and export revenue. Same place, two legitimate but competing perceptions.' },
      { q:'List the factors that shape a person’s perception of place.', a:'Age; cultural background; social background; media and expectations; socio-economic and environmental factors.' }
    ] },
  { id:'ict', name:'ICT Case Studies', icon:'wifi', blurb:'Four examples of ICT interconnecting people globally.',
    cards:[
      { q:'<em>School of the Air</em> — what does it demonstrate?', a:'Satellite and radio networks connect geographically isolated students in remote Australia to teachers and schooling. It shows ICT overcoming distance so remote students access the same services as urban students.' },
      { q:'<em>Royal Flying Doctor Service (RFDS)</em> — what does it demonstrate?', a:'Telehealth, radio communications and emergency aviation networks link remote rural patients to life-saving medical care — ICT combined with air transport turns an isolated location into one with access to specialist healthcare.' },
      { q:'<em>Offshore call centres</em> — what do they demonstrate?', a:'Western corporations outsource customer service and IT support to business-processing hubs in India and the Philippines. ICT allows a service to be produced in one country and consumed in another — an interconnection of labour markets, not just goods.' },
      { q:'<em>iPhone sourcing</em> — what does it demonstrate?', a:'A single phone contains 300+ components; materials such as gold, silicon, cobalt, silver and rare-earth elements are mined globally across complex international networks. One everyday device interconnects dozens of countries.' }
    ] },
  { id:'toyota', name:'Car Supply Chain', icon:'car', blurb:'Country ↔ component recall practice from the Toyota supply chain.',
    cards:[
      { q:'Toyota supply chain: what does <strong>Germany</strong> supply?', a:'Locks, pistons, cylinder head gaskets, batteries.' },
      { q:'Toyota supply chain: what does <strong>Britain</strong> supply?', a:'Gearboxes, steering columns, engines.' },
      { q:'Toyota supply chain: what does <strong>Mauritius</strong> supply?', a:'Wiring harnesses.' },
      { q:'Toyota supply chain: what does <strong>Canada</strong> supply?', a:'Glass, radios.' },
      { q:'Toyota supply chain: what does <strong>Brazil</strong> supply?', a:'Oil pumps, distributors, body panels.' },
      { q:'Toyota supply chain: what does <strong>Mexico</strong> supply?', a:'Wheels, brake discs.' },
      { q:'Toyota supply chain: what does the <strong>Middle East</strong> (Bahrain, Kuwait, Oman, Qatar, Saudi Arabia, UAE) supply?', a:'Petroleum.' },
      { q:'Toyota supply chain: what does <strong>France</strong> supply?', a:'Alternators, master cylinders, clutch release bearings.' },
      { q:'Toyota supply chain: what does <strong>Indonesia</strong> supply?', a:'Seat stitching, hose clamps, weatherstrips.' },
      { q:'Toyota supply chain: what does <strong>India</strong> supply?', a:'Carburetors, suspension bushes, steering shafts.' },
      { q:'Toyota supply chain: what does the <strong>Netherlands</strong> supply?', a:'Tires, paint.' },
      { q:'Toyota supply chain: what does <strong>Italy</strong> supply?', a:'Cylinder heads, defroster grills.' },
      { q:'Which two countries both supply <strong>suspension bushes</strong>?', a:'South Africa (with clutch cases) and India (with carburetors and steering shafts).' }
    ] },
  { id:'paris-stats', name:'Paris Key Statistics', icon:'bar-chart-3', blurb:'The numbers that turn a Part C answer into an A+ answer.',
    cards:[
      { q:'Paris tourist revenue in 2025?', a:'~<strong>€24 billion</strong> — a record, and an 8% increase on 2019.' },
      { q:'How much did international visitors alone contribute?', a:'<strong>€16 billion</strong> of the ~€24 billion total.' },
      { q:'How many people does tourism employ in the Paris region?', a:'<strong>290,000+</strong> people.' },
      { q:'How many short-term holiday rentals squeeze Paris housing supply?', a:'~<strong>75,000</strong> short-term holiday rentals (e.g. Airbnb), pricing residents out of the housing market.' },
      { q:'How many tourists arrive in Paris annually?', a:'~<strong>50 million</strong> tourist arrivals per year.' },
      { q:'What did fines for illegal short-term letting show between 2021 and 2023?', a:'Court-issued fines fell from <strong>€3.5 million in 2021</strong> to <strong>€535k in the first 7 months of 2023</strong>, indicating improved compliance and fewer violations.' },
      { q:'What is the fine range for breaching Paris short-term rental rules?', a:'<strong>€15,000 to €100,000</strong>, alongside a 120-day annual cap and mandatory centralised digital registration.' },
      { q:'Which Paris energy-efficiency rental deadlines matter for housing?', a:'G-rated rentals banned in <strong>2025</strong> and F-rated rentals banned in <strong>2028</strong> — further shrinking the housing stock available to residents.' },
      { q:'Who warned Paris risks becoming an “open-air museum”, and what did they mean?', a:'Mayor <strong>Anne Hidalgo</strong> and Deputy <strong>Ian Brossat</strong> — warning that residents are being displaced until the city serves only tourists, not the people who live there.' },
      { q:'Name Paris’s key tourist attractions.', a:'Eiffel Tower, Louvre, Notre-Dame, Arc de Triomphe, Sacré-Cœur and Montmartre — served by a high-density Metro, bus and train network.' }
    ] },
  { id:'paris-strats', name:'Paris Strategies', icon:'shield-check', blurb:'Mechanism / Pros / Cons / Effectiveness for all three strategies.',
    cards:[
      { q:'<strong>Louvre timed entry</strong> — mechanism?', a:'Strict mandatory pre-booked entry tickets since 2026; visitors without a reservation are turned away at the door.' },
      { q:'<strong>Louvre timed entry</strong> — pros, cons and effectiveness?', a:'<strong>Pros:</strong> manages flow inside, spreads visitors through the day, prevents indoor overcrowding.<br><strong>Cons:</strong> does not reduce overall tourist numbers in Paris; tickets sell out weeks in advance.<br><strong>Rating:</strong> Moderately Effective.' },
      { q:'<strong>Airbnb regulations</strong> — mechanism?', a:'Primary-residence rentals capped at 120 days/year (proposed drop to 90 days in hot-spots), centralised digital registration required, and fines of €15,000–€100,000.' },
      { q:'<strong>Airbnb regulations</strong> — pros, cons and effectiveness?', a:'<strong>Pros:</strong> slows housing conversion; encourages compliance — fines fell from €3.5M (2021) to €535k (first 7 months of 2023).<br><strong>Cons:</strong> housing shortage and high rents remain; enforcement is difficult and imperfect.<br><strong>Rating:</strong> Moderately Effective.' },
      { q:'<strong>Active tourist dispersal</strong> — mechanism?', a:'Promoting lesser-known areas (19th &amp; 20th Arrondissements, Belleville) and nearby regional towns (Fontainebleau) via improved transport links and targeted advertising.' },
      { q:'<strong>Active tourist dispersal</strong> — pros, cons and effectiveness?', a:'<strong>Pros:</strong> targets root causes by redistributing crowds; spreads spending to local neighbourhoods; relieves hot-spots like Montmartre; low-cost and scalable via existing tourism boards.<br><strong>Cons:</strong> depends on tourists being willing to leave the primary sites.<br><strong>Rating:</strong> Very Effective Potential — supported by successful models in Amsterdam and Venice.' },
      { q:'Which strategy best addresses the <em>cause</em> rather than the <em>symptom</em> of overtourism, and why?', a:'Active tourist dispersal. Timed entry and rental caps manage or contain pressure at hot-spots, but dispersal redistributes the tourist load itself and pushes spending into under-visited neighbourhoods, tackling both overcrowding and economic leakage.' }
    ] }
];

/* ------------------------------------------------------ 9. TEET BUILDER */
