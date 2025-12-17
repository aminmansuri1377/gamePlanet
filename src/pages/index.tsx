import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
// import Loading from "@/components/ui/Loading";
import genc from "../../public/models/genc.gif";
import ast from "../../public/models/33.png";
import Image from "next/image";
import DeviceCard from "@/components/ui/DeviceCard";

const WelcomePage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    data: products,
    isLoading,
    error,
  } = trpc.main.getProducts.useQuery(undefined, {
    retry: false,
  });

  const handleSinglePage = (productName: string) => {
    if (!productName) return; // Don't navigate if no product
    router.push({ pathname: "/singlePage", query: { product: productName } });
  };

  if (error) {
    if (error.data?.httpStatus === 500) {
      return (
        <div>
          <Image
            src={ast}
            alt="genc"
            className=" my-10 scale-110"
            loading="lazy"
          />
          <DeviceCard product="" info="no data" isError />
        </div>
      );
    }
    return <p>Error: {error.message}</p>;
  }

  // Show models when there are no products
  if (!isLoading && (!products || products.length === 0)) {
    return (
      <div>
        <h1 className=" font-PeydaBlack text-center [word-spacing:5px] my-5">
          {t("rent.ps5AndXboxRental")}{" "}
        </h1>
        <Image
          src={ast}
          alt="genc"
          className=" my-10 scale-110"
          loading="lazy"
        />
        <div onClick={() => handleSinglePage("")}>
          <DeviceCard product="" info="No products available" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className=" font-PeydaBlack text-center [word-spacing:5px] my-5">
        {t("rent.ps5AndXboxRental")}{" "}
      </h1>
      <Image src={ast} alt="genc" className=" my-10 scale-110" loading="lazy" />
      <div>
        {products?.map((product) => (
          <div key={product.id} onClick={() => handleSinglePage(product.name)}>
            <DeviceCard product={product?.name} info={product?.info} />
          </div>
        ))}
      </div>
    </div>
  );
};
export default WelcomePage;
