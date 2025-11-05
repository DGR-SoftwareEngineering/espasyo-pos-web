import { memo, useEffect, useMemo, useRef } from "react";

export interface SmartAdvancedMarkerProps {
  map: google.maps.Map | null;
  position: google.maps.LatLngLiteral;
  title?: string;
  label?: string;
  zIndex?: number;
  onClick?: () => void;
  content?: HTMLElement | null;
}

export const SmartAdvancedMarker = memo(function SmartAdvancedMarker({
  map,
  position,
  title,
  label,
  zIndex,
  onClick,
  content,
}: SmartAdvancedMarkerProps) {
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null
  );

  const pinNode = useMemo(() => {
    if (!label) return null;
    const el = document.createElement("div");
    el.style.cssText = `
      display:inline-flex;align-items:center;justify-content:center;
      width:28px;height:28px;border-radius:50%;
      background:#0F62FE;color:#fff;font:600 12px/1 system-ui;
      box-shadow:0 1px 4px rgba(0,0,0,.3);
    `;
    el.textContent = label;
    return el;
  }, [label]);

  useEffect(() => {
    if (!map) return;

    let adv: google.maps.marker.AdvancedMarkerElement | null = null;
    let unlisten: google.maps.MapsEventListener | null = null;
    (async () => {
      const { AdvancedMarkerElement } = (await google.maps.importLibrary(
        "marker"
      )) as google.maps.MarkerLibrary;

      const markerContent = content ?? pinNode ?? undefined;

      adv = new AdvancedMarkerElement({
        map,
        position,
        title,
        zIndex,
        ...(markerContent ? { content: markerContent } : {}),
      });

      if (onClick) {
        unlisten = adv.addListener("click", () => onClick());
      }
      markerRef.current = adv;
    })();

    return () => {
      if (unlisten) unlisten.remove();
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
    };
  }, [
    map,
    position.lat,
    position.lng,
    title,
    zIndex,
    pinNode,
    content,
    onClick,
  ]);

  useEffect(() => {
    const adv = markerRef.current;
    if (
      adv &&
      position &&
      Number.isFinite(position.lat) &&
      Number.isFinite(position.lng)
    ) {
      adv.position = position;
    }
  }, [position.lat, position.lng]);

  return null;
});
