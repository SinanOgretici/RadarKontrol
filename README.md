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

### Adımlar

```bash
cd RadarKontrol
npm install --legacy-peer-deps
```

### Google Maps API Key

`app.json` içindeki `YOUR_GOOGLE_MAPS_API_KEY` yerine kendi anahtarını gir:

1. [Google Cloud Console](https://console.cloud.google.com/) → Maps SDK for Android etkinleştir
2. API key oluştur
3. `app.json` → `android.config.googleMaps.apiKey` güncelle

### Çalıştırma

```bash
# Expo Go ile (Maps tam çalışmaz, geliştirme için)
npx expo start

# Android cihaz/emülatöre direkt kur
npx expo run:android
```

## APK / AAB Build

EAS Build için:

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview   # APK
eas build --platform android --profile production # AAB
```

`eas.json`:

```json
{
  "build": {
    "preview": {
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

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
```

## API

### CreateRoute
```
POST https://www.icisleri.gov.tr/ISAYWebPart/PolGenControlPointV2/CreateRoute
Body: fromLatitude, fromLongitude, toLatitude, toLongitude, fromDistrictId, toDistrictId
```

Response: Rota polyline, hız koridorları (tam GPS koordinatları), tekil radar noktaları, il bazlı istatistik

### GetDistricts
```
GET https://www.icisleri.gov.tr/ISAYWebPart/PolGenControlPointV2/GetDistricts?cityId={plateNo}
```

Response: `[{ Id, Name, Latitude, Longitude }]` — İlçe listesi (cityId = il plaka numarası)
