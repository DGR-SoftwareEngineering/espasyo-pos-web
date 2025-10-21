import React from "react";
import { Card } from "../../../../../Card";
import { Container } from "@mui/material";
import { Alert } from "../../../../../alerts/Alert";
import { CreateBookingFormBlock } from "./create-booking-line/CreateBookingFormBlock";

export function CreateBookingBlock() {
  return (
    <Container>
      <Alert
        severity="info"
        title="Booking Management "
        description="You can create your booking information here."
      />
      <Card sx={{ mt: 5 }}>
        <CreateBookingFormBlock />
      </Card>
    </Container>
  );
}
