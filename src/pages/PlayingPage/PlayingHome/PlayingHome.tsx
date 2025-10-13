import clsx from "clsx";
import bannerImage from "../../../assets/images/dashboard/dashboardHomeImage/banner.svg";
import AnimationLink from "../../../components/AnimationLink/AnimationLink";
import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { RiCloseLine, RiSideBarLine } from "@remixicon/react";
import Header from "../../../components/Header/Header";
import { useTranslation } from "react-i18next";

function Banner() {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-400">
      <div className="container flex-center flex-col md:flex-row text-white py-5 md:py-0">
        <div className="image">
          <img
            src={bannerImage}
            alt={t("banner_image")}
            className="h-[250px] w-full object-cover"
          />
        </div>
        {/* text */}
        <div className="text text-center">
          <h3 className="text-3xl font-bold">
            {t("music_platform")}{" "}
            <span className="text-green-500">{t("join_our_platform")}</span>
          </h3>
          <p className="text-xl font-medium text-center mt-6">
            {t("platform_description_1")}
            <br />
            {t("platform_description_2")}
            <br />
            {t("platform_description_3")}
          </p>
          <AnimationLink
            to="/join-us"
            className="h-[50px] w-[180px] mx-auto flex-center text-2xl font-semibold mt-6 bg-green-500 rounded-full"
          >
            {t("join_us_now")}
          </AnimationLink>
        </div>
      </div>
    </div>
  );
}

function AsideBar({
  showSidebar,
  setShowSidebar,
}: {
  showSidebar: boolean;
  setShowSidebar: (prev: boolean) => void;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isAr = lang === "ar";

  const currentPath = useLocation().pathname;
  // const [searchParams] = useSearchParams();
  console.log(currentPath);
  const categories = [
    {
      title: t("browse"),
      style:
        "mt-2 pl-3 text-nowrap font-semibold text-[#141414] hover:bg-[#959595] hover:text-white transition-colors rounded w-full",
      list: [
        {
          label: t("home"),
          href: "",
        },
        {
          label: t("trending_songs"),
          href: "trending-songs",
        },
        {
          label: t("trending_albums"),
          href: "trending-albums",
        },
        {
          label: t("recently_added"),
          href: "recently-added",
        },
      ],
    },
    {
      title: t("browse"),
      style:
        "mt-2 pl-3 text-nowrap font-semibold text-[#141414] hover:bg-[#959595] hover:text-white transition-colors rounded w-full",
      list: [
        {
          label: t("top_songs"),
          href: "top-songs",
        },
        {
          label: t("top_albums"),
          href: "top-albums",
        },
        {
          label: t("top_supported"),
          href: "top-supported",
        },
      ],
    },
    {
      title: t("genres"),
      style:
        "rounded-full text-nowrap w-fit p-[13px] border-2 border-[#252525] font-semibold hover:border-green-500 transition-colors ",
      list: [
        {
          label: t("all_genres"),
          href: "trending-songs",
        },
        {
          label: t("shaapey"),
          href: "division/shaapey",
        },
        {
          label: t("rap"),
          href: "division/Rap",
        },
        {
          label: t("hip_hop"),
          href: "division/pop",
        },
        {
          label: t("blues"),
          href: "division/Blues",
        },
        {
          label: t("rock"),
          href: "division/Rock",
        },
        {
          label: t("mahrgnat"),
          href: "division/Mahraganat",
        },
        {
          label: t("Jazz"),
          href: "division/Orchestra",
        },
        {
          label: t("Sonata"),
          href: "division/Sonata",
        },
        {
          label: t("Symphony"),
          href: "division/Symphony",
        },
        {
          label: t("Orchestra"),
          href: "division/Orchestra",
        },
        {
          label: t("Concerto"),
          href: "division/Concerto",
        },
      ],
    },
  ];

  return (
    <aside
      className={clsx(
        showSidebar && `pl-11 max-w-full -z-10`,
        `h-full md:max-h-screen ${
          isAr ? "pr-11 md:pr-11 pl-0" : "pl-0 md:pl-11"
        } overflow-y-scroll shrink-0 ${
          isAr ? "right-[-50px]" : "left-0"
        } fixed md:sticky top-0 bg-white transition-all max-w-0 md:max-w-89 z-20`
      )}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* mobile aside  */}
      {/* close  */}
      <button
        className={`absolute w-6 h-6 cursor-pointer ${
          isAr ? "left-2" : "right-2"
        } top-7 block md:hidden`}
        onClick={() => setShowSidebar(false)}
      >
        <RiCloseLine />
      </button>
      {/*  */}
      {categories.map((category, idx) => (
        <div key={idx}>
          <h5 className="text-green-500 font-bold text-[28px] mt-4">
            {category.title}
          </h5>
          <ul className="flex flex-wrap gap-3">
            {category.list.map((li, i) => (
              <li
                key={i}
                className={clsx(
                  category.style,
                  currentPath === "/playing/" + li.href &&
                    "bg-[#959595] text-white"
                )}
              >
                <AnimationLink to={li.href} className="block">
                  {li.label}
                </AnimationLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}

function ScrollerHeader({
  showSidebar,
  setShowSidebar,
}: {
  setShowSidebar: (prev: boolean) => void;
  showSidebar: boolean;
}) {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const isAr = lang === "ar";

  return (
    <header
      className={clsx(
        "sticky top-0 w-full bg-white p-3 shadow-xl block md:hidden transition-opacity",
        showSidebar ? "opacity-0 -z-10" : "opacity-100 z-0"
      )}
      dir={isAr ? "rtl" : "ltr"}
    >
      <button
        className={`w-6 h-6 cursor-pointer ${
          isAr ? "float-right" : "float-left"
        }`}
        onClick={() => setShowSidebar(true)}
      >
        <RiSideBarLine />
      </button>
    </header>
  );
}

export default function PlayingHome() {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const isAr = lang === "ar";

  const aSidebarWidth = 356;
  const [showSidebar, setShowSidebar] = useState<boolean>(false);

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <Header type="dashboard" />
      <div>
        <Banner />
        <div className="flex relative">
          <AsideBar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
          <div
            className={`flex-1 max-w-full md:max-w-[calc(100%-${aSidebarWidth}px] ${
              isAr ? "mr-auto" : "ml-auto"
            } overflow-hidden`}
          >
            {/* hide show aside bar icon */}
            <ScrollerHeader
              setShowSidebar={setShowSidebar}
              showSidebar={showSidebar}
            />
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
