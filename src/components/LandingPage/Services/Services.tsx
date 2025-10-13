import React from 'react';
import { useTranslation } from 'react-i18next';

import TikTokAgencyImg from '../../../assets/images/ServicesImages/image-4.svg';
import MusicDistributionImg from '../../../assets/images/ServicesImages/image-1.svg';
import PlatformManagement from '../../../assets/images/ServicesImages/image-3.svg';
import Socialmedia from '../../../assets/images/ServicesImages/image-2.svg';
import clothing from '../../../assets/images/ServicesImages/clothing.png';
import programming from '../../../assets/images/ServicesImages/robots.png';

import ServicesBox from './servicesBox';

interface ServiceType {
  id: number;
  title: string;
  description: string;
  img: string;
  link: string;
  bg: string;
  comingSoon?: boolean;
  facebook_Link?: string;
  instagram_Link?: string;
  tiktok_Link?: string;
}

const Services: React.FC = () => {
  const { t } = useTranslation();

  const getTextColor = (bgColor: string): string => {
    let r = 0, g = 0, b = 0;

    if (bgColor.startsWith("#")) {
      const hex = bgColor.slice(1);
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
      }
    } else if (bgColor.startsWith("rgb")) {
      const rgbValues = bgColor.match(/\d+/g);
      if (rgbValues) {
        [r, g, b] = rgbValues.map(Number);
      }
    }
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "black" : "white";
  };

  const ServicesD: ServiceType[] = [
    {
      id: 1,
      title: t("services_1"),
      description: t("services_1p"),
      img: MusicDistributionImg,
      link: "/Music_distribution",
      bg: "#6017DC",
    },
    {
      id: 2,
      title: t('services_2'),
      description: t('services_2p'),
      img: PlatformManagement,
      link: "/Platform_Management",
      bg: "#DFF7EA",
    },
    {
      id: 3,
      title: t('services_3'),
      description: t('services_3p'),
      img: Socialmedia,
      link: "/Social_media",
      bg: "#6017DC",
    },
    {
      id: 4,
      title: t('services_4'),
      description: t('services_4p'),
      img: clothing,
      link: "",
      facebook_Link: "https://m.facebook.com/61573739062609/",
      instagram_Link: "https://www.instagram.com/black_8_bear",
      tiktok_Link: "https://www.tiktok.com/@___blackbear",
      bg: "#DFF7EA",
    },
    {
      id: 5,
      title: t('services_5'),
      description: t('services_5p'),
      img: programming,
      link: "/",
      bg: "#6017DC",
      comingSoon: true
    },
    {
      id: 6,
      title: t('services_6'),
      description: t('services_6p'),
      img: TikTokAgencyImg,
      link: "https://servicesLInk",
      bg: "#29A49F",
      comingSoon: true
    }
  ];

  return (
    <div className={`py-20 bg-cover bg-white`}>
      <div data-aos="zoom-in" className="container m-auto">
        <p className='text-center font-bold text-xl text-[#29A49F] mb-4'>{t("Satisfy_Solution")}</p>
        <h2 className='text-center text-4xl font-bold mb-6'>{t("Satisfy_Solutionp")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 pt-12">
          {ServicesD.map((service, index) => (
            <div key={index} dir='ltr'>
              <ServicesBox
                key={service.id.toString()}
                bgColor={service.bg}
                textColor={getTextColor(service.bg)}
                title={service.title}
                description={service.description}
                link={service.link}
                img={service.img}
                comingSoon={service.comingSoon}
                facebook_Link={service.facebook_Link}
                instagram_Link={service.instagram_Link}
                tiktok_Link={service.tiktok_Link}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;