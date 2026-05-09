import { AppOpenAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { AppState, AppStateStatus } from 'react-native';

const APP_OPEN_AD_ID = __DEV__ 
  ? TestIds.APP_OPEN 
  : 'ca-app-pub-3581074606829094/6206416933';

class AppOpenAdService {
  private appOpenAd: AppOpenAd | null = null;
  private isLoadingAd = false;
  private isShowingAd = false;
  private appState: AppStateStatus = AppState.currentState;
  private lastAdShownTime = 0;
  private readonly AD_SHOW_INTERVAL = 4 * 60 * 60 * 1000; // 4 saat

  constructor() {
    this.loadAd();
    this.setupAppStateListener();
  }

  private setupAppStateListener() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (
      this.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // Uygulama ön plana geldi
      this.showAdIfAvailable();
    }
    this.appState = nextAppState;
  };

  private loadAd() {
    if (this.isLoadingAd || this.isShowingAd) {
      return;
    }

    this.isLoadingAd = true;

    this.appOpenAd = AppOpenAd.createForAdRequest(APP_OPEN_AD_ID, {
      requestNonPersonalizedAdsOnly: false,
    });

    this.appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log('App Open Ad yüklendi');
      this.isLoadingAd = false;
    });

    this.appOpenAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.log('App Open Ad yükleme hatası:', error);
      this.isLoadingAd = false;
      this.appOpenAd = null;
    });

    this.appOpenAd.addAdEventListener(AdEventType.OPENED, () => {
      console.log('App Open Ad açıldı');
      this.isShowingAd = true;
    });

    this.appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('App Open Ad kapatıldı');
      this.isShowingAd = false;
      this.lastAdShownTime = Date.now();
      this.appOpenAd = null;
      // Yeni reklam yükle
      this.loadAd();
    });

    this.appOpenAd.load();
  }

  async showAdIfAvailable() {
    // 4 saatten önce reklam gösterme
    if (Date.now() - this.lastAdShownTime < this.AD_SHOW_INTERVAL) {
      console.log('Reklam çok yakın zamanda gösterildi, atlanıyor');
      return;
    }

    if (!this.appOpenAd || this.isShowingAd) {
      console.log('Reklam hazır değil veya zaten gösteriliyor');
      this.loadAd();
      return;
    }

    try {
      await this.appOpenAd.show();
    } catch (error) {
      console.log('App Open Ad gösterme hatası:', error);
      this.isShowingAd = false;
      this.appOpenAd = null;
      this.loadAd();
    }
  }

  // İlk açılışta reklam göster
  async showInitialAd() {
    // Biraz bekle (kullanıcı deneyimi için)
    await new Promise(resolve => setTimeout(resolve, 1000));
    await this.showAdIfAvailable();
  }
}

export default new AppOpenAdService();
