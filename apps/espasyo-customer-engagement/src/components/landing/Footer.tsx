// components/landing/Footer.tsx - Completely Redesigned
import React, { useState } from "react";
import { Box, Container, Grid, Heading, Text, Flex, Button, TextField } from "@radix-ui/themes";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  TwitterLogoIcon,
  InstagramLogoIcon,
  LinkedInLogoIcon,
  EnvelopeOpenIcon,
  MobileIcon,
  GlobeIcon,
} from "@radix-ui/react-icons";

const footerLinks = {
  menu: [
    { name: "Coffee Beverages", href: "#menu", icon: "☕" },
    { name: "Food & Pastries", href: "#menu", icon: "🥐" },
    { name: "Seasonal Specials", href: "#promos", icon: "🎄" },
    { name: "Merchandise", href: "#", icon: "🛍️" },
  ],
  company: [
    { name: "About Us", href: "#", icon: "🏢" },
    { name: "Our Story", href: "#", icon: "📖" },
    { name: "Careers", href: "#", icon: "💼" },
    { name: "Blog", href: "#", icon: "✍️" },
  ],
  support: [
    { name: "Contact Us", href: "#", icon: "📞" },
    { name: "FAQs", href: "#", icon: "❓" },
    { name: "Privacy Policy", href: "#", icon: "🔒" },
    { name: "Terms of Service", href: "#", icon: "📜" },
  ],
};

const socialLinks = [
  { icon: TwitterLogoIcon, href: "#", label: "Twitter", color: "#1DA1F2" },
  { icon: InstagramLogoIcon, href: "#", label: "Instagram", color: "#E4405F" },
  { icon: LinkedInLogoIcon, href: "#", label: "LinkedIn", color: "#0A66C2" },
];

const paymentMethods = [
  { name: "Visa", icon: "💳" },
  { name: "Mastercard", icon: "💳" },
  { name: "PayPal", icon: "📱" },
  { name: "GCash", icon: "📱" },
];

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => setIsSubscribed(false), 3000);
      setEmail("");
    }
  };

  return (
    <Box style={{ position: "relative", background: "#0a0a0a", overflow: "hidden" }}>
      {/* Animated Background Pattern */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at 20% 50%, rgba(194,65,12,0.08) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      {/* Top Gradient Border */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{
          height: 3,
          background: "linear-gradient(90deg, #c2410c, #fbbf24, #c2410c)",
          transformOrigin: "left",
        }}
      />

      <Container style={{ position: "relative", zIndex: 1 }} py="8">
        <Grid columns={{ initial: "1", md: "2", lg: "4" }} gap="8" mb="8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Flex direction="column" gap="3">
              <Link href="/" style={{ textDecoration: "none" }}>
                <Flex align="center" gap="2">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    style={{ fontSize: 32 }}
                  >
                    ☕
                  </motion.div>
                  <Heading 
                    size="6" 
                    weight="bold" 
                    style={{ 
                      background: "linear-gradient(135deg, #fff, #fbbf24)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Espasyo Coffee House
                  </Heading>
                </Flex>
              </Link>

              <Text size="2" style={{ color: "#9ca3af", lineHeight: 1.6 }}>
                Your perfect cup, every single day. Premium coffee, loyalty rewards,
                and seamless ordering.
              </Text>

              {/* Social Links */}
              <Flex gap="3" mt="2">
                {socialLinks.map((social, idx) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -3, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.05)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <social.icon width={18} height={18} style={{ color: "#9ca3af" }} />
                  </motion.a>
                ))}
              </Flex>
            </Flex>
          </motion.div>

          {/* Menu Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Heading size="4" mb="4" style={{ color: "white" }}>
              Menu
            </Heading>
            <Flex direction="column" gap="3">
              {footerLinks.menu.map((link, idx) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  whileHover={{ x: 5 }}
                  style={{
                    color: "#9ca3af",
                    textDecoration: "none",
                    fontSize: 14,
                    transition: "color 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Text size="1">{link.icon}</Text>
                  <Text>{link.name}</Text>
                </motion.a>
              ))}
            </Flex>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Heading size="4" mb="4" style={{ color: "white" }}>
              Company
            </Heading>
            <Flex direction="column" gap="3">
              {footerLinks.company.map((link, idx) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  whileHover={{ x: 5 }}
                  style={{
                    color: "#9ca3af",
                    textDecoration: "none",
                    fontSize: 14,
                    transition: "color 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Text size="1">{link.icon}</Text>
                  <Text>{link.name}</Text>
                </motion.a>
              ))}
            </Flex>
          </motion.div>

          {/* Support & Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Heading size="4" mb="4" style={{ color: "white" }}>
              Support
            </Heading>
            <Flex direction="column" gap="3" mb="6">
              {footerLinks.support.map((link, idx) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  whileHover={{ x: 5 }}
                  style={{
                    color: "#9ca3af",
                    textDecoration: "none",
                    fontSize: 14,
                    transition: "color 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Text size="1">{link.icon}</Text>
                  <Text>{link.name}</Text>
                </motion.a>
              ))}
            </Flex>

            {/* Newsletter Signup */}
            <Box>
              <Text size="2" weight="bold" mb="2" style={{ color: "white" }}>
                Subscribe to our newsletter
              </Text>
              <form onSubmit={handleSubscribe}>
                <Flex gap="2" style={{ minWidth: 0 }}>
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <TextField.Root
                      size="2"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "white",
                        width: "100%",
                      }}
                    />
                  </Box>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: "8px 16px",
                      background: "linear-gradient(135deg, #c2410c, #ea580c)",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      color: "white",
                      fontWeight: 600,
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {isSubscribed ? "✓" : "Subscribe"}
                  </motion.button>
                </Flex>
              </form>
            </Box>
          </motion.div>
        </Grid>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Flex
            direction={{ initial: "column", md: "row" }}
            justify="between"
            align="center"
            gap="4"
            style={{
              paddingTop: 24,
              borderTop: "1px solid rgba(255,255,255,0.1)",
              marginTop: 8,
            }}
          >
            {/* Copyright */}
            <Text size="1" style={{ color: "#6b7280" }}>
              © {new Date().getFullYear()} Espasyo Coffee House. All rights reserved.
            </Text>

            {/* Payment Methods */}
            <Flex align="center" gap="3">
              <Text size="1" style={{ color: "#6b7280" }}>Secure payments:</Text>
              <Flex gap="2">
                {paymentMethods.map((method, idx) => (
                  <motion.div
                    key={method.name}
                    whileHover={{ y: -2 }}
                    style={{
                      padding: "4px 8px",
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: 6,
                      fontSize: 16,
                    }}
                  >
                    {method.icon}
                  </motion.div>
                ))}
              </Flex>
            </Flex>

            {/* Additional Links */}
            <Flex gap="4">
              <motion.a
                href="#"
                whileHover={{ color: "#c2410c" }}
                style={{ color: "#6b7280", textDecoration: "none", fontSize: 12 }}
              >
                Sitemap
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ color: "#c2410c" }}
                style={{ color: "#6b7280", textDecoration: "none", fontSize: 12 }}
              >
                Accessibility
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ color: "#c2410c" }}
                style={{ color: "#6b7280", textDecoration: "none", fontSize: 12 }}
              >
                Cookie Policy
              </motion.a>
            </Flex>
          </Flex>

          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{
              marginTop: 24,
              padding: "12px 20px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: 12,
              textAlign: "center",
            }}
          >
            <Flex align="center" justify="center" gap="4" wrap="wrap">
              <Flex align="center" gap="2">
                <GlobeIcon width={14} height={14} style={{ color: "#6b7280" }} />
                <Text size="1" style={{ color: "#6b7280" }}>Available worldwide</Text>
              </Flex>
              <Flex align="center" gap="2">
                <MobileIcon width={14} height={14} style={{ color: "#6b7280" }} />
                <Text size="1" style={{ color: "#6b7280" }}>Mobile app available</Text>
              </Flex>
              <Flex align="center" gap="2">
                <EnvelopeOpenIcon width={14} height={14} style={{ color: "#6b7280" }} />
                <Text size="1" style={{ color: "#6b7280" }}>24/7 customer support</Text>
              </Flex>
            </Flex>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
};