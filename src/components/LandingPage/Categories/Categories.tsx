import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/swiper-bundle.css';
// import 'swiper/css/navigation';
// import 'swiper/css/pagination';
import contentCreatorImage from "../../../assets/images/CategoriesImage/contentCreators.svg";
import actorImage from "../../../assets/images/CategoriesImage/actor.svg";
import athletesImage from "../../../assets/images/CategoriesImage/athletes.svg";
import youtuberImage from "../../../assets/images/CategoriesImage/youtuber.svg";
import musicianImage from "../../../assets/images/CategoriesImage/musician.svg";
import publicImage from "../../../assets/images/CategoriesImage/puplic.jpg";
import tiktokImage from "../../../assets/images/CategoriesImage/tiktok.jpg";
import AnimationLink from "../../AnimationLink/AnimationLink";
import MostOrdered from "./MostOrder/MostOrder";
import TopOrder from "./TopOrder/TopOrder";
import JoinUs from "../../../pages/Orders/JoinUs";

interface TCategoriesType {
  src: string;
  name: string;
  route: string;
}

function CategoryItem({ cat }: { cat: TCategoriesType }) {
  return (
    <div className="flex flex-col items-center">
      <AnimationLink to={`/SingleOrder/${cat.route}`} className="flex flex-col items-center">
        <div className="bg-[#484848] rounded-full overflow-hidden w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-[170px] lg:h-[170px] flex items-center justify-center">
          <img src={cat.src} alt={cat.name} className="md:w-30 md:h-30 w-20 h-20 rounded-full object-cover object-top" />
        </div>
        <p className="text-base sm:text-lg md:text-xl text-center underline font-medium mt-3">{cat.name}</p>
      </AnimationLink>
    </div>
  );
}

export default function Categories() {
  const { t } = useTranslation();
  const [slidesPerView, setSlidesPerView] = useState(3);

  // Update slides per view based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlidesPerView(2);
      } else if (window.innerWidth < 1024) {
        setSlidesPerView(3);
      } else {
        setSlidesPerView(5);
      }
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const categoriesType: TCategoriesType[] = [
    {
      src: actorImage,
      name: t("Actors"),
      route: "Actor",
    },
    {
      src: musicianImage,
      name: t("Musicians"),
      route: "Musician",
    },
    {
      src: contentCreatorImage,
      name: t("Content_creators"),
      route: "Content creator",
    },
    {
      src: youtuberImage,
      name: t("youtubers"),
      route: "youtuber",
    },
    {
      src: athletesImage,
      name: t("Athlete"),
      route: "Athlete",
    },
    {
      src: publicImage,
      name: t("public_figure"),
      route: "top-video-creators-all",
    },
    {
      src: tiktokImage,
      name: t("Tiktokers"),
      route: "Tiktok",
    },
  ];

  return (
    <section className="mt-16 md:mt-24 lg:mt-section-margin bg-green-100 pt-8 md:pt-12 pb-16 md:pb-section-margin">
      <div className="container px-4 md:px-6">
        {/* categories type */}
        <div>
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center">
            {t("Personalized")}
          </h3>

          <div className="mt-10 md:mt-16 lg:mt-section-margin">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={slidesPerView}
              // navigation
              pagination={{ clickable: true }}
              className="categories-swiper"
            >
              {categoriesType.map((cat, i) => (
                <SwiperSlide key={i}>
                  <CategoryItem cat={cat} />
                </SwiperSlide>
              ))}
              {/* <SwiperSlide> */}
              {/* </SwiperSlide> */}
            </Swiper>
                <JoinUs />
          </div>
        </div>

        {/* Add custom styles for swiper */}
        <style>{`
          .categories-swiper {
            padding-bottom: 50px;
          }
          :global(.swiper-button-next),
          :global(.swiper-button-prev) {
            color: #22c55e;
          }
          :global(.swiper-pagination-bullet-active) {
            background: #22c55e;
          }
        `}</style>

        {/* most order */}
        <MostOrdered />

        {/* top order */}
        <TopOrder />
      </div>
    </section>
  );
}