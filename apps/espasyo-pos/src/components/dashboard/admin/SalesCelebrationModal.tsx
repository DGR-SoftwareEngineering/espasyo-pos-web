import React, { useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Separator,
} from "core-lib/components/radix/proxies";
import {
  Dialog,
  Button,
  Grid,
} from "@radix-ui/themes";;
import { motion, AnimatePresence } from "framer-motion";
import { EmojiEvents } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { ConfettiCanvas, ConfettiHandle } from "core-lib/components/confetti";
import { useResolution } from "core-lib/core/hooks";
import { mobileDialogStyle } from "core-lib/components/radix/dialog/mobileFullScreen";
import { formatCurrency } from "../../contents/pos/format";

interface SalesCelebrationModalProps {
  open: boolean;
  onClose: () => void;
  targetAmount: number;
  currentAmount: number;
  transactionCount: number;
  currencyCode: string;
}

interface StatTileProps {
  label: string;
  value: string;
  accent: "green" | "indigo" | "blue" | "amber";
}

const StatTile: React.FC<StatTileProps> = ({ label, value, accent }) => (
  <Box
    style={{
      padding: "16px",
      borderRadius: "var(--radius-2)",
      background: `var(--${accent}-a2)`,
      border: `1px solid var(--${accent}-a5)`,
      textAlign: "center",
    }}
  >
    <Text size="1" color="gray" weight="medium">
      {label}
    </Text>
    <Heading size="3" weight="bold" style={{ marginTop: "8px", color: `var(--${accent}-11)` }}>
      {value}
    </Heading>
  </Box>
);

export const SalesCelebrationModal: React.FC<SalesCelebrationModalProps> = ({
  open,
  onClose,
  targetAmount,
  currentAmount,
  transactionCount,
  currencyCode,
}) => {
  const { isSmallMobile } = useResolution();
  const confettiRef = useRef<ConfettiHandle>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      confettiRef.current?.fire();
    }
  }, [open]);

  const handleViewReports = () => {
    router.push("/admin/hub/reports");
    onClose();
  };

  return (
    <>
      <ConfettiCanvas ref={confettiRef} />
      <Dialog.Root open={open} onOpenChange={onClose}>
        <Dialog.Content
          style={{
            ...(isSmallMobile
              ? mobileDialogStyle
              : { maxWidth: 480, borderRadius: "var(--radius-4)", overflow: "hidden" }),
            padding: 0,
          }}
        >
          <AnimatePresence mode="wait">
            {open && (
              <motion.div
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.75, opacity: 0 }}
                transition={{ type: "spring", damping: 18 }}
              >
                <Box
                  style={{
                    background: "linear-gradient(135deg, var(--indigo-9) 0%, var(--violet-9) 50%, var(--indigo-10) 100%)",
                    padding: "24px",
                    textAlign: "center",
                  }}
                >
                  <motion.div
                    animate={{ scale: [0.5, 1.15, 1] }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <Box
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: "16px",
                      }}
                    >
                      <EmojiEvents
                        style={{
                          fontSize: 64,
                          color: "var(--amber-11)",
                        }}
                      />
                    </Box>
                  </motion.div>

                  <Heading size="6" style={{ color: "white", marginBottom: "8px" }}>
                    🎉 Daily Target Reached!
                  </Heading>
                  <Text
                    size="2"
                    style={{
                      color: "rgba(255, 255, 255, 0.8)",
                      lineHeight: 1.5,
                    }}
                  >
                    You've hit today's target of {formatCurrency(targetAmount, currencyCode)}
                  </Text>
                </Box>

                <Box style={{ padding: "20px" }}>
                  <Grid columns="2" gap="3">
                    <StatTile
                      label="Total Sales"
                      value={formatCurrency(currentAmount, currencyCode)}
                      accent="green"
                    />
                    <StatTile
                      label="Transactions"
                      value={String(transactionCount)}
                      accent="indigo"
                    />
                  </Grid>

                  <Separator style={{ margin: "20px 0" }} />

                  <Flex gap="3" justify="center">
                    <Button
                      onClick={handleViewReports}
                      style={{ cursor: "pointer" }}
                    >
                      View Reports →
                    </Button>
                    <Button
                      variant="soft"
                      color="gray"
                      onClick={onClose}
                      style={{ cursor: "pointer" }}
                    >
                      Keep Selling ✨
                    </Button>
                  </Flex>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
};
