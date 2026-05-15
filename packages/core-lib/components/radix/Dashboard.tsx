import React, { ReactNode } from "react";
import { Box, Flex } from "@radix-ui/themes";
import { useResolution } from "../../core/hooks";
import { SideMenu } from "./SideMenu";
import { Header } from "./Header";

interface Props {
  logout: () => Promise<void>;
  loading?: boolean;
  role?: string;
  initials?: string;
  email?: string;
  children: ReactNode;
}

export const RadixDashboard: React.FC<Props> = ({
  children,
  logout,
  loading,
  role,
  initials,
  email,
}) => {
  const { isMobile } = useResolution();

  return (
    <Flex
      direction={isMobile ? "column" : "row"}
      style={{ minHeight: "100vh" }}
    >
      <SideMenu
        logout={logout}
        loading={loading}
        role={role}
        initials={initials}
        email={email}
      />

      <Flex
        direction="column"
        style={{ flex: 1, minWidth: 0, overflow: "auto" }}
      >
        <Header />
        <Box
          style={{
            flex: 1,
            padding: isMobile ? "16px" : "24px 32px",
          }}
        >
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};
