import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Grid,
  Separator,
} from "@radix-ui/themes";
import {
  PersonIcon,
  LockClosedIcon,
  EnvelopeClosedIcon,
  CheckCircledIcon,
} from "@radix-ui/react-icons";
import {
  EmojiEventsOutlined,
  LocalOfferOutlined,
  ShoppingBagOutlined,
  SecurityOutlined,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { TextField } from "core-lib/components/radix/form/TextField";
import { Button } from "core-lib/components/radix/buttons/Button";
import {
  useFormFocusOnError,
  useFormSubmissionBindingHooks,
  useKeyDown,
} from "core-lib/core/hooks";
import { CustomerRegistrationFormType } from "../validation";
import Link from "next/link";
import { useCustomerRegistrationForm } from "./hooks";

interface Props {
  onSubmit: (values: CustomerRegistrationFormType) => void;
  submitLoading: boolean;
  resetForm?: boolean;
}

const MotionDiv = motion.div;
const MotionBox = motion(Box);

const REGISTRATION_STEPS = [
  { id: 1, label: "Account", icon: PersonIcon },
  { id: 2, label: "Profile", icon: CheckCircledIcon },
];

const BENEFITS = [
  { icon: EmojiEventsOutlined, text: "Earn points on every purchase", color: "#fbbf24" },
  { icon: LocalOfferOutlined, text: "Exclusive member discounts", color: "#fb923c" },
  { icon: ShoppingBagOutlined, text: "Early access to new products", color: "#60a5fa" },
  { icon: SecurityOutlined, text: "Secure & encrypted data", color: "#34d399" },
];

export const CustomerRegistrationForm: React.FC<Props> = ({
  onSubmit,
  submitLoading,
  resetForm,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isStep1Valid, setIsStep1Valid] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState,
    trigger,
    clearErrors,
    setFocus,
  } = useCustomerRegistrationForm({
    onSubmit,
    resetForm,
  });

  const watchedFields = watch();

  // Validate step 1 fields in real-time
  useEffect(() => {
    const validateStep1 = async () => {
      const isValid = await trigger(['username', 'password', 'confirmPassword']);
      setIsStep1Valid(isValid);
    };
    validateStep1();
  }, [watchedFields.username, watchedFields.password, watchedFields.confirmPassword, trigger]);

  useFormFocusOnError<CustomerRegistrationFormType>(formState.errors, setFocus);
  useKeyDown("Enter", () => {
    if (currentStep === 1 && isStep1Valid) {
      setCurrentStep(2);
    } else if (currentStep === 2 && formState.isValid) {
      handleSubmit(onSubmit)();
    }
  });
  useFormSubmissionBindingHooks({
    key: "customer-registration-form",
    isValid: formState.isValid,
    isDirty: formState.isDirty,
    cb: () => handleSubmit(onSubmit)(),
  });

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ width: "100%", overflow: "hidden" }}
    >
      <Box
        style={{
          width: "100%",
          maxWidth: "100%",
          margin: "0 auto",
          position: "relative",
          overflowX: "hidden",
        }}
      >
        {/* Step Indicator */}
        <Flex justify="center" gap="4" mb="6" wrap="wrap">
          {REGISTRATION_STEPS.map((step) => (
            <Flex
              key={step.id}
              align="center"
              gap="2"
              px="3"
              py="2"
              style={{
                borderRadius: 100,
                background: currentStep === step.id 
                  ? "linear-gradient(135deg, #c2410c, #ea580c)"
                  : "var(--gray-a3)",
                color: currentStep === step.id ? "white" : "var(--gray-11)",
                transition: "all 0.3s ease",
              }}
            >
              <step.icon width={14} height={14} />
              <Text size="1" weight="medium">
                {step.label}
              </Text>
            </Flex>
          ))}
        </Flex>

        {/* Form Card */}
        <MotionBox
          key={currentStep}
          initial={{ opacity: 0, x: currentStep === 1 ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: currentStep === 1 ? 20 : -20 }}
          transition={{ duration: 0.3 }}
          p={{ initial: "4", sm: "6" }}
          style={{
            borderRadius: 32,
            background: "white",
            boxShadow: "0 20px 35px -12px rgba(0,0,0,0.1)",
            width: "100%",
            overflow: "hidden",
          }}
        >
          <Flex direction="column" gap="5" style={{ width: "100%" }}>
            {currentStep === 1 ? (
              <>
                <Flex direction="column" gap="1">
                  <Heading size="6" weight="bold">
                    Create your account
                  </Heading>
                  <Text size="2" color="gray">
                    Join our community and start earning rewards
                  </Text>
                </Flex>

                <TextField<CustomerRegistrationFormType>
                  name="username"
                  control={control}
                  label="Username"
                  placeholder="Choose a unique username"
                  size="3"
                  
                  startAdornment={
                    <PersonIcon width={18} height={18} style={{ color: "var(--gray-9)" }} />
                  }
                />

                <TextField<CustomerRegistrationFormType>
                  name="password"
                  control={control}
                  label="Password"
                  placeholder="Create a strong password"
                  type={isPasswordVisible ? "text" : "password"}
                  size="3"
                  
                  showPasswordToggle
                  onBlur={() => {
                    clearErrors();
                    trigger('password');
                  }}
                  startAdornment={
                    <LockClosedIcon width={18} height={18} style={{ color: "var(--gray-9)" }} />
                  }
                />

                <TextField<CustomerRegistrationFormType>
                  name="confirmPassword"
                  control={control}
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  type={isConfirmPasswordVisible ? "text" : "password"}
                  size="3"
                  
                  showPasswordToggle
                  onBlur={() => {
                    clearErrors();
                    trigger('confirmPassword');
                  }}
                  startAdornment={
                    <LockClosedIcon width={18} height={18} style={{ color: "var(--gray-9)" }} />
                  }
                />

                {/* Password Requirements */}
                <Box
                  p="3"
                  style={{
                    borderRadius: 12,
                    background: "var(--gray-a2)",
                    fontSize: 12,
                    width: "100%",
                  }}
                >
                  <Text size="1" weight="bold" mb="2" as="div">
                    Password requirements:
                  </Text>
                  <Flex direction="column" gap="1">
                    <Text size="1" color={watchedFields.password?.length >= 8 ? "green" : "gray"}>
                      ✓ At least 8 characters
                    </Text>
                    <Text size="1" color={/[A-Z]/.test(watchedFields.password || "") ? "green" : "gray"}>
                      ✓ At least one uppercase letter
                    </Text>
                    <Text size="1" color={/[a-z]/.test(watchedFields.password || "") ? "green" : "gray"}>
                      ✓ At least one lowercase letter
                    </Text>
                    <Text size="1" color={/[0-9]/.test(watchedFields.password || "") ? "green" : "gray"}>
                      ✓ At least one number
                    </Text>
                    <Text size="1" color={/[!@#$%^&*(),.?":{}|<>]/.test(watchedFields.password || "") ? "green" : "gray"}>
                      ✓ At least one special character
                    </Text>
                  </Flex>
                </Box>

                <Button
                  type="Primary"
                  size="3"
                  fullWidth
                  disabled={!isStep1Valid}
                  onClick={() => setCurrentStep(2)}
                  style={{
                    background: "linear-gradient(135deg, #c2410c, #ea580c)",
                  }}
                >
                  Continue to Profile →
                </Button>
              </>
            ) : (
              <>
                <Flex direction="column" gap="1">
                  <Heading size="6" weight="bold">
                    Tell us about yourself
                  </Heading>
                  <Text size="2" color="gray">
                    We'd love to get to know you better
                  </Text>
                </Flex>

                <Grid columns={{ initial: "1", sm: "2" }} gap="3">
                  <TextField<CustomerRegistrationFormType>
                    name="firstName"
                    control={control}
                    label="First Name"
                    placeholder="John"
                    size="3"
                    
                  />
                  <TextField<CustomerRegistrationFormType>
                    name="lastName"
                    control={control}
                    label="Last Name"
                    placeholder="Doe"
                    size="3"
                    
                  />
                </Grid>

                <TextField<CustomerRegistrationFormType>
                  name="email"
                  control={control}
                  label="Email Address"
                  placeholder="john@example.com"
                  size="3"
                  
                  startAdornment={
                    <EnvelopeClosedIcon width={18} height={18} style={{ color: "var(--gray-9)" }} />
                  }
                />

                {/* <TextField<CustomerRegistrationFormType>
                  name="phone"
                  control={control}
                  label="Phone Number (Optional)"
                  placeholder="+1 234 567 8900"
                  size="3"
                  
                  startAdornment={
                    <MobileIcon width={18} height={18} style={{ color: "var(--gray-9)" }} />
                  }
                />

                <TextField<CustomerRegistrationFormType>
                  name="address"
                  control={control}
                  label="Address (Optional)"
                  placeholder="123 Coffee Street"
                  size="3"
                  
                  startAdornment={
                    <HomeIcon width={18} height={18} style={{ color: "var(--gray-9)" }} />
                  }
                />

                <Grid columns={{ initial: "1", sm: "2" }} gap="3">
                  <TextField<CustomerRegistrationFormType>
                    name="city"
                    control={control}
                    label="City (Optional)"
                    placeholder="New York"
                    size="3"
                    
                  />
                  <TextField<CustomerRegistrationFormType>
                    name="birthday"
                    control={control}
                    label="Birthday (Optional)"
                    placeholder="MM-DD"
                    size="3"
                    
                    startAdornment={
                      <CalendarIcon width={18} height={18} style={{ color: "var(--gray-9)" }} />
                    }
                  />
                </Grid> */}

                <Flex 
  direction={{ initial: "column", sm: "row" }} 
  gap="3"
  style={{ width: "100%" }}
>
  <Box style={{ flex: 1 }}>
    <Button
      type="Secondary"
      size="3"
      fullWidth
      onClick={() => setCurrentStep(1)}
    >
      ← Back
    </Button>
  </Box>
  <Box style={{ flex: 1 }}>
    <Button
      type="Primary"
      size="3"
      fullWidth
      disabled={submitLoading || !formState.isValid}
      loading={submitLoading}
      customActionKey="create-customer-registration-submission"
      style={{
        background: "linear-gradient(135deg, #c2410c, #ea580c)",
      }}
    >
      {submitLoading ? "Creating Account..." : "Complete Registration →"}
    </Button>
  </Box>
</Flex>
              </>
            )}
          </Flex>
        </MotionBox>

        {/* Benefits Section */}
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ width: "100%", overflow: "hidden" }}
        >
          <Separator size="4" my="6" />
          
          <Text size="2" weight="bold" align="center" mb="4" as="div">
            Why join Espasyo?
          </Text>
          
          <Grid columns={{ initial: "1", sm: "2" }} gap="3">
            {BENEFITS.map((benefit, index) => (
              <Flex
                key={index}
                align="center"
                gap="2"
                p="2"
                style={{
                  borderRadius: 12,
                  background: "var(--gray-a2)",
                  width: "100%",
                }}
              >
                <benefit.icon style={{ fontSize: 18, color: benefit.color, flexShrink: 0 }} />
                <Text size="2" style={{ flex: 1 }}>{benefit.text}</Text>
              </Flex>
            ))}
          </Grid>

          {/* Navigation Links */}
          <Separator size="4" my="6" />
          
          <Flex 
            justify="center" 
            align="center" 
            gap="4" 
            wrap="wrap"
            direction={{ initial: "column", sm: "row" }}
            style={{ width: "100%" }}
          >
            <Link href="/login">
              <Text size="2" style={{ color: "var(--accent-9)", cursor: "pointer", whiteSpace: "nowrap" }}>
                ← Already have an account? Sign in
              </Text>
            </Link>
            <Text size="1" color="gray">•</Text>
            <Link href="/">
              <Text size="2" style={{ color: "var(--accent-9)", cursor: "pointer", whiteSpace: "nowrap" }}>
                Back to home
              </Text>
            </Link>
          </Flex>
        </MotionDiv>
      </Box>
    </MotionDiv>
  );
};