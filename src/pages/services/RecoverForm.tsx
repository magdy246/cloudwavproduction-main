import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdVerified } from 'react-icons/md';
import { useTranslation } from "react-i18next";
import { axiosServices } from '../../utils/axios';
import { AxiosError } from 'axios';
import { FaChevronRight } from 'react-icons/fa';
interface FormFieldConfig {
    id: string;
    type: string;
    label: string;
    placeholder: string;
    options?: Array<{ value: string; label: string }>;
  }
// Define types for form values and errors
type FormField = 'name' | 'email' | 'phone' | 'whatsapp_number' | 'platform' | 'social_media_account' | 'details';

interface FormValues {
    name: string;
    email: string;
    phone: string;
    whatsapp_number: string;
    platform: string;
    social_media_account: string;
    details: string;
}

interface FormTouched {
    name: boolean;
    email: boolean;
    phone: boolean;
    whatsapp_number: boolean;
    platform: boolean;
    social_media_account: boolean;
    details: boolean;
}

interface FormErrors {
    name: string;
    email: string;
    phone: string;
    whatsapp_number: string;
    platform: string;
    social_media_account: string;
    details: string;
}

export default function RecoverForm() {
    const { t } = useTranslation();
    const [modalOpen, setModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formValues, setFormValues] = useState<FormValues>({
        name: "",
        email: "",
        phone: "",
        whatsapp_number: "",
        platform: "",
        social_media_account: "",
        details: ""
    });
    const [formErrors, setFormErrors] = useState<FormErrors>({
        name: "",
        email: "",
        phone: "",
        whatsapp_number: "",
        platform: "",
        social_media_account: "",
        details: ""
    });
    const [touched, setTouched] = useState<FormTouched>({
        name: false,
        email: false,
        phone: false,
        whatsapp_number: false,
        platform: false,
        social_media_account: false,
        details: false
    });

    // RTL Support
    const isRTL = true; // Set to true for Arabic, false for English

    // Validation functions
    const validateField = (name: FormField, value: string): string => {
        let error = "";

        switch (name) {
            case "name":
              if (!value) {
                error = t("errors.name_required");
              } else if (value.length < 3) {
                error = t("errors.name_min");
              } else if (value.length > 20) {
                error = t("errors.name_max");
              }
              break;
          
            case "email":
              if (!value) {
                error = t("errors.email_required");
              } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
                error = t("errors.email_invalid");
              }
              break;
          
            case "phone":
            case "whatsapp_number":
              if (!value) {
                error = t("errors.phone_required");
              } else if (!/^(010|011|012|015)[0-9]{8}$/.test(value)) {
                error = t("errors.phone_invalid");
              }
              break;
          
            case "platform":
              if (!value) {
                error = t("errors.platform_required");
              }
              break;
          
            case "details":
              if (value && value.length < 10) {
                error = t("errors.details_min");
              } else if (value && value.length > 500) {
                error = t("errors.details_max");
              }
              break;
          
            default:
              break;
          }

        return error;
    };

    // Handle field change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const fieldName = name as FormField;

        setFormValues({ ...formValues, [fieldName]: value });

        // Validate field if touched
        if (touched[fieldName]) {
            const error = validateField(fieldName, value);
            setFormErrors({ ...formErrors, [fieldName]: error });
        }
    };

    // Handle field blur
    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const fieldName = name as FormField;

        setTouched({ ...touched, [fieldName]: true });

        const error = validateField(fieldName, value);
        setFormErrors({ ...formErrors, [fieldName]: error });
    };

    // Validate all fields
    const validateForm = (): boolean => {
        const errors: Partial<FormErrors> = {};
        let isValid = true;

        (Object.keys(formValues) as FormField[]).forEach(name => {
            const error = validateField(name, formValues[name]);
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
        (Object.keys(formValues) as FormField[]).forEach(key => {
            allTouched[key] = true;
        });
        setTouched(allTouched);

        // Validate form
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Structure the data according to the required format
            const requestData = {
                type: "recover social media account",
                data: {
                    name: formValues.name,
                    email: formValues.email,
                    phone: formValues.phone,
                    whatsapp_number: formValues.whatsapp_number,
                    platform: formValues.platform,
                    social_media_account: formValues.social_media_account,
                    details: formValues.details
                }
            };

            const response = await axiosServices.post("/services", requestData);

            if (response.status === 200 || response.status === 201) {
                toast.success("تم إرسال طلب التحقق بنجاح", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    rtl: isRTL
                });

                // Reset form
                setFormValues({
                    name: "",
                    email: "",
                    phone: "",
                    whatsapp_number: "",
                    platform: "",
                    social_media_account: "",
                    details: ""
                });
                setTouched({
                    name: false,
                    email: false,
                    phone: false,
                    whatsapp_number: false,
                    platform: false,
                    social_media_account: false,
                    details: false
                });
                setFormErrors({
                    name: "",
                    email: "",
                    phone: "",
                    whatsapp_number: "",
                    platform: "",
                    social_media_account: "",
                    details: ""
                });

                // Close modal
                setModalOpen(false);
            }
        } catch (error) {
            const axiosError = error as AxiosError;
            if (axiosError.response) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                toast.error((axiosError.response.data as any)?.error || "حدث خطأ أثناء إرسال الطلب", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    rtl: isRTL
                });
            } else {
                toast.error("حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    rtl: isRTL
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Available platforms
    // const platforms = [
    //     { value: "", label: "اختر المنصة" },
    //     { value: "Facebook", label: "فيسبوك" },
    //     { value: "Instagram", label: "انستغرام" },
    //     { value: "Twitter", label: "تويتر" },
    //     { value: "TikTok", label: "تيك توك" },
    //     { value: "YouTube", label: "يوتيوب" },
    //     { value: "LinkedIn", label: "لينكد إن" },
    //     { value: "Other", label: "أخرى" }
    // ];

    // Form fields configuration
    // const formFields = [
    //     { id: "name", type: "text", label: "الاسم", placeholder: "أدخل اسمك الكامل" },
    //     { id: "email", type: "email", label: "البريد الإلكتروني", placeholder: "example@domain.com" },
    //     { id: "phone", type: "text", label: "رقم الهاتف", placeholder: "01234567890" },
    //     { id: "whatsapp_number", type: "text", label: "رقم الواتساب", placeholder: "01234567890" },
    //     { id: "platform", type: "select", label: "المنصة", options: platforms },
    //     { id: "social_media_account", type: "text", label: "رابط الحساب", placeholder: "https://www.facebook.com/youraccount" },
    //     { id: "details", type: "textarea", label: "تفاصيل إضافية (اختياري)", placeholder: "أي تفاصيل إضافية تود إضافتها..." }
    // ];
    const formFields: FormFieldConfig[] = [
        { id: "name", type: "text", label: t("modal.name"), placeholder: t("modal.name_placeholder") },
        { id: "email", type: "email", label: t("modal.email"), placeholder: t("modal.email_placeholder") },
        { id: "phone", type: "text", label: t("modal.phone"), placeholder: t("modal.phone_placeholder") },
        { id: "whatsapp_number", type: "text", label: t("modal.whatsapp_number"), placeholder: t("modal.whatsapp_number_placeholder") },
        { id: "platform", type: "text", label: t("modal.platform"), placeholder: t("modal.platform_placeholder") },
        { id: "social_media_account", type: "text", label: t("modal.social_media_account"), placeholder: t("modal.social_media_account_placeholder") },
        { id: "details", type: "textarea", label: t("modal.details"), placeholder: t("modal.details_placeholder") }
    ];
    return (
        <>
            <ToastContainer position="top-right" rtl={isRTL} />
            <button onClick={() => setModalOpen(true)} className="flex flex-row items-center text-lg text-[#30B797] cursor-pointer hover:text-[#488b7c] font-bold transition-all">
                {t("Get_it_now")}
                <FaChevronRight />
            </button>

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
                                        {/* طلب التحقق من الحساب */}
                                        { t("modal.title")}
                                    </div>
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                                >
                                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                    </svg>
                                    <span className="sr-only">إغلاق</span>
                                </button>
                            </div>

                            <div className="p-6 md:p-8">
                                {/* <p className="text-gray-600 mb-6">أدخل بيانات حسابك للتحقق منه والحصول على شارة التوثيق</p> */}

                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    {formFields.map((field) => (
                                        <div key={field.id} className="mb-6">
                                            <label htmlFor={field.id} className="block mb-2 text-sm font-medium text-[#4267B2]">
                                                {field.label}
                                            </label>

                                            {field.type === "textarea" ? (
                                                <textarea
                                                    name={field.id}
                                                    id={field.id}
                                                    rows={4}
                                                    value={formValues[field.id as FormField]}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    className="border-b border-[#4267B2] text-gray-900 text-sm outline-none focus-visible:outline-0 block w-full p-2.5 focus:border-[#3B5998]"
                                                    placeholder={field.placeholder}
                                                ></textarea>
                                            ) : field.type === "select" ? (
                                                <select
                                                    name={field.id}
                                                    id={field.id}
                                                    value={formValues[field.id as FormField]}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    className="border-b border-[#4267B2] text-gray-900 text-sm outline-none focus-visible:outline-0 block w-full p-2.5 focus:border-[#3B5998]"
                                                >
                                                    {field.options?.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type={field.type}
                                                    name={field.id}
                                                    id={field.id}
                                                    value={formValues[field.id as FormField]}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    className="border-b border-[#4267B2] text-gray-900 text-sm outline-none focus-visible:outline-0 block w-full p-2.5 focus:border-[#3B5998]"
                                                    placeholder={field.placeholder}
                                                />
                                            )}

                                            {touched[field.id as FormField] && formErrors[field.id as FormField] && (
                                                <small className="text-red-500 mt-1 block">{formErrors[field.id as FormField]}</small>
                                            )}
                                        </div>
                                    ))}
{/* 
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                                        <p className="text-sm text-blue-800">
                                            <strong>ملاحظة:</strong> سيتم مراجعة طلبك ومن ثم التواصل معك خلال 24-48 ساعة
                                        </p>
                                    </div> */}

                                    <button
                                        type="submit"
                                        className="w-full bg-[#4267B2] text-white border border-[#4267B2] hover:bg-white hover:text-[#4267B2] font-bold rounded-full px-6 py-3 text-center transition-all duration-300 flex items-center justify-center gap-2"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                                جاري الإرسال...
                                            </>
                                        ) : (
                                            <>
                                                <MdVerified className="text-xl" />
                                                {/* إرسال طلب التحقق */}
                                                { t("modal.send")}
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