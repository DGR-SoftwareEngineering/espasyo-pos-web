import { useEffect } from "react";
import { useRouter } from "core-lib/core/router";

const ProductCategoriesSettingsPage = () => {
  const router = useRouter();
  useEffect(() => { router.replace("/admin/hub/categories"); }, []);
  return null;
};

export default ProductCategoriesSettingsPage;
