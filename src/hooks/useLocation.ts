import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useStore } from '../store/useStore';
import { checkProximityAlert } from '../services/alertService';
import { haversineDistance } from '../utils/haversine';
import { getRadarTypeInfo } from '../utils/radarType';

const FOREGROUND_COOLDOWN_MS = 30000;
let lastForegroundAlertTime = 0;

export function useLocation() {
  const setUserLocation = useStore((s) => s.setUserLocation);
  const setInAppAlert = useStore((s) => s.setInAppAlert);
  const alertSettings = useStore((s) => s.alertSettings);
  const routeData = useStore((s) => s.routeData);
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || !mounted) return;

      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 30,
          timeInterval: 5000,
        },
        (loc) => {
          if (!mounted) return;
          const { latitude, longitude } = loc.coords;
          setUserLocation({ latitude, longitude });

          if (!routeData || !alertSettings.enabled) return;

          // Arkaplanda çalışan push bildirimi
          checkProximityAlert(latitude, longitude);

          // Önplanda çalışan in-app uyarı + haptic
          const now = Date.now();
          if (now - lastForegroundAlertTime < FOREGROUND_COOLDOWN_MS) return;

          const threshold = alertSettings.distanceThreshold ?? 500;

          for (const tunnel of routeData.SpeedTunnels) {
            const dist = Math.min(
              haversineDistance(latitude, longitude, tunnel.startLatY, tunnel.startLonX),
              haversineDistance(latitude, longitude, tunnel.endLatY, tunnel.endLonX)
            );
            if (dist <= threshold) {
              lastForegroundAlertTime = now;
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
              setInAppAlert({
                message: `Hız Koridoru — ${tunnel.speedLimit} km/s limiti`,
                emoji: '⚡',
                color: '#FF9500',
                distanceM: Math.round(dist),
              });
              dismissTimerRef.current = setTimeout(() => setInAppAlert(null), 6000);
              return;
            }
          }

          for (const radar of routeData.Radars) {
            if (radar.latitude == null || radar.longitude == null) continue;
            const dist = haversineDistance(latitude, longitude, radar.latitude, radar.longitude);
            if (dist <= threshold) {
              lastForegroundAlertTime = now;
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              const typeInfo = getRadarTypeInfo(radar.radarType, radar.controlPointTypeId, radar.isRadarli, radar.name);
              if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
              setInAppAlert({
                message: typeInfo.label,
                emoji: typeInfo.emoji,
                color: typeInfo.color,
                distanceM: Math.round(dist),
              });
              dismissTimerRef.current = setTimeout(() => setInAppAlert(null), 6000);
              return;
            }
          }
        }
      );
    })();

    return () => {
      mounted = false;
      watchRef.current?.remove();
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [routeData, alertSettings.enabled, alertSettings.distanceThreshold]);

  return null;
}
