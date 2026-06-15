import { useState } from "react";

export function useCriticalDeleteGuard() {
  const [showAdminConfirm, setShowAdminConfirm] = useState(false);
  const [adminConfirmError, setAdminConfirmError] = useState<string | null>(null);
  const [forceLoading, setForceLoading] = useState(false);

  const openAdminConfirm = () => {
    setAdminConfirmError(null);
    setShowAdminConfirm(true);
  };

  return {
    showAdminConfirm,
    setShowAdminConfirm,
    openAdminConfirm,
    adminConfirmError,
    setAdminConfirmError,
    forceLoading,
    setForceLoading,
  };
}
