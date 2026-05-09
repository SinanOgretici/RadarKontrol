import { useCallback } from 'react';
import { createRoute } from '../api/radarApi';
import { useStore } from '../store/useStore';

export function useRadar() {
  const { selection, setRouteData, setLoading, setError } = useStore();

  const fetchRoute = useCallback(async () => {
    const { fromDistrict, toDistrict } = selection;
    if (!fromDistrict || !toDistrict) {
      setError('Lütfen nereden ve nereye seçiniz.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await createRoute({
        fromLatitude: fromDistrict.Latitude,
        fromLongitude: fromDistrict.Longitude,
        toLatitude: toDistrict.Latitude,
        toLongitude: toDistrict.Longitude,
        fromDistrictId: fromDistrict.Id,
        toDistrictId: toDistrict.Id,
      });
      setRouteData(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bağlantı hatası';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [selection]);

  return { fetchRoute };
}
