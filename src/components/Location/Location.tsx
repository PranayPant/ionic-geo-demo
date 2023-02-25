import { Geolocation, Position } from "@capacitor/geolocation";
import { GoogleMap } from "@capacitor/google-maps";
import {
  IonPage,
  useIonViewWillEnter,
  IonContent,
  IonButton,
  useIonViewWillLeave,
} from "@ionic/react";
import * as React from "react";

import "./Location.css";

const Location: React.FC = () => {
  const [location, setLocation] = React.useState<Position | null>(null);
  const [map, setMap] = React.useState<GoogleMap | null>(null);
  const mapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!mapRef?.current || !location?.coords) return;
    const { coords } = location;
    GoogleMap.create({
      id: "map-2",
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
        const loc = await Geolocation.getCurrentPosition();
        setLocation(loc);
      } catch (err) {
        console.error(err);
      }
    };
    initializeLocationService();
  });
  useIonViewWillLeave(() => {
    map?.destroy();
  });
  return (
    <IonPage>
      <IonContent >
        <div className="flex-col center location-page">
          <span>My location is currently</span>
          {location && (
            <div className="flex-col">
              <span>Latitude: {location?.coords.latitude}</span>
              <span>Longitude: {location?.coords.longitude}</span>
            </div>
          )}
          <capacitor-google-map ref={mapRef} />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Location;
