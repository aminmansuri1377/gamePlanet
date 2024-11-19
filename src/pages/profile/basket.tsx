import Box from "@/components/Box";
import React, { useState } from "react";
import { useRouter } from "next/router";
import { FaArrowLeftLong } from "react-icons/fa6";
import { FaShoppingBasket } from "react-icons/fa";
import TicketBasket from "@/components/basket/TicketBasket";
import { trpc } from "../../../utils/trpc";
import { useSession } from "next-auth/react";
import Loading from "@/components/ui/Loading";
import { useTranslation } from "react-i18next";
import { FcBinoculars } from "react-icons/fc";

function basket() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const userId = session && +session?.user?.id;
  const {
    data: orders,
    isLoading,
    error,
  } = trpc.main.getOrdersById.useQuery({ userId }, { enabled: !!userId });
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };
  if (isLoading) return <Loading />;
  if (error) return <p>Error: {error.message}</p>;
  return (
    <div className="w-full">
      <Box>
        <div className="flex justify-between items-center mx-5">
          <div onClick={handleBack}>
            <FaArrowLeftLong />
          </div>
          <div className="flex rounded-full bg-gradient-to-tr shadow-xl shadow-purple-800 from-[#9E16BD] to-[#5F1470] p-3 items-center text-center mr-2">
            <FaShoppingBasket size={34} className="text-gray-300" />
          </div>
          <div></div>
        </div>
        <h1 className=" font-PeydaBlack my-5">{t("rent.myCart")}</h1>
        {orders ? (
          orders.length > 0 ? (
            <div className="h-[55vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200">
              {orders
                .slice()
                .reverse()
                .map((i, index) => (
                  <div key={index}>
                    <TicketBasket data={i} />
                  </div>
                ))}
            </div>
          ) : (
            <h1 className="text-center font-bold mx-auto items-center">
              <FcBinoculars size={50} />{" "}
            </h1>
          )
        ) : (
          "loading"
        )}
      </Box>
    </div>
  );
}

export default basket;
