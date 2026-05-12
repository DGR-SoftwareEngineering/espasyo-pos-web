import {
  Avatar,
  Box,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";

const TOP_PRODUCTS = [
  {
    id: 1,
    name: "Coca Cola 1.5L",
    category: "Beverages",
    sold: 1240,
    revenue: "₱42,500",
    growth: 82,
    color: "#64b5f6",
  },
  {
    id: 2,
    name: "Buffallo Wings",
    category: "Main Dish",
    sold: 980,
    revenue: "₱31,200",
    growth: 68,
    color: "#81c784",
  },
  {
    id: 3,
    name: "Chicken Cordon Bleu",
    category: "Dairy",
    sold: 860,
    revenue: "₱27,900",
    growth: 58,
    color: "#ffb74d",
  },
  {
    id: 4,
    name: "Smoothies",
    category: "Drinks",
    sold: 740,
    revenue: "₱22,300",
    growth: 49,
    color: "#ba68c8",
  },
];

export const QuickActions = () => {
  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 4,
        height: "100%",
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Top Selling Products
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Product sales performance overview
          </Typography>
        </Box>

        <Avatar
          sx={{
            bgcolor: "primary.light",
            color: "primary.main",
          }}
        >
          <TrendingUpRoundedIcon />
        </Avatar>
      </Stack>

      {/* Table Header */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          px: 2,
          py: 1.5,
          borderRadius: 2,
          bgcolor: "grey.100",
          mb: 1,
        }}
      >
        <Typography variant="caption" fontWeight={700}>
          Product
        </Typography>

        <Typography variant="caption" fontWeight={700}>
          Units Sold
        </Typography>

        <Typography variant="caption" fontWeight={700}>
          Revenue
        </Typography>

        <Typography variant="caption" fontWeight={700}>
          Growth
        </Typography>
      </Box>

      {/* Table Body */}
      <Stack spacing={1.5}>
        {TOP_PRODUCTS.map((product, index) => (
          <Box
            key={product.id}
            sx={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              alignItems: "center",
              px: 2,
              py: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              transition: "all 0.2s ease",
              backgroundColor:
                index % 2 === 0
                  ? "rgba(100,181,246,0.05)"
                  : "rgba(129,199,132,0.05)",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 2,
              },
            }}
          >
            {/* Product */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                {product.name}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {product.category}
              </Typography>
            </Box>

            {/* Units */}
            <Typography fontWeight={600}>
              {product.sold.toLocaleString()}
            </Typography>

            {/* Revenue */}
            <Typography fontWeight={700} color="primary.main">
              {product.revenue}
            </Typography>

            {/* Growth */}
            <Box>
              <Chip
                label={`${product.growth}%`}
                size="small"
                sx={{
                  mb: 1,
                  bgcolor: `${product.color}20`,
                  color: product.color,
                  fontWeight: 700,
                }}
              />

              <LinearProgress
                variant="determinate"
                value={product.growth}
                sx={{
                  height: 6,
                  borderRadius: 10,
                  bgcolor: "grey.200",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 10,
                    backgroundColor: product.color,
                  },
                }}
              />
            </Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};
