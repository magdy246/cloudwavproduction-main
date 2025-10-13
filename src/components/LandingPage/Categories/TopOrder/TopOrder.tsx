import { RiStarFill } from "@remixicon/react";
import { useEffect, useState } from "react";
import { axiosServices } from "../../../../utils/axios";
import { getImagePath } from "../../../../utils/functions";
import { Link } from "react-router-dom";
import OrderNowButton from "../../../OrderNowButton/OrderNowButton";

interface TTopOrderCards {
  profile_image: string;
  user: {
    type: string;
    role: string;
  };
  name: string;
  type: string;
  role: string;
  rate: number;
  id: string;
  date: string;
  private_price: number;
}

function TopOrderCard({ card }: { card: TTopOrderCards }) {
  return (
    <section className="bg-white rounded-xl border-[#B5B5C3] border-1 relative">
      <div className="pt-7 px-3">
        <Link to={`orders/${card.id}`} className="image rounded-xl overflow-hidden h-50">
          <img
            src={getImagePath(card.profile_image)}
            alt="TopOrderImage"
            loading="lazy"
            className="size-60 mt-2"
          />
        </Link>
        <div className="mt-6 flex items-center justify-between">
          {/* <p className="bg-[#EFEFF2] px-3 py-2 font-medium text-[18px] rounded-full">
            {card.user.role}
          </p> */}
        
        </div>
        <div className="flex items-center justify-between mt-3">
          <h3 className="text-xl font-semibold truncate ">{card.name}</h3>
          <div className="flex items-center gap-1 absolute top-2 transform -translate-x-1/2 left-1/2">
            <RiStarFill color="gold" />
            <p className="text-[#7F7E97] text-center">
              ({card.rate} Reviews)
            </p>
          </div>
          
        </div>
        <p className="mt-4">
            <span className="text-purple text-[18px] font-semibold">
              ${card.private_price}
            </span>
          </p>
        <div className="mt-4 pb-4">
          
            <OrderNowButton orderInfo={card} />
        </div>
      </div>
    </section>
  );
}

export default function TopOrder() {
  const [topOrderCards, setTopOrderCards] = useState<TTopOrderCards[]>([]);
  
  const getTopOrderLists = async () => {
    try {
      const res = await axiosServices.get("/top-video-creators");
      // Slice to only get top 4 if there are more items
      const top4 = res.data.slice(0, 4);
      setTopOrderCards(top4);
      console.log("Top 4 creators loaded:", top4);
    } catch (error) {
      console.error("Error fetching top video creators:", error);
      setTopOrderCards([]);
    }
  };
  
  useEffect(() => {
    getTopOrderLists();
  }, []);

  return (
    <div className="mt-18">
      <div className="flex items-center justify-between">
        <h6 className="text-4xl">Top 4</h6>
      </div>
      {/* cards */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {topOrderCards.map((card, i) => (
          <TopOrderCard card={card} key={i} />
        ))}
      </div>
    </div>
  );
}