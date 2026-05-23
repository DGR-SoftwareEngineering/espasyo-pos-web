import { useEffect } from "react";
import { useRouter } from "core-lib/core/router";

const LocationsSettingsPage = () => {
  const router = useRouter();
  useEffect(() => { router.replace("/admin/hub/categories"); }, []);
  return null;
};

export default LocationsSettingsPage;
