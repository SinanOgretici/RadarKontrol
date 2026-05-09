import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';

class AdMobService {
  private initialized = false;

  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      await mobileAds().initialize();
      
      // AdMob ayarları
      await mobileAds().setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.PG,
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
      });

      this.initialized = true;
      console.log('AdMob başarıyla başlatıldı');
    } catch (error) {
      console.error('AdMob başlatma hatası:', error);
    }
  }

  isInitialized() {
    return this.initialized;
  }
}

export default new AdMobService();
