import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaCheck } from "react-icons/fa";

interface Plan {
  name: string;
  price: number;
  priceYearly?: number;
  priceMonthly?: number;
  features: string[];
}

interface PlansBoxProps {
  planName: string;
  MainPrice: number;
  addPrice: number;
  Features: string[];
  isRTL: boolean;
  period: "monthly" | "yearly";
}

const Pricing: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL: boolean = i18n.language === "ar";

  const [period, setPeriod] = useState<"Monthly" | "Yearly">("Monthly");

  const plans: { monthly: Plan[]; yearly: Plan[] } = {
    monthly: [
      {
        name: "plans.basic",
        price: 2,
        priceYearly: 15,
        features: [
          "plans.features.unlimited_listening",
          "plans.features.unlimited_download",
          "plans.features.no_ads",
          "plans.features.direct_download",
          "plans.features.easy_browsing",
        ],
      },
      {
        name: "plans.starter",
        price: 20,
        priceYearly: 200,
        features: [
          "plans.features.content_protection",
          "plans.features.revenue_security",
          "plans.features.artist_platform_protection",
          "plans.features.artist_profile",
          "plans.features.real_job_opportunities",
          "plans.features.no_ads",
          "plans.features.easy_browsing",
        ],
      },
      {
        name: "plans.pro_tune",
        price: 40,
        priceYearly: 425,
        features: [
          "plans.features.content_protection",
          "plans.features.revenue_security",
          "plans.features.artist_platform_protection",
          "plans.features.artist_profile",
          "plans.features.real_job_opportunities",
          "plans.features.exclusive_marketing",
          "plans.features.no_ads",
          "plans.features.easy_browsing",
        ],
      },
    ],
    yearly: [
      {
        name: "plans.basic",
        price: 15,
        priceMonthly: 2,
        features: [
          "plans.features.unlimited_listening",
          "plans.features.unlimited_download",
          "plans.features.no_ads",
          "plans.features.direct_download",
          "plans.features.easy_browsing",
        ],
      },
      {
        name: "plans.starter",
        price: 200,
        priceMonthly: 20,
        features: [
          "plans.features.content_protection",
          "plans.features.revenue_security",
          "plans.features.artist_platform_protection",
          "plans.features.artist_profile",
          "plans.features.real_job_opportunities",
          "plans.features.no_ads",
          "plans.features.easy_browsing",
        ],
      },
      {
        name: "plans.pro_tune",
        price: 425,
        priceMonthly: 40,
        features: [
          "plans.features.content_protection",
          "plans.features.revenue_security",
          "plans.features.artist_platform_protection",
          "plans.features.artist_profile",
          "plans.features.real_job_opportunities",
          "plans.features.exclusive_marketing",
          "plans.features.no_ads",
          "plans.features.easy_browsing",
        ],
      },
    ],
  };

  return (
    <>
      <div className="py-20" style={{ direction: isRTL ? "rtl" : "ltr" }}>
        <div className="container m-auto">
          <div className="flex items-center flex-col">
            <h1 className="text-4xl font-bold text-center">
              {t("pricing_title")}
            </h1>
            <p className="text-center text-lg text-black mt-8">
              {t("pricing_subtitle")}
            </p>

            {/* Period selector buttons */}
            <div className="flex justify-center items-center mt-12">
              <div
                className={`cursor-pointer transition border px-8 py-4 text-xl font-bold 
                                ${
                                  period === "Monthly"
                                    ? "bg-[#2F00AC] text-white"
                                    : "bg-[#B0E4D5] text-[#2F00AC]"
                                }
                                ${isRTL ? "rounded-r-2xl" : "rounded-l-2xl"}`}
                onClick={() => setPeriod("Monthly")}
              >
                {t("monthly")}
              </div>
              <div
                className={`cursor-pointer transition border px-8 py-4 text-xl font-bold 
                                ${
                                  period === "Yearly"
                                    ? "bg-[#2F00AC] text-white"
                                    : "bg-[#B0E4D5] text-[#2F00AC]"
                                }
                                ${isRTL ? "rounded-l-2xl" : "rounded-r-2xl"}`}
                onClick={() => setPeriod("Yearly")}
              >
                {t("yearly")}
              </div>
            </div>

            {/* Plan cards */}
            <div
              className={`grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-center mt-12 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {period === "Monthly"
                ? plans.monthly.map((plan, index) => (
                    <PlansBox
                      key={index}
                      planName={plan.name}
                      MainPrice={plan.price}
                      addPrice={plan.priceYearly || 0}
                      Features={plan.features}
                      isRTL={isRTL}
                      period="monthly"
                    />
                  ))
                : plans.yearly.map((plan, index) => (
                    <PlansBox
                      key={index}
                      planName={plan.name}
                      MainPrice={plan.price}
                      addPrice={plan.priceMonthly || 0}
                      Features={plan.features}
                      isRTL={isRTL}
                      period="yearly"
                    />
                  ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Plans Box Component (now internal to the same file)
const PlansBox: React.FC<PlansBoxProps> = ({
  planName,
  MainPrice,
  Features,
  isRTL,
  period,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={`flex flex-col p-8 bg-white border border-[#0000000D] shadow-xl rounded-xl
                ${isRTL ? "text-right" : "text-left"}`}
    >
      <h1 className="text-3xl font-bold mb-2">{t(planName)}</h1>
      <span className="w-full border border-gray-600 mb-6" />
      <h3 className="text-6xl font-bold mb-2">
        ${MainPrice}
        <span className="text-2xl">/{period === "monthly" ? "Mo" : "Yr"}</span>
      </h3>
      <button
        className="w-full mb-12 text-[#2F00AC] bg-[#E6F6F2] border border-[#B0E4D5] rounded-xl py-4 px-6
                    hover:bg-[#2F00AC] hover:text-[#E6F6F2] transition-all"
      >
        {t("plans.get_started")}
      </button>
      <span className="w-full border border-gray-600 mb-6" />
      <ul>
        {Features?.map((feature, index) => (
          <li key={index} className={`flex items-center text-lg mb-4 `}>
            <span>
              <FaCheck
                className={`text-[#2F00AC] ${isRTL ? "ml-2" : "mr-2"}`}
              />
            </span>
            {t(feature)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Pricing;