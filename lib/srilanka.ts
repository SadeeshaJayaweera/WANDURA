export interface SriLankanCity {
  name: string
  sinhala: string
  district: string
  lat: number
  lng: number
}

export const SRI_LANKAN_CITIES: SriLankanCity[] = [
  { name: 'Colombo', sinhala: 'කොළඹ', district: 'Colombo', lat: 6.9271, lng: 79.8612 },
  { name: 'Kandy', sinhala: 'මහනුවර', district: 'Kandy', lat: 7.2906, lng: 80.6337 },
  { name: 'Galle', sinhala: 'ගාල්ල', district: 'Galle', lat: 6.0535, lng: 80.2210 },
  { name: 'Gampaha', sinhala: 'ගම්පහ', district: 'Gampaha', lat: 7.0840, lng: 79.9943 },
  { name: 'Negombo', sinhala: 'මීගමුව', district: 'Gampaha', lat: 7.2088, lng: 79.8358 },
  { name: 'Kurunegala', sinhala: 'කුරුණෑගල', district: 'Kurunegala', lat: 7.4863, lng: 80.3623 },
  { name: 'Kalutara', sinhala: 'කළුතර', district: 'Kalutara', lat: 6.5854, lng: 79.9607 },
  { name: 'Matara', sinhala: 'මාතර', district: 'Matara', lat: 5.9549, lng: 80.5550 },
  { name: 'Maharagama', sinhala: 'මහරගම', district: 'Colombo', lat: 6.8480, lng: 79.9265 },
  { name: 'Moratuwa', sinhala: 'මොරටුව', district: 'Colombo', lat: 6.7730, lng: 79.8816 },
  { name: 'Kaduwela', sinhala: 'කඩුවෙල', district: 'Colombo', lat: 6.9333, lng: 79.9833 },
  { name: 'Dehiwala', sinhala: 'දෙහිවල', district: 'Colombo', lat: 6.8301, lng: 79.8801 },
  { name: 'Nugegoda', sinhala: 'නුගේගොඩ', district: 'Colombo', lat: 6.8649, lng: 79.8997 },
  { name: 'Panadura', sinhala: 'පානදුර', district: 'Kalutara', lat: 6.7132, lng: 79.9074 },
  { name: 'Anuradhapura', sinhala: 'අනුරාධපුරය', district: 'Anuradhapura', lat: 8.3114, lng: 80.4037 },
  { name: 'Ratnapura', sinhala: 'රත්නපුරය', district: 'Ratnapura', lat: 6.7056, lng: 80.3847 },
  { name: 'Jaffna', sinhala: 'යාපනය', district: 'Jaffna', lat: 9.6615, lng: 80.0255 },
  { name: 'Batticaloa', sinhala: 'මඩකලපුව', district: 'Batticaloa', lat: 7.7170, lng: 81.7000 },
]

export const SKILL_LABELS: Record<string, { en: string; si: string; emoji: string }> = {
  MASON: { en: 'Mason', si: 'මේසන් බාස්', emoji: '🧱' },
  CARPENTER: { en: 'Carpenter', si: 'වඩු බාස්', emoji: '🪵' },
  WELDER: { en: 'Welder', si: 'වෙල්ඩින් කාර්මික', emoji: '⚙️' },
  TILE_LAYER: { en: 'Tile Layer', si: 'ටයිල් බාස්', emoji: '🏠' },
  PLUMBER: { en: 'Plumber', si: 'නල කාර්මික', emoji: '🔧' },
  ELECTRICIAN: { en: 'Electrician', si: 'විදුලි කාර්මික', emoji: '⚡' },
  STEEL_FIXER: { en: 'Steel Fixer', si: 'යකඩ බාස්', emoji: '🏗️' },
  PAINTER: { en: 'Painter', si: 'තීන්ත ආලේපක', emoji: '🎨' },
}

export function getSkillLabel(skillKey: string, format: 'combo' | 'si' | 'en' = 'en'): string {
  const item = SKILL_LABELS[skillKey]
  if (!item) return skillKey.replace(/_/g, ' ')
  if (format === 'si') return item.si
  if (format === 'en') return item.en
  return `${item.en} (${item.si})`
}

export function findNearestCity(lat: number, lng: number): SriLankanCity {
  let nearest = SRI_LANKAN_CITIES[0]
  let minDistance = Infinity

  for (const city of SRI_LANKAN_CITIES) {
    const dLat = city.lat - lat
    const dLng = city.lng - lng
    const distSq = dLat * dLat + dLng * dLng
    if (distSq < minDistance) {
      minDistance = distSq
      nearest = city
    }
  }

  return nearest
}

