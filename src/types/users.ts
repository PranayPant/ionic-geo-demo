export interface RedisGeoSearchResult {
  member: string;
  distance: string;
  coordinates: RedisGeoCoordinates;
}

export interface RedisGeoCoordinates {
  latitude: string | number;
  longitude: string | number;
}
