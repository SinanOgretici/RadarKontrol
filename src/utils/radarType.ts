export type RadarTypeInfo = {
  label: string;
  emoji: string;
  color: string;
  alertPrefix: string;
};

/**
 * Radar noktası türünü belirler.
 * Önce name alanındaki Türkçe anahtar kelimelere bakar (API her zaman name döndürür).
 * Yoksa radarType / controlPointTypeId / isRadarli alanlarını kullanır.
 */
export function getRadarTypeInfo(
  radarType?: number,
  controlPointTypeId?: number,
  isRadarli?: boolean,
  name?: string
): RadarTypeInfo {
  const nameLower = (name ?? '').toLocaleLowerCase('tr-TR');

  // İsim tabanlı tespit (en güvenilir yol)
  if (nameLower.includes('sabit')) {
    return { label: 'Sabit Radar', emoji: '📷', color: '#E84041', alertPrefix: 'sabit radar noktası' };
  }
  if (nameLower.includes('mobil')) {
    return { label: 'Mobil Radar', emoji: '🚔', color: '#FF6B00', alertPrefix: 'mobil radar noktası' };
  }
  if (nameLower.includes('kontrol') && (nameLower.includes('radarlı') || nameLower.includes('radarli'))) {
    return { label: 'Kontrol Noktası (Radarlı)', emoji: '🚧', color: '#FF9500', alertPrefix: 'radarlı kontrol noktası' };
  }
  if (nameLower.includes('kontrol')) {
    return { label: 'Kontrol Noktası', emoji: '🛑', color: '#34C759', alertPrefix: 'kontrol noktası' };
  }

  // Sayısal kod tabanlı tespit (API bu alanı dönerse)
  const code = radarType ?? controlPointTypeId;
  switch (code) {
    case 1:
      return { label: 'Sabit Radar', emoji: '📷', color: '#E84041', alertPrefix: 'sabit radar noktası' };
    case 2:
      return { label: 'Mobil Radar', emoji: '🚔', color: '#FF6B00', alertPrefix: 'mobil radar noktası' };
    case 3:
      return { label: 'Kontrol Noktası (Radarlı)', emoji: '🚧', color: '#FF9500', alertPrefix: 'radarlı kontrol noktası' };
    case 4:
      return { label: 'Kontrol Noktası', emoji: '🛑', color: '#34C759', alertPrefix: 'kontrol noktası' };
  }

  // isRadarli boolean'ı varsa
  if (isRadarli === false) {
    return { label: 'Kontrol Noktası', emoji: '🛑', color: '#34C759', alertPrefix: 'kontrol noktası' };
  }

  return { label: 'Radar Noktası', emoji: '📡', color: '#E84041', alertPrefix: 'radar noktası' };
}
