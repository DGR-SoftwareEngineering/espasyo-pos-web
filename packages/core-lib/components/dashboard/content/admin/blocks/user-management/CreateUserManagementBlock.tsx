import React from "react";
import { Card } from "../../../../../Card";
import { Container } from "@mui/material";
import { Alert } from "../../../../../alerts/Alert";

export function CreateUserManagementBlock() {
  return (
    <Container>
      <Alert
        severity="info"
        title="User Management "
        description="You can create your user information here."
      />
      <Card sx={{ mt: 5 }}>
        <>
        
        </>
      </Card>
    </Container>
  );
}
