import {
  IonContent,
  IonPage,
} from "@ionic/react";
import ExploreContainer from "../components/ExploreContainer/ExploreContainer";

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen>
        <ExploreContainer />
      </IonContent>
    </IonPage>
  );
};

export default Home;
