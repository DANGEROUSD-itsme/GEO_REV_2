/* ==========================================================================
   teet.js: the three T.E.E.T questions and their twelve hint sets.
   Ported verbatim from the verified curriculum content. Every value that the
   UI shows lives here. The pages render from this data and hold no copy of
   their own, so a fact is corrected in exactly one place.
   ========================================================================== */
window.GEO = window.GEO || {};
GEO.data = GEO.data || {};

GEO.data.TEET_QUESTIONS = [
  { id:'q1', label:'Explain the negative social impacts of overtourism on a selected city.',
    icon:'users', marks:'Typical: 4 to 6 marks',
    hints:{
      t:{ title:'Topic sentence starters',
        starters:['Overtourism produces severe negative social impacts on the residents of Paris, particularly through the loss of affordable housing and local character.',
                  'The rapid growth of tourism in Paris has significantly damaged the social fabric of the city for its permanent residents.'],
        phrases:['negative social impacts','local residents','loss of liveability','residential displacement'] },
      e1:{ title:'Explanation: link mechanism to consequence',
        starters:['This occurs because property owners can earn far more from short-term holiday letting than from long-term residential leases, which removes housing from the residential market and drives rents upward.',
                  'As a result, the everyday services residents rely on are replaced by tourist-oriented businesses, meaning the neighbourhood no longer functions as a place to live.'],
        phrases:['This occurs because…','As a consequence…','which means that…','This directly leads to…','over time this results in…'] },
      e2:{ title:'Example: use hard evidence',
        starters:['For example, approximately 75,000 short-term holiday rentals such as Airbnb operate in Paris, squeezing housing supply and pricing local residents out.',
                  'For instance, Mayor Anne Hidalgo and Deputy Ian Brossat have warned that Paris risks becoming an “open-air museum”, while the “Disneyfication” of Montmartre has driven residential conflict over crowds, noise and the loss of daily services.'],
        phrases:['~75,000 short-term rentals','~50 million arrivals annually','Montmartre “Disneyfication”','“open-air museum”: Hidalgo & Brossat','residential conflict: crowds, noise, lost services'] },
      t2:{ title:'Tie-back: answer the question again',
        starters:['Therefore, the social cost of overtourism in Paris falls directly on residents, who lose both affordable housing and the everyday character of their own neighbourhoods.',
                  'Consequently, overtourism has socially transformed Paris from a functioning residential city into one increasingly serving visitors rather than the people who live there.'],
        phrases:['Therefore…','Consequently…','This clearly demonstrates that…','Ultimately, the negative social impact is…'] }
    } },
  { id:'q2', label:'Evaluate the effectiveness of a strategy used to manage overtourism in a selected city.',
    icon:'scale', marks:'Typical: 6 marks',
    hints:{
      t:{ title:'Topic sentence starters (make a judgement immediately)',
        starters:['The Louvre’s timed-entry and capacity control system is only moderately effective at managing overtourism in Paris.',
                  'Active tourist dispersal has very strong potential as a management strategy because, unlike other measures, it addresses the root cause of overtourism.'],
        phrases:['is moderately effective','has strong potential','only partially addresses','effective at… but limited by…'] },
      e1:{ title:'Explanation: how the mechanism is supposed to work',
        starters:['This strategy works by requiring strict mandatory pre-booked tickets, so visitor numbers are capped per time slot and flow is spread evenly across the day, preventing dangerous indoor overcrowding.',
                  'Dispersal works by using transport links and targeted advertising to redirect visitors to lesser-known areas, which reduces pressure at hot-spots while spreading tourist spending into local neighbourhoods.'],
        phrases:['This strategy works by…','The mechanism is…','It is effective because…','However, its limitation is that…'] },
      e2:{ title:'Example: evidence for and against',
        starters:['For example, since 2026 the Louvre has turned away non-reserved visitors; however, this does not reduce the overall number of tourists in Paris and tickets now sell out weeks in advance.',
                  'For example, Airbnb regulation caps primary-residence letting at 120 days per year with fines of €15,000 to €100,000, and court-issued fines fell from €3.5 million in 2021 to €535k in the first 7 months of 2023, indicating improved compliance, yet the housing shortage remains.'],
        phrases:['120-day cap; fines €15,000 to €100,000','fines fell €3.5M (2021) → €535k (2023)','19th & 20th Arrondissements, Belleville, Fontainebleau','Amsterdam and Venice dispersal models'] },
      t2:{ title:'Tie-back: restate the judgement with a qualifier',
        starters:['Overall, the strategy is moderately effective because it successfully manages visitor flow at a single site, but it fails to reduce the total tourist pressure on the city.',
                  'Overall, dispersal is the most effective long-term option because it is low-cost, scalable and targets the cause of overtourism, though its success ultimately depends on tourist willingness to leave the primary sites.'],
        phrases:['Overall, the strategy is…','effective in the short term, but…','the most effective option because…','its effectiveness is limited by…'] }
    } },
  { id:'q3', label:'Explain how transport networks connect manufacturers and global supply chains.',
    icon:'ship', marks:'Typical: 4 to 6 marks',
    hints:{
      t:{ title:'Topic sentence starters',
        starters:['Global transport networks are the physical foundation of modern manufacturing, allowing a single product to be assembled from components sourced across dozens of countries.',
                  'Shipping, air and road transport interconnect manufacturers worldwide by moving raw materials and components from their point of origin to the point of assembly.'],
        phrases:['transport networks','global supply chain','point of origin → point of consumption','integrated logistics'] },
      e1:{ title:'Explanation: how and why',
        starters:['This occurs because logistics manages the flow of goods, time and information between the point of origin and the point of consumption, integrating transport, warehousing, inventory and packaging so components arrive exactly when required for assembly.',
                  'As a result, manufacturers can source each component from wherever it is produced most cheaply or expertly, rather than being limited to their own country.'],
        phrases:['This occurs because…','logistics integrates transport, warehousing, inventory and packaging','just-in-time assembly','lower production costs / specialisation'] },
      e2:{ title:'Example: Toyota / shipping data',
        starters:['For example, a single Toyota vehicle relies on gearboxes, steering columns and engines from Britain, wiring harnesses from Mauritius, wheels and brake discs from Mexico, glass and radios from Canada and petroleum from the Middle East.',
                  'For example, around 90% of all international physical trade in goods travels by sea, a trade valued at over $18 trillion annually, while air freight moves high-value goods across the globe in under 24 hours.'],
        phrases:['Britain: gearboxes, steering columns, engines','Mauritius: wiring harnesses','Germany: locks, pistons, gaskets, batteries','~90% of trade by sea, >$18 trillion annually','air freight: under 24 hours'] },
      t2:{ title:'Tie-back',
        starters:['Therefore, without integrated global transport networks the modern supply chain could not function, as no single country supplies every component required to build a finished product.',
                  'Consequently, transport networks are what physically interconnect manufacturers, turning components produced in over twenty countries into one finished vehicle.'],
        phrases:['Therefore…','Consequently…','This demonstrates that transport is…','Without these networks…'] }
    } }
];

/* -------------------------------------------------- 10. MOCK TEST (37) */
