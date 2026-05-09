import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useStore } from '../../src/store/useStore';
import AdMobBanner from '../../src/components/AdMobBanner';

export default function SettingsScreen() {
  const systemDark = useColorScheme() === 'dark';
  const { alertSettings, setAlertSettings, nightMode, setNightMode, favorites, removeFavorite, clearRoute } = useStore();
  const isDark = nightMode || systemDark;
  const colors = isDark ? dark : light;

  const [sliderValue, setSliderValue] = useState(alertSettings.distanceThreshold);

  function changeDistance(delta: number) {
    const next = Math.min(2000, Math.max(100, sliderValue + delta));
    setSliderValue(next);
    setAlertSettings({ distanceThreshold: next });
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.header, { color: colors.text }]}>Ayarlar</Text>

        {/* Uyarı Sistemi */}
        <GroupHeader label="Uyarı Sistemi" color={colors.sub} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ToggleRow
            label="Uyarı Aktif"
            icon="alert-circle"
            value={alertSettings.enabled}
            onToggle={(v) => setAlertSettings({ enabled: v })}
            colors={colors}
          />
          <Separator color={colors.border} />
          <ToggleRow
            label="Bildirim Sesi"
            icon="volume-high"
            value={alertSettings.soundEnabled}
            onToggle={(v) => setAlertSettings({ soundEnabled: v })}
            colors={colors}
          />
          <Separator color={colors.border} />
          <ToggleRow
            label="Sesli Asistan (TTS)"
            icon="mic"
            value={alertSettings.speechEnabled}
            onToggle={(v) => {
              if (!v) Speech.stop();
              setAlertSettings({ speechEnabled: v });
            }}
            colors={colors}
          />
          <Separator color={colors.border} />
          <View style={styles.distanceRow}>
            <Ionicons name="radio" size={20} color="#E84041" />
            <Text style={[styles.distanceLabel, { color: colors.text }]}>  Uyarı Mesafesi</Text>
            <View style={styles.distanceStepper}>
              <TouchableOpacity
                style={[styles.stepBtn, { borderColor: colors.border, opacity: sliderValue <= 100 ? 0.3 : 1 }]}
                onPress={() => changeDistance(-100)}
                disabled={sliderValue <= 100}
              >
                <Text style={[styles.stepBtnText, { color: colors.text }]}>−</Text>
              </TouchableOpacity>
              <Text style={[styles.distanceValue, { color: '#E84041' }]}>{sliderValue} m</Text>
              <TouchableOpacity
                style={[styles.stepBtn, { borderColor: colors.border, opacity: sliderValue >= 2000 ? 0.3 : 1 }]}
                onPress={() => changeDistance(100)}
                disabled={sliderValue >= 2000}
              >
                <Text style={[styles.stepBtnText, { color: colors.text }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Görünüm */}
        <GroupHeader label="Görünüm" color={colors.sub} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ToggleRow
            label="Gece Modu"
            icon="moon"
            value={nightMode}
            onToggle={setNightMode}
            colors={colors}
          />
        </View>

        {/* Favoriler */}
        {favorites.length > 0 && (
          <>
            <GroupHeader label="Favori Rotalar" color={colors.sub} />
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {favorites.map((fav, i) => (
                <React.Fragment key={fav.id}>
                  {i > 0 && <Separator color={colors.border} />}
                  <View style={styles.favRow}>
                    <Ionicons name="heart" size={16} color="#E84041" />
                    <Text style={[styles.favLabel, { color: colors.text }]} numberOfLines={2}>
                      {'  '}{fav.label}
                    </Text>
                    <TouchableOpacity onPress={() => removeFavorite(fav.id)}>
                      <Ionicons name="trash-outline" size={18} color="#E84041" />
                    </TouchableOpacity>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </>
        )}

        {/* Tehlikeli Alan */}
        <GroupHeader label="Diğer" color={colors.sub} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.dangerRow}
            onPress={() =>
              Alert.alert('Rotayı Temizle', 'Mevcut rota ve seçimler silinecek.', [
                { text: 'İptal', style: 'cancel' },
                { text: 'Temizle', style: 'destructive', onPress: clearRoute },
              ])
            }
          >
            <Ionicons name="trash" size={20} color="#E84041" />
            <Text style={styles.dangerText}>  Rotayı Temizle</Text>
          </TouchableOpacity>
        </View>

        {/* Versiyon */}
        <Text style={[styles.version, { color: colors.sub }]}>
          Radar Kontrol v1.0.0 • icisleri.gov.tr
        </Text>
      </ScrollView>

      {/* Banner Reklam */}
      <AdMobBanner />
    </SafeAreaView>
  );
}

function GroupHeader({ label, color }: { label: string; color: string }) {
  return (
    <Text style={[styles.groupHeader, { color }]}>{label.toUpperCase()}</Text>
  );
}

function ToggleRow({
  label, icon, value, onToggle, colors,
}: {
  label: string; icon: string; value: boolean; onToggle: (v: boolean) => void;
  colors: typeof light;
}) {
  return (
    <View style={styles.toggleRow}>
      <Ionicons name={icon as any} size={20} color="#E84041" />
      <Text style={[styles.toggleLabel, { color: colors.text }]}>{'  '}{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#3a3a3c', true: '#E84041' }}
        thumbColor="#fff"
      />
    </View>
  );
}

function Separator({ color }: { color: string }) {
  return <View style={[styles.sep, { backgroundColor: color }]} />;
}

const light = { bg: '#f2f2f7', text: '#1c1c1e', sub: '#8e8e93', card: '#fff', border: '#e0e0e0' };
const dark = { bg: '#000', text: '#fff', sub: '#636366', card: '#1c1c1e', border: '#2c2c2e' };

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  header: { fontSize: 26, fontWeight: '700', marginBottom: 20 },
  groupHeader: { fontSize: 12, fontWeight: '600', marginBottom: 6, marginLeft: 4, marginTop: 16 },
  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: 4 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  toggleLabel: { flex: 1, fontSize: 15 },
  distanceRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  distanceLabel: { flex: 1, fontSize: 15 },
  distanceStepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  distanceValue: { fontSize: 15, fontWeight: '700', minWidth: 70, textAlign: 'center' },
  stepBtn: { width: 34, height: 34, borderRadius: 8, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  stepBtnText: { fontSize: 20, lineHeight: 24, fontWeight: '500' },
  sep: { height: 0.5, marginLeft: 14 },
  favRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  favLabel: { flex: 1, fontSize: 13 },
  dangerRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  dangerText: { fontSize: 15, color: '#E84041', fontWeight: '500' },
  version: { textAlign: 'center', fontSize: 12, marginTop: 32 },
});
