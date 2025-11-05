import { MarkerClustererF } from "@react-google-maps/api";
import { Clusterer } from "@react-google-maps/marker-clusterer";
import type { ReactElement } from "react";
import type { ClusterOptions } from "../types";

interface Props {
  cluster?: ClusterOptions;
  children: (clusterer?: Clusterer) => ReactElement;
}

export function ClusteredMarkers({ cluster, children }: Props) {
  if (!cluster?.enabled) return <>{children(undefined)}</>;
  const { enabled, ...rest } = cluster;
  return (
    <MarkerClustererF {...rest}>
      {(clusterer) => children(clusterer)}
    </MarkerClustererF>
  );
}
