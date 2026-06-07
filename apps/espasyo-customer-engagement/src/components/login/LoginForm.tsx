import React, { useState, useEffect } from "react";
import {
  Badge,
  Box,
  Flex,
  Heading,
  Separator,
  Text,
  Theme,
  Grid
} from "@radix-ui/themes";
import {
  PersonIcon,
  LockClosedIcon,
  ArrowRightIcon,
  StarIcon,
  HeartIcon,
} from "@radix-ui/react-icons";
import {
  CoffeeOutlined,
  ShieldOutlined,
  LocalOfferOutlined,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { TextField } from "core-lib/components/radix/form/TextField";
import { Button } from "core-lib/components/radix/buttons/Button";
import {
  useFormFocusOnError,
  useFormSubmissionBindingHooks,
  useKeyDown,
} from "core-lib/core/hooks";
import { usePublicSettings } from "core-lib/core/contexts";
import { hexToRadixAccent } from "core-lib/business/colors";
import { LoginFormType, loginFormSchema } from "./validation";
import Link from "next/link";
import Image from "next/image";

interface Props {
  onSubmit: (values: LoginFormType) => void;
  submitLoading: boolean;
  cooldownSeconds?: number;
}

const CUSTOMER_FEATURES = [
  { icon: StarIcon, label: "Loyalty Rewards", color: "#fbbf24" },
  { icon: LocalOfferOutlined, label: "Exclusive Deals", color: "#fb923c" },
  { icon: ShoppingCartOutlined, label: "Easy Ordering", color: "#60a5fa" },
  { icon: HeartIcon, label: "Personalized Offers", color: "#f43f5e" },
];

const MotionDiv = motion.div;

export const LoginForm: React.FC<Props> = ({
  onSubmit,
  submitLoading,
  cooldownSeconds = 0,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { handleSubmit, control, formState, setFocus, clearErrors } =
    useForm<LoginFormType>({
      resolver: yupResolver(loginFormSchema),
      mode: "onChange",
      defaultValues: loginFormSchema.getDefault(),
    });

  const { systemName, theme } = usePublicSettings();
  const logoUrl = theme.logoUrl;
  const resolvedAccent = hexToRadixAccent(theme.primaryColor, "orange");
  const brandName = systemName || "Espasyo";

  useEffect(() => {
    setMounted(true);
  }, []);

  useFormFocusOnError<LoginFormType>(formState.errors, setFocus);
  useKeyDown("Enter", () => handleSubmit(onSubmit)());
  useFormSubmissionBindingHooks({
    key: "espasyo-customer-sign-in",
    isValid: formState.isValid,
    isDirty: formState.isDirty,
    cb: () => handleSubmit(onSubmit)(),
  });

  const submit = handleSubmit(onSubmit);

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
          {/* LEFT PANEL — Redesigned Hero Section */}
          <Box
            display={{ initial: "none", lg: "block" }}
            style={{
              position: "relative",
              flex: 1,
              overflow: "hidden",
            }}
          >
            {/* Animated Background Image */}
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
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=90"
                alt="Coffee background"
                fill
                style={{ objectFit: "cover" }}
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>

            {/* Gradient Overlay */}
            <Box
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.4) 100%)",
              }}
            />

            {/* Animated Gradient Orbs */}
            <motion.div
              animate={{ y: [0, -30, 0], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                top: "15%",
                right: "10%",
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(251,146,60,0.25) 0%, transparent 70%)",
                filter: "blur(40px)",
                pointerEvents: "none",
              }}
            />
            
            <motion.div
              animate={{ y: [0, 20, 0], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              style={{
                position: "absolute",
                bottom: "15%",
                left: "10%",
                width: 250,
                height: 250,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%)",
                filter: "blur(50px)",
                pointerEvents: "none",
              }}
            />

            <Flex
              direction="column"
              justify="between"
              p="7"
              style={{ position: "relative", height: "100%", zIndex: 1 }}
            >
              {/* Brand Section */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
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
                    {/* Always render Image, but hide with CSS if no logoUrl */}
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
                  <Flex direction="column" style={{ lineHeight: 1.1 }}>
                    <Text size="4" weight="bold" style={{ color: "#fbe9cf" }}>
                      E'spasyo Coffee House | Customer Engagement System
                    </Text>
                    <Text size="1" style={{ color: "rgba(251,233,207,0.7)" }}>
                      Premium Coffee House
                    </Text>
                  </Flex>
                </Flex>
              </motion.div>

              {/* Hero Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              >
                <Flex direction="column" gap="6" style={{ maxWidth: 560 }}>
                  <Badge 
                    color="orange" 
                    variant="solid" 
                    size="2" 
                    style={{ 
                      alignSelf: "flex-start",
                      background: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(10px)",
                      padding: "6px 16px",
                    }}
                  >
                    ✨ Welcome to Espasyo
                  </Badge>

                  <Heading
                    size={{ initial: "8", xl: "9" }}
                    weight="bold"
                    style={{
                      letterSpacing: "-0.02em",
                      lineHeight: 1.1,
                      color: "white",
                    }}
                  >
                    Your Perfect{" "}
                    <span style={{
                      background: "linear-gradient(90deg, #fb923c, #fbbf24)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}>
                      Cup Awaits
                    </span>
                  </Heading>

                  <Text
                    size="4"
                    style={{
                      color: "rgba(255,255,255,0.85)",
                      lineHeight: 1.6,
                      maxWidth: 500,
                    }}
                  >
                    Sign in to unlock loyalty rewards, exclusive deals, and seamless online ordering — crafted just for you.
                  </Text>

                  {/* Features Grid */}
                  <Grid columns="2" gap="2" style={{ marginTop: 16 }}>
                    {CUSTOMER_FEATURES.map(({ icon: Icon, label, color }, index) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                      >
                        <Flex
                          align="center"
                          gap="2"
                          px="3"
                          py="2"
                          style={{
                            background: "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: 12,
                            backdropFilter: "blur(8px)",
                          }}
                        >
                          {"render" in Icon ? (
                            <Icon style={{ fontSize: 16, color }} />
                          ) : (
                            <Icon width={16} height={16} style={{ color }} />
                          )}
                          <Text size="2" weight="medium" style={{ color: "rgba(255,255,255,0.9)" }}>
                            {label}
                          </Text>
                        </Flex>
                      </motion.div>
                    ))}
                  </Grid>

                  {/* Stats */}
                  <Flex gap="4" style={{ marginTop: 24 }}>
                    <Box>
                      <Text size="5" weight="bold" style={{ color: "#fb923c" }}>5k+</Text>
                      <Text size="1" style={{ color: "rgba(255,255,255,0.7)" }}>Happy Customers</Text>
                    </Box>
                    <Box>
                      <Text size="5" weight="bold" style={{ color: "#fb923c" }}>50+</Text>
                      <Text size="1" style={{ color: "rgba(255,255,255,0.7)" }}>Menu Items</Text>
                    </Box>
                    <Box>
                      <Text size="5" weight="bold" style={{ color: "#fb923c" }}>4.9★</Text>
                      <Text size="1" style={{ color: "rgba(255,255,255,0.7)" }}>Rating</Text>
                    </Box>
                  </Flex>
                </Flex>
              </motion.div>

              {/* Footer */}
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

          {/* RIGHT PANEL — Modern Form */}
          <Box
            style={{
              position: "relative",
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "48px 32px",
              background: "white",
            }}
          >
            {/* Decorative Background Pattern */}
            <Box
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "radial-gradient(rgba(194,65,12,0.03) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
                pointerEvents: "none",
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              style={{ width: "100%", maxWidth: 460, position: "relative", zIndex: 1 }}
            >
              {/* Mobile Brand */}
              <Flex
                display={{ initial: "flex", lg: "none" }}
                justify="center"
                mb="6"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 24px",
                    background: "linear-gradient(135deg, #fff7ed, #fff)",
                    borderRadius: 20,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                >
                  <Box
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #c2410c, #ea580c)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CoffeeOutlined style={{ fontSize: 20, color: "white" }} />
                  </Box>
                  <Flex direction="column">
                    <Text size="3" weight="bold">E'spasyo</Text>
                    <Text size="1" color="gray">Coffee House</Text>
                  </Flex>
                </motion.div>
              </Flex>

              {/* Form Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Box
                  p="7"
                  style={{
                    borderRadius: 32,
                    background: "white",
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)",
                  }}
                >
                  <Flex direction="column" gap="2" mb="6">
                    <Heading size="7" weight="bold" style={{ letterSpacing: "-0.02em" }}>
                      Welcome back
                    </Heading>
                    <Text size="2" color="gray">
                      Sign in to continue to your account
                    </Text>
                  </Flex>

                  <Flex direction="column" gap="5">
                    <TextField<LoginFormType>
                      name="userName"
                      control={control}
                      label="Username"
                      placeholder="Enter your username"
                      size="3"
                      startAdornment={
                        <PersonIcon height={18} width={18} style={{ color: "var(--gray-9)" }} />
                      }
                    />

                    <TextField<LoginFormType>
                      name="password"
                      control={control}
                      label="Password"
                      placeholder="Enter your password"
                      type={isPasswordVisible ? "text" : "password"}
                      size="3"
                      showPasswordToggle
                      onBlur={() => clearErrors()}
                      startAdornment={
                        <LockClosedIcon height={18} width={18} style={{ color: "var(--gray-9)" }} />
                      }
                    />

                    <Flex justify="between" align="center">
                      <Flex align="center" gap="2">
                        <input
                          id="remember-me"
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          style={{ 
                            width: 16, 
                            height: 16, 
                            accentColor: "var(--accent-9)", 
                            cursor: "pointer",
                            borderRadius: 4,
                          }}
                        />
                        <Text as="label" size="2" color="gray" htmlFor="remember-me" style={{ cursor: "pointer" }}>
                          Remember me
                        </Text>
                      </Flex>
                      {/* <motion.a
                        href="#"
                        whileHover={{ x: 3 }}
                        style={{ textDecoration: "none" }}
                      >
                        <Text size="2" weight="medium" style={{ color: "var(--accent-11)" }}>
                          Forgot password?
                        </Text>
                      </motion.a> */}
                    </Flex>

                    <Box mt="2">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="Primary"
                          size="3"
                          fullWidth
                          disabled={submitLoading || cooldownSeconds > 0}
                          loading={submitLoading}
                          onClick={() => submit()}
                          style={{
                            background: "linear-gradient(135deg, #c2410c, #ea580c)",
                            boxShadow: "0 4px 12px rgba(194,65,12,0.3)",
                          }}
                        >
                          <Flex align="center" justify="center" gap="2">
                            <Text size="3" weight="bold">
                              {cooldownSeconds > 0
                                ? `Try again in ${cooldownSeconds}s`
                                : "Sign in"}
                            </Text>
                            {!submitLoading && cooldownSeconds === 0 && <ArrowRightIcon />}
                          </Flex>
                        </Button>
                      </motion.div>
                    </Box>
                  </Flex>

                  <Flex align="center" gap="3" my="6">
                    <Separator size="4" style={{ flex: 1 }} />
                    <Text size="1" color="gray" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Secure Login
                    </Text>
                    <Separator size="4" style={{ flex: 1 }} />
                  </Flex>

                  {/* Security Notice */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    style={{
                      padding: "16px",
                      borderRadius: 16,
                      background: "linear-gradient(135deg, #fff7ed, #fff)",
                      border: "1px solid rgba(194,65,12,0.1)",
                    }}
                  >
                    <Flex align="center" gap="3">
                      <ShieldOutlined style={{ fontSize: 20, color: "var(--accent-9)" }} />
                      <Box>
                        <Text size="1" weight="bold" style={{ color: "#c2410c" }}>
                          🔒 Secure Connection
                        </Text> <br />
                        <Text size="1" style={{ color: "#6b7280" }}>
                          Your data is encrypted and protected
                        </Text>
                      </Box>
                    </Flex>
                  </motion.div>
                </Box>
              </motion.div>

              {/* Footer Links */}
              <Flex justify="center" align="center" gap="4" mt="6" wrap="wrap">
                <Link href="/">
                  <Text size="1" style={{ color: "var(--accent-9)", cursor: "pointer" }}>
                    ← Back to home
                  </Text>
                </Link>
                <Text size="1" color="gray">•</Text>
                <Link href="/customer-engagement-registration/account-creation">
                  <Text size="1" style={{ color: "var(--accent-9)", cursor: "pointer" }}>
                    Create an account →
                  </Text>
                </Link>
                <Text size="1" color="gray">•</Text>
                <Text size="1" color="gray">
                  Need help? Contact support
                </Text>
              </Flex>
            </motion.div>
          </Box>
        </Flex>
      </Box>
    </Theme>
  );
};