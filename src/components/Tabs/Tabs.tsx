import { Redirect, Route } from "react-router-dom";
import {
  IonContent,
  IonIcon,
  IonLabel,
  IonPage,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";
import { ellipse, square, triangle } from "ionicons/icons";
import Home from "../../pages/Home";
import Products from "../Products/Products";

const Tabs: React.FC = () => (
  <IonContent>
    <IonTabs>
      <IonRouterOutlet>
        <Redirect exact path="/" to="/home" />
        <Route exact path="/home">
          <Home />
        </Route>
        <Route exact path="/location">
          <IonPage>
            <IonContent style={{ position: "relative", top: "100px" }}>
              Special mobile page
            </IonContent>
          </IonPage>
        </Route>
        <Route path="/products">
          <Products />
        </Route>
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="home" href="/home">
          <IonIcon icon={triangle} />
          <IonLabel>Home</IonLabel>
        </IonTabButton>
        <IonTabButton tab="products" href="/products">
          <IonIcon icon={ellipse} />
          <IonLabel>Products</IonLabel>
        </IonTabButton>
        <IonTabButton tab="location" href="/location">
          <IonIcon icon={square} />
          <IonLabel>Location</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  </IonContent>
);

export default Tabs;
