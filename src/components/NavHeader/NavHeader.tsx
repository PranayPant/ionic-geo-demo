import { IonHeader, IonToolbar, IonRouterLink } from "@ionic/react";

const NavHeader: React.FC = () => {
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonRouterLink slot="start" href="/home">
            <span style={{ padding: "10px" }}>Home</span>
          </IonRouterLink>
          <IonRouterLink slot="start" routerLink="/products" routerOptions={{}}>
            <span style={{ padding: "10px" }}>Products</span>
          </IonRouterLink>
          <IonRouterLink slot="start" href="/location">
            <span style={{ padding: "10px" }}>Location</span>
          </IonRouterLink>
        </IonToolbar>
      </IonHeader>
    </>
  );
};

export default NavHeader;
