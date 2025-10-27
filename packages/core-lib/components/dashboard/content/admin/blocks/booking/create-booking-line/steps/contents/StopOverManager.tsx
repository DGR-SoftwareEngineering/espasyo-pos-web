import React, { useState, useEffect } from "react";
import { Button } from "../../../../../../../../buttons/Button";
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from "@mui/material";
import { Stop } from "./types";
import { Input } from "../../../../../../../../form";
import { EvaIcon } from "../../../../../../../../EvaIcon";
import { AddCircleOutline, KeyboardArrowDown } from "@mui/icons-material";

interface Props {
  stops: Stop[] | null;
  setStops: React.Dispatch<React.SetStateAction<Stop[] | null>>;
}

export const StopOverManager: React.FC<Props> = ({ stops, setStops }) => {
  
  const [text, setText] = useState("Add Destination");
  const onClick = () => {
    // TODO :: PUT MAP INPUT HERE MODAL
  };

  const handleRemoveStopOver = (index: number) => {
    if (stops) {
      const updated = stops.filter((_, i) => i !== index);
      setStops(updated);
    }
  }

  const handleStopoverChange = (index: number, value: Stop) => {
    if (stops) {
      const updated = [...stops];
      updated[index] = value;
      setStops(updated);
    }
  };

  return (<>
    <Box className="w-full flex items-center justify-start my-4">
      <Box>
        <Button
        onClick={onClick}
        disabled={false}
        loading={false}
        data-testid="add-stops-button"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          color: "#0F2A71",
          boxShadow: 0,
          minWidth: 10,
          maxHeight: 10,
          gap: 1,
          borderRadius: "0px",
          paddingX: 0,
          paddingY: 0,
          backgroundColor: "transparent",
          background: "transparent",
          border: "1px solid transparent"
        }}
      ><AddCircleOutline></AddCircleOutline>{text}</Button>
      </Box>
      
      <Typography>
        Route Details
      </Typography>
      {/* {stops &&
        stops.map((stop, idx) => (
          <>
            <StopoverInput key={idx} value={stop} onChange={handleStopoverChange} onRemove={handleRemoveStopOver} />
          </>
        ))
      } */}
      <StopoverAccordion stops={stops} setStops={setStops}/>
    </Box>
  </>
  );
};

type MapLocationCoordinate = {
  key: number;
  value: Stop;
  onChange: (index: number, value: Stop) => void;
  onRemove: (index: number) => void;
}

const StopoverAccordion: React.FC<Props> = ({stops, setStops}) => {
  return (
    <Box className="w-full max-w-2xl mx-auto mt-8">
      {stops && stops.map((location, index) => (
        <Accordion key={index} className="bg-white shadow-md rounded-md mb-4">
          <AccordionSummary
            expandIcon={<KeyboardArrowDown />}
            aria-controls={`panel${index}-content`}
            id={`panel${index}-header`}
            className="bg-gray-100"
          >
            <Typography className="font-semibold">{location.address}</Typography>
          </AccordionSummary>
          <AccordionDetails className="p-0">
            <iframe
              src={location.mapUrl}
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-b-md"
            ></iframe>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}


const StopoverInput: React.FC<MapLocationCoordinate> = ({ key, value, onChange, onRemove }) => {

  return (
    <>
      <Box>
        <Box key={key}>
          <Typography
            sx={{
              fontFamily: "PT Sans",
              fontWeight: "bold",
              color: "#0F2A71",
              marginBottom: 4,
              fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
            }}
          >Stop #: {value.stopId}</Typography>
          <Typography
            sx={{
              fontFamily: "PT Sans",
              fontWeight: "bold",
              color: "#0F2A71",
              marginBottom: 4,
              fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
            }}
          >Address Name:</Typography>
          <Typography
            sx={{
              fontFamily: "PT Sans",
              fontWeight: "bold",
              color: "#0F2A71",
              marginBottom: 4,
              fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
            }}
          >{value.address}</Typography>
          <Typography
            sx={{
              fontFamily: "PT Sans",
              fontWeight: "bold",
              color: "#0F2A71",
              marginBottom: 4,
              fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
            }}
          >Longitude:</Typography>
          <Typography
            sx={{
              fontFamily: "PT Sans",
              fontWeight: "bold",
              color: "#0F2A71",
              marginBottom: 4,
              fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
            }}
          >{value.longitude}</Typography>
          <Typography
            sx={{
              fontFamily: "PT Sans",
              fontWeight: "bold",
              color: "#0F2A71",
              marginBottom: 4,
              fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
            }}
          >Latitude:</Typography>
          <Typography
            sx={{
              fontFamily: "PT Sans",
              fontWeight: "bold",
              color: "#0F2A71",
              marginBottom: 4,
              fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
            }}
          >{value.latitude}</Typography>
        </Box>
        <Button text="Edit Stop" onClick={() => onChange(key, value)} />
        <Button text="Remove Stop" onClick={() => onRemove(key)} />
      </Box>
    </>)
};
