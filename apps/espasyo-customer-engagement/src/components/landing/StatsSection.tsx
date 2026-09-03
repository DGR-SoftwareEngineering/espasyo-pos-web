// components/landing/StatsSection.tsx - Fixed Icons
import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Text,
  Heading,
  Flex,
  Badge,
} from "core-lib/components/radix/proxies";
import {
  Container,
  Grid,
} from "@radix-ui/themes";;
import { motion, useMotionValue, animate, useInView } from "framer-motion";
import { 
  HeartIcon, 
  StarIcon,
  RocketIcon,
  CheckIcon
} from "@radix-ui/react-icons";

const Counter: React.FC<{ target: number; suffix?: string; duration?: number }> = ({ 
  target, 
  suffix = "", 
  duration = 2.5 
}) => {
  const [display, setDisplay] = useState(0);
  const count = useMotionValue(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, target, {
        duration: duration,
        ease: "easeOut",
      });
      const unsubscribe = count.on("change", (latest) => {
        setDisplay(Math.floor(latest));
      });
      return () => {
        controls.stop();
        unsubscribe();
      };
    }
  }, [isInView, count, target, duration]);

  return (
    <span ref={ref}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
};

const stats = [
  { 
    label: "Happy Customers", 
    value: 15234, 
    suffix: "+", 
    icon: HeartIcon,
    color: "#f43f5e",
    gradient: "linear-gradient(135deg, #f43f5e, #fb7185)",
    description: "Satisfied coffee lovers",
    prefix: "✨",
    bgGradient: "linear-gradient(135deg, #f43f5e10, #fb718505)"
  },
  { 
    label: "Cups Served", 
    value: 89234, 
    suffix: "+", 
    icon: CheckIcon,
    color: "#c2410c",
    gradient: "linear-gradient(135deg, #c2410c, #ea580c)",
    description: "Delicious cups and counting",
    prefix: "☕",
    bgGradient: "linear-gradient(135deg, #c2410c10, #ea580c05)"
  },
  { 
    label: "Locations", 
    value: 8, 
    suffix: "", 
    icon: RocketIcon,
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)",
    description: "Growing nationwide",
    prefix: "📍",
    bgGradient: "linear-gradient(135deg, #3b82f610, #60a5fa05)"
  },
  { 
    label: "Years of Excellence", 
    value: 4, 
    suffix: "+", 
    icon: StarIcon,
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
    description: "Award-winning service",
    prefix: "🏆",
    bgGradient: "linear-gradient(135deg, #f59e0b10, #fbbf2405)"
  },
];

const StatCard: React.FC<{ stat: typeof stats[0]; index: number }> = ({ stat, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{ height: "100%" }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 24,
          padding: "32px 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          height: "100%",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        {/* Elevated shadow overlay — GPU opacity only */}
        <motion.div
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 24,
            boxShadow: `0 20px 40px ${stat.color}20`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Animated Background Gradient */}
        <motion.div
          animate={{
            opacity: isHovered ? 0.08 : 0,
            scale: isHovered ? 1 : 0.8,
          }}
          transition={{ duration: 0.3 }}
          style={{
            position: "absolute",
            inset: 0,
            background: stat.gradient,
            zIndex: 0,
          }}
        />

        {/* Icon Container */}
        <motion.div
          animate={{
            scale: isHovered ? 1.1 : 1,
            rotate: isHovered ? [0, -5, 5, 0] : 0,
          }}
          transition={{ duration: 0.3 }}
          style={{
            position: "relative",
            zIndex: 1,
            marginBottom: 20,
          }}
        >
          <Box
            style={{
              width: 70,
              height: 70,
              margin: "0 auto",
              borderRadius: "50%",
              background: stat.bgGradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <stat.icon width={32} height={32} style={{ color: stat.color }} />
          </Box>
        </motion.div>

        {/* Prefix Animation */}
        <motion.div
          animate={{
            y: isHovered ? [-5, 0] : 0,
            scale: isHovered ? [1.2, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
          style={{ position: "relative", zIndex: 1 }}
        >
          <Text size="5" style={{ marginBottom: 8, display: "block" }}>
            {stat.prefix}
          </Text>
        </motion.div>

        {/* Counter Value */}
        <motion.div
          animate={{
            scale: isHovered ? 1.05 : 1,
          }}
          transition={{ duration: 0.3 }}
          style={{ position: "relative", zIndex: 1 }}
        >
          <Heading
            size="9"
            weight="bold"
            style={{
              background: stat.gradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: 8,
              fontSize: "clamp(36px, 5vw, 56px)",
            }}
          >
            <Counter target={stat.value} suffix={stat.suffix} duration={2} />
          </Heading>
        </motion.div>

        {/* Label */}
        <Text 
          size="4" 
          weight="bold" 
          style={{ 
            color: "#1f2937", 
            display: "block", 
            marginBottom: 8,
            position: "relative",
            zIndex: 1,
          }}
        >
          {stat.label}
        </Text>

        {/* Description */}
        <Text 
          size="1" 
          style={{ 
            color: "#6b7280", 
            display: "block",
            position: "relative",
            zIndex: 1,
          }}
        >
          {stat.description}
        </Text>

        {/* Decorative Line */}
        <motion.div
          animate={{
            scaleX: isHovered ? 1 : 0.67,
            opacity: isHovered ? 1 : 0.5,
          }}
          transition={{ duration: 0.3 }}
          style={{
            width: 60,
            height: 2,
            background: stat.gradient,
            margin: "16px auto 0",
            borderRadius: 2,
            position: "relative",
            zIndex: 1,
            transformOrigin: "center",
          }}
        />
      </div>
    </motion.div>
  );
};

export const StatsSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <Box 
      ref={sectionRef}
      py="9" 
      style={{ 
        position: "relative",
        background: "linear-gradient(135deg, #fefaf5 0%, #ffffff 50%, #fefaf5 100%)",
        overflow: "hidden",
      }}
    >
      {/* Decorative Background Elements */}
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
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(194,65,12,0.05) 0%, transparent 70%)",
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
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Floating Icons */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "15%",
          left: "10%",
          fontSize: 40,
          opacity: 0.1,
          pointerEvents: "none",
        }}
      >
        ⭐
      </motion.div>

      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{
          position: "absolute",
          bottom: "20%",
          right: "8%",
          fontSize: 50,
          opacity: 0.1,
          pointerEvents: "none",
        }}
      >
        ☕
      </motion.div>

      <Container style={{ position: "relative", zIndex: 1 }}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: 56 }}
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
            📊 Our Impact
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
            By the Numbers
          </Heading>
          <Text size="4" style={{ color: "#6b7280", maxWidth: 600, margin: "0 auto" }}>
            The impact we've made in our community
          </Text>

          {/* Decorative Underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{
              height: 3,
              width: 80,
              background: "linear-gradient(90deg, #c2410c, #fbbf24)",
              margin: "24px auto 0",
              borderRadius: 3,
              transformOrigin: "left",
            }}
          />
        </motion.div>

        {/* Stats Grid */}
        <Grid 
          columns={{ initial: "1", sm: "2", lg: "4" }} 
          gap="6"
          style={{ marginBottom: 40 }}
        >
          {stats.map((stat, idx) => (
            <StatCard key={idx} stat={stat} index={idx} />
          ))}
        </Grid>

        {/* Bottom Highlight Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            marginTop: 40,
            padding: "24px 32px",
            background: "linear-gradient(135deg, #fff7ed, #fff)",
            borderRadius: 20,
            border: "1px solid rgba(194,65,12,0.1)",
            textAlign: "center",
          }}
        >
          <Flex direction="column" align="center" gap="3">
            <Flex align="center" gap="2">
              <span style={{ fontSize: 18 }}>🔥</span>
              <Text weight="bold" size="2" style={{ color: "#c2410c" }}>
                Growing Stronger Every Day
              </Text>
            </Flex>
            <Text size="1" style={{ color: "#6b7280", maxWidth: 500 }}>
              Join over 15,000+ satisfied customers who start their day with Espasyo
            </Text>
            <Flex gap="2" justify="center">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                >
                  <StarIcon width={12} height={12} style={{ color: "#fbbf24" }} />
                </motion.div>
              ))}
            </Flex>
          </Flex>
        </motion.div>
      </Container>
    </Box>
  );
};