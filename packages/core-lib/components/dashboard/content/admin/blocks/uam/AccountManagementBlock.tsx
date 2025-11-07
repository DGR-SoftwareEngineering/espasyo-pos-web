import React from "react";
import { Card } from "../../../../../Card";
import { Container } from "@mui/material";
import { Alert } from "../../../../../alerts/Alert";
import { AccountList } from "./content";
import { responseMockData } from "./content/types";

export function AccountManagementBlock() {
  return (
    <Container maxWidth="xl">
      <Alert
        severity="info"
        title="User Access Mangement | Account Management "
        description="You can manage the entire account here."
      />
      <Card sx={{ mt: 5 }}>
        <AccountList
          tableData={responseMockData}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      </Card>
    </Container>
  );
}
