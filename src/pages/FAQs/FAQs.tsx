import { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { Data } from "./FAQsData";

interface FAQItem {
  id: number;
  question: string;
  answers: string[];
}

interface OpenItems {
  [key: number]: boolean;
}

const FAQs: React.FC = () => {
  const { t } = useTranslation();
  const [openItems, setOpenItems] = useState<OpenItems>({});

  const toggleItem = (id: number): void => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <>
      <div className="py-20">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            {t("faq_title")}
          </h2>
          <p className="text-center text-lg">{t("faq_questions")}</p>
          <div className="flex flex-col mt-14 gap-6 items-center">
            {Data.map((item: FAQItem) => (
              <div
                key={item.id}
                id="accordion-collapse"
                className="bg-main-color rounded-2xl w-full"
              >
                <h2 id="accordion-collapse-heading" className="transition-all">
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className="flex items-center cursor-pointer justify-between w-full text-2xl p-5 font-bold text-white border-gray-200 transition-all"
                  >
                    <span>{t(item.question)}</span>
                    {openItems[item.id] ? <FaMinus /> : <FaPlus />}
                  </button>
                </h2>
                <div
                  id="accordion-collapse-body"
                  className={`${
                    openItems[item.id] ? "block" : "hidden"
                  } p-4 transition-all`}
                >
                  <ul className="text-white text-lg pl-8">
                    {item.answers.map((answer: string, index: number) => (
                      <li key={index} className="mb-2">
                        {t(answer)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
            <div className="flex flex-col items-center pt-10 md:w-2/3">
              <div className="mb-6 text-center font-bold">
                <h2 className="text-black font-bold text-3xl mb-6">
                  {t("tipsh")}
                </h2>
                {(t("tips", { returnObjects: true }) as string[]).map(
                  (tip, index) => (
                    <p className="text-black text-lg mb-2" key={index}>
                      {tip}
                    </p>
                  )
                )}
              </div>
              <div className="mb-6 text-center font-bold">
                <h2 className="text-black font-bold text-3xl mb-6">
                  {t("legal_warningh")}
                </h2>
                {(t("legal_warning", { returnObjects: true }) as string[]).map(
                  (legal, index: number) => (
                    <p className="text-black text-lg mb-2" key={index}>
                      {legal}
                    </p>
                  )
                )}
              </div>
              <p className="text-center mb-6 text-lg">{t("not_found")}</p>
              <a
                href="/Contact"
                className="text-2xl px-10 py-4 rounded-2xl cursor-pointer font-bold bg-[#30B797] text-white border border-[#30B797] hover:bg-white hover:text-[#30B797] transition"
              >
                {t("contact_us")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQs;
