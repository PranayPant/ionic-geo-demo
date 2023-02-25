import {
  IonPage,
  IonItem,
  IonList,
  useIonViewWillEnter,
  IonContent,
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
      <IonContent>
        <IonList className="container product-list">
          {products.map((p) => (
            <IonItem key={p.id}>
              <div className="flex-col">
                <span>{p.title}</span>
                <span>{p.category}</span>
              </div>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Products;
