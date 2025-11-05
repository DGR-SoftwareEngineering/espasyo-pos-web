import {
  DirectionsRenderer,
  DrawingManagerF,
  GoogleMap,
  HeatmapLayerF,
  KmlLayer,
  GroundOverlay,
} from "@react-google-maps/api";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useGoogleMapsLoader,
  useDebouncedCallback,
  useDirections,
  useFitBoundsOnData,
  circleBounds,
} from "./hooks";
import { themedMapStyles, ensurePadding, buildRequestFromRoute } from "./utils";
import type { GoogleMapRef, Props } from "./types";
import { SmartMarker } from "./markers/SmartMarker";
import { ClusteredMarkers } from "./overlays/ClusteredMarkers";

const containerStyle: React.CSSProperties = { width: "100%", height: "100%" };

export const CustomGoogleMap = forwardRef<GoogleMapRef, Props>(
  function CustomGoogleMap(props, ref) {
    const {
      apiKey,
      libraries,
      center,
      zoom = 10,
      mapId,
      options,
      mapContainerStyle,
      onMapReady,
      markers,
      cluster,
      heatmap,
      drawing,
      directions,
      route,
      kml,
      ground,
      fitTo = "none",
      fitPadding = 24,
      mapStyles,
      onDirectionsResult,
    } = props;

    const { isLoaded, loadError } = useGoogleMapsLoader(apiKey, libraries);
    const [map, setMap] = useState<google.maps.Map | null>(null);

    const shapesRef = useRef<
      Array<
        | google.maps.Polygon
        | google.maps.Polyline
        | google.maps.Rectangle
        | google.maps.Circle
      >
    >([]);
    const addShape = useCallback((shape: any) => {
      shapesRef.current = [...shapesRef.current, shape];
    }, []);
    const clearShapes = useCallback(() => (shapesRef.current = []), []);

    const derivedRouteRequest = useMemo(
      () => (directions?.request ? null : buildRequestFromRoute(route)),
      [directions?.request, route]
    );

    const activeDirectionsEnabled =
      directions?.enabled || (!!derivedRouteRequest && route);

    const requestForHook =
      directions?.enabled && directions.request
        ? directions.request
        : derivedRouteRequest;

    const { result: directionsResult } = useDirections(
      requestForHook,
      !!activeDirectionsEnabled
    );

    useEffect(() => {
      onDirectionsResult?.(directionsResult ?? null);
    }, [directionsResult, onDirectionsResult]);

    const defaultStyles = useMemo(() => {
      const darkMode =
        window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
      return typeof mapStyles === "function"
        ? mapStyles({ darkMode })
        : mapStyles ?? themedMapStyles({ darkMode });
    }, [mapStyles]);

    const computedOptions = useMemo<google.maps.MapOptions>(
      () => ({
        mapId,
        clickableIcons: false,
        disableDefaultUI: false,
        styles: defaultStyles,
        ...options,
        ...(options?.styles
          ? { styles: [...(defaultStyles || []), ...options.styles] }
          : {}),
      }),
      [mapId, options, defaultStyles]
    );

    const handleOnLoad = useCallback(
      (m: google.maps.Map) => {
        setMap(m);
        onMapReady?.(m);
      },
      [onMapReady]
    );

    const fitNow = useFitBoundsOnData(
      map,
      markers,
      shapesRef.current,
      fitTo,
      fitPadding
    );
    const debouncedFit = useDebouncedCallback(() => fitNow(), 150);

    useEffect(() => {
      if (!map) return;
      if (fitTo !== "none") debouncedFit();
    }, [map, markers, directionsResult, fitTo, debouncedFit]);

    useImperativeHandle(
      ref,
      () => ({
        getMap: () => map,
        panTo: (pos) => map?.panTo(pos),
        fitToMarkers: (padding) => {
          if (!map || !markers?.length) return;
          const bounds = new google.maps.LatLngBounds();
          markers.forEach((m) => bounds.extend(m.position));
          map.fitBounds(bounds, ensurePadding(padding ?? fitPadding));
        },
        fitToShapes: (padding) => {
          if (!map || !shapesRef.current.length) return;
          const bounds = new google.maps.LatLngBounds();
          shapesRef.current.forEach((shape) => {
            if (shape instanceof google.maps.Circle) {
              bounds.union(circleBounds(shape));
            } else if (shape instanceof google.maps.Rectangle) {
              bounds.union(shape.getBounds()!);
            } else {
              const path = shape.getPath();
              for (let i = 0; i < path.getLength(); i++)
                bounds.extend(path.getAt(i));
            }
          });
          map.fitBounds(bounds, ensurePadding(padding ?? fitPadding));
        },
        fitAll: (padding) => {
          if (!map) return;
          const bounds = new google.maps.LatLngBounds();
          (markers ?? []).forEach((m) => bounds.extend(m.position));
          shapesRef.current.forEach((shape) => {
            if (shape instanceof google.maps.Circle)
              bounds.union(circleBounds(shape));
            else if (shape instanceof google.maps.Rectangle)
              bounds.union(shape.getBounds()!);
            else {
              const path = shape.getPath();
              for (let i = 0; i < path.getLength(); i++)
                bounds.extend(path.getAt(i));
            }
          });
          if (!bounds.isEmpty())
            map.fitBounds(bounds, ensurePadding(padding ?? fitPadding));
        },
        setCenter: (pos) => map?.setCenter(pos),
        setZoom: (z) => map?.setZoom(z),
      }),
      [map, markers, fitPadding]
    );

    if (loadError) {
      return (
        <div>
          Failed to load Google Maps: {String(loadError.message || loadError)}
        </div>
      );
    }

    if (!isLoaded) {
      return <div>Loading map...</div>;
    }

    return (
      <GoogleMap
        center={center}
        zoom={zoom}
        onLoad={handleOnLoad}
        onUnmount={() => {
          setMap(null);
          clearShapes();
        }}
        options={computedOptions}
        mapContainerStyle={mapContainerStyle ?? containerStyle}
      >
        {heatmap?.enabled && heatmap.data && (
          <HeatmapLayerF data={heatmap.data} options={heatmap.options} />
        )}

        {kml?.enabled && kml.url && (
          <KmlLayer
            url={kml.url}
            options={kml.options}
            onStatusChanged={kml.onStatusChanged}
          />
        )}

        {ground?.enabled && (
          <GroundOverlay
            bounds={ground.bounds}
            url={ground.url}
            options={ground.options}
          />
        )}

        <ClusteredMarkers cluster={cluster}>
          {(clusterer) => (
            <>
              {(markers ?? []).map((m) => (
                <SmartMarker
                  key={m.id}
                  data={m}
                  onSelect={m.onClick}
                  clusterer={clusterer}
                />
              ))}
            </>
          )}
        </ClusteredMarkers>

        {activeDirectionsEnabled && !!directionsResult && (
          <DirectionsRenderer
            directions={directionsResult}
            options={directions?.rendererOptions}
          />
        )}

        {drawing?.enabled && (
          <DrawingManagerF
            {...drawing}
            onPolygonComplete={(poly) => {
              addShape(poly);
              drawing.onPolygonComplete?.(poly);
            }}
            onPolylineComplete={(pl) => {
              addShape(pl);
              drawing.onPolylineComplete?.(pl);
            }}
            onRectangleComplete={(rect) => {
              addShape(rect);
              drawing.onRectangleComplete?.(rect);
            }}
            onCircleComplete={(circle) => {
              addShape(circle);
              drawing.onCircleComplete?.(circle);
            }}
          />
        )}
      </GoogleMap>
    );
  }
);
