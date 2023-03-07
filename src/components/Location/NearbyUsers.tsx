import { Marker, MarkerClusterer } from "@react-google-maps/api";
import { RedisGeoSearchResult } from "../../types/users";

export interface NearbyUsersProps {
  title: string;
  coords: google.maps.LatLngLiteral;
  nearbyUsers: RedisGeoSearchResult[] | null;
}

const NearbyUsers: React.FC<NearbyUsersProps> = ({ title, coords, nearbyUsers }) => {
  return (
    <>
      <Marker title={title} position={coords} />
      <MarkerClusterer>
        {(clusterer) => (
          <>
            {nearbyUsers
              ?.filter((u) => u.member !== title)
              .map((u) => (
                <Marker
                  key={u.member}
                  clusterer={clusterer}
                  title={u.member}
                  position={
                    {
                      lat: parseFloat(`${u.coordinates.latitude}`),
                      lng: parseFloat(`${u.coordinates.longitude}`),
                    } as google.maps.LatLngLiteral
                  }
                />
              ))}
          </>
        )}
      </MarkerClusterer>
    </>
  );
};

export default NearbyUsers
