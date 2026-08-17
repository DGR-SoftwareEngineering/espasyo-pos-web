// components/landing/OrderingSection.tsx - Fixed image alignment
import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  Badge,
  Flex,
} from "core-lib/components/radix/proxies";
import {
  Container,
  Grid,
  Button,
  Card,
} from "@radix-ui/themes";;
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { LockClosedIcon } from "@radix-ui/react-icons";

const FEATURES = [
  { 
    icon: "📱", 
    title: "Browse Full Menu", 
    desc: "Explore our complete selection of premium coffee and pastries",
    color: "#c2410c",
  },
  { 
    icon: "☕", 
    title: "Customize Drinks", 
    desc: "Add your favorite flavors, milk alternatives, and toppings",
    color: "#f59e0b",
  },
  { 
    icon: "⏱️", 
    title: "Track Order Status", 
    desc: "Know exactly when your order is ready for pickup",
    color: "#8b5cf6",
  },
  { 
    icon: "⭐", 
    title: "Auto Earn Stamps", 
    desc: "Loyalty stamps on every order, automatically applied",
    color: "#ec4899",
  },
];

const steps = [
  { 
    number: "01", 
    title: "Browse", 
    description: "Explore our menu and customize your drink",
    longDescription: "Scroll through our extensive menu of premium coffee drinks, teas, and pastries. Filter by category, see nutritional info, and customize your drink exactly how you like it.",
    icon: "🔍",
    color: "#c2410c"
  },
  { 
    number: "02", 
    title: "Order", 
    description: "Place your order and make secure payment",
    longDescription: "Add items to your cart, apply promo codes, and checkout securely with multiple payment options including credit card, digital wallets, and cash on pickup.",
    icon: "🛒",
    color: "#f59e0b"
  },
  { 
    number: "03", 
    title: "Pickup", 
    description: "Skip the line and grab your coffee",
    longDescription: "Get real-time notifications when your order is ready. Skip the queue, head straight to the pickup counter, and enjoy your freshly made coffee.",
    icon: "🎯",
    color: "#8b5cf6"
  },
  { 
    number: "04", 
    title: "Earn", 
    description: "Collect stamps and redeem rewards",
    longDescription: "Earn loyalty stamps automatically with every purchase. Collect 10 stamps to get a free drink, plus unlock exclusive member-only deals and birthday rewards.",
    icon: "⭐",
    color: "#ec4899"
  },
];

export const OrderingSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  const handleStepClick = (idx: number) => {
    setActiveStep(activeStep === idx ? null : idx);
  };

  return (
    <Box 
      ref={sectionRef}
      py={{ initial: "8", md: "9" }} 
      style={{ 
        background: "linear-gradient(135deg, #ffffff 0%, #fff7ed 50%, #ffffff 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative Background Elements */}
      <motion.div
        animate={{
          y: [0, -30, 0],
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
          fontSize: 150,
          opacity: 0.03,
          pointerEvents: "none",
        }}
      >
        📱
      </motion.div>

      <motion.div
        animate={{
          y: [0, 30, 0],
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
          fontSize: 120,
          opacity: 0.03,
          pointerEvents: "none",
        }}
      >
        ☕
      </motion.div>

      <Container style={{ position: "relative", zIndex: 1 }}>
        <Grid columns={{ initial: "1", lg: "2" }} gap={{ initial: "8", lg: "16" }} align="center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Flex direction="column" gap="6">
              {/* Badge */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <Badge 
                  color="orange" 
                  variant="solid" 
                  size="2" 
                  style={{ 
                    alignSelf: "flex-start",
                    padding: "8px 20px",
                    background: "linear-gradient(135deg, #c2410c, #ea580c)",
                    fontSize: 12,
                  }}
                >
                  🚀 Digital Experience
                </Badge>
              </motion.div>

              {/* Heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Heading 
                  size="8" 
                  weight="bold" 
                  style={{ 
                    lineHeight: 1.2, 
                    letterSpacing: "-0.02em",
                  }}
                >
                  Order Your{" "}
                  <span style={{ 
                    background: "linear-gradient(135deg, #c2410c, #f59e0b)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>
                    Favorites Online
                  </span>
                </Heading>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <Text size="4" style={{ color: "#4b5563", lineHeight: 1.7 }}>
                  Seamlessly browse, customize, and order your perfect coffee. 
                  Skip the queue, earn loyalty rewards, and enjoy exclusive 
                  online-only promotions.
                </Text>
              </motion.div>

              {/* Features Grid - This is the target for alignment */}
              <Grid columns="2" gap="4">
                {FEATURES.map((feature, idx) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                  >
                    <Box
                      style={{
                        padding: "16px",
                        background: "white",
                        borderRadius: 16,
                        border: `1px solid ${feature.color}20`,
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                    >
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <Text size="6" as="div" mb="2">{feature.icon}</Text>
                      </motion.div>
                      <Text weight="bold" size="2" as="div" mb="1" style={{ color: feature.color }}>
                        {feature.title}
                      </Text>
                      <Text size="1" style={{ color: "#6b7280", lineHeight: 1.4 }}>
                        {feature.desc}
                      </Text>
                    </Box>
                  </motion.div>
                ))}
              </Grid>

              {/* How It Works Steps - Clickable with details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
              >
                <Flex direction="column" gap="4">
                  <Text weight="bold" size="3" style={{ color: "#1f2937" }}>
                    How it works:
                  </Text>
                  <Grid columns={{ initial: "2", sm: "4" }} gap="3">
                    {steps.map((step, idx) => (
                      <motion.div
                        key={step.number}
                        whileHover={{ y: -4 }}
                        onClick={() => handleStepClick(idx)}
                        style={{
                          textAlign: "center",
                          padding: "12px 8px",
                          borderRadius: 12,
                          background: activeStep === idx ? `linear-gradient(135deg, ${step.color}15, ${step.color}05)` : "transparent",
                          border: activeStep === idx ? `1px solid ${step.color}30` : "1px solid transparent",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                        }}
                      >
                        <Text size="5" mb="2">{step.icon}</Text>
                        <Text size="1" weight="bold" style={{ color: step.color }}>
                          {step.number}
                        </Text>
                        <Text size="1" weight="bold" style={{ color: "#1f2937", marginTop: 4, marginLeft: 5 }}>
                          {step.title}
                        </Text>
                      </motion.div>
                    ))}
                  </Grid>

                  {/* Expanded Step Details */}
                  <AnimatePresence mode="wait">
                    {activeStep !== null && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: "hidden" }}
                      >
                        <Card
                          style={{
                            marginTop: 16,
                            padding: 20,
                            background: `linear-gradient(135deg, ${steps[activeStep].color}08, ${steps[activeStep].color}02)`,
                            border: `1px solid ${steps[activeStep].color}20`,
                            borderRadius: 16,
                          }}
                        >
                          <Flex gap="3" align="start">
                            <Text size="6">{steps[activeStep].icon}</Text>
                            <Box>
                              <Flex align="center" gap="2" mb="2">
                                <Badge color="orange" variant="soft" size="1">
                                  Step {steps[activeStep].number}
                                </Badge>
                                <Text weight="bold" size="3" style={{ color: steps[activeStep].color }}>
                                  {steps[activeStep].title}
                                </Text>
                              </Flex>
                              <Text size="2" style={{ color: "#4b5563", lineHeight: 1.6 }}>
                                {steps[activeStep].longDescription}
                              </Text>
                            </Box>
                          </Flex>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Flex>
              </motion.div>

              {/* Login Indicator & CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
              >
                <Flex align="center" justify="between" wrap="wrap" gap="4">
                  <Flex align="center" gap="2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <LockClosedIcon width={16} height={16} style={{ color: "#c2410c" }} />
                    </motion.div>
                    <Text size="2" style={{ color: "#c2410c", fontWeight: 600 }}>
                      Available after login
                    </Text>
                  </Flex>

                  <Link href="/login">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        color="orange" 
                        size="3" 
                        style={{ 
                          cursor: "pointer", 
                          fontWeight: 600,
                          padding: "12px 32px",
                          background: "linear-gradient(135deg, #c2410c, #ea580c)",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(194,65,12,0.3)",
                        }}
                      >
                        Login to Order Now →
                      </Button>
                    </motion.div>
                  </Link>
                </Flex>
              </motion.div>
            </Flex>
          </motion.div>

          {/* Right Side - Image - Now properly aligned with the features grid */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ 
              position: "relative",
              // Align image with the features grid (which starts after badge, heading, description)
              alignSelf: "center",
            }}
          >
            <motion.div
              style={{
                scale: imageScale,
              }}
            >
              {/* Main Image Container */}
              <Box
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "4/3",
                  borderRadius: 30,
                  overflow: "hidden",
                  boxShadow: "0 30px 60px rgba(0,0,0,0.15)",
                  marginLeft: 10
                }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=1000&q=90"
                  alt="Mobile coffee ordering"
                  fill
                  style={{ objectFit: "cover" }}
                  quality={90}
                />
                
                {/* Gradient Overlay */}
                <Box
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(135deg, rgba(194,65,12,0.1) 0%, rgba(0,0,0,0.05) 100%)",
                  }}
                />

                {/* Floating Badge 1 - Top Left */}
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  style={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 12,
                    padding: "8px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    zIndex: 2,
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <span style={{ fontSize: 16 }}>📱</span>
                  </motion.div>
                  <Text size="1" weight="bold" style={{ color: "#1f2937" }}>
                    Order in Seconds
                  </Text>
                </motion.div>

                {/* Floating Badge 2 - Bottom Right */}
                <motion.div
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7, type: "spring" }}
                  style={{
                    position: "absolute",
                    bottom: 20,
                    right: 20,
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 12,
                    padding: "8px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    zIndex: 2,
                  }}
                >
                  <span style={{ fontSize: 16 }}>⏱️</span>
                  <Text size="1" weight="bold" style={{ color: "#1f2937" }}>
                    Real-time Tracking
                  </Text>
                </motion.div>

                {/* Floating Badge 3 - Center Left */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9, type: "spring" }}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: -10,
                    background: "linear-gradient(135deg, #c2410c, #ea580c)",
                    borderRadius: 12,
                    padding: "6px 12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    transform: "translateY(-50%)",
                    zIndex: 2,
                  }}
                >
                  <Text size="1" weight="bold" style={{ color: "white" }}>
                    ⚡ Fast & Easy
                  </Text>
                </motion.div>
              </Box>
            </motion.div>

            {/* Decorative Circles */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(251,146,60,0.15) 0%, transparent 70%)",
                zIndex: -1,
              }}
            />
            
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              style={{
                position: "absolute",
                bottom: -20,
                left: -20,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)",
                zIndex: -1,
              }}
            />
          </motion.div>
        </Grid>

        {/* Bottom Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          style={{
            marginTop: 80,
            padding: "28px 32px",
            background: "white",
            borderRadius: 20,
            border: "1px solid rgba(194,65,12,0.1)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <Grid columns={{ initial: "1", sm: "2", md: "4" }} gap="5">
            {/* Stat 1 */}
            <Flex align="center" gap="3">
              <Box
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #c2410c10, #ea580c10)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text size="5">⚡</Text>
              </Box>
              <Box>
                <Text size="2" weight="bold" style={{ color: "#1f2937", marginBottom: 4 }}>
                  2-min Setup
                </Text> <br/>
                <Text size="1" style={{ color: "#6b7280" }}>Quick account creation</Text>
              </Box>
            </Flex>

            {/* Stat 2 */}
            <Flex align="center" gap="3">
              <Box
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #f59e0b10, #fbbf2410)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text size="5">🔒</Text>
              </Box>
              <Box>
                <Text size="2" weight="bold" style={{ color: "#1f2937", marginBottom: 4 }}>
                  Secure Payment
                </Text> <br/>
                <Text size="1" style={{ color: "#6b7280" }}>Multiple payment options</Text>
              </Box>
            </Flex>

            {/* Stat 3 */}
            <Flex align="center" gap="3">
              <Box
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #8b5cf610, #a78bfa10)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text size="5">🎯</Text>
              </Box>
              <Box>
                <Text size="2" weight="bold" style={{ color: "#1f2937", marginBottom: 4 }}>
                  Real-time Tracking
                </Text> <br/>
                <Text size="1" style={{ color: "#6b7280" }}>Know when it's ready</Text>
              </Box>
            </Flex>

            {/* Stat 4 */}
            <Flex align="center" gap="3">
              <Box
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #ec489910, #f472b610)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text size="5">⭐</Text>
              </Box>
              <Box>
                <Text size="2" weight="bold" style={{ color: "#1f2937", marginBottom: 4 }}>
                  Earn Rewards
                </Text> <br/>
                <Text size="1" style={{ color: "#6b7280" }}>Stamps on every order</Text>
              </Box>
            </Flex>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};