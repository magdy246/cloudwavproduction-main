import { useState, FormEvent, ChangeEvent } from "react";
import {
  FaPhoneVolume,

} from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { IoMdMail } from "react-icons/io";
import { useTranslation } from "react-i18next";

// Define TypeScript interfaces
interface FormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  message: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  message?: string;
}

interface SubmitStatus {
  type: "success" | "error";
  message: string;
}

const Contact: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = (): boolean => {
    let formErrors: FormErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      formErrors.firstName = t("validation.required");
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      formErrors.lastName = t("validation.required");
    }

    // Email validation
    if (!formData.email) {
      formErrors.email = t("validation.required");
    } else if (
      !/\S+@\S+\.\S+/.test(formData.email) ||
      formData.email.length < 15
    ) {
      formErrors.email = t("validation.correctEmail");
    }

    // Phone validation
    if (!formData.phoneNumber) {
      formErrors.phoneNumber = t("validation.required");
    } else if (!/^(010|011|012|015)[0-9]{8}$/.test(formData.phoneNumber)) {
      formErrors.phoneNumber = t("validation.validPhone");
    } else if (!/^\d+$/.test(formData.phoneNumber)) {
      formErrors.phoneNumber = t("validation.onlyNumbers");
    }

    // Message validation
    if (!formData.message.trim()) {
      formErrors.message = t("validation.required");
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Show success status
        setSubmitStatus({
          type: "success",
          message: t("success.message"),
        });

        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          phoneNumber: "",
          email: "",
          message: "",
        });

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSubmitStatus(null);
        }, 3000);
      } catch (error) {
        // Show error status
        console.log(error);
        
        setSubmitStatus({
          type: "error",
          message: t("errors.default"),
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      <div className="mb-10">
        <div className="container m-auto">
          <div className="flex flex-col lg:flex-row gap-14 mt-24">
            {/* Contact Info Section */}
            <div className="w-full lg:w-2/5 relative overflow-hidden">
              <div className="flex flex-col bg-main-color relative p-10 rounded-2xl text-white overflow-hidden">
                <h2 className="text-4xl mb-4 font-bold">
                  {t("contact.header")}
                </h2>
                <p className="text-2xl">{t("contact.subHeader")}</p>
                <ul className="py-20 text-3xl">
                  <a
                    href="http://wa.me/+201055030045"
                    className="flex items-center gap-1 mb-14"
                  >
                    <FaPhoneVolume />
                    <span className="text-lg">+201055030045</span>
                  </a>
                  <a
                    href="mailto:support@cloudwavproduction.com"
                    className="flex items-center gap-1 mb-14"
                  >
                    <IoMdMail className="text-2xl" />
                    <span className="text-lg">
                      support@cloudwavproduction.com
                    </span>
                  </a>
                  <li className="flex items-center gap-1 mb-14">
                    <FaLocationDot />
                    <span className="text-lg">{t("contact.address")}</span>
                  </li>
                </ul>
              </div>
              <div className="absolute w-[200px] h-[200px] bg-[#30B797] rounded-full bottom-[-80px] right-[-80px] z-[1]"></div>
                <div className="absolute w-[150px] h-[150px] bg-[#48484880] rounded-full bottom-[-10px] right-[60px] z-[2]"></div>
            </div>

            {/* Contact Form Section */}
            <div className="w-full lg:w-3/5">
              {submitStatus && (
                <div
                  className={`mb-6 p-4 rounded text-white ${
                    submitStatus.type === "success"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                >
                  {submitStatus.message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="flex flex-col flex-wrap gap-10">
                  {/* First Row - Name Fields */}
                  <div className="flex gap-10 flex-col md:flex-row">
                    <div className="mb-6 md:w-1/2 w-full">
                      <label
                        htmlFor="firstName"
                        className="block mb-2 text-sm font-bold text-black"
                      >
                        {t("contact.firstName")}
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        onChange={handleChange}
                        value={formData.firstName}
                        className={`border-b ${
                          errors.firstName
                            ? "border-red-500"
                            : "border-[#8D8D8D]"
                        } text-[#8D8D8D] text-sm block w-full p-2.5`}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="mb-6 md:w-1/2 w-full">
                      <label
                        htmlFor="lastName"
                        className="block mb-2 text-sm font-bold text-black"
                      >
                        {t("contact.lastName")}
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        onChange={handleChange}
                        value={formData.lastName}
                        className={`border-b ${
                          errors.lastName
                            ? "border-red-500"
                            : "border-[#8D8D8D]"
                        } text-[#8D8D8D] text-sm block w-full p-2.5`}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Second Row - Email and Phone */}
                  <div className="flex gap-10 flex-col md:flex-row">
                    <div className="mb-6 md:w-1/2 w-full">
                      <label
                        htmlFor="email"
                        className="block mb-2 text-sm font-bold text-black"
                      >
                        {t("contact.Email")}
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        onChange={handleChange}
                        value={formData.email}
                        className={`border-b ${
                          errors.email ? "border-red-500" : "border-[#8D8D8D]"
                        } text-[#8D8D8D] text-sm block w-full p-2.5`}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div className="mb-6 md:w-1/2 w-full">
                      <label
                        htmlFor="phoneNumber"
                        className="block mb-2 text-sm font-bold text-black"
                      >
                        {t("contact.phone")}
                      </label>
                      <input
                        type="text"
                        id="phoneNumber"
                        name="phoneNumber"
                        onChange={handleChange}
                        value={formData.phoneNumber}
                        className={`border-b ${
                          errors.phoneNumber
                            ? "border-red-500"
                            : "border-[#8D8D8D]"
                        } text-[#8D8D8D] text-sm block w-full p-2.5`}
                      />
                      {errors.phoneNumber && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Message Field */}
                  <div className="mb-6 w-full">
                    <label
                      htmlFor="message"
                      className="block mb-2 text-sm font-bold text-black"
                    >
                      {t("contact.message")}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      onChange={handleChange}
                      value={formData.message}
                      placeholder={t("contact.messagePlaceholder")}
                      className={`border-b ${
                        errors.message ? "border-red-500" : "border-[#8D8D8D]"
                      } text-[#8D8D8D] text-sm block w-full p-2.5 min-h-[100px]`}
                    />
                    {errors.message && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-black text-white hover:bg-white border border-black hover:text-[#1B1B1B] font-bold transition-all p-4 rounded-md text-sm disabled:opacity-50"
                    >
                      {isSubmitting
                        ? t("contact.sending")
                        : t("contact.sendButton")}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
