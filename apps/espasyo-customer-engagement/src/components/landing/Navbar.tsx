import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
} from "core-lib/components/radix/proxies";
import {
  Button,
} from "@radix-ui/themes";;
import { HamburgerMenuIcon, Cross1Icon } from "@radix-ui/react-icons";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "#menu" },
  { label: "Loyalty", href: "#loyalty" },
  { label: "Promotions", href: "#promos" },
  { label: "Contact", href: "#contact" },
];

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    const close = () => setMobileOpen(false);
    router.events.on("routeChangeStart", close);
    return () => router.events.off("routeChangeStart", close);
  }, [router.events]);

  const handleAnchorClick = (href: string) => {
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
      setMobileOpen(false);
    }
  };

  return (
    <motion.header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
      }}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Backdrop layer — GPU opacity transition only */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          opacity: scrolled ? 1 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: "none",
        }}
      />

      {/* Shadow layer — GPU opacity transition only */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 1,
          background: "rgba(0,0,0,0.06)",
          opacity: scrolled ? 1 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: "none",
        }}
      />

      <Box
        px={{ initial: "4", md: "6" }}
        style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}
      >
        <Flex
          justify="between"
          align="center"
          style={{ minHeight: 64 }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <Flex align="center" gap="2">
              <Heading
                size="5"
                weight="bold"
                style={{
                  color: scrolled ? "#c2410c" : "#fff",
                  transition: "color 0.3s ease",
                  letterSpacing: "-0.02em",
                }}
              >
                E'spasyo Coffee House
              </Heading>
            </Flex>
          </Link>

          {/* Desktop nav links */}
          <Flex
            gap="6"
            align="center"
            display={{ initial: "none", md: "flex" }}
          >
            {NAV_LINKS.map((link) => (
              link.href.startsWith("#") ? (
                <button
                  key={link.label}
                  onClick={() => handleAnchorClick(link.href)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    fontSize: "14px",
                    fontWeight: 500,
                    color: scrolled ? "#374151" : "rgba(255,255,255,0.85)",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.color = "#c2410c";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.color = scrolled
                      ? "#374151"
                      : "rgba(255,255,255,0.85)";
                  }}
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    textDecoration: "none",
                    color: scrolled ? "#374151" : "rgba(255,255,255,0.85)",
                    transition: "color 0.2s ease",
                  }}
                >
                  {link.label}
                </Link>
              )
            ))}
          </Flex>

          {/* Right side: Login + hamburger */}
          <Flex align="center" gap="3">
            <Link href="/login">
              <Button
                color="orange"
                variant={scrolled ? "solid" : "soft"}
                size="2"
                style={{ cursor: "pointer", fontWeight: 600 }}
              >
                Login
              </Button>
            </Link>

            {/* Hamburger — mobile only */}
            <Box display={{ initial: "block", md: "none" }}>
              <Button
                variant="ghost"
                color="gray"
                size="2"
                onClick={() => setMobileOpen((v) => !v)}
                style={{ cursor: "pointer" }}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                {mobileOpen ? <Cross1Icon /> : <HamburgerMenuIcon />}
              </Button>
            </Box>
          </Flex>
        </Flex>
      </Box>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{
              background: "rgba(255,255,255,0.97)",
              backdropFilter: "blur(16px)",
              borderTop: "1px solid rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            <Flex direction="column" px="4" py="4" gap="1">
              {NAV_LINKS.map((link) => (
                link.href.startsWith("#") ? (
                  <button
                    key={link.label}
                    onClick={() => handleAnchorClick(link.href)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      padding: "10px 12px",
                      borderRadius: 8,
                      fontSize: "15px",
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    style={{
                      display: "block",
                      padding: "10px 12px",
                      borderRadius: 8,
                      fontSize: "15px",
                      fontWeight: 500,
                      textDecoration: "none",
                      color: "#374151",
                    }}
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </Flex>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
