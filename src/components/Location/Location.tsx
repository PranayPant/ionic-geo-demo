import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  MarkerClusterer,
} from "@react-google-maps/api";
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
const RADIUS: number = 1000;
const UNITS: RedisGeoUnits = "mi";

const Location: React.FC = () => {
  const { coords } = React.useContext(AppContext);
  const [nearbyUsers, setNearbyUsers] = React.useState<
    RedisGeoSearchResult[] | null
  >(null);
  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const [ws, setWs] = React.useState<WebSocket | null>(null);
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBESUC0Dw1LKX7Nvw5RWVLz43bxmn8OrSk",
  });

  const onLoad = React.useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(() => {
    setMap(null);
  }, []);

  // Add nearby users
  React.useEffect(() => {
    if (!nearbyUsers || !map) return;
    const bounds = new google.maps.LatLngBounds();
    nearbyUsers.forEach((u) => {
      bounds.extend({
        lat: parseFloat(`${u.coordinates.latitude}`),
        lng: parseFloat(`${u.coordinates.longitude}`),
      });
    });
    map.fitBounds(bounds);
  }, [nearbyUsers, map]);

  // Add user position and initialize search
  React.useEffect(() => {
    if (!map || !coords || !ws) return;
    ws.send(
      JSON.stringify({
        id: nanoid(),
        type: "ready-to-search",
        data: {
          longitude: coords.lng,
          latitude: coords.lat,
          member: MEMBER_ID,
          radius: RADIUS,
          radiusUnit: UNITS,
        },
      })
    );
  }, [ws, map, coords]);

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
              setWs(ws);
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
            case "user-message": {
              console.log("Server: user-message -->", data);
              const payload = JSON.parse(data);
              const updatedUser: RedisGeoSearchResult = payload.data;
              switch (payload.action) {
                case "position-change": {
                  setNearbyUsers((prev) => {
                    const users = prev || [];
                    return users.map((user) => {
                      if (user.member === updatedUser.member) {
                        return {
                          ...user,
                          coordinates: {
                            latitude: updatedUser.coordinates.latitude,
                            longitude: updatedUser.coordinates.longitude,
                          },
                        };
                      }
                      return user;
                    });
                  });
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

  return (
    <IonPage>
      <IonContent>
        <section className="flex-col center">
          {isLoaded && coords && (
            <>
              <GoogleMap
                mapContainerStyle={{ width: 700, height: 700 }}
                center={coords}
                zoom={12}
                onLoad={onLoad}
                onUnmount={onUnmount}
              >
                {/* Child components, such as markers, info windows, etc. */}
                <Marker title={MEMBER_ID} position={coords} />
                <MarkerClusterer>
                  {(clusterer) => (
                    <>
                      {nearbyUsers
                        ?.filter((u) => u.member !== MEMBER_ID)
                        .map((u) => (
                          <Marker
                            key={u.member}
                            clusterer={clusterer}
                            title={u.member}
                            label={`${u.coordinates.latitude}, ${u.coordinates.longitude}`}
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
