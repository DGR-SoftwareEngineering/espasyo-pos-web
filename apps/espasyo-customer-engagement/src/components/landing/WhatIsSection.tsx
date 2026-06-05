// components/landing/WhatIsSection.tsx - Redesigned without wave
import React, { useRef } from "react";
import { Box, Container, Grid, Heading, Text, Button, Badge, Flex } from "@radix-ui/themes";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { CheckCircledIcon, HeartIcon, RocketIcon, MagicWandIcon, ArrowRightIcon } from "@radix-ui/react-icons";

const BENEFITS = [
  { 
    title: "Loyalty Stamps", 
    desc: "Earn a stamp with every purchase, 10 stamps = 1 free drink",
    icon: CheckCircledIcon,
    color: "#c2410c"
  },
  { 
    title: "Exclusive Deals", 
    desc: "Member-only promotions and seasonal bundles",
    icon: RocketIcon,
    color: "#f59e0b"
  },
  { 
    title: "Easy Ordering", 
    desc: "Order online, skip the queue, and earn rewards automatically",
    icon: MagicWandIcon,
    color: "#8b5cf6"
  },
  { 
    title: "Personalized Offers", 
    desc: "Deals curated based on your taste preferences",
    icon: HeartIcon,
    color: "#ec4899"
  },
];

// Animated Coffee Illustration Component
const CoffeeIllustration: React.FC = () => {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Steam Animation */}
      <motion.div
        animate={{ 
          y: [-20, -80],
          opacity: [0, 0.5, 0],
          scale: [0.8, 1.3, 1.6]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeOut",
          repeatDelay: 1
        }}
        style={{
          position: "absolute",
          top: "25%",
          left: "40%",
          transform: "translateX(-50%)",
          fontSize: 45,
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        💨
      </motion.div>
      
      <motion.div
        animate={{ 
          y: [-15, -70],
          opacity: [0, 0.4, 0],
          scale: [0.7, 1.2, 1.5]
        }}
        transition={{ 
          duration: 3.5,
          repeat: Infinity,
          ease: "easeOut",
          delay: 0.5,
          repeatDelay: 1
        }}
        style={{
          position: "absolute",
          top: "25%",
          right: "40%",
          transform: "translateX(50%)",
          fontSize: 35,
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        💨
      </motion.div>

      {/* Main Coffee Cup */}
      <motion.div
        animate={{ 
          y: [0, -8, 0],
          rotate: [0, 3, 0, -3, 0]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: 180,
          textAlign: "center",
          filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.15))",
          cursor: "pointer",
          zIndex: 3,
        }}
      >
        ☕
      </motion.div>

      {/* Floating Coffee Beans */}
      <motion.div
        animate={{ 
          y: [0, -40, 0],
          x: [0, 25, 0],
          rotate: [0, 180, 360]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: "absolute",
          bottom: "15%",
          right: "10%",
          fontSize: 55,
          filter: "drop-shadow(0 5px 10px rgba(0,0,0,0.1))",
          zIndex: 1,
        }}
      >
        🫘
      </motion.div>

      <motion.div
        animate={{ 
          y: [0, 35, 0],
          x: [0, -20, 0],
          rotate: [0, -180, -360]
        }}
        transition={{ 
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        style={{
          position: "absolute",
          top: "15%",
          left: "10%",
          fontSize: 50,
          filter: "drop-shadow(0 5px 10px rgba(0,0,0,0.1))",
          zIndex: 1,
        }}
      >
        🫘
      </motion.div>

      {/* Sparkles */}
      <motion.div
        animate={{ 
          scale: [0, 1, 0],
          opacity: [0, 1, 0]
        }}
        transition={{ 
          duration: 2.5,
          repeat: Infinity,
          delay: 0,
          times: [0, 0.5, 1],
          repeatDelay: 1.5
        }}
        style={{
          position: "absolute",
          top: "20%",
          right: "25%",
          fontSize: 28,
          zIndex: 2,
        }}
      >
        ✨
      </motion.div>

      <motion.div
        animate={{ 
          scale: [0, 1, 0],
          opacity: [0, 1, 0]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          delay: 0.8,
          times: [0, 0.5, 1],
          repeatDelay: 1.5
        }}
        style={{
          position: "absolute",
          bottom: "25%",
          left: "15%",
          fontSize: 22,
          zIndex: 2,
        }}
      >
        ✨
      </motion.div>

      {/* Static Glow Effect */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "70%",
          height: "70%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,146,60,0.15) 0%, rgba(251,146,60,0.05) 50%, transparent 70%)",
          filter: "blur(30px)",
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.5,
        }}
      />
    </div>
  );
};

export const WhatIsSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const illustrationY = useTransform(scrollYProgress, [0, 0.5, 1], [0, -30, 0]);

  return (
    <Box 
      ref={sectionRef}
      id="what-is" 
      py={{ initial: "8", md: "9" }} 
      style={{ 
        background: "linear-gradient(180deg, #ffffff 0%, #fffaf5 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Static Decorative Background Elements */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          right: "0%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,146,60,0.05) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "5%",
          left: "0%",
          width: 450,
          height: 450,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <Container style={{ position: "relative", zIndex: 1 }}>
        <Grid columns={{ initial: "1", md: "2" }} gap={{ initial: "8", md: "12" }} align="center">
          {/* Left Side - Animated Coffee Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <motion.div
              style={{
                y: illustrationY,
                width: "100%",
                maxWidth: 500,
                margin: "0 auto",
              }}
            >
              <Box
                style={{
                  width: "100%",
                  aspectRatio: "1/1",
                  position: "relative",
                }}
              >
                <CoffeeIllustration />
              </Box>
            </motion.div>
          </motion.div>

          {/* Right Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <Flex direction="column" gap="6">
              {/* Section Label */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Flex align="center" gap="2">
                  <div style={{ 
                    width: 40, 
                    height: 2, 
                    background: "linear-gradient(90deg, #c2410c, transparent)",
                    borderRadius: 2 
                  }} />
                  <Text
                    size="2"
                    weight="bold"
                    style={{
                      color: "#c2410c",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Why Choose Us
                  </Text>
                </Flex>
              </motion.div>

              {/* Main Heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <Heading 
                  size="8" 
                  weight="bold" 
                  style={{ 
                    lineHeight: 1.2, 
                    letterSpacing: "-0.02em",
                  }}
                >
                  More Than{" "}
                  <span style={{ 
                    background: "linear-gradient(135deg, #c2410c, #f59e0b)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>
                    Just Coffee
                  </span>
                </Heading>
                <Text size="4" style={{ color: "#6b7280", lineHeight: 1.6, marginTop: 16 }}>
                  Discover a seamless digital experience that rewards your loyalty
                </Text>
              </motion.div>

              {/* Benefits Grid */}
              <Grid columns={{ initial: "1", sm: "2" }} gap="4" style={{ marginTop: 8 }}>
                {BENEFITS.map((item, idx) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
                    whileHover={{ x: 5 }}
                  >
                    <Flex gap="3" align="start">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          flexShrink: 0,
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: `linear-gradient(135deg, ${item.color}10, ${item.color}20)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: `1px solid ${item.color}20`,
                        }}
                      >
                        <item.icon width={22} height={22} style={{ color: item.color }} />
                      </motion.div>
                      <Box>
                        <Text weight="bold" size="3" style={{ marginBottom: 4, display: "block" }}>
                          {item.title}
                        </Text>
                        <Text size="2" style={{ color: "#6b7280", lineHeight: 1.4 }}>
                          {item.desc}
                        </Text>
                      </Box>
                    </Flex>
                  </motion.div>
                ))}
              </Grid>

              {/* Feature Highlight Bar */}
              {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
                style={{
                  marginTop: 8,
                  padding: "20px 24px",
                  background: "linear-gradient(135deg, rgba(194,65,12,0.05), rgba(251,146,60,0.05))",
                  borderRadius: 16,
                  border: "1px solid rgba(194,65,12,0.1)",
                }}
              >
                <Flex align="center" justify="between" wrap="wrap" gap="3">
                  <Flex align="center" gap="3">
                    <span style={{ fontSize: 32 }}>🎯</span>
                    <Box>
                      <Text size="2" weight="bold" style={{ color: "#c2410c" }}>
                        Limited Time Offer
                      </Text>
                      <Text size="1" style={{ color: "#6b7280" }}>
                        First-time users get 20% off
                      </Text>
                    </Box>
                  </Flex>
                  <Link href="/login">
                    <Text size="2" style={{ color: "#c2410c", fontWeight: 600 }}>
                      Claim Now →
                    </Text>
                  </Link>
                </Flex>
              </motion.div> */}

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 0.5 }}
                style={{ marginTop: 8 }}
              >
                <Link href="/login">
                  <Button 
                    color="orange" 
                    size="3" 
                    style={{ 
                      cursor: "pointer", 
                      fontWeight: 600,
                      padding: "12px 32px",
                      fontSize: 15,
                      background: "linear-gradient(135deg, #c2410c, #ea580c)",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(194,65,12,0.25)",
                    }}
                  >
                    Get Started
                    <ArrowRightIcon width={16} height={16} style={{ marginLeft: 8 }} />
                  </Button>
                </Link>
              </motion.div>
            </Flex>
          </motion.div>
        </Grid>
      </Container>
    </Box>
  );
};