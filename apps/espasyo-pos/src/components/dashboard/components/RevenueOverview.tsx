import { Box, Container, Fab, Tooltip, Typography } from "@mui/material";
import { Card } from "../../../../../../packages/core-lib/components/Card";

export const RevenueOverview = () => {
  return (
    <Card
      elevation={3}
      text="Revenue Overview"
      sx={{
        borderRadius: 4,
        p: 3,
        height: "100%",
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mt: 2,
          mb: 4,
        }}
      >
        {/* Donut Chart */}
        <Box
          sx={{
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: `
          conic-gradient(
            #4f46e5 0% 32%,
            #f59e0b 32% 58%,
            #10b981 58% 82%,
            #dbeafe 82% 100%
          )
        `,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
          }}
        >
          {/* Inner Circle */}
          <Box
            sx={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              bgcolor: "background.paper",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Total Revenue
            </Typography>

            <Typography variant="h5" fontWeight={700}>
              ₱248K
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Analytics Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 2,
        }}
      >
        {[
          {
            label: "Sales",
            amount: "₱82K",
            growth: "+12%",
            color: "#4f46e5",
          },
          {
            label: "Expenses",
            amount: "₱65K",
            growth: "+8%",
            color: "#f59e0b",
          },
          {
            label: "Profit",
            amount: "₱54K",
            growth: "+18%",
            color: "#10b981",
          },
          {
            label: "Visitors",
            amount: "24K",
            growth: "+5%",
            color: "#60a5fa",
          },
        ].map((item) => (
          <Box
            key={item.label}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.paper",
              transition: "0.2s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: 3,
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 1,
              }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: item.color,
                }}
              />

              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
            </Box>

            <Typography variant="h6" fontWeight={700}>
              {item.amount}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: "success.main",
                fontWeight: 600,
              }}
            >
              {item.growth} this month
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
};
