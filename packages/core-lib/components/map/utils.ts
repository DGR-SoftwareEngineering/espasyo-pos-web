import { MapOption, Props } from "./types";

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });
}

export function ensurePadding(
  p: number | google.maps.Padding = 24
): google.maps.Padding {
  return typeof p === "number" ? { top: p, right: p, bottom: p, left: p } : p;
}

export function themedMapStyles({
  darkMode,
}: {
  darkMode: boolean;
}): google.maps.MapTypeStyle[] {
  if (!darkMode) return [];

  return [
    { elementType: "geometry", stylers: [{ color: "#1f1f1f" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#1f1f1f" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#8e8e8e" }] },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#2c2c2c" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#0e1626" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#8e8e8e" }],
    },
  ];
}

export function buildRequestFromRoute(
  route: Props["route"]
): google.maps.DirectionsRequest | null {
  if (!route?.origin || !route.destination) return null;

  const resolvedTravelMode =
    (typeof window !== "undefined" &&
      (window as any).google?.maps?.TravelMode?.[
        route.travelMode ?? "DRIVING"
      ]) ||
    (route.travelMode ?? "DRIVING");

  return {
    origin: route.origin,
    destination: route.destination,
    waypoints: route.stops.map((s) => ({ location: s, stopover: true })),
    optimizeWaypoints: true,
    travelMode: resolvedTravelMode as any,
  };
}

export function safeGetOptionLabel(opt: unknown): string {
  if (opt == null) return "";

  if (typeof opt === "string") return opt;

  const o = opt as Partial<MapOption>;

  if (typeof o.label === "string" && o.label.trim().length > 0) return o.label;

  const lat = (o as any)?.position?.lat;
  const lng = (o as any)?.position?.lng;
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return `${lat}, ${lng}`;
  }

  return "";
}

export function isOptionEqualToValue(a: unknown, b: unknown): boolean {
  const oa = a as Partial<MapOption> | null | undefined;
  const ob = b as Partial<MapOption> | null | undefined;

  if (oa == null && ob == null) return true;
  if (oa == null || ob == null) return false;

  if (oa.id != null && ob.id != null) return oa.id === ob.id;

  if (oa.label && ob.label) return oa.label === ob.label;

  const la = (oa as any)?.position?.lat;
  const lga = (oa as any)?.position?.lng;
  const lb = (ob as any)?.position?.lat;
  const lgb = (ob as any)?.position?.lng;

  if (
    Number.isFinite(la) &&
    Number.isFinite(lga) &&
    Number.isFinite(lb) &&
    Number.isFinite(lgb)
  ) {
    return la === lb && lga === lgb;
  }
  return false;
}
