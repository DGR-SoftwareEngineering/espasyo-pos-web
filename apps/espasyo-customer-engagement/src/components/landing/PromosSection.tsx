// components/landing/PromosSection.tsx - Completely Redesigned
import React, { useState } from "react";
import { Box, Container, Grid, Heading, Text, Badge, Flex, Button } from "@radix-ui/themes";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { TimerIcon, ArrowRightIcon, StarIcon } from "@radix-ui/react-icons";

const PROMOS = [
  {
    id: 1,
    title: "Buy 1 Get 1 Free",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=90",
    discount: "50% OFF",
    desc: "On selected beverages every Tuesday",
    badgeColor: "orange" as const,
    validUntil: "Dec 31, 2024",
    isFeatured: true,
    code: "BOGO50",
  },
  {
    id: 2,
    title: "Cold Brew Special",
    image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&q=90",
    discount: "20% OFF",
    desc: "All cold brew variants all week long",
    badgeColor: "cyan" as const,
    validUntil: "Dec 25, 2024",
    isFeatured: false,
    code: "COLD20",
  },
  {
    id: 3,
    title: "Coffee + Pastry Bundle",
    image: "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=600&q=90",
    discount: "SAVE ₱50",
    desc: "Any coffee paired with your choice of pastry",
    badgeColor: "purple" as const,
    validUntil: "Dec 30, 2024",
    isFeatured: true,
    code: "BUNDLE50",
  },
  {
    id: 4,
    title: "Free Size Upgrade",
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&q=90",
    discount: "FREE",
    desc: "Upgrade to large on any hot drink",
    badgeColor: "green" as const,
    validUntil: "Dec 28, 2024",
    isFeatured: false,
    code: "UPGRADE",
  },
];

const PromoCard: React.FC<{ promo: typeof PROMOS[0]; index: number }> = ({ promo, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showCode, setShowCode] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        animate={{
          y: isHovered ? -8 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          position: "relative",
          height: "100%",
          cursor: "pointer",
          borderRadius: 20,
          overflow: "hidden",
          background: "#fff",
          boxShadow: isHovered 
            ? "0 20px 40px rgba(0,0,0,0.15)" 
            : "0 4px 15px rgba(0,0,0,0.08)",
          transition: "box-shadow 0.3s ease",
        }}
      >
        {/* Featured Badge */}
        {promo.isFeatured && (
          <motion.div
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            transition={{ type: "spring", stiffness: 400 }}
            style={{
              position: "absolute",
              top: 20,
              left: -30,
              background: "linear-gradient(135deg, #f59e0b, #ea580c)",
              color: "white",
              padding: "6px 40px",
              transform: "rotate(-45deg)",
              zIndex: 2,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "1px",
            }}
          >
            FEATURED
          </motion.div>
        )}

        {/* Image Container */}
        <Box style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden" }}>
          <motion.div
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.5 }}
            style={{ width: "100%", height: "100%", position: "relative" }}
          >
            <Image
              src={promo.image}
              alt={promo.title}
              fill
              style={{ objectFit: "cover" }}
              quality={85}
            />
          </motion.div>

          {/* Gradient Overlay */}
          <motion.div
            animate={{ opacity: isHovered ? 0.6 : 0.3 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 100%)",
            }}
          />

          {/* Discount Badge */}
          <motion.div
            animate={{
              scale: isHovered ? 1.1 : 1,
              rotate: isHovered ? [0, -5, 5, 0] : 0,
            }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 2,
            }}
          >
            <Badge
              color={promo.badgeColor}
              variant="solid"
              size="2"
              radius="full"
              style={{
                padding: "8px 16px",
                fontSize: 14,
                fontWeight: 700,
                background: `linear-gradient(135deg, ${getBadgeGradient(promo.badgeColor)})`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              {promo.discount}
            </Badge>
          </motion.div>

          {/* Timer Badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              position: "absolute",
              bottom: 16,
              left: 16,
              zIndex: 2,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
              borderRadius: 8,
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <TimerIcon width={12} height={12} style={{ color: "#fff" }} />
            <Text size="1" style={{ color: "#fff", fontWeight: 500 }}>
              Valid until {promo.validUntil}
            </Text>
          </motion.div>
        </Box>

        {/* Card Content */}
        <Box p="5">
          <Flex direction="column" gap="3">
            {/* Title */}
            <Heading size="4" weight="bold" style={{ letterSpacing: "-0.01em" }}>
              {promo.title}
            </Heading>

            {/* Description */}
            <Text size="2" style={{ color: "#6b7280", lineHeight: 1.5 }}>
              {promo.desc}
            </Text>

            {/* Promo Code Section */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: showCode ? 1 : 0, height: showCode ? "auto" : 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden" }}
            >
              <Flex
                align="center"
                justify="between"
                style={{
                  background: "#fefaf5",
                  borderRadius: 12,
                  padding: "8px 12px",
                  border: "1px dashed #c2410c",
                }}
              >
                <Text size="2" weight="bold" style={{ color: "#c2410c", fontFamily: "monospace" }}>
                  Code: {promo.code}
                </Text>
                <Button
                  size="1"
                  variant="ghost"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    navigator.clipboard.writeText(promo.code);
                    alert("Promo code copied!");
                  }}
                >
                  Copy
                </Button>
              </Flex>
            </motion.div>

            {/* Action Buttons */}
            <Flex gap="2" style={{ marginTop: 8 }}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ flex: 1 }}
              >
                <Link href="/login" style={{ textDecoration: "none", width: "100%", display: "block" }}>
                  <Button
                    color="orange"
                    size="2"
                    style={{
                      cursor: "pointer",
                      fontWeight: 600,
                      width: "100%",
                      background: "linear-gradient(135deg, #c2410c, #ea580c)",
                    }}
                  >
                    Claim
                    <ArrowRightIcon width={14} height={14} style={{ marginLeft: 6 }} />
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="2"
                  style={{
                    cursor: "pointer",
                    fontWeight: 600,
                    borderColor: "#c2410c",
                    color: "#c2410c",
                  }}
                  onClick={() => setShowCode(!showCode)}
                >
                  {showCode ? "Hide Code" : "Get Code"}
                </Button>
              </motion.div>
            </Flex>
          </Flex>
        </Box>

        {/* Hover Border Effect */}
        <motion.div
          animate={{
            scaleX: isHovered ? 1 : 0,
          }}
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

// Helper function for badge gradients
const getBadgeGradient = (color: string): string => {
  const gradients = {
    orange: "#c2410c, #ea580c",
    cyan: "#0891b2, #06b6d4",
    purple: "#7c3aed, #8b5cf6",
    green: "#059669, #10b981",
  };
  return gradients[color as keyof typeof gradients] || gradients.orange;
};

export const PromosSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filteredPromos = activeFilter === "all" 
    ? PROMOS 
    : PROMOS.filter(promo => 
        activeFilter === "featured" ? promo.isFeatured : true
      );

  return (
    <Box 
      id="promos" 
      py={{ initial: "7", md: "9" }} 
      style={{ 
        background: "linear-gradient(180deg, #fff 0%, #fff7ed 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative Background Elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          top: "10%",
          right: "5%",
          fontSize: 120,
          opacity: 0.05,
          pointerEvents: "none",
        }}
      >
        🎁
      </motion.div>

      <motion.div
        animate={{
          y: [0, 20, 0],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        style={{
          position: "absolute",
          bottom: "10%",
          left: "5%",
          fontSize: 100,
          opacity: 0.05,
          pointerEvents: "none",
        }}
      >
        🎉
      </motion.div>

      <Container style={{ position: "relative", zIndex: 1 }}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: 48 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <Badge 
              color="orange" 
              variant="soft" 
              size="2" 
              style={{ 
                display: "inline-block",
                marginBottom: 16,
                padding: "6px 16px",
              }}
            >
              🔥 Limited Time Offers
            </Badge>
          </motion.div>

          <Heading 
            size="8" 
            weight="bold" 
            mb="3" 
            style={{ 
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #1f2937, #c2410c)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Current Deals & Promotions
          </Heading>
          <Text size="4" style={{ color: "#6b7280", maxWidth: 600, margin: "0 auto" }}>
            Exclusive offers crafted for our valued customers
          </Text>

          {/* Filter Tabs */}
          <Flex justify="center" gap="3" style={{ marginTop: 32 }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter("all")}
              style={{
                padding: "8px 24px",
                borderRadius: 999,
                border: "none",
                background: activeFilter === "all" 
                  ? "linear-gradient(135deg, #c2410c, #ea580c)"
                  : "rgba(194,65,12,0.1)",
                color: activeFilter === "all" ? "white" : "#c2410c",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              All Offers
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter("featured")}
              style={{
                padding: "8px 24px",
                borderRadius: 999,
                border: "none",
                background: activeFilter === "featured" 
                  ? "linear-gradient(135deg, #c2410c, #ea580c)"
                  : "rgba(194,65,12,0.1)",
                color: activeFilter === "featured" ? "white" : "#c2410c",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              Featured Only
            </motion.button>
          </Flex>
        </motion.div>

        {/* Promos Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Grid columns={{ initial: "1", sm: "2", lg: "4" }} gap="6">
              {filteredPromos.map((promo, idx) => (
                <PromoCard key={promo.id} promo={promo} index={idx} />
              ))}
            </Grid>
          </motion.div>
        </AnimatePresence>

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{
            marginTop: 64,
            padding: "32px",
            background: "linear-gradient(135deg, #fff7ed, #fff)",
            borderRadius: 24,
            border: "1px solid rgba(194,65,12,0.1)",
            textAlign: "center",
          }}
        >
          <Flex direction="column" align="center" gap="3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
            >
              <Text style={{ fontSize: 48 }}>📧</Text>
            </motion.div>
            <Heading size="5" weight="bold">
              Don't Miss Out on Future Deals!
            </Heading>
            <Text size="2" style={{ color: "#6b7280", maxWidth: 400 }}>
              Subscribe to get exclusive offers and early access to promotions
            </Text>
            <Link href="/login">
              <Button
                color="orange"
                size="3"
                style={{
                  cursor: "pointer",
                  fontWeight: 600,
                  marginTop: 8,
                }}
              >
                Subscribe Now
                {/* <FireIcon width={16} height={16} style={{ marginLeft: 8 }} /> */}
              </Button>
            </Link>
          </Flex>
        </motion.div>
      </Container>
    </Box>
  );
};