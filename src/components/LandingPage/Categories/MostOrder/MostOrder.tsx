import {
  RiArrowLeftSLine,
  RiStarFill
} from "@remixicon/react";
import { axiosServices } from "../../../../utils/axios";
import { useEffect, useState } from "react";
import { getImagePath } from "../../../../utils/functions";
import OrderNowButton from "../../../OrderNowButton/OrderNowButton";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
interface TMostOrderList {
  profile_image: string;
  user: {
    type: string;
    role: string;
  };
  name: string;
  type: string;
  role: string;
  rate: number;
  id: string,
  date: string;
  private_price: number;
}

function MostOrderList({ list }: { list: TMostOrderList }) {
  const { t } = useTranslation();
  return (
    <section className="bg-white rounded-xl border-[#B5B5C3] border-1 relative">
      <div className="pt-7 px-3">
        <Link to={`orders/${list.id}`} className="image rounded-xl overflow-hidden h-50">
          <img
            src={getImagePath(list.profile_image)}
            alt="TopOrderImage"
            loading="lazy"
            className="size-60 my-2  "
          />
        </Link>
        <div className="mt-6 flex items-center justify-between">
          {/* <p className="bg-[#EFEFF2] px-3 py-2 font-medium text-[18px] rounded-full">
            {list.user.role}
          </p> */}
        
        </div>
        <div className="flex items-center justify-between mt-3">
          <h3 className="text-xl font-semibold  truncate">{list.name}</h3>
          <div className="flex items-center gap-1 absolute top-2 transform -translate-x-1/2 left-1/2">
            <RiStarFill color="gold" />
            <p className="text-[#7F7E97] text-center ">
              ({list.rate} {t("Reviews")})
            </p>
          </div>
          
        </div>
        <p className="mt-4">
            <span className="text-purple text-[18px] font-semibold">
              ${list.private_price}
            </span>
          </p>
        <div className="mt-4 pb-4">
          
            <OrderNowButton orderInfo={list} />
        </div>
      </div>
    </section>
  );
}

export default function MostOrdered() {
  // const mostOrderLists: TMostOrderList[] = [
  //   {
  //     src: image1,
  //     name: "Amir Monzer amer",
  //     type: "Musician",
  //     role: "singer",
  //     rate: 4.5,
  //     date: "24/7",
  //     price: 5066,
  //   },
  //   {
  //     src: image2,
  //     name: "Amir Monzer amer",
  //     type: "Musician",
  //     role: "singer",
  //     rate: 4.5,
  //     date: "24/7",
  //     price: 5066,
  //   },
  //   {
  //     src: image3,
  //     name: "Amir Monzer amer",
  //     type: "Musician",
  //     role: "singer",
  //     rate: 4.5,
  //     date: "24/7",
  //     price: 5066,
  //   },
  //   {
  //     src: image4,
  //     name: "Amir Monzer amer",
  //     type: "Musician",
  //     role: "singer",
  //     rate: 4.5,
  //     date: "24/7",
  //     price: 5066,
  //   },
  //   {
  //     src: image1,
  //     name: "Amir Monzer amer",
  //     type: "Musician",
  //     role: "singer",
  //     rate: 4.5,
  //     date: "24/7",
  //     price: 5066,
  //   },
  // ];
 const [mostOrderLists, setMostOrderLists] = useState<TMostOrderList[]>([]);
  const getmMstOrderLists = async ()=>{
    const res = await axiosServices.get("/top-video-creators-all")
    setMostOrderLists(res.data)
    console.log(res.data);
    
  }
  useEffect(() => {
    getmMstOrderLists()
  }, [])

  return (
    <div className="mt-18">
      <div className="flex items-center justify-between">
        <h6 className="text-4xl">VIP</h6>
        <button className="w-10 h-10 rounded-full bg-[#7E7E7E] flex-center">
          <RiArrowLeftSLine color="white" size={35} />
        </button>
      </div>
      {/* card */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mostOrderLists.map((list, i) => (
          <MostOrderList list={list} key={i} />
        ))}
      </div>
    </div>
  );
}
