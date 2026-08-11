import { haversineDistanceKm } from '../geo';

describe('haversineDistanceKm', () => {
  it('should return 0 for identical coordinates', () => {
    expect(haversineDistanceKm(0, 0, 0, 0)).toBe(0);
  });

  it('should calculate distance within 1% of true value', () => {
    // Coordinates for New York City and London
    const nycLat = 40.7128;
    const nycLng = -74.0060;
    const londonLat = 51.5074;
    const londonLng = -0.1278;
    
    // Approximate great-circle distance is 5570 km
    const trueDistanceKm = 5570; 
    
    const distance = haversineDistanceKm(nycLat, nycLng, londonLat, londonLng);
    const errorMargin = trueDistanceKm * 0.01; // 1%
    
    expect(Math.abs(distance - trueDistanceKm)).toBeLessThanOrEqual(errorMargin);
  });
});
