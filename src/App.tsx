import { Redirect, Route } from "react-router-dom";
import { IonApp, IonHeader, IonRouterLink, IonRouterOutlet, IonTitle, IonToolbar, setupIonicReact } from "@ionic/react";
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

setupIonicReact();

const App: React.FC = () => {
  return (
    <IonApp>
      <IonHeader>
        <IonToolbar>
          <IonRouterLink slot="start" href="/home">
            <span style={{ padding: "10px" }}>Home</span>
          </IonRouterLink>
          <IonRouterLink slot="start" href="/products">
            <span style={{ padding: "10px" }}>Products</span>
          </IonRouterLink>
        </IonToolbar>
      </IonHeader>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/home">
            <Home />
          </Route>
          <Route exact path="/products">
            <Products />
          </Route>
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
