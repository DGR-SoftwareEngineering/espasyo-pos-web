import { useEffect } from "react";
import { useRouter } from "core-lib/core/router";

const BusinessSupplyCategoriesSettingsPage = () => {
  const router = useRouter();
  useEffect(() => { router.replace("/admin/hub/categories"); }, []);
  return null;
};

export default BusinessSupplyCategoriesSettingsPage;
