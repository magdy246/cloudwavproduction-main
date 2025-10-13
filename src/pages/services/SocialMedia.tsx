import React from "react";
import Kit from "../../assets/img/Kit.png";
import lamp from "../../assets/img/lamp.png";
import { MdCamera } from "react-icons/md";
import { IoMdRedo } from "react-icons/io";
import { RiThreadsLine } from "react-icons/ri";
// import { FaChevronRight } from "react-icons/fa";
// import Swal from "sweetalert2";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import SocialMediaForm from "./SocialMediaForm";
import CreatingplatformsForm from "./CreatingplatformsForm";
import RecoverForm from "./RecoverForm";
import SponsoredForm from "./SponsoredForm";

// Define TypeScript interfaces
interface ServiceItem {
  title: string;
  description: string;
  icon: any;
  price: string;
  form: any;
}

const SocialMedia: React.FC = () => {
  const { t } = useTranslation();

  const SocialMediaServices: ServiceItem[] = [
    {
      title: t("Creating_and_documenting_platforms"),
      description: t("Creating_and_documenting_platforms_desc"),
      icon: <MdCamera />,
      price: "20",
      form : <CreatingplatformsForm />
    },
    {
      title: t("Recover_closed_accounts"),
      description: t("Recover_closed_accounts_desc"),
      icon: <IoMdRedo />,
      price: "30",
      form : <RecoverForm />
    },
    {
      title: t("Create_sponsored_ads"),
      description: t("Create_sponsored_ads_desc"),
      icon: <RiThreadsLine />,
      price: "15",
      form : <SponsoredForm />
    },
  ];

  return (
    <>
      <Helmet>
        <title>Services Social Media | Cloud.wav</title>
      </Helmet>
      <div className="py-24">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row justify-center gap-8">
            <div className="w-full lg:w-1/2">
              <h1 className="text-6xl font-bold mb-4">
                {t("servisespage.title")}
              </h1>
              <p className="text-xl leading-10 mb-4">
                {t("servisespage.description")}
              </p>
              <SocialMediaForm /> 
            </div>
            <div className="w-full mt-4 lg:mt-0 lg:w-1/2">
              <img src={Kit} className="w-full" alt="Kit" />
            </div>
          </div>
          <div
            className="flex flex-col lg:flex-row justify-center lg:gap-44 gap-20"
            id="Sevrvices"
          >
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <h1 className="text-5xl font-bold mb-4">
                {t("servisespage.text1")}
              </h1>
              <p className="text-xl leading-5 mb-4">
                {t("servisespage.text2")}
              </p>
              <img src={lamp} className="mt-12" alt="Lamp" />
            </div>
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <ul className="mb-8">
                {SocialMediaServices.map((service, index) => (
                  <li
                    key={index}
                    className="flex md:flex-row flex-col items-center gap-6 mb-6"
                  >
                    <div className="flex items-center justify-center bg-[#30B797] p-8 rounded-2xl text-4xl text-white">
                      {service.icon}
                    </div>
                    <div className="flex flex-col text-center md:text-start">
                      <h2 className="text-3xl mb-2 font-bold">
                        {t(service.title)}
                      </h2>
                      <p className="text-sm">{t(service.description)}</p>
                      <div className="flex md:flex-row flex-col items-center font-bold gap-2">
                        <p className="font-bold">
                          {t("Prices_start_from")} ${service.price}
                        </p>
                        {service.form}
                      
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SocialMedia;
