import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import '../src/services/backgroundTask';
import admobService from '../src/services/admobService';
import appOpenAdService from '../src/services/appOpenAdService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Bildirim izni
    Notifications.requestPermissionsAsync();
    
    // AdMob başlat
    admobService.initialize().then(() => {
      // İlk açılışta reklam göster
      appOpenAdService.showInitialAd();
    });
  }, []);

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
