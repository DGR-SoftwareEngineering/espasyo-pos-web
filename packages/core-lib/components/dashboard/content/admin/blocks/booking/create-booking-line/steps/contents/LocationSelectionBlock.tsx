import { useFieldArray, useWatch } from "react-hook-form";
import { useStepNavigator } from "../../../../../../../../../core/hooks";
import { useCreateBookingFormContext } from "../../CreateBookingContext";
import { CreationManagementSteps } from "../creation";
import { Props } from "./types";
import {
  MapOption,
  MarkerData,
  optionToLatLng,
} from "../../../../../../../../map/types";
import { useMemo } from "react";
import { Box, Divider, Typography } from "@mui/material";
import { SelectionBlock } from "./SelectionBlock";
import { BackButton, Button } from "../../../../../../../../buttons";
import { Card } from "../../../../../../../../Card";
import { divStyle } from "./styles";
import {
  AddStopField,
  CustomGoogleMap,
  FromField,
  ToField,
} from "../../../../../../../../map";
import { CreateBookingType } from "../../validation";

export const LocationSelecionBlock: React.FC<Props> = ({
  previousStep,
  previous,
  nextStep,
  next,
}) => {
  const { goToNextStep, goToPreviousStep } =
    useStepNavigator<CreationManagementSteps>(
      next,
      nextStep,
      previous,
      previousStep
    );
  const { form } = useCreateBookingFormContext();
  const { control } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "route.stops",
  });

  const routeFromOpt = useWatch({
    control,
    name: "route.from",
  }) as MapOption | null;
  const routeToOpt = useWatch({
    control,
    name: "route.to",
  }) as MapOption | null;
  const routeStopsOpt = useWatch({ control, name: "route.stops" }) as
    | (MapOption | null)[]
    | undefined;

  const routeForMap = useMemo(() => {
    const from = optionToLatLng(routeFromOpt);
    const to = optionToLatLng(routeToOpt);
    const stops = (routeStopsOpt ?? [])
      .map((o) => (o ? optionToLatLng(o) : null))
      .filter(Boolean) as google.maps.LatLngLiteral[];

    return {
      origin: from
        ? { lat: from.lat, lng: from.lng, label: routeFromOpt?.label }
        : null,
      destination: to
        ? { lat: to.lat, lng: to.lng, label: routeToOpt?.label }
        : null,
      stops: stops.map((s, i) => ({
        lat: s.lat,
        lng: s.lng,
        label: routeStopsOpt?.[i]?.label,
      })),
    };
  }, [routeFromOpt, routeToOpt, routeStopsOpt]);

  const markers = useMemo<MarkerData[]>(() => {
    const m: MarkerData[] = [];
    if (routeForMap.origin) {
      m.push({
        id: "from",
        position: { lat: routeForMap.origin.lat, lng: routeForMap.origin.lng },
        title: "From",
        label: "A",
        infoHtml: (
          <div>
            <b>From</b>
            <br />
            {routeForMap.origin.label}
          </div>
        ),
      });
    }
    routeForMap.stops.forEach((s, i) => {
      m.push({
        id: `stop-${i}`,
        position: { lat: s.lat, lng: s.lng },
        title: `Stop ${i + 1}`,
        label: `${i + 1}`,
        infoHtml: (
          <div>
            <b>Stop {i + 1}</b>
            <br />
            {s.label}
          </div>
        ),
      });
    });
    if (routeForMap.destination) {
      m.push({
        id: "to",
        position: {
          lat: routeForMap.destination.lat,
          lng: routeForMap.destination.lng,
        },
        title: "To",
        label: "B",
        infoHtml: (
          <div>
            <b>To</b>
            <br />
            {routeForMap.destination.label}
          </div>
        ),
      });
    }
    return m;
  }, [routeForMap]);

  const center = useMemo<google.maps.LatLngLiteral>(() => {
    if (routeForMap.origin)
      return { lat: routeForMap.origin.lat, lng: routeForMap.origin.lng };
    if (routeForMap.destination)
      return {
        lat: routeForMap.destination.lat,
        lng: routeForMap.destination.lng,
      };
    return { lat: 14.5547, lng: 121.0244 };
  }, [routeForMap]);

  const placeOptions: MapOption[] = useMemo(
    () => [
      {
        label: "Five/NEO Taguig",
        position: { lat: 14.552981, lng: 121.048469 },
      },
      { label: "SM City Calamba", position: { lat: 14.1891, lng: 121.1643 } },
      { label: "SM Aura", position: { lat: 14.5436, lng: 121.0537 } },
    ],
    []
  );

  return (
    <SelectionBlock>
      <BackButton onClick={() => {}} loading={false} />
      <Box sx={{ width: "100%" }}>
        <h1 className="pt-sans-bold md:text-3xl text-2xl lg:text-4xl text-[#0F2A71] mb-4">
          Location Selection
        </h1>
        <Card sx={{ padding: 5, width: "100%" }} elevation={4}>
          <Box sx={{ width: "100%" }}>
            <Typography
              sx={{
                fontFamily: "PT Sans",
                fontWeight: "bold",
                color: "#0F2A71",
                marginBottom: 4,
                fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
              }}
            >
              Kindly select a location
            </Typography>
            <Divider sx={divStyle} />

            <FromField<CreateBookingType>
              name="route.from"
              control={control}
              options={placeOptions}
            />
            <Divider sx={divStyle} />
            <ToField<CreateBookingType>
              name="route.to"
              control={control}
              options={placeOptions}
            />
            <Divider sx={divStyle} />

            {fields.map((field, idx) => (
              <div
                key={field.id}
                style={{ display: "flex", gap: 8, alignItems: "center" }}
              >
                <AddStopField<CreateBookingType>
                  name={`route.stops.${idx}` as const}
                  control={control}
                  options={placeOptions}
                />
                <Button
                  variant="outlined"
                  onClick={() => {
                    remove(idx);
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Button variant="contained" onClick={() => append(null)}>
                + Add Stop
              </Button>
              <Button
                variant="text"
                onClick={() => {
                  for (let i = fields.length - 1; i >= 0; i--) remove(i);
                }}
              >
                Clear Stops
              </Button>
            </div>

            <CustomGoogleMap
              apiKey={""}
              center={center}
              zoom={12}
              route={routeForMap}
              markers={markers}
              cluster={{ enabled: true, gridSize: 48 }}
              fitTo="all"
              fitPadding={48}
              options={{
                fullscreenControl: true,
                streetViewControl: true,
                mapTypeControl: true,
              }}
            />
          </Box>
        </Card>
      </Box>
    </SelectionBlock>
  );
};
