// components/landing/HeroSection.tsx - With Inline STATS
import React, { useRef, useState, useEffect } from "react";
import { Box, Flex, Heading, Button, Text, Container } from "@radix-ui/themes";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronDownIcon, PlayIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import Image from "next/image";

const STATS = [
  { value: "5,000+", label: "Happy Customers", icon: "😊", delay: 0 },
  { value: "50+", label: "Menu Items", icon: "☕", delay: 0.1 },
  { value: "15,000+", label: "Orders Served", icon: "🚀", delay: 0.2 },
  { value: "4.9", label: "Rating", icon: "⭐", delay: 0.3 },
];

export const HeroSection: React.FC = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.6, 0]);
  const scale = useSpring(useTransform(scrollYProgress, [0, 1], [1, 1.15]), {
    stiffness: 100,
    damping: 30,
  });
  const contentScale = useSpring(useTransform(scrollYProgress, [0, 0.5], [1, 0.95]), {
    stiffness: 100,
    damping: 30,
  });

  const scrollToMenu = () => {
    document.querySelector("#menu")?.scrollIntoView({ behavior: "smooth" });
  };

  // Typing animation for subtitle
  const [displayText, setDisplayText] = useState("");
  const fullText = "Experience premium coffee, earn loyalty rewards with every purchase, and enjoy exclusive deals crafted just for you.";

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 30);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      ref={targetRef}
      className="hero-full-height"
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#0a0a0a",
      }}
    >
      {/* Background Video/Image with Parallax */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          y,
          scale,
        }}
      >
        <Image
          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&q=90"
          alt="Coffee background"
          fill
          priority
          style={{ objectFit: "cover" }}
          quality={95}
          sizes="100vw"
        />
        {/* Overlay gradient for better text readability */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.3) 100%)",
        }} />
      </motion.div>

      {/* Animated Gradient Overlay */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 20% 50%, rgba(251,146,60,0.15) 0%, transparent 50%)",
          opacity,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Animated Grain Texture */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
          pointerEvents: "none",
        }}
      />

      <Container style={{ position: "relative", zIndex: 2, height: "100%" }}>
        <Flex
          direction="column"
          justify="center"
          style={{ height: "100%", paddingTop: "clamp(72px, 10vw, 96px)" }}
        >
          <motion.div
            style={{ scale: contentScale }}
          >
            <Flex direction="column" gap="8" style={{ maxWidth: 780 }}>
              {/* Animated Badge */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <Box
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 12,
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 999,
                    padding: "8px 24px",
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Box
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#4ade80",
                        boxShadow: "0 0 0 3px rgba(74,222,128,0.3)",
                      }}
                    />
                  </motion.div>
                  <Text size="2" weight="medium" style={{ color: "white", letterSpacing: "0.5px" }}>
                    ✨ Espasyo Coffee House · Since 2022
                  </Text>
                </Box>
              </motion.div>

              {/* Main Headline with 3D effect */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              >
                <Heading
                  size="9"
                  weight="bold"
                  style={{
                    color: "white",
                    lineHeight: 1.1,
                    letterSpacing: "-0.03em",
                    fontSize: "clamp(48px, 8vw, 80px)",
                    textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                  }}
                >
                  Your Perfect{" "}
                  <span style={{ display: "inline-block" }}>
                    <motion.span
                      initial={{ backgroundPosition: "0% 50%" }}
                      animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      style={{
                        background: "linear-gradient(90deg, #fb923c, #fbbf24, #f97316, #fb923c)",
                        backgroundSize: "300% auto",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      Cup,
                    </motion.span>
                  </span>
                  <br />
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    Every{" "}
                    <motion.span
                      animate={{ 
                        scale: [1, 1.05, 1],
                        display: "inline-block"
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      style={{
                        background: "linear-gradient(90deg, #fbbf24, #fb923c)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      Single Day
                    </motion.span>
                  </motion.span>
                </Heading>
              </motion.div>

              {/* Animated Subtitle with typing effect */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Text
                  size="5"
                  style={{
                    color: "rgba(255,255,255,0.92)",
                    lineHeight: 1.7,
                    maxWidth: 600,
                    fontSize: "clamp(16px, 2vw, 20px)",
                  }}
                >
                  {displayText}
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{ display: "inline-block", marginLeft: 2 }}
                  >
                    |
                  </motion.span>
                </Text>
              </motion.div>

              {/* CTA Buttons with 3D hover effects */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Flex gap="4" wrap="wrap">
                  <motion.div
                    whileHover={{ scale: 1.08, y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Button
                      color="orange"
                      size="3"
                      onClick={scrollToMenu}
                      style={{
                        cursor: "pointer",
                        fontWeight: 700,
                        padding: "14px 36px",
                        fontSize: 16,
                        background: "linear-gradient(135deg, #c2410c, #ea580c)",
                        border: "none",
                        boxShadow: "0 4px 15px rgba(194,65,12,0.4)",
                      }}
                    >
                      Explore Menu
                      <ArrowRightIcon width={16} height={16} style={{ marginLeft: 8 }} />
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link href="/login">
                      <Button
                        variant="outline"
                        size="3"
                        style={{
                          cursor: "pointer",
                          fontWeight: 600,
                          padding: "14px 32px",
                          fontSize: 16,
                          border: "2px solid rgba(255,255,255,0.5)",
                          color: "white",
                          background: "rgba(255,255,255,0.1)",
                          backdropFilter: "blur(10px)",
                          transition: "all 0.3s ease",
                        }}
                      >
                        ✨ Login to Order
                      </Button>
                    </Link>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsVideoPlaying(true)}
                  >
                    <Button
                      variant="ghost"
                      size="3"
                      style={{
                        cursor: "pointer",
                        padding: "14px 28px",
                        fontSize: 16,
                        color: "white",
                        background: "rgba(255,255,255,0.08)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <PlayIcon width={18} height={18} style={{ marginRight: 8 }} />
                      Watch Story
                    </Button>
                  </motion.div>
                </Flex>
              </motion.div>

              {/* STATS - Now inline with dividers */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                style={{ marginTop: 40 }}
              >
                <Flex 
                  align="center" 
                  justify="start" 
                  gap="6" 
                  wrap="wrap"
                >
                  {STATS.map((stat, idx) => (
                    <React.Fragment key={stat.label}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + stat.delay }}
                        whileHover={{ y: -3 }}
                      >
                        <Flex align="center" gap="2">
                          <Text size="4">{stat.icon}</Text>
                          <Flex direction="column">
                            <Text
                              size="6"
                              weight="bold"
                              style={{ color: "#fb923c", lineHeight: 1.2 }}
                            >
                              {stat.value}
                            </Text>
                            <Text size="1" style={{ color: "rgba(255,255,255,0.7)" }}>
                              {stat.label}
                            </Text>
                          </Flex>
                        </Flex>
                      </motion.div>
                      {idx < STATS.length - 1 && (
                        <Text size="2" style={{ color: "rgba(255,255,255,0.3)" }}>
                          •
                        </Text>
                      )}
                    </React.Fragment>
                  ))}
                </Flex>
              </motion.div>
            </Flex>
          </motion.div>
        </Flex>
      </Container>

      {/* Scroll Indicator with animation */}
      <motion.div
        style={{
          position: "absolute",
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
          cursor: "pointer",
        }}
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        onClick={scrollToMenu}
      >
        <Flex direction="column" align="center" gap="2">
          <Text size="1" style={{ color: "rgba(255,255,255,0.7)", letterSpacing: "2px", textTransform: "uppercase" }}>
            Scroll
          </Text>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDownIcon width={28} height={28} style={{ color: "rgba(255,255,255,0.7)" }} />
          </motion.div>
        </Flex>
      </motion.div>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.95)",
              zIndex: 2000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={() => setIsVideoPlaying(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{
                position: "relative",
                width: "90%",
                maxWidth: 900,
                aspectRatio: "16/9",
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Espasyo Story"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};