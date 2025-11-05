import { memo, useMemo, useState } from "react";
import { InfoWindowF, MarkerF } from "@react-google-maps/api";
import { Clusterer } from "@react-google-maps/marker-clusterer";
import type { MarkerData } from "../types";

interface Props {
  data: MarkerData;
  onSelect?: (marker: MarkerData) => void;
  openInfo?: boolean;
  clusterer?: Clusterer;
}

export const SmartMarker = memo(function SmartMarker({
  data,
  onSelect,
  openInfo,
  clusterer,
}: Props) {
  const [open, setOpen] = useState<boolean>(!!openInfo);

  const icon = useMemo<google.maps.Icon | undefined>(() => {
    if (!data.iconUrl) return undefined;
    return {
      url: data.iconUrl,
      scaledSize: new google.maps.Size(28, 28),
      anchor: new google.maps.Point(14, 14),
    };
  }, [data.iconUrl]);

  return (
    <>
      <MarkerF
        position={data.position}
        icon={icon}
        label={
          typeof data.label === "string"
            ? { text: data.label, color: "#111" }
            : data.label
        }
        title={data.title}
        draggable={data.draggable}
        onClick={() => {
          onSelect?.(data);
          setOpen(true);
        }}
        clusterer={clusterer}
      />
      {open && data.infoHtml && (
        <InfoWindowF
          position={data.position}
          onCloseClick={() => setOpen(false)}
        >
          <div style={{ minWidth: 200 }}>{data.infoHtml}</div>
        </InfoWindowF>
      )}
    </>
  );
});
