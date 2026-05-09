import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Animated,
  useColorScheme,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { getRadarTypeInfo } from '../../src/utils/radarType';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../src/store/useStore';
import { RouteCard } from '../../src/components/RouteCard';
import { useLocation } from '../../src/hooks/useLocation';
import { startBackgroundTracking, stopBackgroundTracking } from '../../src/services/backgroundTask';
import AdMobBanner from '../../src/components/AdMobBanner';

export default function MapScreen() {
  const systemDark = useColorScheme() === 'dark';
  const nightMode = useStore((s) => s.nightMode);
  const isDark = nightMode || systemDark;
  const mapRef = useRef<MapView>(null);
  const bannerAnim = useRef(new Animated.Value(-120)).current;

  const routeData = useStore((s) => s.routeData);
  const userLocation = useStore((s) => s.userLocation);
  const alertSettings = useStore((s) => s.alertSettings);
  const inAppAlert = useStore((s) => s.inAppAlert);

  useEffect(() => {
    if (inAppAlert) {
      Animated.spring(bannerAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();
    } else {
      Animated.timing(bannerAnim, {
        toValue: -120,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [inAppAlert]);

  // Ön planda konum izle
  useLocation();

  // Arka plan takibini başlat/durdur
  useEffect(() => {
    if (alertSettings.enabled) {
      startBackgroundTracking();
    } else {
      stopBackgroundTracking();
    }
    return () => { stopBackgroundTracking(); };
  }, [alertSettings.enabled]);

  // Rota yüklenince haritayı rota koordinatlarına odakla
  useEffect(() => {
    if (!routeData || !mapRef.current) return;

    const coords = routeData.Coordinates;
    if (coords.length === 0) return;

    const lats = coords.map((c) => c.y);
    const lons = coords.map((c) => c.x);
    mapRef.current.fitToCoordinates(
      coords.map((c) => ({ latitude: c.y, longitude: c.x })),
      {
        edgePadding: { top: 80, right: 40, bottom: 200, left: 40 },
        animated: true,
      }
    );
  }, [routeData]);

  const routePolyline = routeData?.Coordinates.map((c) => ({
    latitude: c.y,
    longitude: c.x,
  })) ?? [];

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        mapType="standard"
        showsUserLocation
        showsMyLocationButton
        initialRegion={{
          latitude: 39.0,
          longitude: 35.0,
          latitudeDelta: 8,
          longitudeDelta: 8,
        }}
      >
        {/* Ana rota polyline */}
        {routePolyline.length > 1 && (
          <Polyline
            coordinates={routePolyline}
            strokeColor="#4A90E2"
            strokeWidth={3}
            lineDashPattern={[8, 4]}
          />
        )}

        {/* Hız koridorları */}
        {routeData?.SpeedTunnels.map((tunnel) => (
          <React.Fragment key={`tunnel-${tunnel.id}`}>
            <Polyline
              coordinates={tunnel.coordinates.map((c) => ({
                latitude: c.y,
                longitude: c.x,
              }))}
              strokeColor="#FF9500"
              strokeWidth={5}
            />
            {/* Başlangıç marker */}
            <Marker
              coordinate={{ latitude: tunnel.startLatY, longitude: tunnel.startLonX }}
              title={tunnel.name}
              description={`Hız Limiti: ${tunnel.speedLimit} km/s | ${tunnel.length} km`}
              pinColor="#FF9500"
            />
            {/* Bitiş marker */}
            <Marker
              coordinate={{ latitude: tunnel.endLatY, longitude: tunnel.endLonX }}
              title={`Son: ${tunnel.name}`}
              description={`Hız koridoru bitişi`}
              pinColor="#FF6000"
            />
          </React.Fragment>
        ))}

        {/* Tekil radar noktaları */}
        {routeData?.Radars.map((radar, i) => {
          if (radar.latitude == null || radar.longitude == null) return null;
          const typeInfo = getRadarTypeInfo(
            radar.radarType,
            radar.controlPointTypeId,
            radar.isRadarli,
            radar.name
          );
          return (
            <Marker
              key={`radar-${radar.id ?? i}`}
              coordinate={{ latitude: radar.latitude, longitude: radar.longitude }}
              title={`${typeInfo.emoji} ${typeInfo.label}`}
              description={
                [
                  radar.name ? String(radar.name) : null,
                  radar.speedLimit ? `Hız Limiti: ${radar.speedLimit} km/s` : null,
                ]
                  .filter(Boolean)
                  .join(' • ') || undefined
              }
              pinColor={typeInfo.color}
            />
          );
        })}
      </MapView>

      {/* Üst başlık */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={[styles.headerBar, { backgroundColor: isDark ? '#1c1c1eee' : '#ffffffee' }]}>
          <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#1c1c1e' }]}>
            Radar Kontrol
          </Text>
          {alertSettings.enabled ? (
            <View style={styles.alertBadge}>
              <Text style={styles.alertBadgeText}>● Aktif</Text>
            </View>
          ) : null}
        </View>
      </SafeAreaView>

      {/* In-app uyarı banneri */}
      {inAppAlert && (
        <Animated.View
          style={[
            styles.alertBanner,
            { backgroundColor: inAppAlert.color, transform: [{ translateY: bannerAnim }] },
          ]}
        >
          <Text style={styles.alertBannerEmoji}>{inAppAlert.emoji}</Text>
          <View style={styles.alertBannerTextWrap}>
            <Text style={styles.alertBannerTitle}>{inAppAlert.message}</Text>
            <Text style={styles.alertBannerDist}>{inAppAlert.distanceM} metre ileride</Text>
          </View>
          <Text style={styles.alertBannerWarn}>DİKKAT</Text>
        </Animated.View>
      )}

      {/* Alt bilgi kartı */}
      {routeData && (
        <View style={styles.cardContainer}>
          <RouteCard data={routeData} />
        </View>
      )}

      {/* Rota yok mesajı */}
      {!routeData && (
        <View style={styles.noRouteContainer}>
          <View style={[styles.noRouteCard, { backgroundColor: isDark ? '#1c1c1eee' : '#ffffffee' }]}>
            <Text style={{ color: isDark ? '#aaa' : '#666', fontSize: 14 }}>
              Rota seçmek için "Rota" sekmesine gidin
            </Text>
          </View>
        </View>
      )}

      {/* Banner Reklam */}
      <View style={styles.adContainer}>
        <AdMobBanner />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerBar: {
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  alertBadge: {
    backgroundColor: '#34C75920',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  alertBadgeText: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContainer: {
    position: 'absolute',
    bottom: 60, // Banner için yer bırak
    left: 0,
    right: 0,
  },
  noRouteContainer: {
    position: 'absolute',
    bottom: 84, // Banner için yer bırak
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  noRouteCard: {
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  adContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  alertBanner: {
    position: 'absolute',
    top: 90,
    left: 16,
    right: 16,
    zIndex: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },
  alertBannerEmoji: {
    fontSize: 36,
    marginRight: 12,
  },
  alertBannerTextWrap: {
    flex: 1,
  },
  alertBannerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  alertBannerDist: {
    color: '#ffffffcc',
    fontSize: 13,
    marginTop: 2,
  },
  alertBannerWarn: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    opacity: 0.85,
  },
});
