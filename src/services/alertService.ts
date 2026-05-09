import * as Notifications from 'expo-notifications';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { haversineDistance } from '../utils/haversine';
import { getRadarTypeInfo } from '../utils/radarType';
import { RouteData, AlertSettings } from '../types';

const ROUTE_DATA_KEY = 'radar-kontrol-storage';
const ALERT_COOLDOWN_MS = 30000; // 30 saniye
let lastAlertTime = 0;

export async function checkProximityAlert(
  userLat: number,
  userLon: number
): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(ROUTE_DATA_KEY);
    if (!raw) return;

    const stored = JSON.parse(raw);
    const routeData: RouteData | null = stored?.state?.routeData;
    const alertSettings: AlertSettings | null = stored?.state?.alertSettings;

    if (!routeData || !alertSettings?.enabled) return;

    const threshold = alertSettings.distanceThreshold ?? 500;
    const now = Date.now();
    if (now - lastAlertTime < ALERT_COOLDOWN_MS) return;

    // Hız koridorları kontrolü
    for (const tunnel of routeData.SpeedTunnels) {
      const distStart = haversineDistance(
        userLat, userLon,
        tunnel.startLatY, tunnel.startLonX
      );
      const distEnd = haversineDistance(
        userLat, userLon,
        tunnel.endLatY, tunnel.endLonX
      );
      const minDist = Math.min(distStart, distEnd);

      if (minDist <= threshold) {
        lastAlertTime = now;
        await triggerAlert(
          `Dikkat! ${Math.round(minDist)} metre ileride hız koridoru. Hız limiti: ${tunnel.speedLimit} km/s`,
          alertSettings
        );
        return;
      }
    }

    // Tekil radar kontrolü
    for (const radar of routeData.Radars) {
      if (radar.latitude == null || radar.longitude == null) continue;
      const dist = haversineDistance(
        userLat, userLon,
        radar.latitude, radar.longitude
      );
      if (dist <= threshold) {
        lastAlertTime = now;
        const typeInfo = getRadarTypeInfo(
          radar.radarType,
          radar.controlPointTypeId,
          radar.isRadarli,
          radar.name
        );
        const speedPart = radar.speedLimit
          ? ` Hız limiti: ${radar.speedLimit} km/s.`
          : '';
        await triggerAlert(
          `Dikkat! ${Math.round(dist)} metre ileride ${typeInfo.alertPrefix}.${speedPart}`,
          alertSettings
        );
        return;
      }
    }
  } catch (e) {
    // Arka plan hataları sessizce geç
  }
}

async function triggerAlert(
  message: string,
  settings: AlertSettings
): Promise<void> {
  // Önceki konuşmayı durdur (toggle kapatılmış olsa bile temizle)
  Speech.stop();

  // Bildirim gönder
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Radar Uyarısı',
      body: message,
      sound: settings.soundEnabled ? 'default' : undefined,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null,
  });

  // Sesli konuşma
  if (settings.speechEnabled) {
    Speech.speak(message, { language: 'tr-TR', rate: 1.1 });
  }
}
