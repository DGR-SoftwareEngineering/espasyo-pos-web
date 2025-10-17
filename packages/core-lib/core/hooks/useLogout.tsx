import { useAuthContext } from "../contexts";
import { useRouter } from "../router";

export const useLogout = () => {
  const auth = useAuthContext();
  const router = useRouter();

  return {
    logout: async () => {
      await auth.logout();
      //   await router.replace((routes) => routes.home, { shallow: false });
    },
  };
};
