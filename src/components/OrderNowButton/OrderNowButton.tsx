import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { IoIosArrowForward } from "react-icons/io";
import { axiosServices } from "../../utils/axios";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OrderNowButton = ({ orderInfo }:any) => {
  const [showModal, setShowModal] = useState(false);
  const [agree, setAgree] = useState(false);
  const [priceType, setPriceType] = useState("private"); // Default to private
  const { t } = useTranslation();
  
  // Added country code state
  const [countryCode, setCountryCode] = useState("+20"); // Default to Egypt
  
  console.log(orderInfo.bussiness_price, "orderInfo");
  console.log(orderInfo.private_price, "orderInfo");

  // Common country codes for phone numbers
  const countryCodes = [
    { code: "+20", country: "Egypt" },
    { code: "+966", country: "Saudi Arabia" },
    { code: "+971", country: "UAE" },
    { code: "+974", country: "Qatar" },
    { code: "+965", country: "Kuwait" },
    { code: "+973", country: "Bahrain" },
    { code: "+968", country: "Oman" },
    { code: "+962", country: "Jordan" },
    { code: "+961", country: "Lebanon" },
    { code: "+1", country: "USA/Canada" },
    { code: "+44", country: "UK" },
    // Add more countries as needed
  ];

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    formik.resetForm();
    setAgree(false);
    setPriceType("private");
    setCountryCode("+20"); // Reset country code
  };

  // Updated validation schema to handle international phone numbers
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      number: "",
      details: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(3, "Can't be less than 3 letters")
        .max(20, "Can't be more than 20 letters")
        .required("Name is required"),

      email: Yup.string()
        .min(15, "Must be at least 15 characters")
        .email("Enter a valid email")
        .required("Email is required"),

      number: Yup.string()
        .matches(
          /^\d{8,15}$/,
          "Must be a valid phone number (8-15 digits without country code)"
        )
        .required("Phone number is required"),

      details: Yup.string()
        .min(10, "Must be at least 10 characters")
        .max(500, "Must not exceed 500 characters")
        .required("Description is required"),
    }),

    onSubmit: async (values) => {
      if (!agree) {
        toast.error(t("You must agree to the terms and conditions"));
        return;
      }

      try {
        // Combine country code with phone number
        const fullPhoneNumber = countryCode + values.number;
        
        const formData = new FormData();
        formData.append("video_creator_id", orderInfo?.id);
        formData.append("order_name", values.name);
        formData.append("order_email", values.email);
        formData.append("phone", fullPhoneNumber);
        formData.append("whatsapp", fullPhoneNumber);
        formData.append("details", values.details);
        formData.append("order_type", orderInfo?.videoType);
        formData.append("order_artistName", orderInfo?.artistName);
        
        // Add price fields based on selection
        formData.append("private_price", priceType === "private" ? orderInfo?.private_price : 0);
        formData.append("bussiness_price", priceType === "business" ? orderInfo?.bussiness_price : 0);

        const response = await axiosServices.post(
          "/orders",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.status === 200 || response.status === 201) {
          toast.success("Your order has been submitted successfully");
          formik.resetForm();
          closeModal();
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error?.response) {
          if (error?.response.status === 403) {
            toast.warning("You've already submitted a request! Your request is under review, please wait for a response.");
          } else {
            toast.error(error.response.data.message || "An error occurred during registration");
          }
        } else {
          toast.error("An unexpected error occurred. Please try again later.");
        }
      }
    },
  });

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} />
      <button
        className="text-white bg-[#30B797] font-bold p-2 rounded-full border border-[#30B797] hover:text-[#30B797] hover:bg-white transition-all flex flex-row items-center gap-2 text-lg"
        onClick={openModal}
      >
        {t("Order_now")}
        <IoIosArrowForward />
      </button>

      {showModal && (
        <div className="flex bg-[#000000bf] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full h-full">
          <div className="relative p-4 w-full md:w-1/2 max-h-full">
            <div className="relative bg-white rounded-3xl shadow-sm">
              <div className="flex items-center justify-between p-4 md:p-5">
                <h3 className="text-xl font-semibold text-gray-900">
                  {t("Order Form")}
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
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
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="p-4 md:p-5">
                <form
                  className="space-y-4"
                  action="#"
                  onSubmit={formik.handleSubmit}
                >
                  {/* Price Type Selection */}
                  <div className="mb-6">
                    <label className="block mb-2 text-sm font-medium text-[#522ED3]">
                      {t("Select Price Type")}
                    </label>
                    <div className="flex gap-4">
                      <div 
                        className={`border rounded-xl p-3 cursor-pointer flex-1 text-center transition-all ${
                          priceType === "private" 
                            ? "border-[#522ED3] bg-[#522ED320] text-[#522ED3] font-medium" 
                            : "border-gray-300 text-gray-700"
                        }`}
                        onClick={() => setPriceType("private")}
                      >
                        <div className="font-semibold">{t("private_price")}</div>
                        <div className="mt-2">{orderInfo?.private_price || "N/A"}</div>
                      </div>
                      <div 
                        className={`border rounded-xl p-3 cursor-pointer flex-1 text-center transition-all ${
                          priceType === "business" 
                            ? "border-[#522ED3] bg-[#522ED320] text-[#522ED3] font-medium" 
                            : "border-gray-300 text-gray-700"
                        }`}
                        onClick={() => setPriceType("business")}
                      >
                        <div className="font-semibold">{t("bussiness_price")}</div>
                        <div className="mt-2">{orderInfo?.bussiness_price || "N/A"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="name"
                      className="block mb-2 text-sm font-medium text-[#522ED3]"
                    >
                      {t("Your_name")}
                    </label>
                    <input
                      type="text"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.name}
                      name="name"
                      id="name"
                      placeholder={t("Your_name")}
                      className="border-b border-[#522ED3] text-gray-900 text-sm outline-b focus-visible:outline-0 block w-full p-2.5"
                    />
                    {formik.touched.name && formik.errors.name ? (
                      <small className="text-red-500">{formik.errors.name}</small>
                    ) : null}
                  </div>
                  <div className="mb-6">
                    <label
                      htmlFor="email"
                      className="block mb-2 text-sm font-medium text-[#522ED3]"
                    >
                      {t("Your_email")}
                    </label>
                    <input
                      type="email"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.email}
                      name="email"
                      id="email"
                      className="border-b border-[#522ED3] text-gray-900 text-sm outline-b focus-visible:outline-0 block w-full p-2.5"
                      placeholder="YourMail@gmail.com"
                    />
                    {formik.touched.email && formik.errors.email ? (
                      <small className="text-red-500">{formik.errors.email}</small>
                    ) : null}
                  </div>
                  
                  {/* Phone number with country code selection */}
                  <div className="mb-6">
                    <label
                      htmlFor="number"
                      className="block mb-2 text-sm font-medium text-[#522ED3]"
                    >
                      {t("Your_Number")}
                    </label>
                    <div className="flex">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="border-b border-[#522ED3] text-gray-900 text-sm outline-b focus-visible:outline-0 p-2.5 mr-2"
                      >
                        {countryCodes.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.country} ({country.code})
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.number}
                        name="number"
                        id="number"
                        className="border-b border-[#522ED3] text-gray-900 text-sm outline-b focus-visible:outline-0 block w-full p-2.5"
                        placeholder="1234567890"
                      />
                    </div>
                    {formik.touched.number && formik.errors.number ? (
                      <small className="text-red-500">{formik.errors.number}</small>
                    ) : null}
                    <small className="text-gray-500">
                      {t("Enter your number without the country code")}
                    </small>
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="details"
                      className="block mb-2 text-sm font-medium text-[#522ED3]"
                    >
                      {t("Write_your_Text")}
                    </label>
                    <textarea
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.details}
                      name="details"
                      id="details"
                      className="border rounded-xl border-[#522ED3] text-gray-900 text-sm outline-b focus-visible:outline-0 block w-full p-2.5 h-36 resize-y"
                      placeholder={t("Write_your_Text")}
                    />
                    {formik.touched.details && formik.errors.details ? (
                      <small className="text-red-500">{formik.errors.details}</small>
                    ) : null}
                  </div>

                  <div className="flex items-center mt-4">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agree}
                      onChange={() => setAgree(!agree)}
                      className="mr-2"
                    />
                    <label htmlFor="terms" className="text-sm">
                      {t("accpt")}{" "}
                      <a
                        href="/Terms/VideosOrder"
                        className="text-[#2F00AC] underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("trams")}
                      </a>
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#522ED3] text-white border border-[#522ED3] hover:bg-white hover:text-[#522ED3] font-bold rounded-full px-6 py-3 text-center transition-all"
                  >
                    {t("Send Now")}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderNowButton;