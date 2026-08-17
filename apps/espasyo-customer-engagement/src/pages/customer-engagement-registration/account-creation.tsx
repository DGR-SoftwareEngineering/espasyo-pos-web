import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Badge,
} from "core-lib/components/radix/proxies";
import {
  Theme,
} from "@radix-ui/themes";;
import {
  CoffeeOutlined,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { usePublicSettings } from "core-lib/core/contexts";
import { hexToRadixAccent } from "core-lib/business/colors";
import Link from "next/link";
import Image from "next/image";
import { CustomerRegistrationFormBlock } from '../../components/register/features/CustomerRegistrationFormBlock';

export default function AccountCreation() {
  const [mounted, setMounted] = useState(false);
  const { systemName, theme } = usePublicSettings();
  const logoUrl = theme.logoUrl;
  const resolvedAccent = hexToRadixAccent(theme.primaryColor, "orange");
  const brandName = systemName || "Espasyo";

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Theme
      appearance="light"
      accentColor={resolvedAccent}
      grayColor="sand"
      radius="large"
    >
      <Box
        style={{
          minHeight: "100vh",
          width: "100%",
          background: "linear-gradient(135deg, #fff7ed 0%, #fff 50%, #fff7ed 100%)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Animated Background Elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
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
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(251,146,60,0.08) 0%, transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />
        
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
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
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        <Flex
          direction={{ initial: "column", lg: "row" }}
          style={{ minHeight: "100vh", width: "100%" }}
        >
          {/* LEFT PANEL - Hero Section */}
          <Box
            display={{ initial: "none", lg: "block" }}
            style={{
              position: "relative",
              flex: 1,
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 1.05 }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
              style={{
                position: "absolute",
                inset: 0,
              }}
            >
              <Image
                src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1600&q=90"
                alt="Coffee background"
                fill
                style={{ objectFit: "cover" }}
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>

            <Box
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.4) 100%)",
              }}
            />

            <Flex
              direction="column"
              justify="between"
              p="7"
              style={{ position: "relative", height: "100%", zIndex: 1 }}
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Flex align="center" gap="3">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 16,
                      background: "linear-gradient(135deg, #f5cf99 0%, #b8854b 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                      position: "relative",
                    }}
                  >
                    <div style={{ position: "relative", width: "100%", height: "100%" }}>
                      {logoUrl && mounted ? (
                        <Image
                          src={logoUrl}
                          alt={brandName}
                          fill
                          style={{ objectFit: "cover", borderRadius: 16 }}
                        />
                      ) : (
                        <CoffeeOutlined style={{ fontSize: 28, color: "#3a2410" }} />
                      )}
                    </div>
                  </motion.div>
                  <Flex direction="column">
                    <Text size="4" weight="bold" style={{ color: "#fbe9cf" }}>
                      E'spasyo Coffee House | Customer Engagement System
                    </Text>
                    <Text size="1" style={{ color: "rgba(251,233,207,0.7)" }}>
                      Join our coffee community
                    </Text>
                  </Flex>
                </Flex>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <Flex direction="column" gap="4" style={{ maxWidth: 480 }}>
                  <Badge 
                    color="orange" 
                    variant="solid" 
                    size="2" 
                    style={{ 
                      alignSelf: "flex-start",
                      background: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    🎉 Join Now & Get 50 Bonus Points
                  </Badge>

                  <Text
                    size="7"
                    weight="bold"
                    style={{
                      letterSpacing: "-0.02em",
                      lineHeight: 1.2,
                      color: "white",
                    }}
                  >
                    Start Your Coffee Journey
                  </Text>

                  <Text
                    size="3"
                    style={{
                      color: "rgba(255,255,255,0.85)",
                      lineHeight: 1.6,
                    }}
                  >
                    Create an account to earn rewards, track your purchases, 
                    and unlock exclusive member benefits.
                  </Text>

                  <Flex gap="3" mt="4">
                    <Box>
                      <Text size="6" weight="bold" style={{ color: "#fb923c" }}>100%</Text>
                      <Text size="1" style={{ color: "rgba(255,255,255,0.7)" }}>Satisfaction</Text>
                    </Box>
                    <Box>
                      <Text size="6" weight="bold" style={{ color: "#fb923c" }}>24/7</Text>
                      <Text size="1" style={{ color: "rgba(255,255,255,0.7)" }}>Support</Text>
                    </Box>
                    <Box>
                      <Text size="6" weight="bold" style={{ color: "#fb923c" }}>Free</Text>
                      <Text size="1" style={{ color: "rgba(255,255,255,0.7)" }}>Membership</Text>
                    </Box>
                  </Flex>
                </Flex>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <Text size="1" style={{ color: "rgba(255,255,255,0.5)" }}>
                  © {new Date().getFullYear()} E'spasyo Coffee House. All rights reserved.
                </Text>
              </motion.div>
            </Flex>
          </Box>

          {/* RIGHT PANEL - Registration Form */}
          <Box
            style={{
              position: "relative",
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "48px 32px",
              background: "white",
              overflowY: "auto",
            }}
          >
            <Box
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "radial-gradient(rgba(194,65,12,0.03) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
                pointerEvents: "none",
              }}
            />

            <div style={{ width: "100%", maxWidth: 560 }}>
              <CustomerRegistrationFormBlock />
            </div>
          </Box>
        </Flex>
      </Box>
    </Theme>
  );
}