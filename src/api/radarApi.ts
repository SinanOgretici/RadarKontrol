import axios from 'axios';
import { RouteData } from '../types';

const BASE_URL = 'https://www.icisleri.gov.tr/ISAYWebPart/PolGenControlPointV2';

const headers = {
  'X-Requested-With': 'XMLHttpRequest',
  'User-Agent':
    'Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36',
  Referer:
    'https://www.icisleri.gov.tr/iller-arasi-radar-ve-kontrol-noktasi-uygulama-sayilari',
  Origin: 'https://www.icisleri.gov.tr',
};

export async function createRoute(params: {
  fromLatitude: number;
  fromLongitude: number;
  toLatitude: number;
  toLongitude: number;
  fromDistrictId: number;
  toDistrictId: number;
}): Promise<RouteData> {
  const body = new URLSearchParams({
    fromLatitude: String(params.fromLatitude),
    fromLongitude: String(params.fromLongitude),
    toLatitude: String(params.toLatitude),
    toLongitude: String(params.toLongitude),
    fromDistrictId: String(params.fromDistrictId),
    toDistrictId: String(params.toDistrictId),
  });

  const response = await axios.post<{ success: boolean; data: RouteData }>(
    `${BASE_URL}/CreateRoute`,
    body.toString(),
    {
      headers: {
        ...headers,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      timeout: 15000,
    }
  );

  if (!response.data.success) {
    throw new Error('API başarısız yanıt döndürdü');
  }

  return response.data.data;
}
