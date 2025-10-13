import { useTranslation } from "react-i18next";

type TTerms = {
  title: string;
  date: string;
  updated: string;
  owner: string;
  sections: {
    title: string;
    content: string[];
  }[];
  footer: {
    contact: string;
  };
};
export default function TermsOfUsePage() {
  const { t } = useTranslation();

  const terms = t("termsOfUse", { returnObjects: true }) as TTerms;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">{terms.title}</h1>
      <p className="text-sm text-gray-600 mb-1">
        {terms.updated}: {terms.date}
      </p>
      <p className="text-sm text-gray-600 mb-6">{terms.owner}</p>

      {terms.sections?.map((section: any, index: number) => (
        <>
          <div key={index} className="mb-8">
            <h2 className="text-xl font-semibold mb-2 text-green-500">
              {section.title}
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-800">
              {section.content?.map((line: string, idx: number) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          </div>
          <hr className="border-green-500 mb-5" />
        </>
      ))}

      <div className="mt-10 text-sm text-gray-600">
        {terms.footer?.contact && (
          <p>
            {t("termsOfUse.footer.contactLabel", "Contact")}:{" "}
            {terms.footer.contact}
          </p>
        )}
      </div>
    </div>
  );
}
