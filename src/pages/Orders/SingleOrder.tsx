import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { FcPrevious, FcNext } from "react-icons/fc";
// import musicbg from "../../assets/img/musicbg.png";
import { Helmet } from "react-helmet";
import { Link, useParams } from "react-router-dom";
import { axiosServices } from "../../utils/axios";
import { useTranslation } from "react-i18next";
import OrderNowButton from "../../components/OrderNowButton/OrderNowButton";

// Define types for our data
interface Order {
  id: string;
  name: string;
  artist: string;
  position: string;
  bussiness_price: number;
  private_price: number;
  image: string;
  description?: string;
  duration?: string;
  category?: string;
  tags?: string[];
}

interface OrderVideoBoxProps {
  order: Order;
  handleVideoClick: (order: Order) => void;
}

// OrderVideoBox Component
const OrderVideoBox: React.FC<OrderVideoBoxProps> = ({
  order,
  // handleVideoClick,
}) => {
  const { t } = useTranslation();
  return (
    <Link
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-xl"
      to={`/orders/${order.id}`}
    >
      <div className=" overflow-hidden px-4">
        <div className="flex justify-between items-center">
          <img
            src={order.image}
            alt={order.name}
            className="w-16 h-16 rounded-full  object-cover"
          />
          <OrderNowButton orderInfo={order} />
        </div>
        <div className="w-full p-3">
          <p className=" font-semibold">{order.name}</p>
          <p className="text-[#30B797] text-sm mt-2">{order.position}</p>
        </div>
      </div>
      <div className="p-4">
        <div className="flex flex-col">
          <p className="font-bold flex gap-1  text-[#30B797]">
            {t("average_video_price")} {order.private_price}
          </p>
          <p className="font-bold flex gap-1 text-[#30B797]">
            {t("business_video")} {order.bussiness_price}
          </p>
        </div>
      </div>
    </Link>
  );
};

// Main Video Service Component
const SingleOrder: React.FC = () => {
  // State declarations
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [, setOpenModel] = useState<boolean>(false);
  const [, setOrderInfo] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [creatorsData, setCreatorsData] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const { OrderName } = useParams();
  // console.log("OrderName", OrderName);
  console.log("creatorsData", creatorsData);

  // Pagination configuration
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  // Function to fetch data for each division
  const fetchCreators = async () => {
    try {
      const response = await axiosServices.get(
        OrderName == "top-video-creators-all"
          ? `/top-video-creators-all`
          : `/top-video-creators-division/${OrderName}`
      );
      // console.log("response", response);

      // Process the data to add price and position if needed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const processedData = (
        response.data.data ? response.data.data : response.data
      ).map((creator: any) => ({
        ...creator,
        bussiness_price: creator.bussiness_price, // Random price if not provided
        private_price: creator.private_price, // Random price if not provided
        position: creator.division,
        description:
          creator.description || `Custom content created by ${creator.name}.`,
        duration: creator.duration || "3-5 minutes",
        category: creator.category || OrderName,
        image: `https://api.cloudwavproduction.com/storage/${creator.profile_image}`,
        tags: creator.tags || [OrderName?.toLowerCase(), "creator", "content"],
      }));
      console.log("processedData", processedData);
      setCreatorsData(processedData);
      setOrders(processedData);
      setFilteredOrders(processedData);
      // setFilteredCreators(processedData);
      // setError(null);
    } catch (err) {
      console.error("Error fetching creators:", err);
      // setError('Failed to load creators. Please try again later.');
    }
  };
  // Sample data (in a real app, this would likely come from an API)
  useEffect(() => {
    fetchCreators();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter orders based on search term
  useEffect(() => {
    const filtered = orders.filter(
      (order) =>
        order.artist?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
        order.position?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
        (order?.category &&
          order.category?.toLowerCase().includes(searchTerm?.toLowerCase()))
    );

    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, orders]);

  // Get current page items
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedOrders = filteredOrders.slice(startIndex, endIndex);

  // Pagination handlers
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Modal handlers
  const handleVideoClick = (order: Order) => {
    setOrderInfo(order);
    setOpenModel(true);
  };

  // Direction detection for right-to-left languages
  const isRTL = document.documentElement.dir === "rtl";

  return (
    <>
      <Helmet>
        <title>Video Service | Could.wav</title>
      </Helmet>

      <div className={`py-20 bg-white relative`}>
        <div className="container mx-auto px-4">
          {/* <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              Video Services
            </h1>
            <p className="text-gray-600">
              Browse our collection of premium video services from top creators
            </p>
          </div> */}

          <div className="w-full px-4 py-3 rounded-lg mb-6 bg-[#F4F5F7] flex flex-row gap-2 items-center text-gray-500 border border-gray-200">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by artist, position, or category..."
              className="rounded-lg w-full border-0 outline-0 bg-[#F4F5F7] placeholder-gray-400"
              dir={isRTL ? "rtl" : "ltr"}
            />
          </div>

          {displayedOrders.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
              {displayedOrders.map((order) => (
                <OrderVideoBox
                  key={order.id}
                  order={order}
                  handleVideoClick={handleVideoClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-5xl mb-4 opacity-30">🔍</div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                No matching results
              </h3>
              <p className="text-gray-500">
                {isRTL
                  ? "لا توجد منتجات مطابقة للبحث"
                  : "Try adjusting your search criteria"}
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-12 gap-4">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`p-2 flex items-center justify-center text-xl cursor-pointer border border-[#30B797] rounded-full w-10 h-10 transition-colors
                  ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200"
                      : "hover:bg-white hover:text-[#30B797] bg-[#30B797] text-white"
                  }`}
                aria-label="Previous Page"
              >
                <FcPrevious className={currentPage === 1 ? "opacity-50" : ""} />
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors
                      ${
                        currentPage === i + 1
                          ? "bg-[#30B797] text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`p-2 flex items-center justify-center text-xl cursor-pointer border border-[#30B797] rounded-full w-10 h-10 transition-colors
                  ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200"
                      : "hover:bg-white hover:text-[#30B797] bg-[#30B797] text-white"
                  }`}
                aria-label="Next Page"
              >
                <FcNext
                  className={currentPage === totalPages ? "opacity-50" : ""}
                />
              </button>
            </div>
          )}
        </div>

        {/* {openModel && (
          <OrderVideoModal
            handleClose={() => setOpenModel(false)}
            orderInfo={orderInfo}
          />
        )} */}
      </div>
    </>
  );
};

export default SingleOrder;
