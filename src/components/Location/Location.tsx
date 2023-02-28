import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import {
  IonPage,
  useIonViewWillEnter,
  IonContent,
  IonButton,
  useIonViewWillLeave,
  IonInput,
} from "@ionic/react";
import { nanoid } from "nanoid";
import * as React from "react";
import { RedisGeoSearchResult, RedisGeoUnits } from "../../types/users";

import "./Location.css";
import { AppContext } from "../../App";

const MEMBER_ID = "1234";
const RADIUS: number = 100;
const UNITS: RedisGeoUnits = "mi";

const Location: React.FC = () => {
  const { coords } = React.useContext(AppContext);
  const [nearbyUsers, setNearbyUsers] = React.useState<
    RedisGeoSearchResult[] | null
  >(null);
  const [markers, setMarkers] = React.useState<
    { markerId: string; userId: string }[]
  >([]);
  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const [ws, setWs] = React.useState<WebSocket | null>(null);
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBESUC0Dw1LKX7Nvw5RWVLz43bxmn8OrSk",
  });

  const onLoad = React.useCallback((map: google.maps.Map) => {
    const bounds = new window.google.maps.LatLngBounds(coords);
    map.fitBounds(bounds);
    setMap(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onUnmount = React.useCallback(() => {
    setMap(null);
  }, []);

  // Add nearby users
  // React.useEffect(() => {
  //   if (!nearbyUsers || !map) return;
  //   map
  //     .addMarkers(
  //       nearbyUsers.map((d) => ({
  //         title: d.member,
  //         coordinate: {
  //           lat: parseFloat(`${d.coordinates.latitude}`),
  //           lng: parseFloat(`${d.coordinates.longitude}`),
  //         },
  //       }))
  //     )
  //     .then((ids) =>
  //       setMarkers(
  //         nearbyUsers.map((u, i) => ({ markerId: ids[i], userId: u.member }))
  //       )
  //     )
  //     .catch((err) => console.error(err));
  // }, [nearbyUsers, map]);

  // Add user position and initialize search
  // React.useEffect(() => {
  //   if (!map || !location?.coords) return;
  //   map.setOnMarkerClickListener((data) => console.log("Listening", data));
  //   map
  //     .addMarker({
  //       title: "My position",
  //       coordinate: {
  //         lat: location.coords.latitude,
  //         lng: location.coords.longitude,
  //       },
  //     })
  //     .then((res) => res)
  //     .catch((err) => console.error(err));
  //   ws?.send(
  //     JSON.stringify({
  //       id: nanoid(),
  //       type: "ready-to-search",
  //       data: {
  //         longitude: location?.coords.longitude,
  //         latitude: location?.coords.latitude,
  //         member: MEMBER_ID,
  //         radius: RADIUS,
  //         radiusUnit: UNITS,
  //       },
  //     })
  //   );
  // }, [ws, map, location?.coords]);

  // Initialize map
  // React.useLayoutEffect(() => {
  //   if (!mapRef?.current || !location?.coords) return;
  //   const { coords } = location;
  //   GoogleMap.create({
  //     id: "map",
  //     element: mapRef.current,
  //     apiKey: "AIzaSyBESUC0Dw1LKX7Nvw5RWVLz43bxmn8OrSk",
  //     config: {
  //       center: {
  //         lat: coords.latitude,
  //         lng: coords.longitude,
  //       },
  //       zoom: 7,
  //     },
  //   })
  //     .then((map) => setMap(map))
  //     .catch((err) => console.error(err));
  // }, [location]);

  useIonViewWillEnter(() => {
    const initializeMessaging = async () => {
      try {
        const ws = new WebSocket("ws://localhost:3001");
        ws.addEventListener("open", () => {
          console.log("Client open for connections");
        });
        ws.addEventListener("close", () => {
          console.log("Client has closed connection");
        });
        ws.addEventListener("error", (err) => {
          console.error("WebSocket connection error:", JSON.stringify(err));
        });
        ws.addEventListener("message", (message) => {
          const { type, data } = JSON.parse(message.data);
          switch (type) {
            case "connect": {
              console.log("Server: connect -->", data);
              break;
            }
            case "initialized-user": {
              console.log("Server: initialized-user -->", data);
              break;
            }
            case "nearby-users": {
              setNearbyUsers(data);
              break;
            }
            case "changing-position": {
              console.log("Server: changing-position -->", data);
              break;
            }
            case "user-message": {
              console.log("Server: user-message -->", data);
              const payload = JSON.parse(data);
              switch (payload.action) {
                case "position-change": {
                  break;
                }
                default:
                  console.error("Invalid user message action", payload.action);
              }
              break;
            }
            case "error": {
              console.error("Server: Error -->", data);
              break;
            }
            default:
              console.error("Received invalid message type:", type);
          }
        });
        setWs(ws);
      } catch (err) {
        console.error("Error Initializing Location:", JSON.stringify(err));
      }
    };
    initializeMessaging();
  });
  useIonViewWillLeave(() => {
    ws?.close();
  });

  const handleSearch = () => {
    ws?.send(
      JSON.stringify({
        id: nanoid(),
        type: "searching-positions",
        data: {
          member: MEMBER_ID,
          radius: RADIUS,
          radiusUnit: UNITS,
        },
      })
    );
  };

  // const handleRemoveMarkers = () => {
  //   if (!map) return;
  //   map.removeMarkers(markers.map((m) => m.markerId));
  // };

  return (
    <IonPage>
      <IonContent>
        <section className="flex-col center">
          {isLoaded && coords && map && (
            <>
              <GoogleMap
                mapContainerStyle={{ width: 400, height: 400 }}
                center={coords}
                zoom={10}
                onLoad={onLoad}
                onUnmount={onUnmount}
              >
                {/* Child components, such as markers, info windows, etc. */}
                <Marker position={coords} />
                {nearbyUsers?.map((u) => (
                  <Marker
                    position={
                      {
                        lat: u.coordinates.latitude,
                        lng: u.coordinates.longitude,
                      } as google.maps.LatLngLiteral
                    }
                  />
                ))}
              </GoogleMap>
              <IonButton onClick={handleSearch}>Search</IonButton>
            </>
          )}
        </section>
      </IonContent>
    </IonPage>
  );
};

export default Location;
