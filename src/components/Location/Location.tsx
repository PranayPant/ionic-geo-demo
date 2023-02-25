import { Geolocation, Position } from "@capacitor/geolocation";
import {
  IonPage,
  IonItem,
  IonList,
  useIonViewWillEnter,
  IonContent,
} from "@ionic/react";
import * as React from "react";

import "./Location.css";

const Location: React.FC = () => {
  const [location, setLocation] = React.useState<Position | null>(null);

  useIonViewWillEnter(() => {
    Geolocation.getCurrentPosition({enableHighAccuracy: false})
      .then((coords) => setLocation(coords))
      .catch((err) => console.error(err));
  });
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
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Location;
