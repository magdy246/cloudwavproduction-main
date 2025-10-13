/* eslint-disable @typescript-eslint/no-explicit-any */
import { FaAngleRight, FaCheckCircle, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import musicbg from "../../assets/img/musicbg.png";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { axiosServices } from "../../utils/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Contact Form Values Interface
interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

// Service Form Values Interface
interface ServiceFormValues {
  name: string;
  email: string;
  phone: string;
  whatsapp_number: string;
  platform: string;
  details: string;
  social_media_account: string;
  options: string[];
  IWillDo: boolean | string;
}

// Service Request Payload Interface
interface ServiceRequestPayload {
  type: string;
  data: {
    name: string;
    email: string;
    phone: string;
    whatsapp_number: string;
    platform: string;
    details: string;
    social_media_account: string;
    options: string[];
    IWillDo: boolean | string;
  };
}

const MusicDistribution: React.FC = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [serviceLoading, setServiceLoading] = useState<boolean>(false);
  const [agree, setAgree] = useState<boolean>(false);
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  // Define service options with keys for translation
  const serviceOptions: string[] = [
    "Voice_Recording",
    "Song_Writing",
    "Music_Production",
    "Video_Filming",
    "Creating_Full_Song",
    "Creating_Song_With_Clip",
  ];

  const optionMapping: Record<string, string> = {
    Voice_Recording: t("musicDistributionOptions.voiceRecording"),
    Song_Writing: t("musicDistributionOptions.songWriting"),
    Music_Production: t("musicDistributionOptions.musicProduction"),
    Video_Filming: t("musicDistributionOptions.musicVideo"),
    Creating_Full_Song: t("musicDistributionOptions.songCreation"),
    Creating_Song_With_Clip: t("musicDistributionOptions.songClip"),
  };

  const contactValidationSchema = Yup.object({
    name: Yup.string()
      .min(3, t("validation.name_min"))
      .max(20, t("validation.name_max"))
      .required(t("validation.required")),
    email: Yup.string()
      .min(5, t("validation.email_min"))
      .email(t("validation.email_invalid"))
      .required(t("validation.required")),
    message: Yup.string()
      .min(10, t("validation.message_min"))
      .max(500, t("validation.message_max"))
      .required(t("validation.required")),
  });

  const serviceValidationSchema = Yup.object({
    name: Yup.string()
      .min(3, t("validation.name_min"))
      .max(20, t("validation.name_max"))
      .required(t("validation.required")),
    email: Yup.string()
      .min(5, t("validation.email_min"))
      .email(t("validation.email_invalid"))
      .required(t("validation.required")),
    phone: Yup.string().required(t("validation.phone_required")),
    whatsapp_number: Yup.string().required(t("validation.required")),
    details: Yup.string().required(t("validation.details_required")),
    options: Yup.array()
      .min(1, t("validation.options_min"))
      .required(t("validation.required")),
    IWillDo: Yup.boolean().required(t("validation.required")),
  });

  // Contact Form Handler
  const contactFormik = useFormik<ContactFormValues>({
    initialValues: {
      name: "",
      email: "",
      message: "",
    },
    validationSchema: contactValidationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);

      try {
        await submitContactForm(values);
        resetForm();
        toast.success(t("successM"), {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (error: any) {
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    },
  });

  // Service Form Handler
  const serviceFormik = useFormik<ServiceFormValues>({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      whatsapp_number: "",
      platform: "",
      details: "",
      social_media_account: "",
      options: [],
      IWillDo: "",
    },
    validationSchema: serviceValidationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { resetForm }) => {
      if (!agree) {
        showTermsError();
        return;
      }

      setServiceLoading(true);

      try {
        await submitServiceRequest(values);
        resetForm();
        setModalOpen(false);
        toast.success(t("successM"), {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (error: any) {
        handleApiError(error);
      } finally {
        setServiceLoading(false);
      }
    },
  });

  const showTermsError = () => {
    toast.error(t("plaseAcceptTerms"), {
      position: "top-center",
      autoClose: 3000,
    });
  };

  const submitServiceRequest = async (values: ServiceFormValues) => {
    const servicePayload: ServiceRequestPayload = {
      type: "artist_service",
      data: {
        name: values.name,
        email: values.email,
        phone: values.phone,
        whatsapp_number: values.whatsapp_number,
        platform: values.platform,
        details: values.details,
        social_media_account: values.social_media_account,
        options: values.options
          .map((option) => optionMapping[option] || option)
          .concat(
            values.IWillDo ? "I Will Sing It Myself" : "I Will Need A Specific"
          ),
        IWillDo: values.IWillDo,
      },
    };

    const response = await axiosServices.post("/services", servicePayload);

    if (![200, 201].includes(response.status)) {
      throw new Error("Service request failed");
    }
  };

  const submitContactForm = async (values: ContactFormValues) => {
    const formData = new FormData();
    formData.append("first_name", values.name);
    formData.append("last_name", values.name);
    formData.append("email", values.email);
    formData.append("message", values.message);

    const response = await axiosServices.post("/send-message", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (![200, 201].includes(response.status)) {
      throw new Error("Contact form submission failed");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleApiError = (error: any) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 403) {
        toast.warning(t("error.duplicate_request.message"), {
          position: "top-right",
          autoClose: 5000,
        });
      } else if (status === 401) {
        toast.error(t("error.session_expired.message"), {
          position: "top-center",
          autoClose: 5000,
          onClose: () => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          },
        });
      } else {
        toast.error(error.response.data?.error || t("error.general.message"), {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } else {
      toast.error(t("error.network.message"), {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && modalOpen) {
        setModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [modalOpen]);

  const formFields = [
    { id: "name", type: "text" },
    { id: "email", type: "email" },
    { id: "phone", type: "text" },
    { id: "whatsapp_number", type: "text" },
    { id: "details", type: "text" },
  ];

  const features = [
    {
      titleKey: "features.feature1.title",
      descriptionKey: "features.feature1.description",
    },
    {
      titleKey: "features.feature2.title",
      descriptionKey: "features.feature2.description",
    },
    {
      titleKey: "features.feature3.title",
      descriptionKey: "features.feature3.description",
    },
    {
      titleKey: "features.feature4.title",
      descriptionKey: "features.feature4.description",
    },
    {
      titleKey: "features.feature5.title",
      descriptionKey: "features.feature5.description",
    },
    {
      titleKey: "features.feature6.title",
      descriptionKey: "features.feature6.description",
    },
  ];

  // Function to change direction based on language
  const getDirection = () => {
    return isAr ? "rtl" : "ltr";
  };

  return (
    <div className="p-6 flex justify-center" dir={getDirection()}>
      <div className="max-w-6xl h-full bg-white p-6 md:p-10 rounded-lg w-full">
        <div className="flex flex-col items-center justify-center text-center mt-6 md:mt-10">
          {/* Toast Container */}
          <ToastContainer />

          {/* Header Section */}
          <p className="text-xl md:text-2xl w-full font-bold mt-3 md:mt-5 text-gray-700">
            {t("headerdescription")}
          </p>

          {/* Action Buttons */}
          <div
            className={`flex flex-col ${isAr ? "sm:flex-row-reverse" : "sm:flex-row"
              } items-center gap-4 md:gap-8 mt-6`}
          >
            <button
              onClick={() => setModalOpen(true)}
              className="flex flex-row items-center gap-2 md:gap-4 bg-[#30B797] border border-[#30B797] text-white hover:text-[#30B797] font-bold hover:bg-white rounded-full py-2 md:py-3 px-4 text-lg md:text-xl transition-all duration-300"
              disabled={serviceLoading}
            >
              {serviceLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t("buttons.loading")}
                </span>
              ) : (
                <>
                  {t("buttons.pricing")} <FaAngleRight />
                </>
              )}
            </button>
            <Link
              to={"/Contact"}
              className="flex flex-row items-center gap-2 md:gap-4 bg-[#30B797] border border-[#30B797] text-white hover:text-[#30B797] font-bold hover:bg-white rounded-full py-2 md:py-3 px-4 text-lg md:text-xl transition-all duration-300"
            >
              {t("buttons.contact")} <FaAngleRight />
            </Link>
          </div>

          {/* Features and Image Section */}
          <div
            className={`mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 ${isAr ? "md:flex-row-reverse" : ""
              }`}
          >
            <div className="flex flex-col items-start">
              <h3 className="text-2xl md:text-3xl font-black mb-4 text-gray-900">
                {t("featurestitle")}
              </h3>
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-row items-start md:items-center mb-4 gap-2 md:gap-3 group"
                >
                  <div className="text-[#30B797] text-xl md:text-2xl group-hover:scale-110 transform transition-all duration-300">
                    <FaCheckCircle />
                  </div>
                  <div className="flex flex-col items-start">
                    <h3 className="text-xl md:text-2xl font-semibold text-gray-800 ">
                      {t(feature.titleKey)}
                    </h3>
                    <p className="text-gray-600 text-base md:text-lg mt-1 text-start">
                      {t(feature.descriptionKey)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#B4C6FC] p-6 md:p-14 rounded-2xl transform transition-all duration-300 hover:shadow-xl h-fit">
              <img
                src={musicbg}
                alt={t("image_alt")}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>

          {/* Contact Form Section */}
          <div
            className={`pt-12 md:pt-20 flex flex-col lg:flex-row justify-center gap-8 md:gap-10 ${isAr ? "lg:flex-row-reverse" : ""
              }`}
          >
            <div className="lg:w-1/2">
              <h2
                className={`text-3xl md:text-4xl lg:text-5xl mb-6 md:mb-12 font-bold w-full text-center ${isAr ? "lg:text-end" : "lg:text-start"
                  } text-gray-900`}
              >
                {t("contactend.title")}
              </h2>
              <p
                className={`text-[#4C484F] text-base md:text-lg w-full text-center ${isAr ? "lg:text-end" : "lg:text-start"
                  }`}
              >
                {t("contactend.description")}
              </p>
            </div>
            <div className="lg:w-1/2">
              <form
                onSubmit={contactFormik.handleSubmit}
                className="flex flex-col space-y-1 md:space-y-2"
                dir={isAr ? "rtl" : "ltr"}
              >
                <div className="mb-2">
                  <input
                    className={`text-[#919499] border ${contactFormik.touched.name && contactFormik.errors.name
                        ? "border-red-500"
                        : "border-[#1F1A234D]"
                      } shadow-md focus:shadow-xl focus:outline-[#2F00AC] rounded-[14px] w-full p-3 md:p-4 transition-all duration-300`}
                    type="text"
                    placeholder={t("contactend.name")}
                    name="name"
                    onChange={contactFormik.handleChange}
                    onBlur={contactFormik.handleBlur}
                    value={contactFormik.values.name}
                  />
                  {contactFormik.touched.name && contactFormik.errors.name && (
                    <small className="text-red-500 text-sm">
                      {contactFormik.errors.name}
                    </small>
                  )}
                </div>

                <div className="mb-2">
                  <input
                    className={`text-[#919499] border ${contactFormik.touched.email && contactFormik.errors.email
                        ? "border-red-500"
                        : "border-[#1F1A234D]"
                      } shadow-md focus:shadow-xl focus:outline-[#2F00AC] rounded-[14px] w-full p-3 md:p-4 transition-all duration-300`}
                    type="email"
                    placeholder={t("contactend.email")}
                    name="email"
                    onChange={contactFormik.handleChange}
                    onBlur={contactFormik.handleBlur}
                    value={contactFormik.values.email}
                  />
                  {contactFormik.touched.email &&
                    contactFormik.errors.email && (
                      <small className="text-red-500 text-sm">
                        {contactFormik.errors.email}
                      </small>
                    )}
                </div>

                <div className="mb-2">
                  <textarea
                    className={`text-[#919499] border ${contactFormik.touched.message &&
                        contactFormik.errors.message
                        ? "border-red-500"
                        : "border-[#1F1A234D]"
                      } shadow-md focus:shadow-xl focus:outline-[#2F00AC] rounded-[14px] w-full p-3 md:p-4 transition-all duration-300`}
                    rows={5}
                    placeholder={t("contactend.message")}
                    name="message"
                    onChange={contactFormik.handleChange}
                    onBlur={contactFormik.handleBlur}
                    value={contactFormik.values.message}
                  />
                  {contactFormik.touched.message &&
                    contactFormik.errors.message && (
                      <small className="text-red-500 text-sm">
                        {contactFormik.errors.message}
                      </small>
                    )}
                </div>

                <button
                  className="bg-[#1F1A23] text-white font-bold rounded-full py-3 md:p-4 mt-3 md:mt-4 text-xl md:text-2xl hover:bg-[#2F00AC] transition-all duration-300 flex justify-center items-center"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {t("buttons.Sending....")}
                    </span>
                  ) : (
                    t("buttons.send")
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Service Request Modal */}
      {modalOpen && (
        <div className="flex bg-[#000000bf] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-[1050] justify-center items-center w-full md:inset-0 h-full max-h-full">
          <div className="relative p-4 w-full md:w-4/5 lg:w-1/2 max-h-full">
            <div className="relative bg-white rounded-3xl shadow-lg animate-fadeIn">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
                  {!isAr ? "choose music services" : " اختر خدمات الموسيقى"}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center transition-all duration-200"
                >
                  <FaTimes className="w-4 h-4" />
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="p-4 md:p-5">
                <form
                  className="space-y-4"
                  onSubmit={serviceFormik.handleSubmit}
                  dir={isAr ? "rtl" : "ltr"}
                >
                  <div className="mb-4 md:mb-6">
                    <div className="grid mb-4 grid-cols-1 md:grid-cols-2 gap-4 bg-[#F8F8F8] p-4 rounded-xl border border-[#1F1A234D] shadow-md">
                      {formFields.map((field) => (
                        <div key={field.id} className="mb-4">
                          <label
                            htmlFor={field.id}
                            className="block mb-2 text-sm font-medium text-[#522ED3]"
                          >
                            {t(`form.${field.id}`)}
                          </label>
                          <input
                            type={field.type}
                            onChange={serviceFormik.handleChange}
                            onBlur={serviceFormik.handleBlur}
                            value={String(
                              serviceFormik.values[
                              field.id as keyof ServiceFormValues
                              ]
                            )}
                            name={field.id}
                            id={field.id}
                            className="border-b border-[#522ED3] text-gray-900 text-sm outline-none focus-visible:outline-0 block w-full p-2.5 focus:border-[#2F00AC]"
                            placeholder={t(`form.${field.id}_placeholder`)}
                          />
                          {serviceFormik.touched[
                            field.id as keyof ServiceFormValues
                          ] &&
                            serviceFormik.errors[
                            field.id as keyof ServiceFormValues
                            ] ? (
                            <small className="text-red-500 mt-1 block">
                              {
                                serviceFormik.errors[
                                field.id as keyof ServiceFormValues
                                ] as string
                              }
                            </small>
                          ) : null}
                        </div>
                      ))}
                    </div>

                    <label className="block mb-2 text-sm font-medium text-[#522ED3]">
                      {t("validation.options_required")}
                    </label>
                    {serviceFormik.touched.options &&
                      serviceFormik.errors.options && (
                        <small className="text-red-500 block mb-2">
                          {serviceFormik.errors.options as string}
                        </small>
                      )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#F8F8F8] p-4 rounded-xl border border-[#1F1A234D] shadow-md">
                      {serviceOptions.map((option, index) => (
                        <label
                          key={index}
                          className={`flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm border ${serviceFormik.values.options.includes(option)
                              ? "border-[#522ED3] bg-[#522ED3] text-black"
                              : "border-[#522ED3] text-black"
                            } cursor-pointer transition-all hover:bg-[#522ED3] hover:text-white`}
                        >
                          <input
                            type="checkbox"
                            name="options"
                            value={option}
                            checked={serviceFormik.values.options.includes(
                              option
                            )}
                            onChange={(e) => {
                              const { value, checked } = e.target;
                              serviceFormik.setFieldValue(
                                "options",
                                checked
                                  ? [...serviceFormik.values.options, value]
                                  : serviceFormik.values.options.filter(
                                    (item) => item !== value
                                  )
                              );
                            }}
                            className="w-4 h-4 text-[#522ED3] border-gray-300 focus:ring-[#522ED3]"
                          />
                          <span>{t(`services.${option}`)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Radio button section for "IWillDo" */}
                  <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-[#522ED3]">
                      {t("select_option")}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#F8F8F8] p-4 rounded-xl border border-[#1F1A234D] shadow-md">
                      <label className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm border border-[#522ED3] cursor-pointer transition-all hover:bg-[#522ED3] hover:text-white">
                        <input
                          type="radio"
                          name="IWillDo"
                          value="true"
                          checked={serviceFormik.values.IWillDo === true}
                          onChange={() =>
                            serviceFormik.setFieldValue("IWillDo", true)
                          }
                          className="w-4 h-4 text-[#522ED3] border-gray-300 focus:ring-[#522ED3]"
                        />
                        <span>{t("sing_it_myself")}</span>
                      </label>

                      <label className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm border border-[#522ED3] cursor-pointer transition-all hover:bg-[#522ED3] hover:text-white">
                        <input
                          type="radio"
                          name="IWillDo"
                          value="false"
                          checked={serviceFormik.values.IWillDo === false}
                          onChange={() =>
                            serviceFormik.setFieldValue("IWillDo", false)
                          }
                          className="w-4 h-4 text-[#522ED3] border-gray-300 focus:ring-[#522ED3]"
                        />
                        <span>{t("need_a_specific")}</span>
                      </label>
                    </div>
                    {serviceFormik.touched.IWillDo &&
                      serviceFormik.errors.IWillDo && (
                        <small className="text-red-500 block mt-1">
                          {serviceFormik.errors.IWillDo as string}
                        </small>
                      )}
                  </div>

                  <div className="flex items-center">
                    <input
                      id="agree-terms"
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      className="w-4 h-4 text-[#522ED3] border-gray-300 rounded focus:ring-[#522ED3]"
                    />
                    <label
                      htmlFor="agree-terms"
                      className={`ml-2 text-sm font-medium text-gray-700 ${isAr ? "mr-2 ml-0" : ""
                        }`}
                    >
                      {t("form.terms_agreement")}
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="submit"
                      className="w-full bg-[#522ED3] text-white border border-[#522ED3] hover:bg-white hover:text-[#522ED3] font-bold rounded-full px-6 py-3 text-center transition-all duration-300 flex justify-center items-center"
                      disabled={serviceLoading}
                    >
                      {serviceLoading ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          {t("Sending....")}
                        </span>
                      ) : (
                        t("form.submit")
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MusicDistribution;
