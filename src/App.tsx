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
  useIonViewWillEnter,
} from "@ionic/react";
import { Device, DeviceInfo } from "@capacitor/device";
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

setupIonicReact();

const SpecialPage: React.FC<{ device: DeviceInfo | null }> = ({ device }) => (
  <IonPage>
    <IonContent style={{ position: "relative", top: "100px" }}>
      Special {device?.platform || ""} page
    </IonContent>
  </IonPage>
);

export const AppContext: React.Context<DeviceInfo | null> =
  React.createContext<DeviceInfo | null>(null);

const App: React.FC = () => {
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo | null>(null);
  React.useEffect(() => {
    const getDeviceInfo = async () => {
      try {
        const info: DeviceInfo = await Device.getInfo();
        setDeviceInfo(info);
      } catch (err) {
        console.error("Device Info:", err);
      }
    };
    getDeviceInfo();
  }, []);
  return (
    <AppContext.Provider value={deviceInfo}>
      <IonApp>
        <IonContent fullscreen>
          <IonHeader>
            <IonToolbar>
              <IonRouterLink slot="start" href="/home">
                <span style={{ padding: "10px" }}>Home</span>
              </IonRouterLink>
              <IonRouterLink slot="start" href="/products">
                <span style={{ padding: "10px" }}>Products</span>
              </IonRouterLink>
              <IonRouterLink slot="start" href="/location">
                <span style={{ padding: "10px" }}>Location</span>
              </IonRouterLink>
            </IonToolbar>
          </IonHeader>
          <IonReactRouter>
            <IonRouterOutlet>
              <Route exact path="/home">
                <Home />
              </Route>
              <Route exact path="/location">
                {deviceInfo?.platform === "web" ? (
                  <Location />
                ) : (
                  <SpecialPage device={deviceInfo} />
                )}
              </Route>
              <Route exact path="/products">
                <Products />
              </Route>
              <Route exact path="/">
                <Redirect to="/home" />
              </Route>
            </IonRouterOutlet>
          </IonReactRouter>
        </IonContent>
      </IonApp>
    </AppContext.Provider>
  );
};

export default App;
