import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import platformImg from "../../assets/img/platformImg.png";
import { CgArrowTopRight, CgProfile } from "react-icons/cg";
import {
  MdCloudDownload,
  MdOutlineSecurity,
  MdWorkOutline,
} from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useFormik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { AxiosResponse, AxiosError } from "axios";
// import {
//   Link,
//   // useNavigate
// } from "react-router-dom";
import PlansBox from "../../components/PlansBox";
import { axiosServices } from "../../utils/axios";

// Define types for the component
interface FormValues {
  name: string;
  email: string;
  phone: string;
  whatsapp_number: string;
  platform: string;
  social_media_account: string;
  details: string;
}

interface Feature {
  title: string;
  desc: string;
  icon: React.ReactNode;
}

interface Plan {
  name: string;
  price: number;
  priceYearly: number;
  features: string[];
}

interface ErrorResponse {
  error?: string;
}

const PlatformManagement: React.FC = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  // const navigate = useNavigate();

  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Validation schema for form
  const validationSchema = Yup.object({
    name: Yup.string()
      .min(3, t("validation.name_min"))
      .max(20, t("validation.name_max"))
      .required(t("validation.name_required")),

    email: Yup.string()
      .email(t("validation.email_invalid"))
      .required(t("validation.email_required")),

    phone: Yup.string()
      .matches(
        /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
        t("errors.phone_invalid")
      )
      .required(t("validation.phone_required")),

    whatsapp_number: Yup.string()
      .matches(
        /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
        t("whatsapp_invalid")
      )
      .required(t("validation.phone_required")),

    platform: Yup.string().required(t("validation.platform_required")),

    // social_media_account: Yup.string()
    //   .url(t("validation.url_invalid"))
    //   .required(t("validation.social_required")),

    details: Yup.string()
      .min(10, t("validation.details_min"))
      .max(500, t("validation.details_max")),
  });

  const servicesFormik = useFormik<FormValues>({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      whatsapp_number: "",
      platform: "",
      social_media_account: "",
      details: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }: FormikHelpers<FormValues>) => {
      // const token = localStorage.getItem("token");

      // if (!token) {
      //   toast.error(t("you must sign in first"), {
      //     position: "top-right",
      //     autoClose: 5000,
      //     hideProgressBar: false,
      //     closeOnClick: true,
      //     pauseOnHover: true,
      //     draggable: true,
      //   });

      //   // Redirect to register page after a short delay
      //   setTimeout(() => {
      //     navigate("/Register");
      //   }, 2000);
      //   return;
      // }

      try {
        // Structure the data according to the required format
        const requestData = {
          type: "platform management",
          data: {
            name: values.name,
            email: values.email,
            phone: values.phone,
            whatsapp_number: values.whatsapp_number,
            platform: values.platform,
            social_media_account: values.social_media_account,
            details: values.details,
          },
        };

        const response: AxiosResponse = await axiosServices.post(
          "/services",
          requestData
        );

        if (response.status === 200 || response.status === 201) {
          toast.success(t("success.message"), {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          resetForm();
          setModalOpen(false);
        }
      } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>;
        if (axiosError.response) {
          toast.error(
            axiosError.response.data?.error || t("error.registration_failed"),
            {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
        } else {
          toast.error(t("error.unexpected"), {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      }
    },
  });

  // Features list
  const features: Feature[] = [
    {
      title: t("artist_profile"),
      desc: t("artist_profile_desc"),
      icon: <CgProfile />,
    },
    {
      title: t("providing_real_job"),
      desc: t("providing_real_job_desc"),
      icon: <MdWorkOutline />,
    },
    {
      title: t("direct_download"),
      desc: t("direct_download_desc"),
      icon: <MdCloudDownload />,
    },
    {
      title: t("data_security"),
      desc: t("data_security_desc"),
      icon: <MdOutlineSecurity />,
    },
    {
      title: t("ensuring_successful"),
      desc: t("ensuring_successful_desc"),
      icon: <CgArrowTopRight />,
    },
  ];

  // Plans data
  const plans: Plan[] = [
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
  ];

  // Form fields configuration
  const formFields = [
    { id: "name", type: "text" },
    { id: "email", type: "email" },
    { id: "phone", type: "text" },
    { id: "whatsapp_number", type: "text" },
    { id: "platform", type: "text" },
    { id: "social_media_account", type: "text" },
    { id: "details", type: "text" },
  ];

  return (
    <div className="p-6 flex justify-center">
      <ToastContainer position="top-right"  />
      <div className="max-w-6xl h-full bg-white p-10 rounded-lg w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="flex flex-col items-center md:items-start">
            <h1 className="text-5xl font-bold mb-12 md:text-start text-center">
              {t("platforms_management")}
            </h1>
            <p className="text-lg text-gray-600 font-bold mb-8 md:text-start text-center">
              {t("platforms_management_desc")}
            </p>
            <div className="flex gap-4">
              <button
                className="bg-[#2F00AC] hover:bg-white hover:text-black border border-[#2F00AC] transition-all duration-300 ease-in-out text-white px-6 py-2 rounded-lg font-semibold"
                onClick={() => setModalOpen(true)}
              >
                {t("get_started")}
              </button>

              <a
                href="#price"
                className="bg-white border border-[#2F00AC] text-[#2F00AC] hover:bg-[#2F00AC] hover:text-white transition-all duration-300 ease-in-out px-6 py-2 rounded-lg font-semibold"
              >
                {t("pricing")}
              </a>
            </div>
          </div>
          <div className="relative flex justify-center">
            <img
              src={platformImg}
              alt={t("platform_management_illustration")}
              className="object-cover rounded-lg "
            />
          </div>
        </div>

        {/* Features section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mt-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 shadow-md rounded-xl flex flex-col items-center text-center md:items-start md:text-start hover:shadow-lg transition-all duration-300"
            >
              <div className="text-3xl bg-[#2F00AC1A] rounded-full text-[#2F00AC] w-12 h-12 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Pricing section */}
        <div className="flex items-center flex-col mt-16" id="price">
          <h1 className="text-4xl font-bold text-center">
            {t("pricing_title")}
          </h1>
          <p className="text-center text-lg text-black mt-8 max-w-2xl">
            {t("pricing_subtitle")}
          </p>

          <div
            id="plans"
            className={`grid gap-10 grid-cols-1 md:grid-cols-2 mt-12 ${
              isRTL ? "text-right" : "text-left"
            }`}
          >
            {plans.map((plan, index) => (
              <PlansBox
                key={index}
                planName={t(plan.name)}
                MainPrice={plan.price}
                addPrice={plan.priceYearly}
                Features={plan.features.map((feature) => t(feature))}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          aria-hidden="true"
          className="flex bg-[#000000bf] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-[1050] justify-center items-center w-full md:inset-0 h-full max-h-full"
        >
          <div className="relative p-4 w-full md:w-1/2 max-h-full">
            <div className="relative bg-white rounded-3xl shadow-lg">
              <div className="flex items-center justify-between p-4 md:p-5 border-b">
                <h2 className="text-2xl font-semibold text-[#522ED3]">
                  {t("modal.title")}
                </h2>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                >
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">{t("modal.close")}</span>
                </button>
              </div>

              <div className="p-6 md:p-8">
                <form
                  className="space-y-6"
                  onSubmit={servicesFormik.handleSubmit}
                >
                  {formFields.map((field) => (
                    <div key={field.id} className="mb-6">
                      <label
                        htmlFor={field.id}
                        className="block mb-2 text-sm font-medium text-[#522ED3]"
                      >
                        {t(`modal.${field.id}`)}
                      </label>
                      <input
                        type={field.type}
                        onChange={servicesFormik.handleChange}
                        onBlur={servicesFormik.handleBlur}
                        value={
                          servicesFormik.values[field.id as keyof FormValues]
                        }
                        name={field.id}
                        id={field.id}
                        className="border-b border-[#522ED3] text-gray-900 text-sm outline-none focus-visible:outline-0 block w-full p-2.5 focus:border-[#2F00AC]"
                        placeholder={t(`modal.${field.id}_placeholder`)}
                      />
                      {servicesFormik.touched[field.id as keyof FormValues] &&
                      servicesFormik.errors[field.id as keyof FormValues] ? (
                        <small className="text-red-500 mt-1 block">
                          {servicesFormik.errors[field.id as keyof FormValues]}
                        </small>
                      ) : null}
                    </div>
                  ))}

                  <button
                    type="submit"
                    className="w-full bg-[#522ED3] text-white border border-[#522ED3] hover:bg-white hover:text-[#522ED3] font-bold rounded-full px-6 py-3 text-center transition-all duration-300"
                    disabled={servicesFormik.isSubmitting}
                  >
                    {servicesFormik.isSubmitting
                      ? t("sending")
                      : t("modal.send")}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformManagement;
