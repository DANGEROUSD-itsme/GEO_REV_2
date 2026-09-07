/* ==========================================================================
   test.js — the 37-mark mock test: Part A, Part B rubrics, Part C exemplar.
   Ported verbatim from the verified curriculum content. Every value that the
   UI shows lives here — the pages render from this data and hold no copy of
   their own, so a fact is corrected in exactly one place.
   ========================================================================== */
window.GEO = window.GEO || {};
GEO.data = GEO.data || {};

GEO.data.PART_A = [
  { q:'Which of the following is the most accurate definition of <em>interconnection</em>?',
    options:['The movement of tourists between two countries',
             'The relationship between all things, both animate and inanimate, and all processes, both natural and human, on Earth',
             'The trade of manufactured goods between developed nations',
             'The physical distance separating two places on a map'],
    answer:1,
    explain:'Interconnection is deliberately broad — it covers relationships between all things and all processes, natural and human. The other options describe single examples of interconnection (tourism, trade) or the opposite idea (distance), not the concept itself.' },
  { q:'<em>Overtourism</em> is best described as:',
    options:['Any city that receives international tourists',
             'A government policy limiting tourist visas',
             'Visitation by excessive numbers of tourists causing negative impacts on a place’s environment, people, culture and infrastructure',
             'Tourism that occurs outside the traditional holiday season'],
    answer:2,
    explain:'The defining feature of overtourism is that visitor numbers are excessive enough to cause undesirable impacts. Simply receiving tourists (option A) is not overtourism — the harm to environment, residents, culture and infrastructure is what makes it “over”.' },
  { q:'Indigenous Australians’ connection to the ancient rock art at Murujuga (Burrup Peninsula) is best classified as which connection criterion?',
    options:['Economic','Spiritual','Recreational','Political'],
    answer:1,
    explain:'A sacred, belief-based connection to Country is a spiritual connection. Economic would be the correct answer for the mining and gas corporations that value the same site as an industrial hub — the classic contested-perspectives pairing.' },
  { q:'Dual naming, such as Mandurah / Mandjoogoordap, is used primarily to:',
    options:['Attract more international tourists to a location',
             'Make place names easier to pronounce for visitors',
             'Recognise First Nations connections to place',
             'Distinguish between two separate towns with the same name'],
    answer:2,
    explain:'Dual naming is a recognition tool: it formally acknowledges the enduring First Nations connection to a place alongside its colonial name. Any tourism benefit is incidental, not the purpose.' },
  { q:'Which case study best demonstrates ICT being used to overcome distance in order to deliver <em>healthcare</em>?',
    options:['School of the Air','Offshore call centres','The Royal Flying Doctor Service','iPhone component sourcing'],
    answer:2,
    explain:'The RFDS combines telehealth and radio communications with emergency aviation to link remote patients to life-saving medical care. School of the Air uses very similar technology, but delivers education rather than healthcare — a common trap in this question.' },
  { q:'An iPhone containing over 300 components sourced from mines and factories worldwide best illustrates:',
    options:['Economic leakage','A complex global supply chain','Ecotourism','Trade surplus'],
    answer:1,
    explain:'A supply chain is the system of organisations, people, activities and resources moving materials and components into a finished product. Economic leakage is a tourism-revenue concept and is unrelated here.' },
  { q:'Approximately what proportion of international physical trade in goods is carried by sea?',
    options:['About 40%','About 60%','About 90%','About 25%'],
    answer:2,
    explain:'Around 90% of all international physical trade in goods moves by sea — bulk oil, gas and grain plus containerised consumer goods — a trade valued at over $18 trillion annually. Air freight is fast but carries only high-value, low-bulk goods.' },
  { q:'In the Toyota global supply chain, <strong>wiring harnesses</strong> are supplied by:',
    options:['Mauritius','Mexico','Denmark','Austria'],
    answer:0,
    explain:'Mauritius supplies wiring harnesses. Denmark supplies fanbelts, Austria supplies radiators and heater hoses, and Mexico supplies wheels and brake discs — all frequently confused in recall questions.' },
  { q:'According to Figure 1 (Global Trade Flows, 2012), which region was the smallest exporter, and why?',
    options:['East Asia — because it imports more than it exports',
             'Western Europe — because of high labour costs',
             'Sub-Saharan Africa — because of lower manufacturing infrastructure, low-value raw material exports and lower regional GDP',
             'North America — because of strong domestic consumption'],
    answer:2,
    explain:'Sub-Saharan Africa exported least because it has limited manufacturing infrastructure and exports low-value raw materials rather than finished goods, alongside a lower regional GDP. East Asia is the opposite case — a trade surplus region.' },
  { q:'East Asia (China / Japan) recorded a trade surplus in 2012 mainly because:',
    options:['It has the world’s largest population of tourists',
             'It has massive manufacturing-led economies, lower production costs and high global demand for its finished goods',
             'It imports almost no raw materials',
             'It has the shortest shipping routes to Europe'],
    answer:1,
    explain:'A trade surplus means exports exceed imports. East Asia achieves this through manufacturing-led economies, lower domestic production costs and strong global demand for its electronics, machinery and consumer goods — it actually imports large volumes of raw materials.' },
  { q:'The ~75,000 short-term holiday rentals operating in Paris are most closely associated with which impact?',
    options:['A positive environmental impact through reduced hotel construction',
             'A negative social impact — squeezed housing supply that prices residents out',
             'A positive economic impact for local small businesses',
             'A negative environmental impact on landmark buildings'],
    answer:1,
    explain:'Short-term rentals remove housing from the residential market, driving up rents and displacing residents — a social impact. They also worsen economic leakage (revenue flowing to Airbnb rather than local businesses), which is why option C is wrong.' },
  { q:'Travel to natural, undisturbed areas designed to conserve the environment and support local communities is known as:',
    options:['Recreational tourism','Historical tourism','Ecotourism','Cultural tourism'],
    answer:2,
    explain:'Ecotourism is defined by its conservation and community-support purpose, not simply by being outdoors. Recreational tourism is leisure-focused (beaches, resorts) and carries no conservation obligation.' }
];

GEO.data.PART_B = [
  { marks:2, q:'Define “Interconnection”.',
    rubric:['<strong>1 mark:</strong> a clear, accurate definition identifying interconnection as the relationship between things and processes on Earth.',
            '<strong>1 mark:</strong> correct use of geographical terminology — recognising that it includes both animate and inanimate things, and both natural and human processes.'],
    model:'Interconnection is the relationship between all things, both animate and inanimate, and all processes, both natural and human, on Earth. It means that places, people, goods and environments are linked together, so that an action or process occurring in one location can influence people, environments and economies in another.' },
  { marks:4, q:'Explain how transport and logistics connect car manufacturers globally, using the car supply chain example.',
    rubric:['<strong>1 mark:</strong> accurate reference to the role of transport (sea, air and road) in physically moving components between countries.',
            '<strong>1 mark:</strong> accurate use of the term logistics — managing the flow of goods, time and information between the point of origin and the point of consumption, integrating transport, warehousing, inventory and packaging.',
            '<strong>1 mark:</strong> at least two specific, correct country–component pairs from the Toyota supply chain.',
            '<strong>1 mark:</strong> explanation of the geographical significance — no single country supplies every component, so global interconnection is necessary for assembly to occur.'],
    model:'Transport and logistics physically interconnect car manufacturers with suppliers located across the world. Logistics is the detailed management of the flow of goods, time and information between the point of origin and the point of consumption, integrating transport, warehousing, inventory and packaging so that components arrive at the assembly plant exactly when they are required. Shipping carries the bulk of these components — around 90% of international physical trade in goods travels by sea — while air freight moves smaller, high-value parts across the globe in under 24 hours. In the Toyota supply chain, gearboxes, steering columns and engines are supplied by Britain, locks, pistons, cylinder head gaskets and batteries by Germany, wiring harnesses by Mauritius, wheels and brake discs by Mexico, glass and radios by Canada, and petroleum by the Middle East. Because no single country produces every one of these components, the manufacturer is entirely dependent on integrated global transport networks; without them the finished vehicle could not be assembled at all.' },
  { marks:7, q:'Using Figure 1 (Global Trade Flows, 2012), identify the region with the smallest export volume and explain why, then identify a region with a trade surplus and explain the factors producing it.',
    rubric:['<strong>1 mark:</strong> correctly identifies Sub-Saharan Africa as the smallest exporting region.',
            '<strong>2 marks:</strong> two valid reasons for low exports — lower manufacturing infrastructure; export of low-value raw materials rather than finished goods; lower regional GDP (1 mark each).',
            '<strong>1 mark:</strong> correctly identifies East Asia (China / Japan) as a region whose exports exceed imports (a trade surplus).',
            '<strong>2 marks:</strong> two valid factors producing the surplus — massive manufacturing-led economies; lower domestic production costs; high global demand for finished electronics, machinery and consumer goods (1 mark each).',
            '<strong>1 mark:</strong> explicit data reference and comparison drawn from the figure, using geographical terminology (exports, imports, trade surplus, raw materials, finished goods).'],
    model:'Figure 1 shows that Sub-Saharan Africa recorded the smallest export volume of any region in 2012. This is because the region has comparatively low manufacturing infrastructure, meaning it is unable to process materials into finished goods at scale. Instead, it predominantly exports low-value raw materials, which generate far less trade value per unit than manufactured products, and its lower regional GDP further limits investment in production and export capacity.\n\nIn contrast, East Asia — particularly China and Japan — shows a clear trade surplus, with exports substantially exceeding imports. This surplus is produced by massive manufacturing-led economies capable of high-volume production, lower domestic production costs that make East Asian goods competitively priced on the world market, and consistently high global demand for the finished electronics, machinery and consumer goods the region specialises in.\n\nComparing the two regions demonstrates the central pattern in global trade flows: regions that export finished manufactured goods accumulate trade surpluses and high trade values, whereas regions exporting primarily low-value raw materials remain at the periphery of global trade despite participating in it.' }
];

GEO.data.PART_C = {
  question:'Write an extended response on how the global growth of tourism has impacted Paris, and outline what is being done to make it more sustainable.',
  parts:[
    { id:'impacts',   name:'Part 1 — Impacts of tourism on Paris', marks:6,
      prompt:'Cover economic, social and environmental impacts (both positive and negative) using specific data.' },
    { id:'strategies',name:'Part 2 — Sustainability strategies',   marks:4,
      prompt:'Outline and evaluate the strategies being used or proposed to manage overtourism.' },
    { id:'structure', name:'Structure / TEET coherence',           marks:2,
      prompt:'Self-assess: does each paragraph have a clear Topic sentence, Explanation, Example and Tie-back?' }
  ],
  exemplar:[
    { heading:'Paragraph 1 — Economic impacts', body:[
      { tag:'T',  text:'The global growth of tourism has generated enormous economic benefits for Paris, but has simultaneously made the city economically vulnerable and allowed much of that wealth to bypass local people.' },
      { tag:'E1', text:'This occurs because a tourism-dominated economy concentrates income in a single volatile sector, while much of the spending is captured by international hotel chains, global tour operators and platforms such as Airbnb rather than by Parisian businesses — a process known as economic leakage.' },
      { tag:'E2', text:'For example, Paris recorded a record tourist revenue of approximately €24 billion in 2025, an 8% increase on 2019, of which international visitors alone contributed €16 billion, and the sector now employs more than 290,000 people across the Paris region; however, a substantial share of that spend leaves the local economy entirely.' },
      { tag:'T2', text:'Therefore, while the growth of global tourism has made Paris financially dependent on a single, highly profitable industry, the distribution of that wealth is uneven and leaves the city exposed if visitor numbers fall.' } ] },
    { heading:'Paragraph 2 — Social impacts', body:[
      { tag:'T',  text:'Socially, the growth of tourism has damaged the liveability of Paris for its permanent residents, despite providing genuine cultural exchange and heritage preservation.' },
      { tag:'E1', text:'This occurs because property owners can earn considerably more from short-term holiday letting than from long-term residential leases, which removes housing from the residential market, drives rents beyond the reach of local people, and gradually replaces everyday neighbourhood services with businesses catering only to visitors.' },
      { tag:'E2', text:'For example, approximately 75,000 short-term holiday rentals now operate in Paris; Mayor Anne Hidalgo and Deputy Ian Brossat have warned that the city risks becoming an “open-air museum” serving only tourists, and the “Disneyfication” of Montmartre has changed the character of the district, producing residential conflict over crowds, noise and the loss of daily services.' },
      { tag:'T2', text:'Consequently, the social cost of overtourism falls directly on Parisians, who are progressively displaced from a city that increasingly functions as a tourist attraction rather than as a place to live.' } ] },
    { heading:'Paragraph 3 — Environmental impacts', body:[
      { tag:'T',  text:'The environmental impact of mass tourism on Paris is overwhelmingly negative, although tourist revenue does fund some heritage conservation.' },
      { tag:'E1', text:'This occurs because approximately 50 million arrivals each year concentrate intense physical and atmospheric pressure onto a small number of historic sites and transport corridors, accelerating material decay and raising emissions faster than the city can mitigate them.' },
      { tag:'E2', text:'For example, landmarks including Sacré-Cœur, Notre-Dame and the Louvre suffer measurable physical wear and tear, waste and litter accumulate in high-traffic districts, and heavy traffic congestion, noise pollution and the carbon footprint of international air and road transport degrade air quality — pressures that intersect with new energy-efficiency laws banning G-rated rentals in 2025 and F-rated rentals in 2028.' },
      { tag:'T2', text:'Therefore, the environmental consequences of global tourism growth in Paris outweigh the conservation funding it generates, making environmental management central to any sustainable tourism plan.' } ] },
    { heading:'Paragraph 4 — Management strategies and evaluation', body:[
      { tag:'T',  text:'In response, Paris has implemented site-based controls and housing regulation, and is proposing active tourist dispersal, which together represent a shift from managing the symptoms of overtourism to addressing its causes.' },
      { tag:'E1', text:'This occurs because capacity controls and rental caps limit pressure at individual sites without reducing the total number of visitors, whereas dispersal redistributes the tourist load itself and pushes spending outwards into under-visited neighbourhoods, tackling overcrowding and economic leakage at the same time.' },
      { tag:'E2', text:'For example, the Louvre has required strict mandatory pre-booked entry since 2026, turning away non-reservations — moderately effective, since it spreads visitors through the day but does not reduce citywide numbers and tickets sell out weeks ahead; Airbnb regulation caps primary-residence letting at 120 days per year (with a proposed 90-day limit in hot-spots), requires centralised digital registration and imposes fines of €15,000–€100,000, with court-issued fines falling from €3.5 million in 2021 to €535k in the first seven months of 2023, indicating improved compliance although the housing shortage persists; and proposed dispersal would promote the 19th and 20th Arrondissements, Belleville and regional towns such as Fontainebleau through transport links and targeted advertising, following successful models in Amsterdam and Venice.' },
      { tag:'T2', text:'Overall, the existing strategies are only moderately effective because they manage tourist pressure rather than reduce it, whereas active dispersal has very effective potential as it is low-cost, scalable through existing tourism boards and targets the root cause — though its success ultimately depends on tourists being willing to travel beyond the primary sites.' } ] }
  ]
};
