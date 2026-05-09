import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useColorScheme,
  Modal,
  FlatList,
  TextInput,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useStore } from '../../src/store/useStore';
import { useRadar } from '../../src/hooks/useRadar';
import { City, District, FavoriteRoute } from '../../src/types';
import AdMobBanner from '../../src/components/AdMobBanner';

const districts: City[] = require('../../assets/data/districts.json');

type SelectionSide = 'from' | 'to';
type PickerMode = 'city' | 'district';

export default function RouteScreen() {
  const systemDark = useColorScheme() === 'dark';
  const { selection, setSelection, isLoading, error, favorites, addFavorite, nightMode } = useStore();
  const isDark = nightMode || systemDark;
  const colors = isDark ? dark : light;
  const { fetchRoute } = useRadar();

  const [modalVisible, setModalVisible] = useState(false);
  const [side, setSide] = useState<SelectionSide>('from');
  const [mode, setMode] = useState<PickerMode>('city');
  const [search, setSearch] = useState('');

  const currentCity = side === 'from' ? selection.fromCity : selection.toCity;
  const currentDistrict = side === 'from' ? selection.fromDistrict : selection.toDistrict;

  const filteredCities = useMemo(
    () =>
      districts.filter((c) =>
        c.cityName.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const filteredDistricts = useMemo(() => {
    if (!currentCity) return [];
    return currentCity.districts.filter((d) =>
      d.Name.toLowerCase().includes(search.toLowerCase())
    );
  }, [currentCity, search]);

  function openCityPicker(s: SelectionSide) {
    setSide(s);
    setMode('city');
    setSearch('');
    setModalVisible(true);
  }

  function openDistrictPicker(s: SelectionSide) {
    setSide(s);
    setMode('district');
    setSearch('');
    setModalVisible(true);
  }

  function selectCity(city: City) {
    if (side === 'from') setSelection({ fromCity: city, fromDistrict: null });
    else setSelection({ toCity: city, toDistrict: null });
    setModalVisible(false);
  }

  function selectDistrict(district: District) {
    if (side === 'from') setSelection({ fromDistrict: district });
    else setSelection({ toDistrict: district });
    setModalVisible(false);
  }

  async function handleFetchRoute() {
    if (!selection.fromDistrict || !selection.toDistrict) {
      Alert.alert('Eksik Seçim', 'Lütfen nereden ve nereye seçiniz.');
      return;
    }
    await fetchRoute();
    router.push('/');
  }

  function saveFavorite() {
    if (!selection.fromCity || !selection.fromDistrict || !selection.toCity || !selection.toDistrict) return;
    const fav: FavoriteRoute = {
      id: Date.now().toString(),
      label: `${selection.fromCity.cityName}/${selection.fromDistrict.Name} → ${selection.toCity.cityName}/${selection.toDistrict.Name}`,
      fromCityId: selection.fromCity.cityId,
      fromCityName: selection.fromCity.cityName,
      fromDistrictId: selection.fromDistrict.Id,
      fromDistrictName: selection.fromDistrict.Name,
      fromLatitude: selection.fromDistrict.Latitude,
      fromLongitude: selection.fromDistrict.Longitude,
      toCityId: selection.toCity.cityId,
      toCityName: selection.toCity.cityName,
      toDistrictId: selection.toDistrict.Id,
      toDistrictName: selection.toDistrict.Name,
      toLatitude: selection.toDistrict.Latitude,
      toLongitude: selection.toDistrict.Longitude,
    };
    addFavorite(fav);
    Alert.alert('Kaydedildi', 'Rota favorilere eklendi.');
  }

  function loadFavorite(fav: FavoriteRoute) {
    const fromCity = districts.find((c) => c.cityId === fav.fromCityId) ?? null;
    const fromDistrict = fromCity?.districts.find((d) => d.Id === fav.fromDistrictId) ?? null;
    const toCity = districts.find((c) => c.cityId === fav.toCityId) ?? null;
    const toDistrict = toCity?.districts.find((d) => d.Id === fav.toDistrictId) ?? null;
    setSelection({ fromCity, fromDistrict, toCity, toDistrict });
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.header, { color: colors.text }]}>Rota Seçimi</Text>

        {/* NEREDEN */}
        <SectionLabel label="📍 Nereden" color={colors.sub} />
        <Row label="İl" value={selection.fromCity?.cityName} onPress={() => openCityPicker('from')} colors={colors} />
        <Row
          label="İlçe"
          value={selection.fromDistrict?.Name}
          onPress={() => selection.fromCity ? openDistrictPicker('from') : null}
          disabled={!selection.fromCity}
          colors={colors}
        />

        <View style={styles.divider} />

        {/* NEREYE */}
        <SectionLabel label="🎯 Nereye" color={colors.sub} />
        <Row label="İl" value={selection.toCity?.cityName} onPress={() => openCityPicker('to')} colors={colors} />
        <Row
          label="İlçe"
          value={selection.toDistrict?.Name}
          onPress={() => selection.toCity ? openDistrictPicker('to') : null}
          disabled={!selection.toCity}
          colors={colors}
        />

        {/* Hata */}
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        {/* Butonlar */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary, isLoading && styles.btnDisabled]}
            onPress={handleFetchRoute}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="navigate" size={18} color="#fff" />
                <Text style={styles.btnPrimaryText}> Rota Oluştur</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnSecondary, { borderColor: colors.border }]}
            onPress={saveFavorite}
            disabled={!selection.fromDistrict || !selection.toDistrict}
          >
            <Ionicons name="heart-outline" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Favori rotalar */}
        {favorites.length > 0 && (
          <View style={styles.favSection}>
            <Text style={[styles.favTitle, { color: colors.text }]}>Favori Rotalar</Text>
            {favorites.map((fav) => (
              <TouchableOpacity
                key={fav.id}
                style={[styles.favItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => loadFavorite(fav)}
              >
                <Ionicons name="heart" size={14} color="#E84041" />
                <Text style={[styles.favText, { color: colors.text }]} numberOfLines={1}>
                  {'  ' + fav.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Banner Reklam */}
      <AdMobBanner />

      {/* Picker Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modal, { backgroundColor: colors.bg }]} edges={['top']}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {mode === 'city' ? 'İl Seç' : 'İlçe Seç'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.searchInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Ara..."
            placeholderTextColor={colors.sub}
            value={search}
            onChangeText={setSearch}
          />

          <FlatList<City | District>
            data={mode === 'city' ? filteredCities : filteredDistricts}
            keyExtractor={(item) =>
              mode === 'city'
                ? String((item as City).cityId)
                : String((item as District).Id)
            }
            renderItem={({ item }) => (
              <Pressable
                style={[styles.listItem, { borderBottomColor: colors.border }]}
                onPress={() =>
                  mode === 'city' ? selectCity(item as City) : selectDistrict(item as District)
                }
              >
                <Text style={[styles.listItemText, { color: colors.text }]}>
                  {mode === 'city' ? (item as City).cityName : (item as District).Name}
                </Text>
              </Pressable>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function SectionLabel({ label, color }: { label: string; color: string }) {
  return <Text style={[styles.sectionLabel, { color }]}>{label}</Text>;
}

function Row({
  label, value, onPress, disabled, colors,
}: {
  label: string; value?: string; onPress: () => void; disabled?: boolean;
  colors: typeof light;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border, opacity: disabled ? 0.4 : 1 }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.rowLabel, { color: colors.sub }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: value ? colors.text : colors.sub }]}>
        {value ?? 'Seçiniz'}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={colors.sub} />
    </TouchableOpacity>
  );
}

const light = { bg: '#f2f2f7', text: '#1c1c1e', sub: '#8e8e93', card: '#fff', border: '#e0e0e0' };
const dark = { bg: '#000', text: '#fff', sub: '#636366', card: '#1c1c1e', border: '#2c2c2e' };

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  header: { fontSize: 26, fontWeight: '700', marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginLeft: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  rowLabel: { fontSize: 13, width: 40 },
  rowValue: { flex: 1, fontSize: 15, fontWeight: '500' },
  divider: { height: 20 },
  errorText: { color: '#E84041', fontSize: 13, marginTop: 8, textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 24 },
  btn: {
    flex: 1, height: 50, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', flexDirection: 'row',
  },
  btnPrimary: { backgroundColor: '#E84041' },
  btnSecondary: { borderWidth: 1.5, flex: 0, width: 50, borderRadius: 14 },
  btnDisabled: { opacity: 0.5 },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  favSection: { marginTop: 28 },
  favTitle: { fontSize: 15, fontWeight: '600', marginBottom: 10 },
  favItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: 10, marginBottom: 6, borderWidth: 1,
  },
  favText: { flex: 1, fontSize: 13 },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  searchInput: {
    marginHorizontal: 16, marginBottom: 8, borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15,
  },
  listItem: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 0.5 },
  listItemText: { fontSize: 16 },
});
