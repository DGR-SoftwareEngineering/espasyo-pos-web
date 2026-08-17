import React, { useRef, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  Badge,
} from "core-lib/components/radix/proxies";
import {
  Container,
  Button,
} from "@radix-ui/themes";;
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRightIcon } from "@radix-ui/react-icons";

const BEAN_POSITIONS = [
  { left: "10%", top: "12%" },
  { left: "20%", top: "67%" },
  { left: "30%", top: "34%" },
  { left: "40%", top: "82%" },
  { left: "50%", top: "21%" },
  { left: "60%", top: "55%" },
  { left: "70%", top: "41%" },
  { left: "80%", top: "78%" },
] as const;

export const CTASection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0.8]);

  const benefits = [
    { icon: "🚀", text: "Free Delivery", color: "#f43f5e" },
    { icon: "🎁", text: "Welcome Bonus", color: "#f59e0b" },
    { icon: "⚡", text: "Fast Checkout", color: "#3b82f6" },
    { icon: "⭐", text: "Loyalty Points", color: "#8b5cf6" },
  ];

  return (
    <Box
      ref={ref}
      py="9"
      style={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #2d1a0e 0%, #4a2c1a 50%, #6b4226 100%)",
      }}
    >
      {/* Animated Background Pattern */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 40%, rgba(255,255,255,0.03) 1px, transparent 1px),
            radial-gradient(circle at 80% 60%, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px, 30px 30px",
          opacity: 0.5,
        }}
      />

      {/* Animated Gradient Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          top: "10%",
          right: "5%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,146,60,0.15) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, 40, 0],
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
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Floating Coffee Beans */}
      {BEAN_POSITIONS.map((pos, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.3, 0],
            scale: [0, 1, 0],
            y: [0, -100],
            x: [0, (i % 2 === 0 ? 20 : -20)],
          }}
          transition={{
            duration: 5,
            delay: i * 0.8,
            repeat: Infinity,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            left: pos.left,
            top: pos.top,
            fontSize: 30,
            pointerEvents: "none",
          }}
        >
          🫘
        </motion.div>
      ))}

      <Container style={{ position: "relative", zIndex: 1 }}>
        <motion.div
          style={{ opacity }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <Flex
            direction="column"
            align="center"
            justify="center"
            style={{ textAlign: "center", padding: "60px 24px" }}
          >
            {/* Animated Badge */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <Badge
                size="2"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  padding: "8px 20px",
                  marginBottom: 24,
                  color: "white",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                🔥 Limited Time Offer
              </Badge>
            </motion.div>

            {/* Main Icon with Pulse */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", delay: 0.3 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              style={{ marginBottom: 24 }}
            >
              <Box
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #c2410c, #f59e0b)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 40px rgba(194,65,12,0.5)",
                }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Text size="8" style={{ fontSize: 48 }}>
                    ☕
                  </Text>
                </motion.div>
              </Box>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Heading
                size="9"
                weight="bold"
                mb="4"
                style={{
                  color: "white",
                  letterSpacing: "-0.02em",
                  fontSize: "clamp(32px, 6vw, 56px)",
                }}
              >
                Ready to Start Your
                <br />
                <span style={{
                  background: "linear-gradient(135deg, #fb923c, #fbbf24)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  Coffee Journey?
                </span>
              </Heading>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <Text
                size="5"
                mb="8"
                style={{
                  color: "rgba(255,255,255,0.9)",
                  maxWidth: 600,
                  lineHeight: 1.6,
                }}
              >
                Join thousands of coffee enthusiasts enjoying premium coffee,
                exclusive deals, and loyalty rewards.
              </Text>
            </motion.div>

            {/* Benefits Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              style={{ marginBottom: 32 }}
            >
              <Flex gap="4" justify="center" wrap="wrap">
                {benefits.map((benefit, idx) => (
                  <motion.div
                    key={benefit.text}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7 + idx * 0.1, type: "spring" }}
                    whileHover={{ y: -3 }}
                  >
                    <Flex
                      align="center"
                      gap="2"
                      style={{
                        background: "rgba(255,255,255,0.1)",
                        backdropFilter: "blur(10px)",
                        borderRadius: 999,
                        padding: "8px 16px",
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                    >
                      <Text>{benefit.icon}</Text>
                      <Text size="2" style={{ color: "white", fontWeight: 500 }}>
                        {benefit.text}
                      </Text>
                    </Flex>
                  </motion.div>
                ))}
              </Flex>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
            >
              <Flex gap="4" justify="center" wrap="wrap">
                <motion.div
                  whileHover={{ scale: 1.08, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                >
                  <Link href="/login">
                    <Button
                      color="orange"
                      size="3"
                      style={{
                        cursor: "pointer",
                        fontWeight: 700,
                        padding: "14px 40px",
                        fontSize: 16,
                        background: "linear-gradient(135deg, #c2410c, #ea580c)",
                        border: "none",
                        boxShadow: "0 4px 15px rgba(194,65,12,0.4)",
                      }}
                    >
                      Get Started
                      <motion.span
                        animate={{ x: isHovered ? 5 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ArrowRightIcon width={16} height={16} style={{ marginLeft: 8 }} />
                      </motion.span>
                    </Button>
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    size="3"
                    style={{
                      cursor: "pointer",
                      fontWeight: 600,
                      padding: "14px 36px",
                      fontSize: 16,
                      border: "2px solid rgba(255,255,255,0.5)",
                      color: "white",
                      background: "rgba(255,255,255,0.1)",
                      backdropFilter: "blur(10px)",
                    }}
                    onClick={() => {
                      const element = document.getElementById("what-is");
                      element?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Learn More
                  </Button>
                </motion.div>
              </Flex>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1, duration: 0.5 }}
              style={{ marginTop: 40 }}
            >
              <Flex align="center" justify="center" gap="4" wrap="wrap">
                <Flex align="center" gap="2">
                  <Text size="2">⭐</Text>
                  <Text size="1" style={{ color: "rgba(255,255,255,0.7)" }}>
                    4.9/5 from 5k+ reviews
                  </Text>
                </Flex>
                <Text size="1" style={{ color: "rgba(255,255,255,0.3)" }}>•</Text>
                <Flex align="center" gap="2">
                  <Text size="2">🔒</Text>
                  <Text size="1" style={{ color: "rgba(255,255,255,0.7)" }}>
                    Secure checkout
                  </Text>
                </Flex>
                <Text size="1" style={{ color: "rgba(255,255,255,0.3)" }}>•</Text>
                <Flex align="center" gap="2">
                  <Text size="2">⚡</Text>
                  <Text size="1" style={{ color: "rgba(255,255,255,0.7)" }}>
                    24/7 support
                  </Text>
                </Flex>
              </Flex>
            </motion.div>

            {/* Animated Particles */}
            <motion.div
              animate={{
                y: [0, -15, 0],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                position: "absolute",
                top: "15%",
                left: "8%",
                fontSize: 28,
              }}
            >
              ✨
            </motion.div>

            <motion.div
              animate={{
                y: [0, 20, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              style={{
                position: "absolute",
                bottom: "20%",
                right: "10%",
                fontSize: 35,
              }}
            >
              ⭐
            </motion.div>

            <motion.div
              animate={{
                x: [0, 10, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
              style={{
                position: "absolute",
                top: "60%",
                right: "15%",
                fontSize: 25,
              }}
            >
              🎁
            </motion.div>

            <motion.div
              animate={{
                x: [0, -15, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5,
              }}
              style={{
                position: "absolute",
                bottom: "30%",
                left: "12%",
                fontSize: 30,
              }}
            >
              🚀
            </motion.div>
          </Flex>
        </motion.div>
      </Container>
    </Box>
  );
};