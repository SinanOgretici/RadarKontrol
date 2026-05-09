/** Haversine formülü: iki GPS noktası arasındaki mesafeyi metre cinsinden döndürür */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dPhi = ((lat2 - lat1) * Math.PI) / 180;
  const dLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/** Kullanıcının verilen polyline'a minimum mesafesini döndürür */
export function distanceToPolyline(
  userLat: number,
  userLon: number,
  coordinates: { x: number; y: number }[]
): number {
  if (coordinates.length === 0) return Infinity;
  let minDist = Infinity;
  for (const coord of coordinates) {
    const d = haversineDistance(userLat, userLon, coord.y, coord.x);
    if (d < minDist) minDist = d;
  }
  return minDist;
}
