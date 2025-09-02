import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Sample maritime documents with realistic content
const sampleDocuments = [
  {
    id: "doc_1703123456789_abc123def",
    filename: "1703123456789_GENCON_Charter_Party_MV_Seabird.pdf",
    originalName: "GENCON_Charter_Party_MV_Seabird.pdf",
    content: `GENCON CHARTER PARTY

VESSEL: MV SEABIRD
IMO: 9876543
FLAG: Marshall Islands
BUILT: 2018
DWT: 75,000 MT
GRT: 45,230

OWNERS: Pacific Maritime Ltd
Address: 123 Ocean Drive, Singapore 049909

CHARTERERS: Global Commodities Trading AG
Address: Bahnhofstrasse 45, 8001 Zurich, Switzerland

CARGO: Iron Ore Pellets
QUANTITY: 70,000 MT +/- 10% in Charterers' option

LOADING PORT: Port Hedland, Australia
DISCHARGING PORT: Rotterdam, Netherlands

LAYDAYS: 15th - 20th December 2024

LAYTIME: 72 running hours total for loading and discharging
DEMURRAGE: USD 35,000 per day pro rata
DESPATCH: USD 17,500 per day pro rata

FREIGHT RATE: USD 42.50 per metric ton

CLAUSE 1: DESCRIPTION OF VESSEL
The vessel is a bulk carrier of 75,000 MT deadweight, built 2018, classed 100A1 at Lloyd's Register.

CLAUSE 2: CARGO
Iron ore pellets in bulk. Cargo to be loaded and trimmed at Charterers' expense.

CLAUSE 3: LOADING/DISCHARGING
Loading: One safe berth Port Hedland - vessel to tender NOR on arrival
Discharging: One safe berth Rotterdam - vessel to tender NOR on arrival

CLAUSE 4: LAYTIME
Laytime shall commence 6 hours after NOR is tendered or on vessel's arrival at berth, whichever occurs first. Time shall count as follows:
- Loading: 36 running hours
- Discharging: 36 running hours
Weather Working Days basis. Sundays and holidays excluded unless used.

CLAUSE 5: DEMURRAGE/DESPATCH
Demurrage at USD 35,000 per day or pro rata for part of a day.
Despatch at USD 17,500 per day or pro rata for part of a day.

CLAUSE 6: FREIGHT PAYMENT
Freight payable in USD to owners' account within 5 banking days of completion of loading.

Date: 1st December 2024
Owners: Pacific Maritime Ltd
Charterers: Global Commodities Trading AG`,
    summary: "GENCON charter party for MV Seabird carrying 70,000 MT iron ore pellets from Port Hedland to Rotterdam. Key terms include 72 hours total laytime, USD 35,000/day demurrage, USD 42.50/MT freight rate.",
    documentType: "charter_party",
    metadata: {
      pages: 12,
      size: 245760,
      uploadedAt: new Date("2024-12-01T09:30:00Z"),
      processedAt: new Date("2024-12-01T09:31:15Z")
    },
    keywords: ["charter party", "gencon", "iron ore", "laytime", "demurrage", "freight", "port hedland", "rotterdam", "bulk carrier"],
    sections: [
      {
        title: "VESSEL PARTICULARS",
        content: "MV SEABIRD, IMO 9876543, Marshall Islands flag, built 2018, DWT 75,000 MT, GRT 45,230. Bulk carrier classed 100A1 at Lloyd's Register.",
        page: 1,
        type: "header"
      },
      {
        title: "CLAUSE 4: LAYTIME",
        content: "Laytime shall commence 6 hours after NOR is tendered or on vessel's arrival at berth, whichever occurs first. Loading: 36 running hours, Discharging: 36 running hours. Weather Working Days basis.",
        page: 3,
        type: "clause"
      }
    ]
  },
  {
    id: "doc_1703209876543_def456ghi",
    filename: "1703209876543_Bill_of_Lading_Hamburg_Shanghai.pdf",
    originalName: "Bill_of_Lading_Hamburg_Shanghai.pdf",
    content: `BILL OF LADING

B/L NO: HAPAG-2024-001234
VESSEL: MV OCEAN PIONEER  
VOYAGE: 024W
PORT OF LOADING: Hamburg, Germany
PORT OF DISCHARGE: Shanghai, China

SHIPPER: European Steel Manufacturing GmbH
Address: Industriestrasse 15, 20095 Hamburg, Germany

CONSIGNEE: Shanghai Metal Works Ltd
Address: 888 Pudong Avenue, Shanghai 200120, China

NOTIFY PARTY: Same as consignee

DESCRIPTION OF GOODS:
Steel Coils, Hot Rolled
20 containers x 40' HC
Container numbers: GESU1234567-0 to GESU1234586-9
Weight: 24.5 MT per container
Total Weight: 490.00 MT

MARKS AND NUMBERS: SMW/SH/2024/001-020

FREIGHT TERMS: Prepaid
FREIGHT AMOUNT: USD 24,500.00

PLACE OF RECEIPT: Hamburg Container Terminal
PLACE OF DELIVERY: Shanghai Yangshan Port

SHIPPED ON BOARD: 5th December 2024

Terms and Conditions:
1. This Bill of Lading is subject to the Hague-Visby Rules
2. Delivery will only be made against surrender of the original Bill of Lading
3. Container seals applied by shipper, carrier not responsible for contents
4. Goods carried on deck at shipper's risk

SIGNED: Hamburg, 5th December 2024
HAPAG-LLOYD AG
Master: Capt. Klaus Mueller`,
    summary: "Bill of Lading for 20x40' containers of steel coils from Hamburg to Shanghai aboard MV Ocean Pioneer. Total cargo 490 MT, freight prepaid USD 24,500.",
    documentType: "bill_of_lading",
    metadata: {
      pages: 3,
      size: 156890,
      uploadedAt: new Date("2024-12-05T14:20:00Z"),
      processedAt: new Date("2024-12-05T14:21:30Z")
    },
    keywords: ["bill of lading", "containers", "steel coils", "hamburg", "shanghai", "hapag lloyd", "hague visby"],
    sections: [
      {
        title: "CARGO DESCRIPTION",
        content: "Steel Coils, Hot Rolled in 20x40' HC containers, total weight 490.00 MT, container numbers GESU1234567-0 to GESU1234586-9",
        page: 1,
        type: "header"
      },
      {
        title: "TERMS AND CONDITIONS",
        content: "Subject to Hague-Visby Rules, delivery against original B/L, container seals by shipper, deck cargo at shipper's risk",
        page: 2,
        type: "clause"
      }
    ]
  },
  {
    id: "doc_1703298765432_ghi789jkl",
    filename: "1703298765432_Weather_Routing_Report_North_Atlantic.pdf",
    originalName: "Weather_Routing_Report_North_Atlantic.pdf",
    content: `WEATHER ROUTING REPORT

VESSEL: MV ATLANTIC VOYAGER
VOYAGE: North Atlantic Crossing
DATE: 10th December 2024
PREPARED BY: Maritime Weather Services Ltd

ROUTE OPTIMIZATION ANALYSIS

DEPARTURE: Southampton, UK (50°54'N, 001°24'W)
DESTINATION: New York, USA (40°42'N, 074°00'W)
DEPARTURE TIME: 12th December 2024, 06:00 UTC
ETA: 20th December 2024, 18:00 UTC
DISTANCE: 3,150 nautical miles

WEATHER SYNOPSIS:
A strong low pressure system is developing over the North Atlantic, moving eastward at 25 knots. Wind speeds up to 45 knots expected in the central North Atlantic from Dec 14-16.

RECOMMENDED ROUTE:
Great Circle Route modified to avoid severe weather:
- Proceed south of normal great circle by 50 nautical miles
- Transit between 48°N and 50°N longitude 030°W to 040°W
- Resume great circle routing after longitude 040°W

WEATHER FORECAST BY ZONES:

ZONE A (50°N-52°N, 000°W-020°W):
Dec 12-13: SW winds 15-20 knots, seas 2-3 meters
Dec 14-15: W winds 25-30 knots, seas 4-5 meters
Dec 16: NW winds 20-25 knots, seas 3-4 meters

ZONE B (48°N-50°N, 020°W-040°W):
Dec 12-13: SW winds 20-25 knots, seas 3-4 meters
Dec 14-15: W winds 35-40 knots, seas 6-7 meters (SEVERE)
Dec 16: NW winds 25-30 knots, seas 4-5 meters

ZONE C (46°N-48°N, 040°W-060°W):
Dec 14-16: W winds 20-30 knots, seas 3-5 meters
Dec 17-18: Variable winds 10-15 knots, seas 2-3 meters

FUEL CONSUMPTION ESTIMATE:
Great Circle: 385 MT
Recommended Route: 395 MT (+10 MT for weather avoidance)

SAFETY RECOMMENDATIONS:
- Monitor weather updates every 6 hours
- Reduce speed if encountering seas >6 meters
- Secure all cargo and deck equipment before entering Zone B
- Consider further south routing if storm intensifies

Captain's approval required for route implementation.

Weather Service: Maritime Weather Services Ltd
Contact: ops@maritimeweather.com
Emergency: +44 20 7946 0958`,
    summary: "Weather routing report for MV Atlantic Voyager crossing North Atlantic. Recommends modified route 50NM south of great circle to avoid severe weather system with 45-knot winds Dec 14-16.",
    documentType: "weather_report",
    metadata: {
      pages: 6,
      size: 312456,
      uploadedAt: new Date("2024-12-10T11:15:00Z"),
      processedAt: new Date("2024-12-10T11:16:45Z")
    },
    keywords: ["weather routing", "north atlantic", "storm", "wind", "routing", "navigation", "fuel consumption", "safety"],
    sections: [
      {
        title: "ROUTE OPTIMIZATION ANALYSIS",
        content: "Southampton to New York, 3,150 NM, modified great circle to avoid severe weather, ETA Dec 20th",
        page: 1,
        type: "header"
      },
      {
        title: "SAFETY RECOMMENDATIONS",
        content: "Monitor weather every 6 hours, reduce speed in seas >6m, secure cargo before Zone B, consider further south routing",
        page: 5,
        type: "clause"
      }
    ]
  },
  {
    id: "doc_1703387654321_jkl012mno",
    filename: "1703387654321_Laytime_Statement_MV_Nordic_Star.pdf",
    originalName: "Laytime_Statement_MV_Nordic_Star.pdf",
    content: `LAYTIME STATEMENT

VESSEL: MV NORDIC STAR
VOYAGE: 2024/12
CHARTER PARTY: NORGRAIN dated 15th November 2024

LOADING PORT: Oslo, Norway
DISCHARGING PORT: Alexandria, Egypt

CARGO: Wheat in bulk - 45,000 MT

LAYTIME CALCULATIONS:

LOADING - Oslo:
NOR Tendered: 18th December 2024 at 08:30
Accepted: 18th December 2024 at 09:15
Laytime Commenced: 18th December 2024 at 15:15 (6 hours after NOR acceptance)
Loading Started: 18th December 2024 at 16:00
Loading Completed: 20th December 2024 at 14:30

Time Used for Loading:
From 15:15 on 18th Dec to 14:30 on 20th Dec
Total: 47 hours 15 minutes
Allowed Laytime: 48 hours
Time Saved: 45 minutes

DISCHARGING - Alexandria:
NOR Tendered: 26th December 2024 at 06:00
Accepted: 26th December 2024 at 07:30
Laytime Commenced: 26th December 2024 at 13:30 (6 hours after NOR acceptance)
Discharging Started: 26th December 2024 at 14:00
Discharging Completed: 29th December 2024 at 11:45

Time Used for Discharging:
From 13:30 on 26th Dec to 11:45 on 29th Dec
Total: 70 hours 15 minutes
Allowed Laytime: 60 hours
Excess Time: 10 hours 15 minutes

LAYTIME SUMMARY:
Loading Time Saved: 45 minutes
Discharging Overtime: 10 hours 15 minutes
Net Demurrage Time: 9 hours 30 minutes

DEMURRAGE CALCULATION:
Rate: USD 28,000 per day
Demurrage Due: 9.5 hours = USD 11,083.33

EXCEPTIONS TO LAYTIME:
- Weather delay on 27th Dec from 18:00 to 06:00 (12 hours) - excluded from laytime
- Customs inspection delay on 28th Dec from 10:00 to 12:00 (2 hours) - excluded from laytime

FINAL DEMURRAGE: USD 11,083.33
Payment due within 30 days as per Charter Party terms.

Prepared by: Nordic Shipping Lines
Date: 30th December 2024
Master: Captain Erik Andersen`,
    summary: "Laytime statement for MV Nordic Star carrying wheat from Oslo to Alexandria. Net demurrage of 9.5 hours resulted in USD 11,083.33 due to discharging delays.",
    documentType: "laytime_calculation",
    metadata: {
      pages: 4,
      size: 198745,
      uploadedAt: new Date("2024-12-30T16:45:00Z"),
      processedAt: new Date("2024-12-30T16:46:20Z")
    },
    keywords: ["laytime", "demurrage", "wheat", "oslo", "alexandria", "nor", "charter party", "bulk cargo"],
    sections: [
      {
        title: "LOADING CALCULATIONS",
        content: "Oslo loading: NOR 18th Dec 08:30, commenced 15:15, completed 20th Dec 14:30, used 47h 15m of 48h allowed, saved 45 minutes",
        page: 2,
        type: "header"
      },
      {
        title: "DEMURRAGE CALCULATION", 
        content: "Net demurrage 9.5 hours at USD 28,000/day = USD 11,083.33, payment due within 30 days per charter party",
        page: 3,
        type: "clause"
      }
    ]
  },
  {
    id: "doc_1703476543210_mno345pqr",
    filename: "1703476543210_Port_Instructions_Dubai.pdf",
    originalName: "Port_Instructions_Dubai.pdf",
    content: `PORT OF DUBAI - JEBEL ALI
VOYAGE INSTRUCTIONS

VESSEL: MV DESERT WIND
ETA: 5th January 2025
CARGO: Containerized Mixed Cargo

PORT AUTHORITY: Dubai Ports World
Port Control VHF: Channel 12
Pilot Station VHF: Channel 14

ARRIVAL PROCEDURES:
1. Send ETA message 72, 48, and 24 hours before arrival
2. Contact Port Control on VHF Ch 12 when 12 miles from port
3. Pilot boarding at Pilot Station Alpha (25°06'N, 055°02'E)
4. Immigration and customs clearance at berth

BERTH ALLOCATION: Terminal 2, Berth 7-8
BERTH LENGTH: 400 meters
DEPTH: 16 meters
MAXIMUM LOA: 380 meters
MAXIMUM DRAFT: 15.5 meters

CARGO OPERATIONS:
Container Operations: 24 hours except Fridays 11:30-13:00
Crane Capacity: 4 x STS cranes @ 65 tons SWL
Average Productivity: 35 containers/hour per crane

SERVICES AVAILABLE:
- Fresh water: USD 8.50 per ton
- Marine gas oil: Available on request
- Waste disposal: USD 2,500 flat rate
- Ship supplies: 24-hour service
- Crew change: Permitted with advance notice

DOCUMENTATION REQUIRED:
1. Crew list (6 copies)
2. Passenger manifest (if applicable)  
3. Ship's stores declaration
4. Maritime Declaration of Health
5. Customs cargo manifest
6. Dangerous goods declaration (if applicable)
7. Ballast water management certificate

CONTACT INFORMATION:
Port Authority: +971 4 881 5555
Agent: Gulf Maritime Services
Agent Contact: Mr. Ahmed Hassan +971 50 123 4567
Emergency: Dubai Coast Guard +971 4 345 6789

WEATHER CONDITIONS:
Prevailing winds: NW 10-15 knots
Visibility: Generally good (>10 NM)
Current: 0.5-1.0 knot setting NE

RESTRICTIONS:
- No hot work without permit
- No discharge of any waste overboard
- Speed limit in port: 6 knots maximum
- All crew must remain on board unless shore leave granted

LOCAL REGULATIONS:
- UAE Immigration requirements apply
- Zero tolerance for drugs and alcohol
- Crew articles containing pork prohibited
- Photography of port facilities restricted

DEPARTURE:
- Give 2 hours notice for pilot
- Port dues payable before departure
- Customs clearance required
- Agent to arrange final documentation

Valid from: 1st January 2025
Issued by: Dubai Ports Authority`,
    summary: "Port instructions for MV Desert Wind arriving Dubai Jebel Ali Terminal 2. Covers arrival procedures, berth details, cargo operations, required documentation, and local regulations.",
    documentType: "voyage_instructions",
    metadata: {
      pages: 5,
      size: 267890,
      uploadedAt: new Date("2025-01-02T08:30:00Z"),
      processedAt: new Date("2025-01-02T08:31:45Z")
    },
    keywords: ["port instructions", "dubai", "jebel ali", "pilot", "berth", "containers", "customs", "immigration"],
    sections: [
      {
        title: "ARRIVAL PROCEDURES",
        content: "ETA messages at 72/48/24 hours, contact Port Control Ch 12 at 12 miles, pilot boarding at Alpha station, clearance at berth",
        page: 1,
        type: "header"
      },
      {
        title: "LOCAL REGULATIONS",
        content: "UAE Immigration requirements, zero tolerance drugs/alcohol, no pork articles, restricted photography, crew remain aboard",
        page: 4,
        type: "clause"
      }
    ]
  }
];

// Generate knowledge base entries from the documents
function generateKnowledgeBaseEntries(documents) {
  const knowledgeEntries = [];
  
  documents.forEach((doc, docIndex) => {
    // Create entries from sections
    doc.sections.forEach((section, sectionIndex) => {
      const category = categorizeSection(section.content);
      const entry = {
        id: `kb_${doc.id}_${sectionIndex}`,
        documentId: doc.id,
        title: section.title,
        content: section.content,
        category,
        relevanceScore: calculateRelevanceScore(section.content, category),
        tags: extractTags(section.content)
      };
      knowledgeEntries.push(entry);
    });

    // Create summary entry
    const summaryCategory = categorizeSection(doc.content);
    knowledgeEntries.push({
      id: `kb_${doc.id}_summary`,
      documentId: doc.id,
      title: `${doc.documentType.replace('_', ' ').toUpperCase()} - ${doc.originalName}`,
      content: doc.summary,
      category: summaryCategory,
      relevanceScore: 0.9,
      tags: doc.keywords.slice(0, 5)
    });
  });

  return knowledgeEntries;
}

function categorizeSection(content) {
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('laytime') || contentLower.includes('demurrage') || contentLower.includes('nor')) {
    return 'laytime';
  } else if (contentLower.includes('weather') || contentLower.includes('wind') || contentLower.includes('storm')) {
    return 'weather';
  } else if (contentLower.includes('distance') || contentLower.includes('route') || contentLower.includes('nautical')) {
    return 'distance';
  } else if (contentLower.includes('charter') || contentLower.includes('clause') || contentLower.includes('freight')) {
    return 'cp_clause';
  } else if (contentLower.includes('port') || contentLower.includes('berth') || contentLower.includes('pilot') || contentLower.includes('voyage')) {
    return 'voyage_guidance';
  } else {
    return 'general';
  }
}

function calculateRelevanceScore(content, category) {
  const baseScore = Math.min(content.length / 500, 1);
  const categoryKeywords = {
    laytime: ['laytime', 'demurrage', 'despatch', 'nor', 'loading', 'discharge'],
    weather: ['weather', 'wind', 'storm', 'forecast', 'routing'],
    distance: ['distance', 'nautical', 'route', 'passage', 'voyage'],
    cp_clause: ['clause', 'charter', 'party', 'terms', 'conditions', 'freight'],
    voyage_guidance: ['port', 'berth', 'pilot', 'customs', 'immigration'],
    general: []
  };
  
  const keywords = categoryKeywords[category] || [];
  const keywordMatches = keywords.filter(kw => 
    content.toLowerCase().includes(kw)
  ).length;
  
  const keywordScore = keywords.length > 0 ? keywordMatches / keywords.length : 0.5;
  return Math.round((baseScore * 0.6 + keywordScore * 0.4) * 100) / 100;
}

function extractTags(content) {
  const commonTags = [
    'maritime', 'shipping', 'vessel', 'cargo', 'port', 'navigation',
    'contract', 'legal', 'operations', 'logistics', 'commercial', 'safety'
  ];
  
  return commonTags.filter(tag => 
    content.toLowerCase().includes(tag)
  ).slice(0, 5);
}

// Save all documents
console.log('Creating sample maritime documents...');

sampleDocuments.forEach((doc) => {
  const filePath = path.join(uploadsDir, `${doc.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(doc, null, 2));
  console.log(`✅ Created: ${doc.originalName}`);
});

// Generate and save knowledge base entries
const knowledgeEntries = generateKnowledgeBaseEntries(sampleDocuments);
const knowledgeBasePath = path.join(uploadsDir, 'knowledge_base.json');
fs.writeFileSync(knowledgeBasePath, JSON.stringify(knowledgeEntries, null, 2));

console.log(`\n📊 Summary:`);
console.log(`• Documents created: ${sampleDocuments.length}`);
console.log(`• Knowledge base entries: ${knowledgeEntries.length}`);
console.log(`• Total file size: ${sampleDocuments.reduce((acc, doc) => acc + doc.metadata.size, 0)} bytes`);

console.log('\n🎉 Sample data population complete!');
console.log('You can now view the documents in:');
console.log('• Documents section: http://localhost:3000/documents');  
console.log('• Knowledge Base section: http://localhost:3000/knowledge-base');
