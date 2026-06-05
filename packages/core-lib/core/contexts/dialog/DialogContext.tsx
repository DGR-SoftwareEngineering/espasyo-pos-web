import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  DialogElement,
  CustomDialogElement,
} from "../../../api/content/types/common";
import { useRouter } from "../../router";
import { DialogContextModal } from "../../../components";
import { DialogBox } from "../../../components/radix/dialog/DialogBox";
interface DialogContextType {
  isDialogOpen: boolean;
  openDialog: (element: CustomDialogElement) => void;
  closeDialog: () => void;
  loading: boolean;
}

const context = createContext<DialogContextType>(undefined as any);

interface Props {
  loading?: boolean;
  dialogOnLoad?: DialogElement;
}

export const useDialogContext = () => {
  const ctx = useContext(context);
  if (!ctx) {
    throw new Error("DialogContextProvider should be used");
  }
  return ctx;
};

export const DialogContextProvider: React.FC<
  React.PropsWithChildren<Props>
> = ({ children, loading, dialogOnLoad }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogElement, setDialogElement] = useState<CustomDialogElement>();
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();
  const isAlternateStyle =
    !!dialogElement?.value?.elements?.showInAlternateStyle?.value;
  const hideCloseButton =
    !!dialogElement?.value?.elements?.hideModalCloseButton?.value;
  const isButtonLoading = router.loading || actionLoading;

  useEffect(() => {
    if (loading) {
      handleForcedClose();
      return;
    }
    if (dialogOnLoad?.value?.elements) {
      handleOpen(dialogOnLoad as CustomDialogElement);
      return;
    }
    handleForcedClose();
  }, [dialogOnLoad?.value?.elements, router.asPath, loading]);

  const handleSuccess = () => {
    dialogElement?.onSuccess?.();
    handleClose();
  };

  return (
    <context.Provider
      value={useMemo(
        () => ({
          isDialogOpen: isOpen,
          loading: actionLoading,
          openDialog: handleOpen,
          closeDialog: handleClose,
        }),
        [isOpen, actionLoading],
      )}
    >
      {children}
      {!isAlternateStyle && (
        <DialogBox
          open={isOpen && !!dialogElement && !loading}
          onClose={handleClose}
          loading={router.loading || loading || isButtonLoading}
          hideCloseButton={hideCloseButton}
          title={dialogElement?.title}
          disableDismiss={loading}
          fullScreenOnMobile
          maxWidth="lg"
        >
          <DialogContextModal
            dialogFormType={dialogElement?.dialogContentType}
            dialogData={dialogElement?.data}
            onSuccess={handleSuccess}
            onClose={handleClose}
          />
        </DialogBox>
      )}
    </context.Provider>
  );

  async function handleClose() {
    if (router.loading || hideCloseButton) {
      return;
    }
    if (dialogElement?.customOnClose) {
      setActionLoading(true);
      await dialogElement.customOnClose();
      setActionLoading(false);
    }
    setIsOpen(false);
  }

  async function handleForcedClose() {
    setIsOpen(false);
    setDialogElement(undefined);
  }

  function handleOpen(element: CustomDialogElement) {
    setDialogElement(element);
    setIsOpen(true);
  }
};
