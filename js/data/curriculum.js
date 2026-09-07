/* ==========================================================================
   curriculum.js: syllabus content: definitions, perception, ICT, transport, tourism, Paris.
   Ported verbatim from the verified curriculum content. Every value that the
   UI shows lives here. The pages render from this data and hold no copy of
   their own, so a fact is corrected in exactly one place.
   ========================================================================== */
window.GEO = window.GEO || {};
GEO.data = GEO.data || {};

GEO.data.EXAM = {
  duration: 45,
  total: 37,
  parts: [
    { id:'A', name:'Part A: Multiple Choice',            marks:12, color:'#837ffb', note:'12 questions × 1 mark' },
    { id:'B', name:'Part B: Short Answer & Data Analysis', marks:13, color:'#43c78f', note:'3 questions (2 + 4 + 7)' },
    { id:'C', name:'Part C: Extended Response',           marks:12, color:'#e0a044', note:'1 question (6 + 4 + 2)' }
  ],
  model: 'T.E.E.T: Topic sentence, Explanation, Example, Tie-back'
};

/* --------------------------------------------------- 2. CORE DEFINITIONS */

GEO.data.DEFINITIONS = [
  { term:'Interconnection', icon:'share-2',
    text:'The relationship between all things, both animate and inanimate, and all processes, both natural and human, on Earth.' },
  { term:'Tourism', icon:'palmtree',
    text:'The business of attracting, accommodating and entertaining tourists, and the business of operating tours.' },
  { term:'Overtourism', icon:'users',
    text:'The phenomenon whereby certain places of interest are visited by excessive numbers of tourists, causing undesirable effects and negative impacts on that place’s environment, local people, culture and infrastructure.' },
  { term:'Supply Chain', icon:'workflow',
    text:'A complex system of organisations, people, activities, information and resources involved in moving a product or service from supplier to customer, transforming natural resources, raw materials and components into a finished product delivered to the end customer.' },
  { term:'Logistics', icon:'truck',
    text:'The detailed management of the flow of things between the point of origin and the point of consumption to meet customer or corporate requirements. It covers physical goods (food, materials, equipment) and abstract assets (time, information), integrating transport, warehousing, inventory and packaging.' }
];

/* ------------------------------------------------ 3. PERCEPTIONS OF PLACE */

GEO.data.PERCEPTION = {
  definition: '“The way in which something is regarded, understood, or interpreted.”',
  factors: ['Age','Cultural background','Social background','Media and expectations','Socio-economic factors','Environmental factors'],
  criteria: [
    { key:'spiritual', name:'Spiritual', icon:'sparkles',
      desc:'Deep sacred, emotional or belief-based connections to a place.',
      caseTitle:'Case study: Murujuga (Burrup Peninsula), Pilbara WA',
      caseText:'Indigenous Australians hold a profound spiritual connection to Murujuga, home to sacred ancient rock art (petroglyphs) of deep cultural and spiritual significance, tying present-day custodians to ancestral Country.' },
    { key:'economic', name:'Economic', icon:'banknote',
      desc:'Connections driven by employment, income, trade or resource extraction.',
      caseTitle:'Case study: the opposing lens on the same place',
      caseText:'Resource and mining corporations view the Burrup Peninsula as a major industrial hub for natural gas processing and mining exports, valuing the same landscape for output, jobs and export revenue rather than for its sacredness.' },
    { key:'cultural', name:'Cultural', icon:'drama',
      desc:'Social connections based on shared community history, traditions, language and cultural practices.',
      caseTitle:'Applying it',
      caseText:'Communities connect to place through festivals, language, food, art and shared customs practised in that location, perception is shaped by the culture a person belongs to.' },
    { key:'historical', name:'Historical', icon:'landmark',
      desc:'Connection established through past events, heritage buildings or ancestral lineage.',
      caseTitle:'Applying it',
      caseText:'A place can be valued because something significant happened there, because heritage architecture survives, or because a person’s ancestors lived there.' }
  ],
  dualNaming: 'Dual naming is a tool used to recognise First Nations connections to place, for example Mandurah is also named Mandjoogoordap.',
  twoLenses: {
    place: 'Burrup Peninsula / Murujuga, Pilbara WA',
    left:  { label:'Spiritual lens', who:'Indigenous Australians (Traditional Custodians)', icon:'sparkles',
             points:['Sacred ancient rock art with deep spiritual significance','Place is inseparable from identity, law and ancestry','Value is intrinsic: it cannot be substituted or relocated','Industrial emissions and development are seen as a threat to sacred heritage'] },
    right: { label:'Economic lens', who:'Resource and mining corporations', icon:'factory',
             points:['Major industrial hub for natural gas processing','Export node for mining products feeding global supply chains','Value is measured in output, employment and export revenue','Development is framed as national and regional economic benefit'] },
    takeaway: 'One place, two legitimate but competing perceptions. Contested perspectives like this are a classic exam angle, always name WHO holds the perception and WHY their background produces it.'
  }
};

/* ------------------------------------------------------ 4. ICT CASE STUDIES */

GEO.data.ICT = {
  intro: 'The internet and personal devices interconnect people globally, linking them to goods, services, information and to other people, almost instantly and across enormous distances. ICT collapses the friction of distance so that isolation no longer means disconnection.',
  cases: [
    { name:'School of the Air', icon:'radio',
      desc:'Satellite and radio networks connect geographically isolated students across remote Australia to teachers, classrooms and schooling.',
      matters:'Why it matters: ICT overcomes the barrier of distance so remote students access the same services as urban students.' },
    { name:'Royal Flying Doctor Service (RFDS)', icon:'plane',
      desc:'Telehealth, radio and communications networks combined with emergency aviation link remote rural patients to life-saving medical care.',
      matters:'Why it matters: interconnection through ICT plus transport turns an isolated location into one with access to specialist healthcare.' },
    { name:'Offshore call centres', icon:'headset',
      desc:'Western corporations outsource customer service and IT support to business-processing hubs in India and the Philippines.',
      matters:'Why it matters: ICT lets a service be produced in one country and consumed in another, an interconnection of labour markets, not just goods.' },
    { name:'iPhone sourcing', icon:'smartphone',
      desc:'A single phone contains 300+ components. Materials such as gold, silicon, cobalt, silver and rare-earth elements are mined globally across complex international networks.',
      matters:'Why it matters: an everyday device is physical proof of a worldwide supply chain, one product interconnects dozens of countries.' }
  ]
};

/* -------------------------------------------- 5. TRANSPORT & GLOBAL LOGISTICS */

GEO.data.TRANSPORT = {
  modes: [
    { name:'Shipping', icon:'ship', stat:'~90%',
      desc:'Around 90% of all international physical trade in goods moves by sea, bulk oil, gas and grain plus consumer goods in containers.',
      extra:'Valued at over $18 trillion annually.' },
    { name:'Air transport', icon:'plane-takeoff', stat:'<24 hrs',
      desc:'Air travel has reshaped the world over the last 100 years, moving high-value goods and millions of international tourists across the globe in under 24 hours.',
      extra:'Speed makes both global tourism and just-in-time manufacturing possible.' }
  ],
  toyota: {
    intro: 'The Toyota car supply chain is a textbook example of globalisation: a single finished vehicle depends on components manufactured in more than twenty countries, moved by integrated shipping, air and road logistics.',
    rows: [
      { country:'Belgium',      parts:'Tubes, seat pads, brakes, radio' },
      { country:'Netherlands',  parts:'Tires, paint' },
      { country:'Denmark',      parts:'Fanbelts' },
      { country:'Norway',       parts:'Exhaust flanges' },
      { country:'Sweden',       parts:'Hose clamps, cylinder bolts' },
      { country:'Germany',      parts:'Locks, pistons, cylinder head gaskets, batteries' },
      { country:'Switzerland',  parts:'Underbody coating, speedometers' },
      { country:'Austria',      parts:'Radiators, heater hoses' },
      { country:'Italy',        parts:'Cylinder heads, defroster grills' },
      { country:'Britain',      parts:'Gearboxes, steering columns, engines' },
      { country:'France',       parts:'Alternators, master cylinders, clutch release bearings' },
      { country:'Spain',        parts:'Air filters, mirrors' },
      { country:'South Africa', parts:'Clutch cases, suspension bushes' },
      { country:'Mauritius',    parts:'Wiring harnesses' },
      { country:'Middle East (Bahrain, Kuwait, Oman, Qatar, Saudi Arabia, UAE)', parts:'Petroleum' },
      { country:'India',        parts:'Carburetors, suspension bushes, steering shafts' },
      { country:'Indonesia',    parts:'Seat stitching, hose clamps, weatherstrips' },
      { country:'Mexico',       parts:'Wheels, brake discs' },
      { country:'Brazil',       parts:'Oil pumps, distributors, body panels' },
      { country:'USA',          parts:'Bearings, bumper shock absorbers' },
      { country:'Canada',       parts:'Glass, radios' }
    ]
  },
  trade: {
    title: 'Global Trade Flow Analysis (Figure 1: Global Trade Flows, 2012)',
    items: [
      { label:'Smallest exporting region', region:'Sub-Saharan Africa', tone:'neg', icon:'trending-down',
        reasons:['Lower manufacturing infrastructure','Exports low-value raw materials rather than finished manufactured goods','Lower regional GDP limits production capacity and trade volume'] },
      { label:'Trade surplus region (exports exceed imports)', region:'East Asia (China / Japan)', tone:'pos', icon:'trending-up',
        reasons:['Massive manufacturing-led economies','Lower domestic production costs','High global demand for finished electronics, machinery and consumer goods'] }
    ]
  }
};

/* ---------------------------------------------------- 6. TYPES OF TOURISM */

GEO.data.TOURISM_TYPES = [
  { name:'Recreational', icon:'umbrella', desc:'Travel for leisure, relaxation and holidaying: beaches, resorts and rest.' },
  { name:'Cultural',     icon:'drama',    desc:'Travel to explore different cultures, lifestyles, art or language.' },
  { name:'Historical',   icon:'landmark', desc:'Touring historic ruins, museums, heritage sites and architecture.' },
  { name:'Event / Ecotourism', icon:'leaf', desc:'Travel for sporting or cultural events; or travel to natural, undisturbed areas designed to conserve the environment and support local communities.' }
];

/* ------------------------------------- 7. CASE STUDY: OVERTOURISM IN PARIS */

GEO.data.PARIS = {
  profile: {
    arrivals: '~50 million tourist arrivals annually',
    attractions: ['Eiffel Tower','Louvre','Notre-Dame','Arc de Triomphe','Sacré-Cœur','Montmartre'],
    infrastructure: 'High-density public transport infrastructure: Metro, buses and trains.'
  },
  tbl: [
    { pillar:'Economic', icon:'banknote',
      positives:[
        'Record tourist revenue of ~€24 billion in 2025, an 8% increase on 2019.',
        'International visitors alone contributed €16 billion.',
        'Employs 290,000+ people across the Paris region.'
      ],
      negatives:[
        'Over-dependency on a volatile sector that collapses in crises.',
        'Severe economic leakage: major tourist spend flows to international hotel chains, global tour operators and Airbnb, bypassing local small businesses.'
      ] },
    { pillar:'Social', icon:'users',
      positives:[
        'Cultural exchange between visitors and residents.',
        'Tourist interest helps preserve local historical heritage.'
      ],
      negatives:[
        'Housing supply squeezed by ~75,000 short-term holiday rentals (e.g. Airbnb), pricing residents out.',
        'Mayor Anne Hidalgo and Deputy Ian Brossat warn of Paris turning into an “open-air museum” serving only tourists.',
        '“Disneyfication” of Montmartre: changing local character, residential conflict over crowds and noise, and the loss of everyday services for residents.'
      ] },
    { pillar:'Environmental', icon:'leaf',
      positives:[
        'Funding generated by tourism can support heritage conservation works.'
      ],
      negatives:[
        'Physical wear and tear on landmarks: Sacré-Cœur, Notre-Dame and the Louvre.',
        'Waste and litter accumulation in high-traffic districts.',
        'Heavy traffic congestion, noise pollution and a high carbon footprint from air and road transport.'
      ],
      policy:'Adaptive policy connection: new energy-efficiency laws in rental housing (banning G-rated rentals from 2025 and F-rated from 2028) intersect with the short-term rental housing crisis, further reducing the stock available to residents.' }
  ],
  strategies: [
    { id:'louvre', name:'Louvre Timed Entry & Capacity Controls', icon:'ticket',
      mechanism:'Strict mandatory pre-booked entry tickets have applied since 2026; visitors without a reservation are turned away at the door.',
      pros:['Effectively manages visitor flow inside the museum','Spreads visitors evenly throughout the day','Prevents dangerous indoor overcrowding'],
      cons:['Does not reduce the overall number of tourists in Paris','Tickets sell out weeks in advance, excluding spontaneous visitors'],
      rating:'Moderately Effective', level:2 },
    { id:'airbnb', name:'Airbnb Short-Term Rental Regulations', icon:'home',
      mechanism:'Primary-residence rentals are capped at 120 days per year (with a proposed drop to 90 days in hot-spots), centralised digital registration is required, and fines range from €15,000 to €100,000.',
      pros:['Slows the conversion of housing into tourist accommodation','Encourages compliance: court-issued fines fell from €3.5 million in 2021 to €535k in the first 7 months of 2023, indicating fewer violations'],
      cons:['The housing shortage and high rent prices remain','Enforcement is difficult and imperfect across tens of thousands of listings'],
      rating:'Moderately Effective', level:2 },
    { id:'dispersal', name:'Active Tourist Dispersal (Proposed Strategy)', icon:'route',
      mechanism:'Promoting alternative, lesser-known areas (the 19th and 20th Arrondissements, Belleville) and nearby regional towns such as Fontainebleau through improved transport links and targeted advertising.',
      pros:['Targets the root cause by redistributing crowds rather than managing them at the door','Spreads economic spending into local neighbourhoods, reducing leakage','Relieves pressure on hot-spots such as Montmartre','Low-cost and scalable through existing tourism boards'],
      cons:['Highly dependent on tourists being willing to travel away from primary sites'],
      rating:'Very Effective Potential', level:3,
      support:'Supported by successful dispersal models already used in Amsterdam and Venice.' }
  ]
};
/* ------------------------------------------------ 8. FLASHCARD SUB-DECKS */

/* Approximate centroids for each supplier in the Toyota chain, in row order,
   plus the assembly plant (Toyota City, Japan). Used by the 3D globe on the
   notes page to place markers and draw the supply arcs. [lat, lon] */
GEO.data.TOYOTA_GEO = [
  [50.5,   4.5],   /* Belgium      */  [52.2,   5.3],   /* Netherlands  */
  [56.0,  10.0],   /* Denmark      */  [61.0,   8.5],   /* Norway       */
  [62.0,  15.0],   /* Sweden       */  [51.0,  10.5],   /* Germany      */
  [46.8,   8.2],   /* Switzerland  */  [47.5,  14.5],   /* Austria      */
  [42.8,  12.8],   /* Italy        */  [54.0,  -2.5],   /* Britain      */
  [46.6,   2.4],   /* France       */  [40.4,  -3.7],   /* Spain        */
  [-29.0, 24.0],   /* South Africa */  [-20.3, 57.5],   /* Mauritius    */
  [24.5,  47.0],   /* Middle East  */  [21.0,  78.0],   /* India        */
  [-2.5, 118.0],   /* Indonesia    */  [23.6,-102.5],   /* Mexico       */
  [-10.0,-52.0],   /* Brazil       */  [39.8, -98.6],   /* USA          */
  [56.0,-106.0]    /* Canada       */
];
GEO.data.TOYOTA_ASSEMBLY = [35.1, 137.2];   /* Toyota City, Japan */
