import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Box, Dialog, Flex } from "@radix-ui/themes";
import { Cross2Icon } from "@radix-ui/react-icons";
import { PrintOutlined } from "@mui/icons-material";
import { Button } from "../radix/buttons/Button";
import {
  PRINT_HIDE_CLASS,
  PRINT_PORTAL_CLASS,
  PRINT_TARGET_CLASS,
} from "./printStyles";

interface PrintPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Title shown on the dialog chrome (hidden from print output). */
  title: string;
  /** Optional extra buttons rendered before Print/Close in the header (hidden from print). */
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Print-preview dialog.
 *
 * The same `children` are rendered in two places:
 *   1. Inside the Radix Dialog — for the on-screen preview (hidden from print).
 *   2. Via a portal to `document.body` — wrapped in the print target so the
 *      browser print engine has a clean, top-level element to paginate.
 *
 * The CSS in `printStyles.ts` hides every body child except the print portal
 * when `@media print` is active, so the printed output contains only the
 * document — no app chrome, no dialog frame.
 */
export const PrintPreviewDialog: React.FC<PrintPreviewDialogProps> = ({
  open,
  onOpenChange,
  title,
  headerActions,
  children,
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrint = useCallback(() => {
    setTimeout(() => window.print(), 0);
  }, []);

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Content
          maxWidth="900px"
          width="calc(100vw - 32px)"
          style={{ padding: 0, maxHeight: "calc(100vh - 32px)" }}
        >
          <Flex
            align="center"
            justify="between"
            gap="2"
            px="4"
            py="3"
            className={PRINT_HIDE_CLASS}
            style={{
              borderBottom: "1px solid var(--gray-a4)",
              background: "var(--color-panel-solid)",
              position: "sticky",
              top: 0,
              zIndex: 2,
            }}
          >
            <Dialog.Title size="3" mb="0">
              {title}
            </Dialog.Title>
            <Flex gap="2" wrap="wrap">
              {headerActions}
              <Button type="Primary" onClick={handlePrint}>
                <Flex align="center" gap="2">
                  <PrintOutlined fontSize="small" /> Print / Save as PDF
                </Flex>
              </Button>
              <Button type="Secondary" onClick={() => onOpenChange(false)}>
                <Flex align="center" gap="2">
                  <Cross2Icon /> Close
                </Flex>
              </Button>
            </Flex>
          </Flex>
          <Box
            p="4"
            style={{
              overflowY: "auto",
              maxHeight: "calc(100vh - 100px)",
              background: "var(--gray-a2)",
            }}
          >
            {/* Visual preview only — no print-target class so this copy is hidden when printing. */}
            {children}
          </Box>
        </Dialog.Content>
      </Dialog.Root>

      {mounted &&
        open &&
        createPortal(
          <div className={PRINT_PORTAL_CLASS}>
            <div className={PRINT_TARGET_CLASS}>{children}</div>
          </div>,
          document.body,
        )}
    </>
  );
};
