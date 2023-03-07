import * as React from "react";
import { DirectionsRenderer, DirectionsService } from "@react-google-maps/api";

const DirectionMap: React.FC = () => {
  const [response, setResponse] =
    React.useState<google.maps.DirectionsResult | null>(null);
  return (
    <>
      <DirectionsService
        options={{
          destination: "Liverpool, UK",
          origin: "London, UK",
          travelMode: google.maps.TravelMode.DRIVING,
        }}
        callback={(response) => setResponse(response)}
      />
      {response !== null && (
        <DirectionsRenderer
          options={{
            directions: response,
          }}
        />
      )}
    </>
  );
};

export default DirectionMap;
