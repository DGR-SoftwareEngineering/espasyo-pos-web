import {
  GoogleMapProps,
  Libraries,
  MarkerClustererProps,
  HeatmapLayerProps,
  DrawingManagerProps,
  DirectionsRendererProps,
  KmlLayerProps,
  GroundOverlayProps,
} from "@react-google-maps/api";
import { JSX } from "react";

export type LatLngLiteral = google.maps.LatLngLiteral;

export interface MarkerData {
  id: string | number;
  position: LatLngLiteral;
  iconUrl?: string;
  draggable?: boolean;
  infoHtml?: string | JSX.Element;
  onClick?: (marker: MarkerData) => void;
  label?: string | google.maps.MarkerLabel;
  title?: string;
}

export interface ClusterOptions extends Omit<MarkerClustererProps, "children"> {
  enabled?: boolean;
}

export interface DirectionsOptions {
  enabled?: boolean;
  request?: google.maps.DirectionsRequest;
  rendererOptions?: DirectionsRendererProps["options"];
}

export interface RouteOptions {
  origin?: LatLngLiteral | null;
  destination?: LatLngLiteral | null;
  stops?: LatLngLiteral[];
  travelMode?: google.maps.TravelMode;
}

export interface DrawingOptions
  extends Omit<
    DrawingManagerProps,
    | "onPolygonComplete"
    | "onCircleComplete"
    | "onPolylineComplete"
    | "onRectangleComplete"
  > {
  enabled?: boolean;
  onPolygonComplete?: (polygon: google.maps.Polygon) => void;
  onPolylineComplete?: (polyline: google.maps.Polyline) => void;
  onRectangleComplete?: (rectangle: google.maps.Rectangle) => void;
  onCircleComplete?: (circle: google.maps.Circle) => void;
}

export interface HeatmapOptions extends Omit<HeatmapLayerProps, "data"> {
  enabled?: boolean;
  data?:
    | google.maps.MVCArray<
        google.maps.LatLng | google.maps.visualization.WeightedLocation
      >
    | google.maps.LatLng[]
    | google.maps.visualization.WeightedLocation[];
}

export interface KmlOptions extends Omit<KmlLayerProps, "url"> {
  enabled?: boolean;
  url: string;
}

export interface GroundOverlayOptions
  extends Omit<GroundOverlayProps, "bounds" | "url"> {
  enabled?: boolean;
  url: string;
  bounds: google.maps.LatLngBoundsLiteral;
}

export type FitTarget = "none" | "markers" | "shapes" | "all";

export interface Props
  extends Omit<GoogleMapProps, "onLoad" | "onUnmount" | "children"> {
  apiKey: string;
  libraries?: Libraries;
  center: LatLngLiteral;
  zoom?: number;
  mapId?: string;
  markers?: MarkerData[];
  cluster?: ClusterOptions;
  heatmap?: HeatmapOptions;
  kml?: KmlOptions;
  ground?: GroundOverlayOptions;
  drawing?: DrawingOptions;
  directions?: DirectionsOptions;
  route?: RouteOptions;
  autocomplete?: {
    enabled?: boolean;
    placeholder?: string;
    onPlaceSelected?: (place: google.maps.places.PlaceResult) => void;
    autoPan?: boolean;
  };
  locateControl?: {
    enabled?: boolean;
    title?: string;
    onError?: (err: GeolocationPositionError) => void;
  };
  fitTo?: FitTarget;
  fitPadding?: number | google.maps.Padding;
  onMapReady?: (map: google.maps.Map) => void;
  onDirectionsResult?: (result: google.maps.DirectionsResult | null) => void;
  mapStyles?:
    | google.maps.MapTypeStyle[]
    | ((opts: { darkMode: boolean }) => google.maps.MapTypeStyle[]);
}

export interface GoogleMapRef {
  getMap: () => google.maps.Map | null;
  panTo: (pos: LatLngLiteral) => void;
  fitToMarkers: (padding?: number | google.maps.Padding) => void;
  fitToShapes: (padding?: number | google.maps.Padding) => void;
  fitAll: (padding?: number | google.maps.Padding) => void;
  setCenter: (pos: LatLngLiteral) => void;
  setZoom: (z: number) => void;
}

export interface MapOption {
  id?: string | number;
  label: string;
  position?: google.maps.LatLngLiteral;
  placeResult?: google.maps.places.PlaceResult;
}

export function optionToLatLng(
  opt: MapOption
): google.maps.LatLngLiteral | null {
  if (opt.position) return opt.position;
  const loc = opt.placeResult?.geometry?.location;
  if (loc && typeof loc.lat === "function" && typeof loc.lng === "function") {
    return { lat: loc.lat(), lng: loc.lng() };
  }
  return null;
}
