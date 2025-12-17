import AdminPassModal from "@/components/AdminPassModal";
import { useRouter } from "next/router";
import React from "react";
import Cookies from "js-cookie";

function Panel() {
  const router = useRouter();

  const handleSuccess = () => {
    Cookies.set("dashboardAuth", "authenticated", { expires: 1 });
    router.push("/dashboard");
  };
  return (
    <div className=" text-end">
      <AdminPassModal onSuccess={handleSuccess} />
    </div>
  );
}

export default Panel;
