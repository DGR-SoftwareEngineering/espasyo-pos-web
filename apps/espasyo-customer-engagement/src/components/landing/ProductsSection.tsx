import React, { useState } from "react";
import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  Badge,
  Flex,
  Button,
} from "@radix-ui/themes";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { LockClosedIcon, MagnifyingGlassIcon, HeartIcon, StarIcon } from "@radix-ui/react-icons";
import { useApi } from "core-lib/core/hooks";
import { useAuthContext } from "core-lib/core/contexts";
import { useRouter } from "next/router";
import type { SellableProductDto, ProductCategoryDto } from "core-lib/api/commons/types";

const COFFEE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80";

// Animated Empty State Component
const EmptyState: React.FC<{ categoryName?: string }> = ({ categoryName }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      style={{
        textAlign: "center",
        padding: "80px 20px",
        maxWidth: 500,
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* Animated Coffee Icon */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, -10, 10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ fontSize: 80, marginBottom: 24 }}
      >
        ☕
      </motion.div>

      {/* Floating elements */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          delay: 1,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          top: "20%",
          left: "15%",
          fontSize: 30,
          opacity: 0,
        }}
      >
        🫘
      </motion.div>

      <motion.div
        animate={{
          y: [0, 30, 0],
          x: [0, -20, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          delay: 1.5,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          bottom: "20%",
          right: "15%",
          fontSize: 35,
          opacity: 0,
        }}
      >
        ✨
      </motion.div>

      <Heading size="6" weight="bold" mb="3" style={{ color: "#1f2937" }}>
        {categoryName ? `No ${categoryName} Available` : "No Products Available"}
      </Heading>
      
      <Text size="3" style={{ color: "#6b7280", marginBottom: 24, display: "block" }}>
        {categoryName 
          ? "We're currently brewing new items in this category. Check back soon!"
          : "Our menu is being updated with fresh new items. Please check back later!"}
      </Text>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          color="orange"
          variant="soft"
          size="3"
          onClick={() => window.location.reload()}
          style={{ cursor: "pointer" }}
        >
          Refresh Menu
          <MagnifyingGlassIcon width={16} height={16} style={{ marginLeft: 8 }} />
        </Button>
      </motion.div>

      {/* Decorative dots */}
      <div style={{ marginTop: 32 }}>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#c2410c",
              margin: "0 4px",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

// Enhanced Skeleton Card
const SkeletonCard: React.FC<{ index: number }> = ({ index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05, duration: 0.3 }}
  >
    <Box
      style={{
        borderRadius: 20,
        overflow: "hidden",
        background: "#fff",
        border: "1px solid #f3f4f6",
      }}
    >
      <Box
        style={{
          aspectRatio: "1/1",
          background: "#f3f4f6",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
            animation: "shimmer-slide 1.5s infinite linear",
          }}
        />
      </Box>
      <Box p="4">
        <Box style={{ height: 18, background: "#e5e7eb", borderRadius: 6, marginBottom: 12, width: "80%" }} />
        <Box style={{ height: 14, background: "#f3f4f6", borderRadius: 6, width: "40%" }} />
        <Flex gap="2" style={{ marginTop: 12 }}>
          <Box style={{ height: 32, background: "#e5e7eb", borderRadius: 8, flex: 1 }} />
          <Box style={{ height: 32, width: 32, background: "#e5e7eb", borderRadius: 8 }} />
        </Flex>
      </Box>
    </Box>
  </motion.div>
);

// Enhanced Product Card
interface ProductCardProps {
  product: SellableProductDto;
  isAuthenticated: boolean;
  onClickProduct: (p: SellableProductDto) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isAuthenticated, onClickProduct }) => {
  const [hovered, setHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  
  const price = product.variants.length > 0
    ? `from ₱${Math.min(...product.variants.map((v) => v.price)).toLocaleString()}`
    : product.sellingPrice != null
    ? `₱${product.sellingPrice.toLocaleString()}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -8 }}
    >
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={() => onClickProduct(product)}
        style={{
          borderRadius: 20,
          overflow: "hidden",
          background: "#fff",
          boxShadow: hovered ? "0 20px 40px rgba(0,0,0,0.12)" : "0 4px 12px rgba(0,0,0,0.06)",
          cursor: product.isOutOfStock ? "not-allowed" : "pointer",
          opacity: product.isOutOfStock ? 0.6 : 1,
          transition: "all 0.3s ease",
          position: "relative",
        }}
      >
        {/* Image Section */}
        <Box style={{ position: "relative", aspectRatio: "1/1", overflow: "hidden" }}>
          <motion.div
            animate={{ scale: hovered ? 1.08 : 1 }}
            transition={{ duration: 0.5 }}
            style={{ width: "100%", height: "100%", position: "relative" }}
          >
            <Image
              src={product.imageUrl ?? COFFEE_PLACEHOLDER}
              alt={product.name}
              fill
              style={{ objectFit: "cover" }}
            />
          </motion.div>

          {/* Gradient Overlay */}
          <motion.div
            animate={{ opacity: hovered ? 0.4 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.5) 100%)",
            }}
          />

          {/* Out of Stock Badge */}
          {product.isOutOfStock && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(4px)",
              }}
            >
              <Badge color="gray" variant="solid" size="2" style={{ padding: "8px 16px" }}>
                Out of Stock
              </Badge>
            </motion.div>
          )}

          {/* Login Overlay on Hover */}
          {!isAuthenticated && !product.isOutOfStock && hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(194,65,12,0.9)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backdropFilter: "blur(4px)",
              }}
            >
              <LockClosedIcon width={28} height={28} style={{ color: "#fff" }} />
              <Text size="2" weight="bold" style={{ color: "#fff" }}>Login to Order</Text>
            </motion.div>
          )}

          {/* Category Badge */}
          {product.categoryName && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{ position: "absolute", bottom: 12, left: 12 }}
            >
              <Badge color="orange" variant="soft" size="1" radius="full">
                {product.categoryName}
              </Badge>
            </motion.div>
          )}

          {/* Like Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setLiked(!liked);
            }}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "rgba(255,255,255,0.9)",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              backdropFilter: "blur(4px)",
            }}
          >
            <HeartIcon width={16} height={16} style={{ color: liked ? "#c2410c" : "#6b7280" }} />
          </motion.button>
        </Box>

        {/* Content Section */}
        <Box p="4">
          <Text
            weight="bold"
            size="3"
            as="div"
            style={{
              marginBottom: 4,
              color: "#1f2937",
            }}
          >
            {product.name}
          </Text>
          
          {price && (
            <Text size="2" style={{ color: "#c2410c", fontWeight: 700 }}>
              {price}
            </Text>
          )}

          {/* Quick Action Buttons */}
          {!product.isOutOfStock && isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
              transition={{ duration: 0.2 }}
              style={{ marginTop: 12 }}
            >
              <Button
                size="1"
                color="orange"
                style={{
                  width: "100%",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Order Now →
              </Button>
            </motion.div>
          )}
        </Box>

        {/* Hover Border Effect */}
        <motion.div
          animate={{ scaleX: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "linear-gradient(90deg, #c2410c, #fbbf24)",
            transformOrigin: "left",
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export const ProductsSection: React.FC = () => {
  const [activeCategoryID, setActiveCategoryID] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const { isAuthenticated } = useAuthContext();
  const router = useRouter();

  const { result: productsResult, loading: productsLoading } = useApi(
    (api) =>
      api.commons.sellableProductList({
        pageNumber: 1,
        pageSize: 12,
        categoryID: activeCategoryID,
      }),
    [activeCategoryID],
  );

  const { result: catsResult } = useApi(
    (api) => api.commons.productCategoryList(),
    [],
  );

  const products = productsResult?.data?.response?.items ?? [];
  const categories = (catsResult?.data?.response ?? []) as ProductCategoryDto[];

  const handleProductClick = (product: SellableProductDto) => {
    if (product.isOutOfStock) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    // Add to cart or show modal logic here
  };

  const getCategoryName = () => {
    if (!activeCategoryID) return "All";
    const category = categories.find(c => c.productCategoryID === activeCategoryID);
    return category?.name || "Products";
  };

  // Container variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        duration: 0.3,
      },
    },
  };

  return (
    <Box id="menu" py={{ initial: "7", md: "9" }} style={{ background: "linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)" }}>
      <Container>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: 48 }}
        >
          <Badge color="orange" variant="soft" size="2" style={{ display: "inline-block", marginBottom: 16 }}>
            🍽️ Our Selection
          </Badge>
          <Heading size="8" weight="bold" mb="3" style={{ letterSpacing: "-0.02em" }}>
            Explore Our Menu
          </Heading>
          <Text size="4" style={{ color: "#6b7280", maxWidth: 600, margin: "0 auto" }}>
            Fresh, handcrafted beverages made with premium ingredients
          </Text>
        </motion.div>

        {/* Category Tabs - Redesigned */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Flex gap="3" wrap="wrap" justify="center" mb="8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveCategoryID(undefined);
                  setSelectedCategory("All");
                }}
                style={{
                  padding: "8px 24px",
                  borderRadius: 999,
                  border: "none",
                  background: activeCategoryID === undefined 
                    ? "linear-gradient(135deg, #c2410c, #ea580c)"
                    : "#fff",
                  color: activeCategoryID === undefined ? "#fff" : "#374151",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: activeCategoryID === undefined 
                    ? "0 4px 12px rgba(194,65,12,0.3)"
                    : "0 2px 4px rgba(0,0,0,0.05)",
                }}
              >
                All Items
              </motion.button>
              {categories.slice(0, 6).map((cat) => (
                <motion.button
                  key={cat.productCategoryID}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setActiveCategoryID(cat.productCategoryID);
                    setSelectedCategory(cat.name);
                  }}
                  style={{
                    padding: "8px 24px",
                    borderRadius: 999,
                    border: "none",
                    background: activeCategoryID === cat.productCategoryID 
                      ? "linear-gradient(135deg, #c2410c, #ea580c)"
                      : "#fff",
                    color: activeCategoryID === cat.productCategoryID ? "#fff" : "#374151",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: activeCategoryID === cat.productCategoryID 
                      ? "0 4px 12px rgba(194,65,12,0.3)"
                      : "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  {cat.name}
                </motion.button>
              ))}
            </Flex>
          </motion.div>
        )}

        {/* Products Grid with Animated Empty State */}
        <AnimatePresence mode="wait">
          {productsLoading ? (
            <Grid columns={{ initial: "2", sm: "3", md: "4" }} gap="5">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} index={i} />
              ))}
            </Grid>
          ) : products.length > 0 ? (
            <motion.div
              key={activeCategoryID || "all"}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: 20 }}
            >
              <Grid columns={{ initial: "2", sm: "3", md: "4" }} gap="5">
                {products.map((product) => (
                  <ProductCard
                    key={product.productID}
                    product={product}
                    isAuthenticated={isAuthenticated}
                    onClickProduct={handleProductClick}
                  />
                ))}
              </Grid>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <EmptyState categoryName={selectedCategory !== "All" ? selectedCategory : undefined} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login CTA */}
        {!isAuthenticated && products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ textAlign: "center", marginTop: 60 }}
          >
            <motion.div
              whileHover={{ y: -4 }}
              style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #fff, #fff7ed)",
                borderRadius: 24,
                padding: "32px 48px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                border: "1px solid rgba(194,65,12,0.1)",
              }}
            >
              <Flex direction="column" align="center" gap="3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                >
                  <LockClosedIcon width={32} height={32} style={{ color: "#c2410c" }} />
                </motion.div>
                <Heading size="4" weight="bold">Ready to Order?</Heading>
                <Text size="2" style={{ color: "#6b7280", maxWidth: 300 }}>
                  Login to order your favorites and earn loyalty stamps
                </Text>
                <Link href="/login">
                  <Button
                    color="orange"
                    size="3"
                    style={{
                      cursor: "pointer",
                      fontWeight: 600,
                      marginTop: 8,
                      background: "linear-gradient(135deg, #c2410c, #ea580c)",
                    }}
                  >
                    Login to Order
                    <StarIcon width={16} height={16} style={{ marginLeft: 8 }} />
                  </Button>
                </Link>
              </Flex>
            </motion.div>
          </motion.div>
        )}
      </Container>
    </Box>
  );
};