import {
  IonPage,
  IonItem,
  IonLabel,
  IonList,
  useIonViewWillEnter,
} from "@ionic/react";
import React from "react";
import { Product } from "../../types/products";
import "./Products.css";

const Products: React.FC = () => {
  const [products, setProducts] = React.useState<Product[]>([]);
  useIonViewWillEnter(() => {
    fetch("https://dummyjson.com/products")
      .then((res) => res.json())
      .then((json) => setProducts(json.products));
  });
  return (
    <IonPage>
      <section>
        <IonList className="product-list">
          {products.map((p) => (
            <IonItem key={p.id}>
              <IonLabel>
                <IonLabel>{p.description}</IonLabel>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </section>
    </IonPage>
  );
};

export default Products;
