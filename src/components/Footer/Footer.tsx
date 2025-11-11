import React from 'react';
import logo from "../../assets/images/logo.svg";
import {
  RiFacebookFill,
  RiInstagramLine,
  RiTwitterFill,
  RiYoutubeFill,
  // RiWordpressFill,
} from "@remixicon/react";
import { Link } from 'react-router-dom';
import AnimationLink from "../AnimationLink/AnimationLink";
import { useTranslation } from "react-i18next";
import {  FaWhatsapp } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

// Define TypeScript interfaces for our data
interface LinkItem {
  name: string;
  href: string;
}

interface ContactItem extends LinkItem {
  value: string;
}

interface SocialItem {
  Logo: React.ComponentType;
  href: string;
}

interface FooterData {
  learnMore: LinkItem[];
  privacy: LinkItem[];
  contact: ContactItem[];
  social: SocialItem[];
  service: LinkItem[];
}

const Footer: React.FC = () => {
  const { t } = useTranslation();
  
  // Footer data
  const footerData: FooterData = {
    learnMore: [
      { name: t("Home"), href: "/" },
      // { name: t("service"), href: "/service" },
      { name: t("pricing"), href: "/pricing" },
      { name: t("faqs"), href: "/Faqs" },
      { name: t("contactus"), href: "/contact" },
    ],
    privacy: [
      { name: t("terms_of_use"), href: "/terms-of-use" },
      { name: t("policyf"), href: "/Policy" },
      // { name: t("policy"), href: "/policy" },
    ],
    service :[
      { name: t("services_1"), href: "services/Music_distribution" },
      { name: t("services_2"), href: "services/Platform_Management" },
      { name: t("services_3"), href: "services/Social_media" },
      // { name: t("services_4"), href: "/Social_media" },
    ],
    contact: [
      // { name: t("hotel_reservation"), value: "123-456-7890", href: "tel:1234567890" },
      { name: t("office"), value: "+201006695204", href: "tel:01055030045" },
    ],
    social: [
      { Logo: RiFacebookFill, href: "https://www.facebook.com/share/18i8rogaB7/?mibextid=qi2Omg" },
      { Logo: RiInstagramLine, href: "https://www.instagram.com/cloud.wav.production" },
      { Logo: RiTwitterFill, href: "https://x.com/cloudwavpr" },
      { Logo: RiYoutubeFill, href: "https://youtube.com/@cloudwavproduction?si=L0uXUZSaJ5iGwOaI" },
      // { Logo: RiWordpressFill, href: "#" },
    ],
  };

  return (
    <footer className="overflow-hidden bg-footer  py-8 px-4 md:py-12 md:px-6 lg:py-16 lg:px-8">
      <div className="container mx-auto max-w-screen-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-14">
          {/* Logo */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center">
              <img src={logo} className="max-w-[180px] h-auto" alt="Logo" />
            </Link>
          </div>

          {/* Learn More */}
          <div>
            <p className="text-[18px] font-bold text-white uppercase mb-6">
              {t("learn_more")}
            </p>
            <ul className="text-gray-500 font-medium">
              {footerData.learnMore.map((item, index) => (
                <li className="mb-4" key={index}>
                  <AnimationLink to={item.href} className="hover:underline hover:text-[#30B797] transition">
                    {item.name}
                  </AnimationLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Privacy */}
          <div>
            <p className="text-[18px] font-bold text-white uppercase mb-6">
              {t("service")}
            </p>
            <ul className="text-gray-500 font-medium">
              {footerData.service.map((item, index) => (
                <li className="mb-4" key={index}>
                  <AnimationLink to={item.href} className="hover:underline hover:text-[#30B797] transition">
                    {item.name}
                  </AnimationLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[18px] font-bold text-white uppercase mb-6">
              {t("contact_us")}
            </p>
            <ul className="text-gray-500 font-medium">
              {footerData.contact.map((item, index) => (
                <li className="mb-4 hover:text-[#30B797] transition" key={index}>
                  <a href={item.href}>
                    {item.name}: {item.value}
                  </a>
                </li>
              ))}
              <li className="mb-4">
                <a href="http://wa.me/01055030045" className="flex items-center gap-2 hover:text-[#30B797] transition">
                  <span className="text-[16px]"><FaWhatsapp/></span>
                  <span>+201006695204</span>
                </a>
              </li>
              <li className="mb-4">
                <a href="mailto:support@cloudwavproduction.com" className="flex items-center gap-2 hover:text-[#30B797] transition">
                  <span className="text-[16px]"><MdEmail />
                  </span>
                  <span>support@cloudwavproduction.com</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <p className="text-[18px] font-bold text-white uppercase mb-6">
              {t("social")}
            </p>
            <ul className="flex flex-wrap gap-4">
              {footerData.social.map((item, index) => (
                <li className="text-[14px] font-medium text-gray-500 mb-2" key={index}>
                  <a 
                    href={item.href} 
                    className="text-2xl hover:text-[#29a49f] transition-colors" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <item.Logo />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        
        <div className="flex items-center justify-between ">
          <div className="text-sm text-white sm:text-center ">
            © 2025 <AnimationLink to={'/'} className="hover:underline">Cloud.wav</AnimationLink>. {t("all_rights_reserved")}
          </div>
          <div className="text-white font-medium flex gap-5">
              {footerData.privacy.map((item, index) => (
                <div className="mb-4" key={index}>
                  <AnimationLink to={item.href} className="hover:underline hover:text-[#30B797] transition">
                    {item.name}
                  </AnimationLink>
                </div>
              ))}
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;