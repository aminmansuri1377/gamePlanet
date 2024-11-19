// hooks/useAuthRedirect.ts
import { useEffect, useState } from "react"           
                                          import { useTranslation } from "react-i18next";;
import { useRouter } from "next/router";
import Cookies from "js-cookie";

const useAuthRedirect = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Check if the component has mounted and if the user is authenticated
    setIsMounted(true);
    const authToken = Cookies.get("dashboardAuth");
    if (authToken === "authenticated") {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push("/"); // Redirect to the home page if not authenticated
    }
  }, [isMounted, isAuthenticated, router]);

  // Return the authentication status and mounted state
  return { isAuthenticated, isMounted };
};

export default useAuthRedirect;
