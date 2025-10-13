// src/pages/Policy.tsx
import React from "react";
import { useTranslation } from "react-i18next";

const Policy: React.FC = () => {
  const today = new Date().toLocaleDateString();
  const { t } = useTranslation();
  console.log();
  return (
    <div className="bg-white text-black min-h-screen px-6 py-10 md:px-20 leading-relaxed">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-[#30B797] mb-4">
          {t("policy.title")}
        </h1>
        <p className="text-sm text-gray-500">
          {t("policy.lastUpdate")} {today}
        </p>
        <p className="font-semibold">{t("policy.owner")} CloudWav Production</p>

        <p>{t("policy.intro")}</p>

        <hr className="border-[#30B797]" />

        {(
          t("policy.sections", { returnObjects: true }) as Array<{
            title: string;
            content: string[];
          }>
        ).map((section) => (
          <>
            <section>
              <h2 className="text-xl font-bold mb-2 text-[#30B797]">
                {section.title}
              </h2>
              <ol className="list-disc  pr-6 space-y-2">
                {section.content.map((subSection) => (
                  <li>{subSection}</li>
                ))}
              </ol>
            </section>
            <hr className="border-green-500" />
          </>
        ))}
      
        <footer className="pt-8 text-center text-gray-500 text-sm mt-10">
                  {t("policy.footer")}
        </footer>
      </div>
    </div>
  );
};

export default Policy;
