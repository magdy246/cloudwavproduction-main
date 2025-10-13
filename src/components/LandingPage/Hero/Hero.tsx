import { RiArrowRightSLine } from "@remixicon/react";
import HeroImage from "../../../assets/images/Hero.svg";
import AnimationLink from "../../AnimationLink/AnimationLink";
import { useTranslation } from "react-i18next";

export default function Hero() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen -mt-(--header-height) relative flex items-center justify-center">
      {/* Hero image */}
      <div className="image absolute top-0 left-0 w-full h-full z-0">
        <div className="overlay absolute inset-0 bg-black bg-opacity-40" />
        <img 
          src={HeroImage} 
          alt="Hero background"
          className="object-cover w-full h-full" 
        />
      </div>
      
      {/* text */}
      <div className="relative px-4 sm:px-6 md:px-8 max-w-4xl mx-auto">
        <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-[64px] font-hero font-normal text-white text-center leading-tight md:leading-snug lg:leading-20">
        {t("intro")}          
          {/* <span className="block sm:inline">world is tuned in</span> */}
        </h3>
        
        <AnimationLink to="/playing" className="flex items-center justify-center w-full sm:w-64 md:w-72 lg:w-79 h-12 sm:h-14 md:h-16 lg:h-20 rounded-[50px] bg-white mx-auto text-lg sm:text-xl md:text-2xl font-semibold gap-2 mt-6 md:mt-8 lg:mt-13 transition-transform hover:scale-105">
        {t("playing")}
                  <RiArrowRightSLine size={24} className="h-6 w-6 md:h-8 md:w-8 lg:h-12 lg:w-12" />
        </AnimationLink>
      </div>
    </div>
  );
}