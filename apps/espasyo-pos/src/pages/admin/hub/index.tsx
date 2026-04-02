import React from "react";
import {
  Box,
  Container,
  Tooltip,
  Fab,
  Paper,
  Typography,
  Divider,
  LinearProgress,
  TableRow,
  TableCell,
} from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";
import { motion } from "framer-motion";

// Hooks
import { useApi } from "core-lib/core/hooks";
import {
  useGreeting,
  useMotivation,
} from "../../../components/dashboard/hooks";

// Components
import {
  WelcomeHeader,
  MotivationMessage,
  StatsGrid,
  QuickActions,
  Achievements,
} from "../../../components/dashboard/components";

import SalesChart from "@/components/dashboard/components/SalesChart";
import { DashboardCard } from "@/components/dashboard/components/DashboardCard";
import {
  DataTableV2,
  DataTableHeader,
} from "../../../../../../packages/core-lib/components/DataTableV2";

const MotionFab = motion(Fab);

const DashboardHome = () => {
  const { timeOfDay } = useGreeting();
  const { currentMessage, isVisible, nextMessage } = useMotivation();
  const { result, loading } = useApi((api) => api.commons.getUserById());

  const roleID = result?.data?.response?.roleID;
  const roleCb = useApi(
    async (api) => {
      if (!roleID) return null;
      return await api.commons.getRoleById(roleID);
    },
    [roleID],
  );

  const userData = result?.data?.response?.userInfo;
  const role = roleCb.result?.data?.response?.roleName;

  if (loading || roleCb.loading) return <Container>Loading...</Container>;

  // metrics
  const totalSales = 12500;
  const salesTarget = 20000;

  const transactions = 156;
  const transactionTarget = 250;

  const growth = 12; // %
  const avgOrder = 80;
  const avgOrderTarget = 150;

  // Table headers
  const topItemsHeaders: DataTableHeader[] = [
    { name: "Item Name" },
    { name: "Units Sold" },
    { name: "Revenue" },
  ];

  // top 5 items
  const topSaleableItems = [
    { name: "Item A", unitsSold: 120, revenue: 2400 },
    { name: "Item B", unitsSold: 95, revenue: 1800 },
    { name: "Item C", unitsSold: 75, revenue: 1500 },
    { name: "Item D", unitsSold: 60, revenue: 1200 },
    { name: "Item E", unitsSold: 50, revenue: 1000 },
  ];

  return (
    <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "grey.50" }}>
      <Container maxWidth="xl">
        <WelcomeHeader
          name={userData?.firstName || "Cashier"}
          role={role ?? "Staff"}
          timeOfDay={timeOfDay}
        />

        <MotivationMessage message={currentMessage} isVisible={isVisible} />

        <StatsGrid />

        {/* main grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "2fr 1fr",
            },
            gap: 3,
            mt: 2,
          }}
        >
          {/* Left Side */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            {/* Sales Chart */}
            <Box sx={{ width: "100%" }}>
              <SalesChart />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* metrics + table */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, 1fr)",
                },
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Total Sales
                </Typography>
                <Typography fontWeight={600}>
                  ₱{totalSales.toLocaleString()}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(totalSales / salesTarget) * 100}
                  sx={{ mt: 1, height: 6, borderRadius: 5 }}
                />
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Transactions
                </Typography>
                <Typography fontWeight={600}>{transactions}</Typography>
                <LinearProgress
                  variant="determinate"
                  value={(transactions / transactionTarget) * 100}
                  sx={{ mt: 1, height: 6, borderRadius: 5 }}
                />
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Growth
                </Typography>
                <Typography fontWeight={600} color="success.main">
                  +{growth}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={growth}
                  color="success"
                  sx={{ mt: 1, height: 6, borderRadius: 5 }}
                />
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Avg Order
                </Typography>
                <Typography fontWeight={600}>₱{avgOrder}</Typography>
                <LinearProgress
                  variant="determinate"
                  value={(avgOrder / avgOrderTarget) * 100}
                  sx={{ mt: 1, height: 6, borderRadius: 5 }}
                />
              </Box>
            </Box>

            {/* data table v2 */}
            <DashboardCard>
              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                  gap: 2,
                }}
              ></Box>

              <Box
                sx={{
                  mt: -3, // move the table
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: 1,
                }}
              >
                {/* title */}
                <Typography
                  variant="h6"
                  sx={{
                    px: 2,
                    pt: 1,
                    pb: 1,
                    fontWeight: 600,
                    color: "text.primary",
                  }}
                >
                  Weekly Top 5 Saleable Items
                </Typography>

                <DataTableV2
                  data={topSaleableItems}
                  tableHeaders={topItemsHeaders.map((header) => ({
                    ...header,
                    sx: { fontWeight: 600, color: "text.secondary" },
                  }))}
                  bodyRowComponent={(row, index, sx) => (
                    <TableRow
                      key={index}
                      sx={{
                        backgroundColor:
                          index % 2 === 0 ? "primary.light" : "success.light",
                        "&:hover": {
                          backgroundColor:
                            index % 2 === 0 ? "primary.main" : "success.main",
                          color: "common.white",
                        },
                        ...sx,
                      }}
                    >
                      {Object.values(row).map((value, cellIndex) => (
                        <TableCell
                          key={cellIndex}
                          sx={{
                            py: 1.5,
                            px: 2,
                            fontSize: "0.875rem",
                            color: "text.primary",
                          }}
                        >
                          {value}
                        </TableCell>
                      ))}
                    </TableRow>
                  )}
                  loading={false}
                  sx={{
                    tableHead: {
                      backgroundColor: "grey.200",
                    },
                    headerCell: {
                      cell: { py: 1.5, px: 2 },
                    },
                    bodyCell: { cell: {} },
                  }}
                />
              </Box>
            </DashboardCard>
          </Paper>

          {/* Right Side: Quick Actions + Achievements */}
          <Box
            sx={{
              display: "grid",
              gridTemplateRows: "1fr 1fr",
              gap: 3,
            }}
          >
            <QuickActions />
            <Achievements />
          </Box>
        </Box>

        {/* Floating Motivation Button */}
        <Tooltip title="New motivation">
          <MotionFab
            color="primary"
            onClick={nextMessage}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            sx={{ position: "fixed", bottom: 24, right: 24 }}
          >
            <AutoAwesome />
          </MotionFab>
        </Tooltip>
      </Container>
    </Box>
  );
};

export default DashboardHome;
