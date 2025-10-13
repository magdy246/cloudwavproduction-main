import { RiGlobalLine, RiMenuLine } from "@remixicon/react";
import { useTranslation } from "react-i18next";
import { useDashboard } from "../../../Providers/DashboardContext";
// import { useState } from "react";
export default function Header() {
  const {  i18n } = useTranslation();

  const {
    headerHeight,
    setDrawerMobile,
    setDrawerWidth,
    collapseDrawerWidth,
    fullDrawerWidth,
    setIsCollapse,
    sm
  } = useDashboard();

  const handleDrawerWidth = () => {
    if (sm) {
      setDrawerMobile(true);
    } else {
      setDrawerWidth((prev) =>
        collapseDrawerWidth == prev ? fullDrawerWidth : collapseDrawerWidth
      );
      setIsCollapse(prev=>!prev);
    }
  };

  // const
  return (
    <div
      className={`bg-main-color/20 py-2 px-5 text-black sticky top-0 w-full flex items-center justify-between backdrop-blur `}
      style={{ height: headerHeight }}
    >
      <button onClick={handleDrawerWidth}
        className="cursor-pointer"
      
      >
        <RiMenuLine size={20} />
      </button>

      <button
        onClick={() => i18n.changeLanguage(i18n.language == "en" ? "ar" : "en")}
        className="cursor-pointer"
      >
        <RiGlobalLine size={20} />
      </button>
    </div>
  );
}
