import React from "react"                 
                                    import { useTranslation } from "react-i18next";;
import Divider from "./divider";

function OrderTicketDetail({ value, text }) {
  return (
    <div>
      {" "}
      <div className=" flex justify-between items-center px-2  py-2 mt-3 ">
        <h2 className=" font-PeydaRegular text-lg">{value}</h2>
        <h2 className=" font-PeydaRegular text-lg">{text}</h2>
      </div>
      <Divider />
    </div>
  );
}

export default OrderTicketDetail;
