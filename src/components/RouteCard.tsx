import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { RouteData } from '../types';
import { useStore } from '../store/useStore';

interface Props {
  data: RouteData;
}

export function RouteCard({ data }: Props) {
  const systemDark = useColorScheme() === 'dark';
  const nightMode = useStore((s) => s.nightMode);
  const isDark = nightMode || systemDark;
  const colors = isDark ? darkColors : lightColors;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
      <Text style={[styles.route, { color: colors.text }]}>
        {data.FromDistrict} → {data.ToDistrict}
      </Text>

      <View style={styles.badgeRow}>
        <Badge label="Hız Koridoru" count={data.CorridorCount} color="#FF9500" />
        <Badge label="Radarlı" count={data.RadarCount} color="#E84041" />
        <Badge label="Kontrolsüz" count={data.ControlPointCount} color="#34C759" />
      </View>

      {data.Cities.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.cityRow}>
            {data.Cities.map((city, i) => (
              <View
                key={i}
                style={[styles.cityChip, { backgroundColor: colors.chip }]}
              >
                <Text style={[styles.cityName, { color: colors.text }]}>
                  {city.City}
                </Text>
                <Text style={styles.cityStats}>
                  {city.Radarli > 0 ? `🔴 ${city.Radarli} ` : ''}
                  {city.Radarsiz > 0 ? `🟢 ${city.Radarsiz}` : ''}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function Badge({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.badgeCount, { color }]}>{count}</Text>
      <Text style={styles.badgeLabel}>{label}</Text>
    </View>
  );
}

const lightColors = { card: '#fff', text: '#1c1c1e', chip: '#f2f2f7', shadow: '#000' };
const darkColors = { card: '#1c1c1e', text: '#fff', chip: '#2c2c2e', shadow: '#000' };

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  route: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  badge: {
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 80,
  },
  badgeCount: {
    fontSize: 22,
    fontWeight: '700',
  },
  badgeLabel: {
    fontSize: 10,
    color: '#8e8e93',
    marginTop: 2,
  },
  cityRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  cityChip: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  cityName: {
    fontSize: 12,
    fontWeight: '600',
  },
  cityStats: {
    fontSize: 11,
    marginTop: 2,
  },
});
