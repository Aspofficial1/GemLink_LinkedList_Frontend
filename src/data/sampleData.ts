export const SAMPLE_DATA = {
  stats: { totalGems: 2847, ceylonVerified: 2676, fraudAlerts: 23, totalStages: 11388 },
  gems: [
    { id: "BS-1773990209789", type: "Blue Sapphire", origin: "Ratnapura, Pelmadulla", district: "Ratnapura", stage: "EXPORTING", weight: 4.8, originalWeight: 5.2, miningPrice: 50000, currentPrice: 850000, verified: true, stages: 4, certificate: "GIC-2025-001", miner: "Sumith Perera", miningDate: "2025-01-15" },
    { id: "RB-1773980123456", type: "Ruby", origin: "Elahera, Matale", district: "Matale", stage: "TRADING", weight: 3.2, originalWeight: 3.8, miningPrice: 80000, currentPrice: 420000, verified: true, stages: 3, certificate: "GIC-2025-002", miner: "Kamal Silva", miningDate: "2025-01-22" },
    { id: "CE-1773970987654", type: "Cat's Eye", origin: "Bibile, Badulla", district: "Badulla", stage: "CUTTING", weight: 6.1, originalWeight: 6.1, miningPrice: 120000, currentPrice: 180000, verified: false, stages: 2, certificate: null, miner: "Nimal Perera", miningDate: "2025-02-01" },
    { id: "PS-1773960876543", type: "Pink Sapphire", origin: "Ratnapura", district: "Ratnapura", stage: "BUYING", weight: 2.8, originalWeight: 3.4, miningPrice: 200000, currentPrice: 1200000, verified: true, stages: 5, certificate: "GIC-2025-003", miner: "Rohan Fernando", miningDate: "2024-12-10" },
    { id: "AL-1773950765432", type: "Alexandrite", origin: "Hasalaka, Kandy", district: "Kandy", stage: "MINING", weight: 8.4, originalWeight: 8.4, miningPrice: 95000, currentPrice: 95000, verified: false, stages: 1, certificate: null, miner: "Chaminda Bandara", miningDate: "2025-02-14" },
  ],
  alerts: [
    { id: 1, gemId: "CE-1773970987654", type: "MISSING_CERTIFICATE", message: "No official certificate has been recorded for this gem. Buyers should request certification before purchase.", resolved: false, date: "2025-02-01" },
    { id: 2, gemId: "AL-1773950765432", type: "ORIGIN_MISMATCH", message: "The recorded origin Hasalaka does not match any known Sri Lankan mining location in our primary database.", resolved: false, date: "2025-02-14" },
    { id: 3, gemId: "RB-1773980123456", type: "MISSING_CERTIFICATE", message: "Certificate verification pending for Ruby ID RB-1773980123456.", resolved: true, date: "2025-01-22" },
  ],
  priceHistory: {
    "BS-1773990209789": [{ stage: "Mine", price: 50000 }, { stage: "Cut", price: 150000 }, { stage: "Trade", price: 350000 }, { stage: "Export", price: 850000 }],
    "PS-1773960876543": [{ stage: "Mine", price: 200000 }, { stage: "Cut", price: 380000 }, { stage: "Trade", price: 650000 }, { stage: "Export", price: 980000 }, { stage: "Buy", price: 1200000 }],
  } as Record<string, { stage: string; price: number }[]>,
  journeyStages: {
    "BS-1773990209789": [
      { stage: "MINING", location: "Ratnapura, Pelmadulla", person: "Sumith Perera", date: "2025-01-15", weight: "5.2 ct", price: "Rs. 50,000" },
      { stage: "CUTTING", location: "Beruwala Gem Center", person: "A. R. Fazal", date: "2025-01-28", weight: "4.8 ct", price: "Rs. 150,000" },
      { stage: "TRADING", location: "Colombo Gem Market", person: "Lanka Gems Ltd.", date: "2025-02-10", weight: "4.8 ct", price: "Rs. 350,000" },
      { stage: "EXPORTING", location: "BIA Colombo", person: "Export Holdings", date: "2025-02-20", weight: "4.8 ct", price: "Rs. 850,000" },
    ],
    "PS-1773960876543": [
      { stage: "MINING", location: "Ratnapura", person: "Rohan Fernando", date: "2024-12-10", weight: "3.4 ct", price: "Rs. 200,000" },
      { stage: "CUTTING", location: "Galle Lapidary", person: "M. Jayasena", date: "2024-12-22", weight: "2.8 ct", price: "Rs. 380,000" },
      { stage: "TRADING", location: "Colombo", person: "Ceylon Stones Pvt", date: "2025-01-05", weight: "2.8 ct", price: "Rs. 650,000" },
      { stage: "EXPORTING", location: "BIA Colombo", person: "Island Exports", date: "2025-01-15", weight: "2.8 ct", price: "Rs. 980,000" },
      { stage: "BUYING", location: "Hong Kong", person: "Pacific Gems HK", date: "2025-01-25", weight: "2.8 ct", price: "Rs. 1,200,000" },
    ],
  } as Record<string, { stage: string; location: string; person: string; date: string; weight: string; price: string }[]>,
};

export type Gem = typeof SAMPLE_DATA.gems[number];
export type Alert = typeof SAMPLE_DATA.alerts[number];
