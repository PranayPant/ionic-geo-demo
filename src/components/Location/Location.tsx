import {
  GoogleMap,
  Marker,
  MarkerClusterer,
  DirectionsService,
  LoadScript,
} from "@react-google-maps/api";
import {
  IonPage,
  useIonViewWillEnter,
  IonContent,
  IonButton,
  useIonViewWillLeave,
} from "@ionic/react";
import { nanoid } from "nanoid";
import * as React from "react";
import { RedisGeoSearchResult, RedisGeoUnits } from "../../types/users";

import "./Location.css";
import { AppContext } from "../../App";
import NearbyUsers from "./NearbyUsers";
import DirectionMap from "./DirectionMap";

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
          {coords && (
            <LoadScript
              googleMapsApiKey={"AIzaSyD03ecQ6fP_H6TgB2QUi531qanO4XmMpI8"}
              loadingElement={<div />}
            >
              <GoogleMap
                mapContainerStyle={{ width: 700, height: 700 }}
                center={coords}
                zoom={12}
                onLoad={onLoad}
                onUnmount={onUnmount}
              >
                {/* Child components, such as markers, info windows, etc. */}
                {/* <NearbyUsers title={MEMBER_ID} coords={coords} nearbyUsers={nearbyUsers} /> */}
                <DirectionMap />
              </GoogleMap>
              <IonButton onClick={handleSearch}>Search</IonButton>
            </LoadScript>
          )}
        </section>
      </IonContent>
    </IonPage>
  );
};

export default Location;
