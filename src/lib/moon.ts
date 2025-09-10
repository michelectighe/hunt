// lib/moon.ts
// Lightweight moon phase util (no deps). Good enough for UI + tagging pins.

const SYNODIC_MONTH = 29.530588853; // days
// Reference new moon: 2000-01-06 18:14 UTC (Julian Day 2451550.1)
const NEW_MOON_JD_2000 = 2451550.1;

// Convert JS Date -> Julian Day (UTC)
function toJulianDay(d: Date): number {
  const utc = new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds(),
      d.getUTCMilliseconds()
    )
  );
  const time = utc.getTime();
  return time / 86400000 + 2440587.5; // ms -> days + JD of Unix epoch
}

const PHASE_NAMES = [
  "New Moon",
  "Waxing Crescent",
  "First Quarter",
  "Waxing Gibbous",
  "Full Moon",
  "Waning Gibbous",
  "Last Quarter",
  "Waning Crescent",
] as const;

const PHASE_EMOJI = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"] as const;

export type MoonData = {
  ageDays: number; // 0..29.53
  illumination: number; // 0..1
  phaseIndex: number; // 0..7 (matches arrays above)
  phaseName: (typeof PHASE_NAMES)[number];
  emoji: (typeof PHASE_EMOJI)[number];
};

export function getMoonData(date: Date = new Date()): MoonData {
  const jd = toJulianDay(date);
  const daysSince = jd - NEW_MOON_JD_2000;
  // normalize age to [0, SYNODIC_MONTH)
  const age = ((daysSince % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;

  // 8 equal bins across the synodic month (offset by 1/16 to center bins)
  const phaseIndex = Math.floor(
    ((age + SYNODIC_MONTH / 16) / (SYNODIC_MONTH / 8)) % 8
  );

  // Approx illum fraction (0..1)
  const phaseAngle = (2 * Math.PI * age) / SYNODIC_MONTH; // 0..2π
  const illumination = 0.5 * (1 - Math.cos(phaseAngle)); // 0(new)->1(full)->0(new)

  return {
    ageDays: age,
    illumination,
    phaseIndex,
    phaseName: PHASE_NAMES[phaseIndex],
    emoji: PHASE_EMOJI[phaseIndex],
  };
}
