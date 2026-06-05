import React, { useState, useEffect } from "react";
import { Box, Container, Grid, Heading, Text, Card, Flex, Avatar } from "@radix-ui/themes";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

const testimonials = [
  {
    name: "Sarah M.",
    role: "Coffee Enthusiast",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    rating: 5,
    text: "Espasyo has completely changed how I order my morning coffee. The loyalty program is amazing, and I love the exclusive deals!",
    date: "2 days ago",
  },
  {
    name: "James L.",
    role: "Regular Customer",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    rating: 5,
    text: "The seamless ordering experience saves me so much time. Plus, I've already earned 3 free drinks from the loyalty program.",
    date: "1 week ago",
  },
  {
    name: "Maria G.",
    role: "Coffee Lover",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    rating: 5,
    text: "Best coffee app ever! The personalized offers are spot on, and the customer service is incredibly responsive.",
    date: "3 days ago",
  },
  {
    name: "David C.",
    role: "Business Professional",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    rating: 5,
    text: "Fast service, great coffee, and the rewards add up quickly. Highly recommend Espasyo!",
    date: "5 days ago",
  },
];

export const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isDesktopView, setIsDesktopView] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktopView(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktopView(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!isDesktopView) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isDesktopView]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "110%" : "-110%",
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "110%" : "-110%",
      opacity: 0,
    }),
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <Box py="9" style={{ background: "linear-gradient(180deg, #fff7ed 0%, #fff 100%)" }}>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: 48 }}
        >
          <Text
            size="2"
            weight="bold"
            style={{
              color: "#c2410c",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              display: "block",
              marginBottom: 16,
            }}
          >
            Testimonials
          </Text>
          <Heading size="8" weight="bold" mb="3">
            What Our Customers Say
          </Heading>
          <Text size="5" style={{ color: "#6b7280" }}>
            Real reviews from real coffee lovers
          </Text>
        </motion.div>

        {/* Mobile View: Grid */}
        <Box display={{ initial: "block", md: "none" }}>
          <Grid columns="1" gap="6">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <TestimonialCard testimonial={testimonial} />
              </motion.div>
            ))}
          </Grid>
        </Box>

        {/* Desktop View: Carousel */}
        <Box display={{ initial: "none", md: "block" }} style={{ position: "relative" }}>
          <div style={{ overflow: "hidden", position: "relative" }}>
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                style={{ position: "absolute", width: "100%" }}
              >
                <TestimonialCard testimonial={testimonials[currentIndex]} />
              </motion.div>
            </AnimatePresence>
          </div>

          <Flex justify="center" gap="4" mt="6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrev}
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "50%",
                width: 48,
                height: 48,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronLeftIcon width={24} height={24} />
            </motion.button>
            <Flex gap="2">
              {testimonials.map((_, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1);
                    setCurrentIndex(idx);
                  }}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: idx === currentIndex ? "#c2410c" : "#d1d5db",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                />
              ))}
            </Flex>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "50%",
                width: 48,
                height: 48,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronRightIcon width={24} height={24} />
            </motion.button>
          </Flex>
        </Box>
      </Container>
    </Box>
  );
};

const TestimonialCard: React.FC<{ testimonial: typeof testimonials[0] }> = ({ testimonial }) => (
  <Card
    style={{
      maxWidth: 800,
      margin: "0 auto",
      padding: "clamp(16px, 4vw, 32px)",
      background: "white",
      boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
    }}
  >
    <Flex direction="column" gap="4">
      <Flex gap="1">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <span key={i} style={{ fontSize: 20 }}>
            ⭐
          </span>
        ))}
      </Flex>

      <Text
        size="5"
        style={{
          fontStyle: "italic",
          color: "#374151",
          lineHeight: 1.6,
        }}
      >
        "{testimonial.text}"
      </Text>

      <Flex align="center" gap="3" style={{ marginTop: 16 }}>
        <Avatar
          src={testimonial.avatar}
          fallback={testimonial.name[0]}
          size="3"
          radius="full"
        />
        <Box>
          <Text weight="bold" size="3">
            {testimonial.name}
          </Text>
          <Text size="2" style={{ color: "#6b7280" }}>
            {testimonial.role} • {testimonial.date}
          </Text>
        </Box>
      </Flex>
    </Flex>
  </Card>
);