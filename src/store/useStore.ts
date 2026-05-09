import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  RouteData,
  RouteSelection,
  AlertSettings,
  FavoriteRoute,
} from '../types';

export interface InAppAlert {
  message: string;
  emoji: string;
  color: string;
  distanceM: number;
}

interface AppState {
  routeData: RouteData | null;
  isLoading: boolean;
  error: string | null;
  selection: RouteSelection;
  userLocation: { latitude: number; longitude: number } | null;
  alertSettings: AlertSettings;
  activeAlert: boolean;
  lastAlertedId: string | null;
  favorites: FavoriteRoute[];
  nightMode: boolean;
  inAppAlert: InAppAlert | null;

  setRouteData: (data: RouteData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelection: (selection: Partial<RouteSelection>) => void;
  setUserLocation: (loc: { latitude: number; longitude: number } | null) => void;
  setAlertSettings: (settings: Partial<AlertSettings>) => void;
  setActiveAlert: (active: boolean) => void;
  setLastAlertedId: (id: string | null) => void;
  addFavorite: (fav: FavoriteRoute) => void;
  removeFavorite: (id: string) => void;
  setNightMode: (enabled: boolean) => void;
  setInAppAlert: (alert: InAppAlert | null) => void;
  clearRoute: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      routeData: null,
      isLoading: false,
      error: null,
      selection: {
        fromCity: null,
        fromDistrict: null,
        toCity: null,
        toDistrict: null,
      },
      userLocation: null,
      alertSettings: {
        enabled: true,
        soundEnabled: true,
        speechEnabled: true,
        distanceThreshold: 500,
      },
      activeAlert: false,
      lastAlertedId: null,
      favorites: [],
      nightMode: false,
      inAppAlert: null,

      setRouteData: (data) => set({ routeData: data, error: null }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setSelection: (selection) =>
        set((state) => ({ selection: { ...state.selection, ...selection } })),
      setUserLocation: (loc) => set({ userLocation: loc }),
      setAlertSettings: (settings) =>
        set((state) => ({
          alertSettings: { ...state.alertSettings, ...settings },
        })),
      setActiveAlert: (active) => set({ activeAlert: active }),
      setLastAlertedId: (id) => set({ lastAlertedId: id }),
      addFavorite: (fav) =>
        set((state) => ({ favorites: [...state.favorites, fav] })),
      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
        })),
      setNightMode: (enabled) => set({ nightMode: enabled }),
      setInAppAlert: (alert) => set({ inAppAlert: alert }),
      clearRoute: () =>
        set({
          routeData: null,
          error: null,
          activeAlert: false,
          lastAlertedId: null,
          selection: {
            fromCity: null,
            fromDistrict: null,
            toCity: null,
            toDistrict: null,
          },
        }),
    }),
    {
      name: 'radar-kontrol-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        routeData: state.routeData,
        alertSettings: state.alertSettings,
        favorites: state.favorites,
        nightMode: state.nightMode,
        selection: state.selection,
      }),
    }
  )
);
