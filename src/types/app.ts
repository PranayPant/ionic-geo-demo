import { DeviceInfo } from "@capacitor/device";

export interface AppStore {
    deviceInfo?: DeviceInfo;
    coords?: google.maps.LatLngLiteral
}