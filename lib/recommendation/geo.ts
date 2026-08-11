/**
 * Calculates the great-circle distance between two points on the Earth's surface.
 * This represents the proximity signal from the paper's hybrid utility function.
 * 
 * @param lat1 Latitude of the first point in degrees
 * @param lng1 Longitude of the first point in degrees
 * @param lat2 Latitude of the second point in degrees
 * @param lng2 Longitude of the second point in degrees
 * @returns Distance in kilometers
 */
export function haversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in kilometers
  
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}
