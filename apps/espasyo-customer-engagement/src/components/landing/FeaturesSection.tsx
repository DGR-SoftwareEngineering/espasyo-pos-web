// components/landing/FeaturesSection.tsx - Fully Fixed
import React, { useRef, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
} from "core-lib/components/radix/proxies";
import {
  Container,
  Grid,
} from "@radix-ui/themes";;
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

const features = [
  {
    icon: "☕",
    title: "Premium Coffee",
    description: "Sourced from the finest roasters, expertly crafted by our skilled baristas.",
    longDescription: "We partner with sustainable farms to bring you the highest quality beans, roasted to perfection and brewed with precision.",
    color: "#c2410c",
    gradient: "linear-gradient(135deg, #c2410c 0%, #ea580c 100%)",
  },
  {
    icon: "⭐",
    title: "Loyalty Rewards",
    description: "Earn stamps with every purchase and redeem them for free drinks.",
    longDescription: "Every purchase brings you closer to your next free drink. Collect stamps digitally and track your progress in real-time.",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
  },
  {
    icon: "🎁",
    title: "Exclusive Deals",
    description: "Member-only promotions, seasonal bundles, and surprise offers.",
    longDescription: "Get access to members-only discounts, early bird specials, and birthday treats that make every visit special.",
    color: "#ea580c",
    gradient: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
  },
  {
    icon: "🚀",
    title: "Fast Service",
    description: "Quick ordering and pickup, so you never have to wait long.",
    longDescription: "Order ahead through our app and skip the line. Your coffee will be ready exactly when you arrive.",
    color: "#dc2626",
    gradient: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
  },
  {
    icon: "📱",
    title: "Mobile App",
    description: "Order ahead, skip the line, and earn rewards from your phone.",
    longDescription: "Available on iOS and Android. Browse menu, customize drinks, and pay seamlessly from your device.",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
  },
  {
    icon: "🎯",
    title: "Personalized",
    description: "Get recommendations based on your taste and order history.",
    longDescription: "AI-powered recommendations that learn your preferences and suggest new drinks you'll love.",
    color: "#06b6d4",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)",
  },
];

const FeatureCard: React.FC<{ feature: typeof features[0]; index: number }> = ({ feature, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Individual icon animations
  const getIconAnimation = () => {
    switch(feature.icon) {
      case "☕":
        return {
          rotate: [0, -5, 5, -5, 0],
          scale: [1, 1.1, 1.05, 1.1, 1],
          y: [0, -3, 2, -2, 0],
        };
      case "⭐":
        return {
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0],
        };
      case "🎁":
        return {
          scale: [1, 1.15, 1],
          y: [0, -5, 0],
          rotate: [0, 5, -5, 0],
        };
      case "🚀":
        return {
          x: [0, 8, -3, 5, 0],
          y: [0, -5, 0],
          rotate: [0, 15, 0],
        };
      case "📱":
        return {
          rotate: [0, -10, 10, -5, 0],
          scale: [1, 1.05, 1],
        };
      case "🎯":
        return {
          scale: [1, 1.2, 0.9, 1.1, 1],
          rotate: [0, -15, 15, 0],
        };
      default:
        return {
          scale: [1, 1.1, 1],
          rotate: [0, 10, -10, 0],
        };
    }
  };

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
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Card Content */}
        <motion.div
          style={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            background: "white",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: isHovered 
              ? "0 20px 40px rgba(0,0,0,0.1)" 
              : "0 4px 20px rgba(0,0,0,0.06)",
            transition: "box-shadow 0.3s ease",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          {/* Colorful Top Border */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              transformOrigin: "top",
            }}
          >
            <motion.div
              animate={{
                scaleY: isHovered ? 1 : 0.75,
              }}
              transition={{ duration: 0.3 }}
              style={{
                position: "absolute",
                inset: 0,
                background: feature.gradient,
              }}
            />
          </div>

          {/* Content Container */}
          <Box p="6" style={{ position: "relative" }}>
            {/* Icon with GIF-like Animation on Hover */}
            <motion.div
              animate={isHovered ? getIconAnimation() : {}}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{ 
                marginBottom: 20,
                display: "inline-block",
              }}
            >
              <Box
                style={{
                  fontSize: 56,
                  display: "inline-block",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                }}
              >
                {feature.icon}
              </Box>
            </motion.div>

            {/* Title */}
            <Heading 
              size="5" 
              weight="bold" 
              mb="2"
              style={{
                color: "#1f2937",
              }}
            >
              {feature.title}
            </Heading>

            {/* Description */}
            <Text size="3" style={{ color: "#6b7280", lineHeight: 1.6, marginBottom: 16 }}>
              {feature.description}
            </Text>

            {/* Expandable Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: "hidden" }}
                >
                  <Box
                    style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: "1px solid #f3f4f6",
                    }}
                  >
                    <Text size="2" style={{ color: "#9ca3af", lineHeight: 1.6 }}>
                      {feature.longDescription}
                    </Text>
                    <motion.div
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      style={{ marginTop: 12 }}
                    >
                      <Flex align="center" gap="2">
                        <span style={{ fontSize: 12 }}>✨</span>
                        <Text size="1" style={{ color: feature.color, fontWeight: 500 }}>
                          Learn more →
                        </Text>
                      </Flex>
                    </motion.div>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Read More Indicator */}
            {!isExpanded && (
              <motion.div
                animate={{
                  y: isHovered ? [0, 3, 0] : 0,
                }}
                transition={{
                  duration: 1,
                  repeat: isHovered ? Infinity : 0,
                  repeatDelay: 0.5,
                  ease: "easeInOut",
                }}
                style={{
                  marginTop: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  opacity: isHovered ? 0.7 : 0.4,
                }}
              >
                <Text size="1" style={{ color: feature.color }}>
                  Click to read more
                </Text>
                <motion.span
                  animate={{ x: isHovered ? [0, 4, 0] : 0 }}
                  transition={{ duration: 1, repeat: isHovered ? Infinity : 0, ease: "easeInOut" }}
                >
                  →
                </motion.span>
              </motion.div>
            )}
          </Box>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export const FeaturesSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <Box 
      ref={ref} 
      id="features" 
      py="9" 
      style={{ 
        position: "relative", 
        overflow: "hidden",
        background: "linear-gradient(180deg, #ffffff 0%, #fefaf5 100%)",
      }}
    >
      {/* Animated Background Orbs */}
      <motion.div
        style={{
          position: "absolute",
          top: "10%",
          right: "0%",
          width: 500,
          height: 500,
          background: "radial-gradient(circle, rgba(251,146,60,0.04) 0%, transparent 70%)",
          borderRadius: "50%",
          y: backgroundY,
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "0%",
          width: 450,
          height: 450,
          background: "radial-gradient(circle, rgba(251,191,36,0.04) 0%, transparent 70%)",
          borderRadius: "50%",
          y: backgroundY,
        }}
        animate={{
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <Container style={{ position: "relative", zIndex: 1 }}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
          >
            <Text
              size="2"
              weight="bold"
              style={{
                color: "#c2410c",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 16,
                display: "inline-block",
                padding: "6px 16px",
                background: "rgba(194,65,12,0.08)",
                borderRadius: 999,
              }}
            >
              ✨ Why Choose Us
            </Text>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Heading 
              size="9" 
              weight="bold" 
              mb="3"
              style={{ 
                letterSpacing: "-0.02em",
                color: "#1f2937",
              }}
            >
              Experience the{" "}
              <span style={{ 
                background: "linear-gradient(135deg, #c2410c, #f59e0b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Perfect Blend
              </span>
            </Heading>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Text size="5" style={{ color: "#6b7280", maxWidth: 600, margin: "0 auto" }}>
              Quality, convenience, and rewards - all in one place
            </Text>
          </motion.div>

          {/* Decorative Underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{
              height: 3,
              width: 60,
              background: "linear-gradient(90deg, #c2410c, #fbbf24)",
              transformOrigin: "left",
              margin: "24px auto 0",
              borderRadius: 3,
            }}
          />
        </motion.div>

        {/* Features Grid */}
        <Grid columns={{ initial: "1", sm: "2", lg: "3" }} gap="6">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} feature={feature} index={idx} />
          ))}
        </Grid>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
          style={{ textAlign: "center", marginTop: 64 }}
        >
          <Flex direction="column" align="center" gap="3">
            <Text size="2" style={{ color: "#9ca3af" }}>
              Join thousands of satisfied coffee lovers
            </Text>
            <motion.div
              whileHover={{ 
                scale: 1.05, 
                y: -2,
                borderColor: "#c2410c",
                boxShadow: "0 4px 12px rgba(194,65,12,0.15)"
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 24px",
                background: "white",
                borderRadius: 999,
                border: "1px solid #e5e7eb",
                cursor: "pointer",
              }}
              onClick={() => {
                document.querySelector("#menu")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Text size="2" style={{ color: "#c2410c", fontWeight: 600 }}>
                Explore all features →
              </Text>
            </motion.div>
          </Flex>
        </motion.div>
      </Container>
    </Box>
  );
};