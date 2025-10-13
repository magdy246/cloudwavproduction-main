import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdVerified } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { AxiosError } from "axios";
import { axiosServices } from "../../utils/axios";
import joinUsImage from "../../assets/images/CategoriesImage/joinUs.svg";

// Define types for form values and errors
type FormField =
  | "name"
  | "email"
  | "number"
  | "whatsapp_number"
  | "division"
  | "social_links"
  | "details"
  | "profile_image"
  | "id_card"
  | "private_price"
  | "bussiness_price";

interface FormValues {
  name: string;
  email: string;
  number: string;
  whatsapp_number: string;
  division: string;
  social_links: string;
  details: string;
  profile_image: File | null;
  id_card: File | null;
  private_price: string;
  bussiness_price: string;
}

interface FormTouched {
  name: boolean;
  email: boolean;
  number: boolean;
  whatsapp_number: boolean;
  division: boolean;
  social_links: boolean;
  details: boolean;
  profile_image: boolean;
  id_card: boolean;
  private_price: boolean;
  bussiness_price: boolean;
}

interface FormErrors {
  name: string;
  email: string;
  number: string;
  whatsapp_number: string;
  division: string;
  social_links: string;
  details: string;
  profile_image: string;
  id_card: string;
  private_price: string;
  bussiness_price: string;
}

export default function JoinUs() {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({
    name: "",
    email: "",
    number: "",
    whatsapp_number: "",
    division: "",
    social_links: "",
    details: "",
    profile_image: null,
    id_card: null,
    private_price: "",
    bussiness_price: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: "",
    email: "",
    number: "",
    whatsapp_number: "",
    division: "",
    social_links: "",
    details: "",
    profile_image: "",
    id_card: "",
    private_price: "",
    bussiness_price: "",
  });
  const [touched, setTouched] = useState<FormTouched>({
    name: false,
    email: false,
    number: false,
    whatsapp_number: false,
    division: false,
    social_links: false,
    details: false,
    profile_image: false,
    id_card: false,
    private_price: false,
    bussiness_price: false,
  });

  // RTL Support - use i18n for language direction
  const isRTL = true; // Set to true for Arabic, false for English

  // Available divisions - updated with new options from the original component
  const divisions = [
    { value: "", label: t("select_division") },
    { value: "Tiktokers", label: t("Tiktokers") },
    { value: "Musician", label: t("Musician") },
    { value: "Actor", label: t("Actor") },
    { value: "Content creator", label: t("Content creator") },
    { value: "Youtuber", label: t("Youtuber") },
    { value: "Athlete", label: t("Athlete") },
    { value: "public_figure", label: t("public_figure") },
  ];

  // Validation functions
  const validateField = (
    name: FormField,
    value: string | File | null
  ): string => {
    let error = "";

    switch (name) {
      case "name":
        if (!value) {
          error = t("name is invalid");
        } else if (typeof value === "string" && value.length < 3) {
          error = t("cant be less than 3 letters");
        } else if (typeof value === "string" && value.length > 20) {
          error = t("cant be more than 20 letters");
        }
        break;

      case "email":
        if (!value) {
          error = t("this is invalid");
        } else if (
          typeof value === "string" &&
          !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)
        ) {
          error = t("enter the correct email");
        }
        break;

      case "number":
      case "whatsapp_number":
        if (!value) {
          error = t("رقم الهاتف مطلوب");
        } else if (typeof value === "string") {
          const cleanedNumber = value.replace(/[\s\-()]/g, "");
          if (!/^\+?[0-9]{8,15}$/.test(cleanedNumber)) {
            error = t(
              "يجب أن يكون الرقم يحتوي على رمز الدولة الدولي قبل الرقم."
            );
          }
        }
        break;

      case "division":
        if (!value) {
          error = t("division is required");
        }
        break;

      case "social_links":
        if (!value) {
          error = t("social links is required");
        } else if (typeof value === "string" && !/^https?:\/\//.test(value)) {
          error = t("enter the correct url");
        }
        break;

      case "profile_image":
        if (!value) {
          error = t("الصورة الشخصيه مطلوبة");
        }
        break;

      case "id_card":
        if (!value) {
          error = t("صورة البطاقه الشخصيه مطلوبه");
        }
        break;

      case "private_price":
        if (!value) {
          error = t("السعر الخاص مطلوب");
        } else if (typeof value === "string" && !/^\d+$/.test(value)) {
          error = t("يجب أن يكون السعر الخاص رقمًا موجبًا");
        }
        break;

      case "bussiness_price":
        if (!value) {
          error = t("السعر التجاري مطلوب");
        } else if (typeof value === "string" && !/^\d+$/.test(value)) {
          error = t("يجب أن يكون السعر التجاري رقمًا موجبًا");
        }
        break;

      default:
        break;
    }

    return error;
  };

  // Handle text field change
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const fieldName = name as FormField;

    setFormValues({ ...formValues, [fieldName]: value });

    // Validate field if touched
    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setFormErrors({ ...formErrors, [fieldName]: error });
    }
  };

  // Handle file field change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    const fieldName = name as FormField;
    const file = files && files.length > 0 ? files[0] : null;

    setFormValues({ ...formValues, [fieldName]: file });

    // Validate field if touched
    if (touched[fieldName]) {
      const error = validateField(fieldName, file);
      setFormErrors({ ...formErrors, [fieldName]: error });
    }
  };

  // Handle field blur
  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name } = e.target;
    const fieldName = name as FormField;

    setTouched({ ...touched, [fieldName]: true });

    // Get the value based on the field type
    const value =
      e.target.type === "file"
        ? (e.target as HTMLInputElement).files?.[0] || null
        : e.target.value;

    const error = validateField(fieldName, value);
    setFormErrors({ ...formErrors, [fieldName]: error });
  };

  // Format phone number before submission
  const formatPhoneNumber = (number: string): string => {
    // Remove any non-digit characters except for leading +
    return number
      .replace(/^(\+)|(.)/, (match, plus) =>
        plus ? plus : match.replace(/[^\d]/g, "")
      )
      .replace(/[^\d+]/g, "");
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const errors: Partial<FormErrors> = {};
    let isValid = true;

    // Validate all fields
    (Object.keys(formValues) as FormField[]).forEach((name) => {
      const value = formValues[name];
      const error = validateField(name, value);
      errors[name] = error;
      if (error) {
        isValid = false;
      }
    });

    setFormErrors(errors as FormErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Touch all fields
    const allTouched: FormTouched = {} as FormTouched;
    (Object.keys(formValues) as FormField[]).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Add text fields to FormData
      formData.append("name", formValues.name);
      formData.append("email", formValues.email);

      // Format phone numbers before submission
      formData.append("number", formatPhoneNumber(formValues.number));
      formData.append(
        "whatsapp_number",
        formatPhoneNumber(formValues.whatsapp_number)
      );

      formData.append("division", formValues.division);
      formData.append("social_links", formValues.social_links);
      formData.append("details", formValues.details);
      formData.append("private_price", formValues.private_price);
      formData.append("bussiness_price", formValues.bussiness_price);

      // Add file fields to FormData
      if (formValues.profile_image) {
        formData.append("profile_image", formValues.profile_image);
      }

      if (formValues.id_card) {
        formData.append("id_card", formValues.id_card);
      }

      // Send the request to the API
      const response = await axiosServices.post(
        "/video-creator-requests",
        formData
      );

      if (response.status === 200 || response.status === 201) {
        toast.success(t("you have been signed in"), {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          rtl: isRTL,
        });

        // Reset form
        setFormValues({
          name: "",
          email: "",
          number: "",
          whatsapp_number: "",
          division: "",
          social_links: "",
          details: "",
          profile_image: null,
          id_card: null,
          private_price: "",
          bussiness_price: "",
        });

        setTouched({
          name: false,
          email: false,
          number: false,
          whatsapp_number: false,
          division: false,
          social_links: false,
          details: false,
          profile_image: false,
          id_card: false,
          private_price: false,
          bussiness_price: false,
        });

        setFormErrors({
          name: "",
          email: "",
          number: "",
          whatsapp_number: "",
          division: "",
          social_links: "",
          details: "",
          profile_image: "",
          id_card: "",
          private_price: "",
          bussiness_price: "",
        });

        // Close modal
        setModalOpen(false);
      }
    } catch (error) {
      const axiosError = error as AxiosError;

      // Handle validation errors from the server
      if (axiosError.response?.status === 403) {
        toast.warning(t("لقد أرسلت طلبًا بالفعل!"), {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          rtl: isRTL,
        });
      } else if (
        axiosError.response?.status === 422 &&
        axiosError.response.data
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const serverErrors = (axiosError.response.data as any).errors || {};

        // Update form errors with server validation errors
        const updatedErrors = { ...formErrors };
        let errorMessage = t("تحقق من البيانات المدخلة:");

        Object.keys(serverErrors).forEach((field) => {
          const fieldName = field as FormField;
          if (fieldName in updatedErrors) {
            updatedErrors[fieldName] = serverErrors[field][0];
            errorMessage += `\n- ${serverErrors[field][0]}`;
          }
        });

        setFormErrors(updatedErrors);

        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 7000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          rtl: isRTL,
        });
      } else if (axiosError.response) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        toast.error((axiosError.response.data as any)?.error || t("errorM"), {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          rtl: isRTL,
        });
      } else {
        toast.error(t("errorM"), {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          rtl: isRTL,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formFields = [
    {
      id: "name",
      type: "text",
      label: t("name"),
      placeholder: t("أدخل اسمك الكامل"),
    },
    {
      id: "email",
      type: "email",
      label: t("email"),
      placeholder: "example@domain.com",
    },
    {
      id: "number",
      type: "text",
      label: t("number"),
      placeholder: "+201234567890",
    },
    {
      id: "whatsapp_number",
      type: "text",
      label: t("whatsapp_number"),
      placeholder: "+201234567890",
    },
    {
      id: "division",
      type: "select",
      label: t("division"),
      options: divisions,
    },
    {
      id: "social_links",
      type: "text",
      label: t("social_links"),
      placeholder: "https://www.facebook.com/youraccount",
    },
    {
      id: "private_price",
      type: "text",
      label: t("private_price"),
      placeholder: "400",
    },
    {
      id: "bussiness_price",
      type: "text",
      label: t("bussiness_price"),
      placeholder: "400",
    },
    {
      id: "profile_image",
      type: "file",
      label: t("profile_image"),
      accept: "image/*",
    },
    { id: "id_card", type: "file", label: t("id_card"), accept: "image/*" },
    {
      id: "details",
      type: "textarea",
      label: t("details"),
      placeholder: t("أي تفاصيل إضافية تود إضافتها..."),
    },
  ];

  return (
    <>
      <div
        className="flex flex-col items-center "
        onClick={() => setModalOpen(true)}
      >
        <ToastContainer position="top-right" rtl={isRTL} />

        <div className="bg-[#484848] cursor-pointer rounded-full overflow-hidden w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-[170px] lg:h-[170px] flex items-center justify-center">
          <img
            src={joinUsImage}
            alt={t("Join us")}
            className="max-w-[60%] max-h-[60%] lg:max-w-[70%] lg:max-h-[70%]"
          />
        </div>
        <p className="text-base sm:text-lg md:text-xl text-center underline font-medium mt-3">
          {t("Join us")}
        </p>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          aria-hidden="true"
          className="flex bg-[#000000bf] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full h-full"
        >
          <div className="relative p-4 w-full md:w-1/2 max-h-full">
            <div className="relative bg-white rounded-3xl shadow-lg">
              <div className="flex items-center justify-between p-4 md:p-5 border-b">
                <h2 className="text-2xl font-semibold text-[#4267B2]">
                  <div className="flex items-center gap-2">
                    <MdVerified className="text-xl" />
                    {t("تسجيل صانع محتوى فيديو")}
                  </div>
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
                  <span className="sr-only">{t("close")}</span>
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto max-h-[70vh]">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {formFields.map((field) => (
                    <div key={field.id} className="mb-6">
                      <label
                        htmlFor={field.id}
                        className="block mb-2 text-sm font-medium text-[#4267B2]"
                      >
                        {field.label}
                      </label>

                      {field.type === "textarea" ? (
                        <textarea
                          name={field.id}
                          id={field.id}
                          rows={4}
                          value={formValues[field.id as FormField] as string}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="border-b border-[#4267B2] text-gray-900 text-sm outline-none focus-visible:outline-0 block w-full p-2.5 focus:border-[#3B5998]"
                          placeholder={field.placeholder}
                        ></textarea>
                      ) : field.type === "select" ? (
                        <select
                          name={field.id}
                          id={field.id}
                          value={formValues[field.id as FormField] as string}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="border-b border-[#4267B2] text-gray-900 text-sm outline-none focus-visible:outline-0 block w-full p-2.5 focus:border-[#3B5998]"
                        >
                          {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : field.type === "file" ? (
                        <input
                          type="file"
                          name={field.id}
                          id={field.id}
                          accept={field.accept}
                          onChange={handleFileChange}
                          onBlur={handleBlur}
                          className="block w-full text-sm text-gray-900 border border-[#4267B2] rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2"
                        />
                      ) : (
                        <input
                          type={field.type}
                          name={field.id}
                          id={field.id}
                          value={formValues[field.id as FormField] as string}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="border-b border-[#4267B2] text-gray-900 text-sm outline-none focus-visible:outline-0 block w-full p-2.5 focus:border-[#3B5998]"
                          placeholder={field.placeholder}
                        />
                      )}

                      {touched[field.id as FormField] &&
                        formErrors[field.id as FormField] && (
                          <small className="text-red-500 mt-1 block">
                            {formErrors[field.id as FormField]}
                          </small>
                        )}
                    </div>
                  ))}

                  <div className="flex items-center mt-4">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={true}
                      onChange={() => {}}
                      className="mr-2"
                    />
                    <label htmlFor="terms" className="text-sm">
                      {t("terms_agree")}{" "}
                      <a
                        href="/Terms/VideosOrder"
                        className="text-[#4267B2] underline"
                      >
                        {t("terms_conditions")}
                      </a>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#4267B2] text-white border border-[#4267B2] hover:bg-white hover:text-[#4267B2] font-bold rounded-full px-6 py-3 text-center transition-all duration-300 flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                        {t("جاري الإرسال...")}
                      </>
                    ) : (
                      <>
                        <MdVerified className="text-xl" />
                        {t("send_now")}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
