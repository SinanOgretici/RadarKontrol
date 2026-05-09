# Radar Kontrol

İçişleri Bakanlığı'nın [radar ve kontrol noktası veritabanını](https://www.icisleri.gov.tr/iller-arasi-radar-ve-kontrol-noktasi-uygulama-sayilari) kullanan React Native (Expo) mobil uygulaması.

## Özellikler

- İl / ilçe seçimi ile rota oluşturma
- Haritada hız koridoru polyline'ları (tam GPS koordinatları)
- Haritada tekil radar noktaları
- 500m'de sesli + bildirimi uyarı (ayarlanabilir)
- Arka planda konum izleme
- Sesli asistan (TTS)
- Favori rotalar
- Offline cache
- Gece modu

## Kurulum

### Gereksinimler

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Android cihaz veya emülatör

## Proje Yapısı

```
RadarKontrol/
├── app/
│   ├── _layout.tsx          → Root layout, bildirim izni
│   └── (tabs)/
│       ├── index.tsx         → Harita ekranı
│       ├── route.tsx         → Rota seçimi
│       └── settings.tsx      → Ayarlar
├── src/
│   ├── api/radarApi.ts       → CreateRoute API
│   ├── components/RouteCard  → Rota bilgi kartı
│   ├── hooks/                → useLocation, useRadar
│   ├── services/             → AlertService, BackgroundTask
│   ├── store/useStore.ts     → Zustand store
│   ├── types/index.ts        → TypeScript tipleri
│   └── utils/haversine.ts    → Mesafe hesabı
└── assets/data/districts.json → 81 il / 973 ilçe verisi
