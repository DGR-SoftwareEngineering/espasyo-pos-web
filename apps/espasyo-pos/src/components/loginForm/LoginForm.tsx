import React from "react";
import {
  Badge,
  Box,
  Flex,
  Heading,
  IconButton,
  Separator,
  Text,
  Theme,
} from "@radix-ui/themes";
import {
  PersonIcon,
  LockClosedIcon,
  ArrowRightIcon,
} from "@radix-ui/react-icons";
import {
  CoffeeOutlined,
  Inventory2Outlined,
  PointOfSaleOutlined,
  RestaurantMenuOutlined,
  ShieldOutlined,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { TextField } from "core-lib/components/radix/form/TextField";
import { Button } from "core-lib/components/radix/buttons/Button";
import { LoginForm as LoginFormType, loginFormSchema } from "./validation";
import {
  useFormFocusOnError,
  useFormSubmissionBindingHooks,
  useKeyDown,
} from "core-lib/core/hooks";

interface Props {
  onSubmit: (values: LoginFormType) => void;
  submitLoading: boolean;
}

const FEATURE_PILLS = [
  { icon: PointOfSaleOutlined, label: "Point of Sale" },
  { icon: Inventory2Outlined, label: "Live Inventory" },
  { icon: RestaurantMenuOutlined, label: "Recipes" },
  { icon: ShieldOutlined, label: "Audit Trail" },
];

const MotionDiv = motion.div;

export const LoginForm: React.FC<Props> = ({ onSubmit, submitLoading }) => {
  const { handleSubmit, control, formState, setFocus, clearErrors } =
    useForm<LoginFormType>({
      resolver: yupResolver(loginFormSchema),
      mode: "onChange",
      defaultValues: loginFormSchema.getDefault(),
    });

  useFormFocusOnError<LoginFormType>(formState.errors, setFocus);
  useKeyDown("Enter", () => handleSubmit(onSubmit)());
  useFormSubmissionBindingHooks({
    key: "espasyo-sign-in-submission",
    isValid: formState.isValid,
    isDirty: formState.isDirty,
    cb: () => handleSubmit(onSubmit)(),
  });

  const submit = handleSubmit(onSubmit);

  return (
    <Theme appearance="light" accentColor="amber" grayColor="sand" radius="large">
      <Box
        style={{
          minHeight: "100vh",
          width: "100%",
          background:
            "radial-gradient(1200px 600px at -10% -10%, var(--accent-a3), transparent 60%), radial-gradient(900px 500px at 110% 110%, var(--accent-a3), transparent 55%), var(--color-background)",
          overflow: "hidden",
        }}
      >
        <Flex
          direction={{ initial: "column", lg: "row" }}
          style={{ minHeight: "100vh", width: "100%" }}
        >
          <Box
            display={{ initial: "none", lg: "block" }}
            style={{
              position: "relative",
              flex: 1,
              overflow: "hidden",
              borderRight: "1px solid var(--accent-a4)",
            }}
          >
            <Box
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "url(/espasyo_bg.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "saturate(1.05) contrast(1.02)",
              }}
            />

            <Box
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(20,12,4,0.45) 0%, rgba(20,12,4,0.62) 50%, rgba(20,12,4,0.88) 100%)",
              }}
            />
            <Box
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(800px 400px at 20% 20%, rgba(255, 200, 130, 0.18), transparent 60%)",
              }}
            />

            <MotionDiv
              aria-hidden
              animate={{ y: [0, -16, 0], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                top: "18%",
                right: "12%",
                width: 220,
                height: 220,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(245, 195, 130, 0.35) 0%, transparent 70%)",
                filter: "blur(8px)",
                pointerEvents: "none",
              }}
            />
            <MotionDiv
              aria-hidden
              animate={{ y: [0, 14, 0], opacity: [0.4, 0.65, 0.4] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                bottom: "12%",
                left: "8%",
                width: 280,
                height: 280,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(120, 90, 50, 0.4) 0%, transparent 70%)",
                filter: "blur(12px)",
                pointerEvents: "none",
              }}
            />

            <Flex
              direction="column"
              justify="between"
              p="7"
              style={{ position: "relative", height: "100%", zIndex: 1 }}
            >
              <MotionDiv
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <Flex align="center" gap="3">
                  <Box
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "var(--radius-4)",
                      background:
                        "linear-gradient(135deg, #f5cf99 0%, #b8854b 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
                      color: "#3a2410",
                    }}
                  >
                    <CoffeeOutlined fontSize="medium" />
                  </Box>
                  <Flex direction="column" style={{ lineHeight: 1.1 }}>
                    <Text size="3" weight="bold" style={{ color: "#fbe9cf" }}>
                      Espasyo
                    </Text>
                    <Text size="1" style={{ color: "rgba(251, 233, 207, 0.7)" }}>
                      Coffee House
                    </Text>
                  </Flex>
                </Flex>
              </MotionDiv>

              <MotionDiv
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
              >
                <Flex direction="column" gap="5" style={{ maxWidth: 560 }}>
                  <Badge
                    color="amber"
                    variant="soft"
                    size="2"
                    radius="full"
                    style={{ alignSelf: "flex-start" }}
                  >
                    <Box
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "var(--green-9)",
                        boxShadow: "0 0 0 3px rgba(57, 167, 90, 0.25)",
                      }}
                    />
                    All systems operational
                  </Badge>

                  <Heading
                    size={{ initial: "8", xl: "9" }}
                    weight="bold"
                    style={{
                      color: "#fbe9cf",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.05,
                    }}
                  >
                    Run your coffee house
                    <Box
                      asChild
                      style={{
                        background:
                          "linear-gradient(90deg, #f5cf99 0%, #d3a970 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        display: "inline-block",
                        marginLeft: 8,
                      }}
                    >
                      <span>like a pro.</span>
                    </Box>
                  </Heading>

                  <Text
                    size="4"
                    style={{
                      color: "rgba(251, 233, 207, 0.78)",
                      lineHeight: 1.55,
                      maxWidth: 480,
                    }}
                  >
                    A unified point-of-sale and inventory platform — built for
                    speed at the counter and accuracy in the back of house.
                  </Text>

                  <Flex gap="2" wrap="wrap" mt="2">
                    {FEATURE_PILLS.map(({ icon: Icon, label }, index) => (
                      <MotionDiv
                        key={label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: 0.35 + index * 0.08,
                        }}
                      >
                        <Flex
                          align="center"
                          gap="2"
                          px="3"
                          py="2"
                          style={{
                            background: "rgba(251, 233, 207, 0.08)",
                            border: "1px solid rgba(251, 233, 207, 0.18)",
                            borderRadius: 999,
                            backdropFilter: "blur(6px)",
                            color: "#fbe9cf",
                          }}
                        >
                          <Icon style={{ fontSize: 16, opacity: 0.85 }} />
                          <Text size="2" weight="medium">
                            {label}
                          </Text>
                        </Flex>
                      </MotionDiv>
                    ))}
                  </Flex>
                </Flex>
              </MotionDiv>

              <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Flex justify="between" align="center">
                  <Text size="1" style={{ color: "rgba(251, 233, 207, 0.55)" }}>
                    © {new Date().getFullYear()} Espasyo Coffee House. Crafted
                    with care.
                  </Text>
                  <Flex align="center" gap="3">
                    <Text
                      size="1"
                      style={{ color: "rgba(251, 233, 207, 0.55)" }}
                    >
                      v1.0
                    </Text>
                  </Flex>
                </Flex>
              </MotionDiv>
            </Flex>
          </Box>

          <Box
            style={{
              position: "relative",
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "32px 24px",
            }}
          >
            <Box
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "radial-gradient(var(--gray-a4) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
                maskImage:
                  "radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent 80%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 80% 60% at 50% 50%, black, transparent 80%)",
                pointerEvents: "none",
              }}
            />

            <MotionDiv
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ width: "100%", maxWidth: 440, position: "relative" }}
            >
              <Flex
                display={{ initial: "flex", lg: "none" }}
                justify="center"
                mb="6"
              >
                <Flex align="center" gap="3">
                  <Box
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "var(--radius-4)",
                      background:
                        "linear-gradient(135deg, var(--accent-9) 0%, var(--accent-11) 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--accent-contrast)",
                      boxShadow: "0 6px 16px var(--accent-a6)",
                    }}
                  >
                    <CoffeeOutlined fontSize="medium" />
                  </Box>
                  <Flex direction="column" style={{ lineHeight: 1.1 }}>
                    <Text size="3" weight="bold">
                      Espasyo
                    </Text>
                    <Text size="1" color="gray">
                      Coffee House
                    </Text>
                  </Flex>
                </Flex>
              </Flex>

              <Box
                p="6"
                style={{
                  borderRadius: "var(--radius-5)",
                  background: "var(--color-panel-solid)",
                  border: "1px solid var(--gray-a4)",
                  boxShadow:
                    "0 24px 48px -20px var(--gray-a5), 0 2px 4px var(--gray-a3)",
                }}
              >
                <Flex direction="column" gap="2" mb="5">
                  <Heading
                    size="7"
                    weight="bold"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    Welcome back
                  </Heading>
                  <Text size="2" color="gray">
                    Sign in to access the Espasyo dashboard.
                  </Text>
                </Flex>

                <Flex direction="column" gap="4">
                  <TextField<LoginFormType>
                    data-testid="auth-username"
                    name="userName"
                    control={control}
                    label="Username"
                    placeholder="e.g. barista.juan"
                    size="3"
                    startAdornment={
                      <PersonIcon
                        height={16}
                        width={16}
                        style={{ color: "var(--gray-10)" }}
                      />
                    }
                  />

                  <TextField<LoginFormType>
                    data-testid="auth-password"
                    name="password"
                    control={control}
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                    size="3"
                    showPasswordToggle
                    onBlur={() => clearErrors()}
                    startAdornment={
                      <LockClosedIcon
                        height={16}
                        width={16}
                        style={{ color: "var(--gray-10)" }}
                      />
                    }
                  />

                  <Flex justify="between" align="center">
                    <Flex align="center" gap="2">
                      <input
                        id="remember-me"
                        type="checkbox"
                        style={{
                          width: 14,
                          height: 14,
                          accentColor: "var(--accent-9)",
                          cursor: "pointer",
                        }}
                      />
                      <Text
                        as="label"
                        size="2"
                        color="gray"
                        htmlFor="remember-me"
                        style={{ cursor: "pointer" }}
                      >
                        Remember me
                      </Text>
                    </Flex>
                    <Text
                      size="2"
                      weight="medium"
                      style={{
                        color: "var(--accent-11)",
                        cursor: "pointer",
                      }}
                    >
                      Forgot password?
                    </Text>
                  </Flex>

                  <Box mt="2">
                    <Button
                      type="Primary"
                      size="3"
                      fullWidth
                      disabled={submitLoading}
                      loading={submitLoading}
                      onClick={() => submit()}
                      data-testid="auth-submit"
                    >
                      <Flex align="center" justify="center" gap="2">
                        <Text size="3" weight="bold">
                          Sign in
                        </Text>
                        {!submitLoading && <ArrowRightIcon />}
                      </Flex>
                    </Button>
                  </Box>
                </Flex>

                <Flex align="center" gap="3" my="5">
                  <Separator size="4" style={{ flex: 1 }} />
                  <Text size="1" color="gray">
                    SECURE ACCESS
                  </Text>
                  <Separator size="4" style={{ flex: 1 }} />
                </Flex>

                <Flex
                  align="center"
                  gap="2"
                  p="3"
                  style={{
                    borderRadius: "var(--radius-3)",
                    background: "var(--accent-a2)",
                    border: "1px solid var(--accent-a4)",
                  }}
                >
                  <ShieldOutlined
                    style={{ fontSize: 18, color: "var(--accent-11)" }}
                  />
                  <Text size="1" color="gray">
                    Your session is protected by encrypted tokens and idle
                    timeout monitoring.
                  </Text>
                </Flex>
              </Box>

              <Flex justify="center" mt="5">
                <Text size="1" color="gray">
                  Need an account? Contact your{" "}
                  <Text
                    size="1"
                    weight="medium"
                    style={{ color: "var(--accent-11)", cursor: "pointer" }}
                  >
                    administrator
                  </Text>
                  .
                </Text>
              </Flex>
            </MotionDiv>
          </Box>
        </Flex>
      </Box>
    </Theme>
  );
};

export default LoginForm;
