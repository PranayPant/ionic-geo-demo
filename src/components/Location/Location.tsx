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
import { RedisGeoSearchResult } from "../../types/users";

import "./Location.css";

const MEMBER_ID = "1234";

const Location: React.FC = () => {
  const [location, setLocation] = React.useState<Position | null>(null);
  const [nearbyUsers, setNearbyUsers] = React.useState<
    RedisGeoSearchResult[] | null
  >(null);
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
      .then(() => console.log("Successfully added markers"))
      .catch((err) => console.error(err));
  }, [nearbyUsers, map]);

  // Add user position and initialize search
  React.useEffect(() => {
    if (!map || !location?.coords) return;
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
        zoom: 12,
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
          console.error(err);
        });
        ws.addEventListener("message", (message) => {
          const json = JSON.parse(message.data);
          if (json.type === "nearby-positions") {
            setNearbyUsers(json.data as RedisGeoSearchResult[]);
          }
        });
        const loc = await Geolocation.getCurrentPosition();
        setLocation(loc);
        setWs(ws);
      } catch (err) {
        console.error(err);
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
        },
      })
    );
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
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Location;
