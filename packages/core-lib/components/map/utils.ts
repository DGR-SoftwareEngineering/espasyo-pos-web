import { Props } from "./types";

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
  const waypoints: google.maps.DirectionsWaypoint[] = (route.stops ?? []).map(
    (pos) => ({ location: pos, stopover: true })
  );
  return {
    origin: route.origin,
    destination: route.destination,
    waypoints,
    optimizeWaypoints: true,
    travelMode: route.travelMode ?? google.maps.TravelMode.DRIVING,
  };
}
