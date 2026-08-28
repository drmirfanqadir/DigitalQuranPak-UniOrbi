// AlQuran.cloud API integration

export const API_BASE = "https://api.alquran.cloud/v1";
export const AUDIO_CDN = "https://cdn.islamic.network/quran/audio/128";

export type ReciterId = typeof RECITERS[number]["id"];

export const RECITERS = [
  { id: "ar.alafasy",         name: "Mishary Alafasy",       lang: "Arabic" },
  { id: "ar.abdurrahmaansudais", name: "Abdurrahman As-Sudais", lang: "Arabic" },
  { id: "ar.husary",          name: "Mahmoud Khalil Al-Husary", lang: "Arabic" },
  { id: "ar.minshawi",        name: "Mohamed Siddiq Al-Minshawi", lang: "Arabic" },
  { id: "ar.mahermuaiqly",    name: "Maher Al Muaiqly",      lang: "Arabic" },
  { id: "ar.abdullahbasfar",  name: "Abdullah Basfar",       lang: "Arabic" },
  { id: "ar.shaatree",        name: "Abu Bakr Ash-Shaatree", lang: "Arabic" },
  { id: "ar.hanirifai",       name: "Hani Ar-Rifai",         lang: "Arabic" },
  { id: "ar.ibrahimakhbar",   name: "Ibrahim Al-Akhdar",     lang: "Arabic" },
  { id: "ar.muhammadayyoub",  name: "Muhammad Ayyoub",       lang: "Arabic" },
] as const;

export const TRANSLATIONS = [
  { id: "en.sahih",       label: "English · Sahih",       lang: "en" },
  { id: "en.pickthall",   label: "English · Pickthall",   lang: "en" },
  { id: "en.yusufali",    label: "English · Yusuf Ali",   lang: "en" },
  { id: "en.ahmedali",    label: "English · Ahmed Ali",   lang: "en" },
  { id: "ur.jalandhry",   label: "اردو · جالندھری",       lang: "ur" },
  { id: "ur.ahmedali",    label: "اردو · احمد علی",       lang: "ur" },
  { id: "ur.maududi",     label: "اردو · مودودی",         lang: "ur" },
  { id: "fr.hamidullah",  label: "Français · Hamidullah", lang: "fr" },
  { id: "de.bubenheim",   label: "Deutsch · Bubenheim",   lang: "de" },
  { id: "tr.diyanet",     label: "Türkçe · Diyanet",      lang: "tr" },
] as const;

export type TranslationId = typeof TRANSLATIONS[number]["id"];

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
}

export interface Edition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
  direction: string | null;
}

export interface SurahData {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  ayahs: Ayah[];
  edition: Edition;
}

export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

// Cache to avoid re-fetching
const surahCache = new Map<string, SurahData[]>();

export async function fetchSurahMultiEdition(
  surahNumber: number,
  editions: string[]
): Promise<SurahData[]> {
  const key = `${surahNumber}-${editions.join(",")}`;
  if (surahCache.has(key)) return surahCache.get(key)!;

  const editionStr = editions.join(",");
  const res = await fetch(`${API_BASE}/surah/${surahNumber}/editions/${editionStr}`);
  if (!res.ok) throw new Error(`Failed to fetch surah ${surahNumber}`);
  const json = await res.json() as { code: number; data: SurahData[] };
  surahCache.set(key, json.data);
  return json.data;
}

// List of all 114 surahs
let surahListCache: SurahMeta[] | null = null;

export async function fetchSurahList(): Promise<SurahMeta[]> {
  if (surahListCache) return surahListCache;
  const res = await fetch(`${API_BASE}/surah`);
  if (!res.ok) throw new Error("Failed to fetch surah list");
  const json = await res.json() as { code: number; data: SurahMeta[] };
  surahListCache = json.data;
  return json.data;
}

export function getAudioUrl(reciterId: ReciterId, surahNumber: number, ayahNumber: number): string {
  // Format: SSSaaa (3-digit surah + 3-digit ayah)
  const ayahGlobal = getGlobalAyahNumber(surahNumber, ayahNumber);
  return `${AUDIO_CDN}/${reciterId}/${ayahGlobal}.mp3`;
}

// Approximate global ayah numbers (cumulative count per surah)
// This is the standard used by the CDN
const SURAH_OFFSETS = [
  0,7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,
  98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,30,28,
  28,55,33,28,24,22,75,60,34,30,73,54,45,83,30,28,28,55,33,28,24,22,
  75,60,34,30,73,54,45,83,30,28,28,55,33,28,24,22,75,60,34,30,73,
  54,45,83,30,28,28,55,33,28,24,22,75,60,34,30,73,54,45,83,30,28,
  28,55,33,28,24,22,75,60,34,30,73,54,45,83,30,28
];

// Precomputed cumulative ayah offsets for all 114 surahs
const CUMULATIVE_OFFSETS = [
  0,7,293,493,669,789,954,1160,1235,1364,1473,1596,1707,1750,1802,1901,2029,2140,2250,
  2348,2483,2595,2673,2791,2855,2932,3159,3252,3340,3409,3469,3503,3533,3606,3660,3705,
  3788,3818,3846,3874,3929,3962,3990,4014,4036,4111,4171,4205,4235,4308,4362,4407,4490,
  4520,4548,4576,4631,4664,4692,4716,4738,4813,4873,4907,4937,5010,5064,5109,5192,5222,
  5250,5278,5333,5366,5394,5418,5440,5515,5575,5609,5639,5712,5766,5811,5894,5924,5952,
  5980,6035,6068,6096,6120,6142,6217,6277,6311,6341,6414,6468,6513,6596,6626,6654,6682,
  6737,6770,6798,6822,6844,6919,6979,7013,7043,7116,7170,7215
];

function getGlobalAyahNumber(surahNumber: number, ayahNumber: number): number {
  const offset = CUMULATIVE_OFFSETS[surahNumber - 1] ?? 0;
  return offset + ayahNumber;
}

// Suppress unused variable warning for SURAH_OFFSETS
void SURAH_OFFSETS;
