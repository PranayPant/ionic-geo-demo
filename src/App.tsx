import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonContent,
  IonHeader,
  IonPage,
  IonRouterLink,
  IonRouterOutlet,
  IonToolbar,
  setupIonicReact,
} from "@ionic/react";
import { Device, DeviceInfo } from "@capacitor/device";
import { Geolocation } from "@capacitor/geolocation";
import { IonReactRouter } from "@ionic/react-router";
import Home from "./pages/Home";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Theme variables */
import "./theme/variables.css";
import * as React from "react";
import Products from "./components/Products/Products";
import Location from "./components/Location/Location";
import Tabs from "./components/Tabs/Tabs";
import NavHeader from "./components/NavHeader/NavHeader";
import { AppStore } from "./types/app";

setupIonicReact();

export const AppContext: React.Context<AppStore> =
  React.createContext<AppStore>({ deviceInfo: undefined, coords: undefined });

const App: React.FC = () => {
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo | undefined>(
    undefined
  );
  const [coords, setCoords] = React.useState<
    google.maps.LatLngLiteral | undefined
  >(undefined);
  React.useEffect(() => {
    const getInfo = async () => {
      try {
        const info: DeviceInfo = await Device.getInfo();
        const { coords } = await Geolocation.getCurrentPosition();
        setDeviceInfo(info);
        setCoords({ lat: coords.latitude, lng: coords.longitude });
      } catch (err) {
        console.error("Device Info:", err);
      }
    };
    getInfo();
  }, []);
  return (
    <AppContext.Provider value={{ deviceInfo, coords }}>
      <IonApp>
        <IonContent fullscreen>
          {deviceInfo?.platform === "web" && <NavHeader />}
          <IonReactRouter>
            {deviceInfo?.platform === "web" && (
              <IonRouterOutlet>
                <Route exact path="/home">
                  <Home />
                </Route>
                <Route exact path="/location">
                  <Location />
                </Route>
                <Route exact path="/products">
                  <Products />
                </Route>
                <Route exact path="/">
                  <Redirect to="/home" />
                </Route>
              </IonRouterOutlet>
            )}
            {deviceInfo?.platform !== "web" && (
              <Route path="/" render={() => <Tabs />} />
            )}
          </IonReactRouter>
        </IonContent>
      </IonApp>
    </AppContext.Provider>
  );
};

export default App;
