import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Libraries, useJsApiLoader } from "@react-google-maps/api";
import type { FitTarget, MarkerData } from "./types";

export type LatLngLiteral = google.maps.LatLngLiteral;

export interface RoutePoint {
  lat: number;
  lng: number;
  label?: string;
}

export interface RouteModel {
  origin: RoutePoint | null;
  destination: RoutePoint | null;
  stops: RoutePoint[];
}

export function useGoogleMapsLoader(apiKey: string, libraries?: Libraries) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: libraries ?? ["places", "geometry", "visualization", "drawing"],
    id: "google-map-pro-loader",
  });
  return { isLoaded, loadError };
}

export function useDirections(
  request?: google.maps.DirectionsRequest | null,
  enabled?: boolean
) {
  const [result, setResult] = useState<google.maps.DirectionsResult | null>(
    null
  );
  const [status, setStatus] = useState<google.maps.DirectionsStatus | null>(
    null
  );

  useEffect(() => {
    if (!enabled || !request || !window.google?.maps) {
      setResult(null);
      setStatus(null);
      return;
    }

    const svc = new google.maps.DirectionsService();
    svc.route(request, (res, st) => {
      setStatus(st);
      if (st === "OK") setResult(res);
      else setResult(null);
    });
  }, [enabled, request]);

  return { result, status };
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  fn: T,
  delay = 250
) {
  const timeout = useRef<number | null>(null);

  const cb = useCallback(
    (...args: Parameters<T>) => {
      if (timeout.current) window.clearTimeout(timeout.current);
      timeout.current = window.setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );

  useEffect(() => {
    return () => {
      if (timeout.current != null) {
        clearTimeout(timeout.current);
        timeout.current = null;
      }
    };
  }, []);

  return cb as T;
}

export function useFitBoundsOnData(
  map: google.maps.Map | null,
  markers: MarkerData[] | undefined,
  shapes:
    | Array<
        | google.maps.Polygon
        | google.maps.Polyline
        | google.maps.Rectangle
        | google.maps.Circle
      >
    | undefined,
  fit: FitTarget,
  padding: number | google.maps.Padding = 24
) {
  const fitNow = useCallback(() => {
    if (!map) return;
    const bounds = new google.maps.LatLngBounds();

    if (fit === "markers" || fit === "all") {
      (markers ?? []).forEach((m) => bounds.extend(m.position));
    }

    if (fit === "shapes" || fit === "all") {
      (shapes ?? []).forEach((shape) => {
        if (shape instanceof google.maps.Circle) {
          bounds.union(circleBounds(shape));
        } else if (shape instanceof google.maps.Rectangle) {
          bounds.union(shape.getBounds()!);
        } else {
          pathToLatLngs(shape.getPath()).forEach((latlng) =>
            bounds.extend(latlng)
          );
        }
      });
    }

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, padding);
    }
  }, [map, markers, shapes, fit, padding]);
  return fitNow;
}

function pathToLatLngs(path: google.maps.MVCArray<google.maps.LatLng>) {
  const arr: google.maps.LatLng[] = [];
  for (let i = 0; i < path.getLength(); i++) arr.push(path.getAt(i));
  return arr;
}

export function circleBounds(c: google.maps.Circle) {
  const b = new google.maps.LatLngBounds();
  const center = c.getCenter()!;
  const r = c.getRadius();
  const dLat = (r / 111320) * (180 / Math.PI);
  const dLng =
    (r / (111320 * Math.cos((center.lat() * Math.PI) / 180))) * (180 / Math.PI);
  b.extend(new google.maps.LatLng(center.lat() - dLat, center.lng() - dLng));
  b.extend(new google.maps.LatLng(center.lat() + dLat, center.lng() + dLng));
  return b;
}

export function useRouteController() {
  const [from, setFrom] = useState<RoutePoint | null>(null);
  const [to, setTo] = useState<RoutePoint | null>(null);
  const [stops, setStops] = useState<RoutePoint[]>([]);

  const setFromLatLng = useCallback(
    (pos: LatLngLiteral | null, label?: string) => {
      setFrom(pos ? { lat: pos.lat, lng: pos.lng, label } : null);
    },
    []
  );
  const setToLatLng = useCallback(
    (pos: LatLngLiteral | null, label?: string) => {
      setTo(pos ? { lat: pos.lat, lng: pos.lng, label } : null);
    },
    []
  );
  const addStopLatLng = useCallback((pos: LatLngLiteral, label?: string) => {
    setStops((prev) => [...prev, { lat: pos.lat, lng: pos.lng, label }]);
  }, []);
  const removeStopAt = useCallback((index: number) => {
    setStops((prev) => prev.filter((_, i) => i !== index));
  }, []);
  const clearStops = useCallback(() => setStops([]), []);

  const route: RouteModel | null = useMemo(() => {
    if (!from && !to && stops.length === 0) return null;
    return { origin: from, destination: to, stops };
  }, [from, to, stops]);

  return {
    route,
    from,
    to,
    stops,
    setFromLatLng,
    setToLatLng,
    addStopLatLng,
    removeStopAt,
    clearStops,
  };
}
