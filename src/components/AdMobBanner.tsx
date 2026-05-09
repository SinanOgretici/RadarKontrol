import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const BANNER_AD_ID = __DEV__ 
  ? TestIds.BANNER 
  : 'ca-app-pub-3581074606829094/6114467884';

interface AdMobBannerProps {
  size?: BannerAdSize;
}

export default function AdMobBanner({ size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER }: AdMobBannerProps) {
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={BANNER_AD_ID}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          console.log('Banner reklam yüklendi');
        }}
        onAdFailedToLoad={(error: Error) => {
          console.log('Banner reklam yüklenemedi:', error);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 5,
  },
});
