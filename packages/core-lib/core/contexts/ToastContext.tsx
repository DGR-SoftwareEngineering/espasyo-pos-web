import React, { createContext, useContext } from "react";
import { toast, ToastOptions, ToastPosition } from "react-toastify";

type ToastType = "info" | "success" | "error" | "warning";
export interface ToastContextSetup {
  executeToast: (
    //change function name into much more appropriate.
    message: string,
    position: ToastPosition,
    hideProgressBar: boolean,
    options?: Partial<ToastOptions>
  ) => void;
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextSetup>({} as any);

export const useToastContext = () => {
  if (!ToastContext) {
    throw new Error("useExecuteToast must be used withing the ToastProvider.");
  }
  return useContext(ToastContext);
};

export const ToastContextProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const executeToast: ToastContextSetup["executeToast"] = (
    message,
    position,
    hideProgress,
    options = {}
  ) => {
    toast(message, {
      position: position,
      autoClose: 5000,
      hideProgressBar: hideProgress,
      ...options,
    });
  };

  const showToast = (message: string, type: ToastType) => {
    executeToast(message, "top-right", false, {
      toastId: 0,
      type,
    });
  };

  return (
    <ToastContext.Provider
      value={{
        executeToast,
        showToast,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};
