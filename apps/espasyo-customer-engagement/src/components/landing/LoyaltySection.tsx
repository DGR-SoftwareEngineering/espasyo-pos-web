import React, { useState } from "react";
import { Box, Container, Grid, Heading, Text, Flex, Badge, Button } from "@radix-ui/themes";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { TimerIcon } from "@radix-ui/react-icons";

const STEPS = [
  { 
    number: "01", 
    icon: "🛍️", 
    title: "Purchase", 
    desc: "Order your favorite coffee and get a loyalty stamp added automatically.",
    longDesc: "Every time you order through our app, you'll automatically earn a stamp. No need to scan or carry physical cards!",
    color: "#c2410c"
  },
  { 
    number: "02", 
    icon: "⭐", 
    title: "Collect", 
    desc: "Earn 10 stamps to complete your loyalty card.",
    longDesc: "Track your progress in real-time. Each purchase brings you closer to your next free reward. Collect 10 stamps and unlock a free drink!",
    color: "#f59e0b"
  },
  { 
    number: "03", 
    icon: "🎉", 
    title: "Redeem", 
    desc: "Claim a free drink and start earning all over again!",
    longDesc: "Once you've collected 10 stamps, you can redeem them for any regular-sized beverage of your choice. The stamps reset and you can start earning again!",
    color: "#ec4899"
  },
];

const benefits = [
  { icon: "🎁", title: "Birthday Bonus", desc: "Free drink on your birthday", color: "#c2410c" },
  { icon: "⚡", title: "Double Stamps", desc: "On selected days", color: "#f59e0b" },
  { icon: "🏆", title: "Tier Rewards", desc: "Unlock exclusive perks", color: "#8b5cf6" },
  { icon: "🎯", title: "Referral Bonus", desc: "Earn stamps for referrals", color: "#ec4899" },
];

export const LoyaltySection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [hoveredStamp, setHoveredStamp] = useState<number | null>(null);

  const handleStepClick = (idx: number) => {
    setActiveStep(activeStep === idx ? null : idx);
  };

  return (
    <Box 
      id="loyalty" 
      py={{ initial: "7", md: "9" }} 
      style={{ 
        background: "linear-gradient(135deg, #ffffff 0%, #fefaf5 50%, #ffffff 100%)",
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
          top: "5%",
          right: "10%",
          fontSize: 120,
          opacity: 0.03,
          pointerEvents: "none",
        }}
      >
        ⭐
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
          opacity: 0.03,
          pointerEvents: "none",
        }}
      >
        🎁
      </motion.div>

      <Container style={{ position: "relative", zIndex: 1 }}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: 48 }}
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
            🎯 Loyalty Program
          </Badge>
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
            Earn Rewards While You Sip
          </Heading>
          <Text size="4" style={{ color: "#6b7280", maxWidth: 600, margin: "0 auto" }}>
            Every purchase brings you closer to your next free drink
          </Text>
        </motion.div>

        <Grid columns={{ initial: "1", lg: "2" }} gap={{ initial: "8", lg: "12" }} align="center">
          {/* Left Side - Loyalty Card (Enhanced) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <motion.div
              whileHover={{ scale: 1.02, rotate: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Box
                style={{
                  maxWidth: "min(380px, 100%)",
                  width: "100%",
                  background: "linear-gradient(135deg, #c2410c 0%, #ea580c 30%, #f97316 60%, #fbbf24 100%)",
                  borderRadius: 32,
                  padding: "32px 28px",
                  boxShadow: "0 30px 60px rgba(194,65,12,0.35)",
                  color: "#fff",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Animated Shine Effect */}
                <motion.div
                  animate={{
                    x: ["-100%", "200%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: 1,
                    ease: "easeInOut",
                  }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "50%",
                    height: "100%",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                    transform: "skewX(-20deg)",
                  }}
                />

                {/* Card Header */}
                <Flex justify="between" align="center" mb="6">
                  <Box>
                    <Flex align="center" gap="2" mb="1">
                      <Text size="6">☕</Text>
                      <Text size="6" weight="bold" as="div" style={{ lineHeight: 1, letterSpacing: "-0.02em" }}>
                        ESPASYO
                      </Text>
                    </Flex>
                    <Text size="1" style={{ opacity: 0.8 }}>Premium Loyalty Card</Text>
                  </Box>
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: 12,
                      padding: "6px 12px",
                    }}
                  >
                    <Text size="1" weight="bold">GOLD TIER</Text>
                  </motion.div>
                </Flex>

                {/* Stamps Grid */}
                <Box mb="6">
                  <Flex justify="between" align="center" mb="3">
                    <Text size="2" weight="bold" style={{ opacity: 0.9 }}>
                      Stamp Progress
                    </Text>
                    <Badge color="orange" variant="solid" size="1">
                      7/12 Stamps
                    </Badge>
                  </Flex>
                  <Grid columns="5" gap="2">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        onHoverStart={() => setHoveredStamp(i)}
                        onHoverEnd={() => setHoveredStamp(null)}
                      >
                        <Box
                          style={{
                            width: "100%",
                            aspectRatio: "1/1",
                            borderRadius: "50%",
                            background: i < 7
                              ? "rgba(255,255,255,0.95)"
                              : "rgba(255,255,255,0.15)",
                            border: i < 7 ? "none" : "2px solid rgba(255,255,255,0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: i < 7 ? "20px" : "0",
                            cursor: "pointer",
                            position: "relative",
                          }}
                        >
                          {/* Hover ring — GPU opacity only */}
                          {i < 7 && (
                            <motion.div
                              animate={{ opacity: hoveredStamp === i ? 1 : 0 }}
                              transition={{ duration: 0.2 }}
                              style={{
                                position: "absolute",
                                inset: -3,
                                borderRadius: "50%",
                                border: "3px solid rgba(255,255,255,0.5)",
                                pointerEvents: "none",
                              }}
                            />
                          )}
                          {i < 7 && (
                            <motion.span
                              animate={{ scale: hoveredStamp === i ? 1.2 : 1 }}
                            >
                              ☕
                            </motion.span>
                          )}
                          {i === 6 && i < 7 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.8 }}
                              style={{
                                position: "absolute",
                                top: -5,
                                right: -5,
                                fontSize: 12,
                              }}
                            >
                              ✨
                            </motion.div>
                          )}
                        </Box>
                      </motion.div>
                    ))}
                  </Grid>
                </Box>

                {/* Progress Bar */}
                <Box mb="4">
                  <Flex justify="between" mb="2">
                    <Text size="2" weight="bold">Progress to Free Drink</Text>
                    <Text size="2" weight="bold" style={{ color: "#fbbf24" }}>70%</Text>
                  </Flex>
                  <Box style={{ height: 10, background: "rgba(255,255,255,0.2)", borderRadius: 6, overflow: "hidden" }}>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                      style={{
                        height: "100%",
                        width: "70%",
                        background: "linear-gradient(90deg, #fff, #fbbf24)",
                        borderRadius: 6,
                        position: "relative",
                        transformOrigin: "left",
                      }}
                    >
                      <motion.div
                        animate={{ x: ["0%", "100%", "0%"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "30%",
                          height: "100%",
                          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
                        }}
                      />
                    </motion.div>
                  </Box>
                  <Text size="1" style={{ opacity: 0.8, marginTop: 8, display: "block" }}>
                    🎉 5 more stamps until your free drink!
                  </Text>
                </Box>

                {/* Card Footer */}
                <Flex justify="between" align="center" style={{ marginTop: 16 }}>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Text size="2" style={{ fontWeight: 600 }}>✦</Text>
                  </motion.div>
                </Flex>
              </Box>
            </motion.div>
          </motion.div>

          {/* Right Side - Steps with Interactive Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Flex direction="column" gap="6">
              {/* Benefits Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Grid columns="2" gap="3">
                  {benefits.map((benefit, idx) => (
                    <motion.div
                      key={benefit.title}
                      whileHover={{ scale: 1.05, y: -2 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Flex
                        align="center"
                        gap="2"
                        style={{
                          padding: "12px",
                          background: "white",
                          borderRadius: 12,
                          border: `1px solid ${benefit.color}20`,
                          cursor: "pointer",
                        }}
                      >
                        <Text size="4">{benefit.icon}</Text>
                        <Box>
                          <Text size="1" weight="bold" style={{ color: benefit.color }}>
                            {benefit.title}
                          </Text> <br/>
                          <Text size="1" style={{ color: "#6b7280" }}>
                            {benefit.desc}
                          </Text>
                        </Box>
                      </Flex>
                    </motion.div>
                  ))}
                </Grid>
              </motion.div>

              {/* Steps */}
              <Box>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <Heading size="6" weight="bold" mb="2">
                    How It Works
                  </Heading>
                  <Text size="2" style={{ color: "#6b7280", marginBottom: 24 }}>
                    Simple steps to earn your rewards
                  </Text>
                </motion.div>

                <Flex direction="column" gap="3">
                  {STEPS.map((step, idx) => (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                      whileHover={{ x: 5 }}
                      onClick={() => handleStepClick(idx)}
                      style={{ cursor: "pointer" }}
                    >
                      <Flex gap="4" align="start">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          style={{
                            flexShrink: 0,
                            width: 56,
                            height: 56,
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${step.color} 0%, ${step.color}80 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 24,
                            boxShadow: `0 4px 12px ${step.color}40`,
                          }}
                        >
                          {step.icon}
                        </motion.div>
                        <Box style={{ flex: 1 }}>
                          <Flex align="center" gap="2" mb="1">
                            <Badge color="orange" variant="soft" size="1">
                              Step {step.number}
                            </Badge>
                            <Text weight="bold" size="3">
                              {step.title}
                            </Text>
                          </Flex>
                          <Text size="2" style={{ color: "#6b7280", lineHeight: 1.5 }}>
                            {step.desc}
                          </Text>

                          {/* Expanded Details */}
                          <AnimatePresence>
                            {activeStep === idx && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                style={{ overflow: "hidden" }}
                              >
                                <Box
                                  style={{
                                    marginTop: 12,
                                    padding: 12,
                                    background: `linear-gradient(135deg, ${step.color}08, transparent)`,
                                    borderRadius: 8,
                                    borderLeft: `3px solid ${step.color}`,
                                  }}
                                >
                                  <Text size="1" style={{ color: "#4b5563", lineHeight: 1.5 }}>
                                    💡 {step.longDesc}
                                  </Text>
                                </Box>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Box>
                        <motion.div
                          animate={{ x: activeStep === idx ? [0, 5, 0] : 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Text size="1" style={{ color: step.color }}>
                            {activeStep === idx ? "▲" : "▼"}
                          </Text>
                        </motion.div>
                      </Flex>
                    </motion.div>
                  ))}
                </Flex>
              </Box>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
                style={{ marginTop: 16 }}
              >
                <Link href="/login">
                  <Button
                    color="orange"
                    size="3"
                    style={{
                      cursor: "pointer",
                      fontWeight: 600,
                      width: "100%",
                      background: "linear-gradient(135deg, #c2410c, #ea580c)",
                      padding: "16px",
                    }}
                  >
                    Start Earning Rewards →
                  </Button>
                </Link>
                <Text size="1" style={{ color: "#9ca3af", textAlign: "center", marginTop: 12, display: "block" }}>
                  Physical Card Needed • Automatically tracked • Instant rewards
                </Text>
              </motion.div>
            </Flex>
          </motion.div>
        </Grid>
      </Container>
    </Box>
  );
};