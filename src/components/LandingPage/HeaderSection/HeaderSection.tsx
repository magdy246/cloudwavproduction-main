import { useState, useEffect } from "react";
import HeaderSectionImage from "../../../assets/images/HeaderSection.svg";
import { RiMusic2Line, RiArrowRightDownLine } from "@remixicon/react";
import card_1 from "../../../assets/images/heaserSectionImages/card-1.svg";
import card_2 from "../../../assets/images/heaserSectionImages/card-2.svg";
import card_3 from "../../../assets/images/heaserSectionImages/card-3.svg";
import { useTranslation } from "react-i18next";
import AnimationLink from "../../AnimationLink/AnimationLink";

interface CardT {
  src: string;
  title: string;
  body: string;
  alt: string;
}

function HeaderSectionCards({ card }: { card: CardT }) {
  return (
    <div className="shadow-2xl rounded-3xl pt-[35px] pb-4 pl-6 pr-4 bg-white h-full">
      <div className="image">
        <img
          src={card.src}
          loading="lazy"
          alt={card.alt}
          className="max-w-full"
        />
      </div>
      <div className="text mt-6">
        <h5 className="text-lg md:text-xl font-semibold ">{card.title}</h5>
        <p className="text-sm md:text-base font-normal mt-2 max-w-57">
          {card.body}
        </p>
      </div>
    </div>
  );
}

export default function HeaderSection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkScreenSize();

    // Add event listener
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);
  const { t } = useTranslation();

  const cards = [
    {
      src: card_1,
      alt: "card1",
      title: t("joinus1"),
      body: t("joinus1p"),
    },
    {
      src: card_2,
      alt: "card2",
      title: t("joinus2"),
      body: t("joinus2p"),
    },
    {
      src: card_3,
      alt: "card3",
      title: t("joinus3"),
      body: t("joinus3p"),
    },
    {
      src: card_1,
      alt: "card1",
      title: t("joinus4"),
      body: t("joinus4p"),
    },
  ];

  return (
    <div className="header-section mt-16 md:mt-30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10 mb-10 md:-mb-19 relative">
          {/* the text */}
          <div className="flex-1">
            <h4 className="text-2xl md:text-3xl lg:text-[32px] font-bold text-center md:text-left">
              {t("joinush")}{" "}
              <RiMusic2Line
                className="inline-block ml-2"
                size={isMobile ? 30 : 40}
              />
            </h4>
            <p className="text-base md:text-lg lg:text-xl text-[#4F4F4F] font-normal mt-2 text-center md:text-left">
              {t("joinusp")}
            </p>
            <div className="button-container mt-8 md:mt-17 relative w-fit mx-auto md:mx-0">
              <AnimationLink
                to={"/contact"}
                className="flex items-center justify-center gap-3 gradient h-14 md:h-[75px] w-48 md:w-[237px] rounded-[30px] border-2 border-[#89DB7B] text-lg md:text-xl font-semibold text-white"
              >
                {t("joinNow")}{" "}
                <RiArrowRightDownLine
                  color="white"
                  size={isMobile ? 24 : 30}
                  strokeWidth={10}
                />
              </AnimationLink>
              <div className="circle w-20 h-20 md:w-[113px] md:h-[113px] rounded-full overflow-hidden absolute top-1/2 -translate-y-1/2 -right-10 md:-right-[50px] -z-10">
                {Array(16)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="bg-[#fce5dd] h-[5px] mb-[3.5px]"
                    ></div>
                  ))}
              </div>
            </div>
          </div>

          {/* the image container */}
          <div className="image-container relative mt-10 md:mt-0 max-md:h-full max-md:w-full">
            {/* the gradient container */}
            <div className="gradient w-full md:w-[400px] lg:w-[592.89px] h-[300px] md:h-[400px] lg:h-[517.45px] rounded-tl-[80px] rounded-tr-[80px] md:rounded-tl-[132.34px] md:rounded-tr-[132.34px]" />
            {/* image */}
            <div className="image absolute top-0 ">
              <img
                src={HeaderSectionImage}
                loading="lazy"
                alt="header-section-img"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* header section cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 z-10 relative">
          {cards.map((card, i) => (
            <HeaderSectionCards card={card} key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
