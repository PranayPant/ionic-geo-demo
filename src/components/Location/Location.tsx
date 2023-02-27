import { Geolocation, Position } from "@capacitor/geolocation";
import { GoogleMap } from "@capacitor/google-maps";
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

const MEMBER_ID = "1234";
const RADIUS: number = 100;
const UNITS: RedisGeoUnits = "mi";

const Location: React.FC = () => {
  const [location, setLocation] = React.useState<Position | null>(null);
  const [nearbyUsers, setNearbyUsers] = React.useState<
    RedisGeoSearchResult[] | null
  >(null);
  const [markers, setMarkers] = React.useState<
    { markerId: string; userId: string }[]
  >([]);
  const [map, setMap] = React.useState<GoogleMap | null>(null);
  const [ws, setWs] = React.useState<WebSocket | null>(null);
  const mapRef = React.useRef<HTMLDivElement>(null);

  // Add nearby users
  React.useEffect(() => {
    if (!nearbyUsers || !map) return;
    map
      .addMarkers(
        nearbyUsers.map((d) => ({
          title: d.member,
          coordinate: {
            lat: parseFloat(`${d.coordinates.latitude}`),
            lng: parseFloat(`${d.coordinates.longitude}`),
          },
        }))
      )
      .then((ids) =>
        setMarkers(
          nearbyUsers.map((u, i) => ({ markerId: ids[i], userId: u.member }))
        )
      )
      .catch((err) => console.error(err));
  }, [nearbyUsers, map]);

  // Add user position and initialize search
  React.useEffect(() => {
    if (!map || !location?.coords) return;
    map.setOnMarkerClickListener((data) => console.log("Listening", data));
    map
      .addMarker({
        title: "My position",
        coordinate: {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        },
      })
      .then((res) => res)
      .catch((err) => console.error(err));
    ws?.send(
      JSON.stringify({
        id: nanoid(),
        type: "ready-to-search",
        data: {
          longitude: location?.coords.longitude,
          latitude: location?.coords.latitude,
          member: MEMBER_ID,
          radius: RADIUS,
          radiusUnit: UNITS,
        },
      })
    );
  }, [ws, map, location?.coords]);

  // Initialize map
  React.useLayoutEffect(() => {
    if (!mapRef?.current || !location?.coords) return;
    const { coords } = location;
    GoogleMap.create({
      id: "map",
      element: mapRef.current,
      apiKey: "AIzaSyBESUC0Dw1LKX7Nvw5RWVLz43bxmn8OrSk",
      config: {
        center: {
          lat: coords.latitude,
          lng: coords.longitude,
        },
        zoom: 7,
      },
    })
      .then((map) => setMap(map))
      .catch((err) => console.error(err));
  }, [location]);

  useIonViewWillEnter(() => {
    const initializeLocationService = async () => {
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
        const loc = await Geolocation.getCurrentPosition();
        setLocation(loc);
        setWs(ws);
      } catch (err) {
        console.error("Error Initializing Location:", JSON.stringify(err));
      }
    };
    initializeLocationService();
  });
  useIonViewWillLeave(() => {
    map?.destroy();
    ws?.close();
  });

  const [inputModel, setInputModel] = React.useState("");
  const ionInputEl = React.useRef<HTMLIonInputElement>(null);

  const onInput = (ev: Event) => {
    const value = (ev.target as HTMLIonInputElement).value as string;
    setInputModel(value);

    // TODO: investigate if we need this
    // const inputCmp = ionInputEl.current;
    // if (inputCmp !== null) {
    //   inputCmp.value = value;
    // }
  };

  const handleSubmit = () => {
    ws?.send(inputModel);
  };

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

  const handleRemoveMarkers = () => {
    if (!map) return;
    map.removeMarkers(markers.map((m) => m.markerId));
  };

  return (
    <IonPage>
      <IonContent>
        <div className="flex-col center location-page">
          <span>My location is currently</span>
          {location && (
            <div className="flex-col">
              <span>Latitude: {location?.coords.latitude}</span>
              <span>Longitude: {location?.coords.longitude}</span>
            </div>
          )}
          <capacitor-google-map ref={mapRef} />
          {map && ws && location && (
            <div className="flex">
              <IonInput
                placeholder="Send message..."
                value={inputModel}
                onIonInput={onInput}
                ref={ionInputEl}
              ></IonInput>
              <IonButton onClick={handleSubmit}>Submit</IonButton>
              <IonButton onClick={handleSearch}>Search</IonButton>
              <IonButton onClick={handleRemoveMarkers}>Clear</IonButton>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Location;
