import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { trpc } from "../../../../utils/trpc";
import Box from "@/components/Box";
import CustomButton from "@/components/ui/CustomButton";
import Loading from "@/components/ui/Loading";
import useAuthRedirect from "@/components/hooks/useAuthRedirect";
import { FaArrowLeftLong } from "react-icons/fa6";
import { AiTwotoneDelete } from "react-icons/ai";

const products = () => {
  const router = useRouter();
  const handleBack = () => {
    router.back();
  };
  const { data: products, isLoading, error } = trpc.main.getProducts.useQuery();
  const deleteProductMutation = trpc.main.deleteProduct.useMutation();

  const { t } = useTranslation();

  const { isAuthenticated, isMounted } = useAuthRedirect();

  if (!isMounted) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) return <Loading />;
  if (error) return <p>Error: {error.message}</p>;

  const handleSinglePage = (productName: string) => {
    router.push({
      pathname: "/dashboard/products/UpdateProductForm",
      query: { product: productName },
    });
  };
  const handleDeleteProduct = async (id) => {
    await deleteProductMutation.mutateAsync({ id });
    router.reload();
  };
  return (
    <div>
      <div onClick={handleBack}>
        <FaArrowLeftLong />
      </div>
      <div>
        {products?.map((product) => (
          <div key={product.id} className=" flex text-center items-center">
            <div onClick={() => handleSinglePage(product.name)}>
              <Box>
                <h1 className="font-PeydaBold text-center text-lg">
                  {product.info}
                </h1>
              </Box>
            </div>
            <AiTwotoneDelete
              size={30}
              onClick={() => handleDeleteProduct(product.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default products;
