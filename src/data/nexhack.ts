/**
 * ─────────────────────────────────────────────────────────────────────────
 *  NEXHACK 2.0 — ALL WEBSITE CONTENT LIVES HERE
 * ─────────────────────────────────────────────────────────────────────────
 *  ⚠️  The numbers, states and colleges below are PLACEHOLDERS.
 *      Replace them with the real registration data before sending
 *      invitations to dignitaries. Totals (registrations, states) are
 *      calculated automatically from the lists, so you only edit lists.
 * ─────────────────────────────────────────────────────────────────────────
 */

export const EVENT = {
  name: "NEXHACK 2.0",
  tagline: "Hack the Next Dimension",
  dates: "24–25 November 2026",
  format: "24-Hour National Offline Hackathon",
  venue: "Geeta University, NH-71, Naultha, Panipat, Haryana 132145",
  reporting: "09:00 AM IST",
};

// TODO: replace with real registrations per state / UT
export const STATES: { name: string; registrations: number }[] = [
  { name: "Haryana", registrations: 520 },
  { name: "Delhi", registrations: 290 },
  { name: "Uttar Pradesh", registrations: 260 },
  { name: "Punjab", registrations: 190 },
  { name: "Rajasthan", registrations: 140 },
  { name: "Uttarakhand", registrations: 95 },
  { name: "Himachal Pradesh", registrations: 80 },
  { name: "Madhya Pradesh", registrations: 70 },
  { name: "Maharashtra", registrations: 55 },
  { name: "Bihar", registrations: 50 },
  { name: "Gujarat", registrations: 40 },
  { name: "Jammu & Kashmir", registrations: 25 },
  { name: "Chandigarh", registrations: 15 },
  { name: "Karnataka", registrations: 10 },
  { name: "Tamil Nadu", registrations: 6 },
  { name: "Odisha", registrations: 4 },
];

// TODO: replace with real college names (sample names only!)
export const COLLEGES: { name: string; state: string; teams: number }[] = [
  { name: "Sample Institute of Technology", state: "Haryana", teams: 14 },
  { name: "Sample College of Engineering", state: "Delhi", teams: 12 },
  { name: "Sample University of Sciences", state: "Uttar Pradesh", teams: 11 },
  { name: "Sample Institute of Management", state: "Punjab", teams: 9 },
  { name: "Sample Technical Campus", state: "Rajasthan", teams: 8 },
  { name: "Sample Engineering University", state: "Haryana", teams: 8 },
  { name: "Sample School of Computing", state: "Uttarakhand", teams: 7 },
  { name: "Sample Polytechnic Institute", state: "Himachal Pradesh", teams: 6 },
  { name: "Sample Institute of Informatics", state: "Madhya Pradesh", teams: 6 },
  { name: "Sample Women's Engineering College", state: "Delhi", teams: 5 },
  { name: "Sample Institute of Cyber Studies", state: "Maharashtra", teams: 5 },
  { name: "Sample Group of Institutions", state: "Bihar", teams: 4 },
];

// TODO: replace with real totals
export const COLLEGE_COUNT = 112; // total colleges registered
export const SELECTED_HACKERS = 500; // shortlisted participants
export const SELECTED_TEAMS = 125;

export const TRACKS = [
  { spell: "Aparecium", name: "Forensic Tech", icon: "🔍", desc: "Unmasking hidden digital truths, anti-forgery systems and automated cyber forensics." },
  { spell: "Lumos", name: "EdTech & Learning", icon: "✨", desc: "Illuminating education with adaptive learning and immersive technology." },
  { spell: "Alohomora", name: "Open Innovation", icon: "🗝️", desc: "Unlocking cross-disciplinary engineering and social-impact ideas." },
  { spell: "Decentralia", name: "Web3 & Blockchain", icon: "⛓️", desc: "Decentralised consensus, verifiable credentials and trustless governance." },
  { spell: "Herbivicus", name: "AI in Agriculture", icon: "🌱", desc: "Smart harvest intelligence, satellite crop analysis and precision farming." },
  { spell: "Conjurus", name: "Generative AI & LLMs", icon: "🔮", desc: "Autonomous agents and next-generation multimodal applications." },
  { spell: "Locomotor", name: "Robotics & IoT", icon: "🤖", desc: "Autonomous hardware brought to life with edge micro-controllers." },
  { spell: "Cave Inimicum", name: "Cybersecurity & Defense", icon: "🛡️", desc: "Zero-trust warding, security auditing and cryptographic vaults." },
  { spell: "Gringotts", name: "FinTech", icon: "🪙", desc: "Algorithmic finance, fraud suppression and instant micro-payments." },
  { spell: "Hogwarts", name: "Campus Solutions", icon: "🏰", desc: "Frictionless digital governance and tools for campus life." },
];

export const VAULTS = [
  { rank: "Grand Champion", vault: "Vault I · Golden Snitch", bounty: "₹25,000", perks: "Trophy, swags, incubation support, jury recognition" },
  { rank: "First Runner-Up", vault: "Vault II · Gringotts Cache", bounty: "₹15,000", perks: "Plaque, swags, industry mentorship, fast-track interviews" },
  { rank: "Second Runner-Up", vault: "Vault III · Elder Wand Vault", bounty: "₹10,000", perks: "Plaque, premium hack packs, tech goodies" },
];
export const PRIZE_POOL = "₹1 Lakh+";
