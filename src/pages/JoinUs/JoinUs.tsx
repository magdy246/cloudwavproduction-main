/* eslint-disable react-hooks/exhaustive-deps */
// import karaokeFill from "../../assets/images/joinUsImage/karaokeFill.svg";
// import karaokeOutline from "../../assets/images/joinUsImage/karaokeOutline.svg";
import singingOutline from "../../assets/images/joinUsImage/singingOutline.png";
import singingFill from "../../assets/images/joinUsImage/singingFill.png";
import { useState, useEffect } from "react";
import clsx from "clsx";
import Pricing from "../Pricing/Pricing";
import Dialog from "../../components/Dialog/Dialog";
import TextField from "../../components/Form/TextField/TextField";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import SelectField from "../../components/Form/SelectField/SelectField";
import { RiUploadLine } from "@remixicon/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { axiosServices } from "../../utils/axios";
import Spinner, { Spinner2 } from "../../components/Spinner/Spinner";
import { useAuth } from "../../Providers/AuthContext";
import ProtectRoute from "../../utils/ProtectRoute";
// import { toast } from "react-toastify";
import { AxiosError, AxiosResponse } from "axios";
import Swal from "sweetalert2";
function JoinUsForm({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const { t } = useTranslation();
  const [imageUpload, setImageUpload] = useState<{
    path: string;
    loading: boolean;
  }>({
    path: "",
    loading: false,
  });

  // Add state for ID card image upload
  const [idCardUpload, setIdCardUpload] = useState<{
    path: string;
    loading: boolean;
  }>({
    path: "",
    loading: false,
  });

  const schema = z.object({
    famous_name: z.string({
      message: t("validation.required"),
    }),
    famous_email: z
      .string({
        message: t("validation.required"),
      })
      .email({
        message: t("validation.correctEmail"),
      }),
    famous_number: z.string({ message: t("validation.required") }).min(11, {
      message: t("validation.validPhone"),
    }),
    famous_division: z.string({ message: t("validation.required") }),
    famous_social_links: z.string({ message: t("validation.required") }).url(),
    famous_profile_image: z.instanceof(File, {
      message: t("validation.required"),
    }),
    famous_id_card_image: z.instanceof(File, {
      message: t("validation.required"),
    }), // Added ID card validation
    famous_details: z.string({ message: t("validation.required") }).min(25),
    famous_whatsapp_number: z
      .string({ message: t("validation.required") })
      .min(9, {
        message: t("validation.validPhone"),
      }),
  });
  type TField = z.infer<typeof schema>;
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const isAr = lang === "ar";
  const formInputs = [
    {
      legend: isAr ? "اسمك" : "Your name",
      name: "famous_name",
    },
    {
      legend: isAr ? "البريد الالكتروني" : "Email",
      name: "famous_email",
    },
    {
      legend: isAr ? "رقم الهاتف" : "Phone number",
      name: "famous_number",
      type: "number",
    },
    {
      legend: isAr ? "رابط السوشيال ميديا" : "Social media link",
      name: "famous_social_links",
    },
    {
      legend: isAr ? "رقم الواتس اب" : "WhatsApp Number",
      name: "famous_whatsapp_number",
      type: "number",
    },
    {
      legend: isAr ? "تفاصيل إضافية" : "Additional details",
      name: "famous_details",
    },
  ];
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { isValid, errors },
  } = useForm<TField>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    const imageFile = watch("famous_profile_image");
    if (!imageFile) return;

    const reader = new FileReader();

    const handleLoadStart = () => {
      setImageUpload((prev) => ({ ...prev, loading: true }));
    };

    const handleLoad = (e: ProgressEvent<FileReader>) => {
      setImageUpload({ path: e.target?.result as string, loading: false });
    };

    const handleProgress = () => {
      setImageUpload((prev) => ({ ...prev, loading: true }));
    };

    const handleLoadEnd = () => {
      setImageUpload((prev) => ({ ...prev, loading: false }));
    };

    reader.addEventListener("loadstart", handleLoadStart);
    reader.addEventListener("load", handleLoad);
    reader.addEventListener("progress", handleProgress);
    reader.addEventListener("loadend", handleLoadEnd);

    reader.readAsDataURL(imageFile);

    return () => {
      reader.removeEventListener("loadstart", handleLoadStart);
      reader.removeEventListener("load", handleLoad);
      reader.removeEventListener("progress", handleProgress);
      reader.removeEventListener("loadend", handleLoadEnd);
    };
  }, [watch("famous_profile_image")]);

  // Add effect for ID card image upload
  useEffect(() => {
    const idCardFile = watch("famous_id_card_image");
    if (!idCardFile) return;

    const reader = new FileReader();

    const handleLoadStart = () => {
      setIdCardUpload((prev) => ({ ...prev, loading: true }));
    };

    const handleLoad = (e: ProgressEvent<FileReader>) => {
      setIdCardUpload({ path: e.target?.result as string, loading: false });
    };

    const handleProgress = () => {
      setIdCardUpload((prev) => ({ ...prev, loading: true }));
    };

    const handleLoadEnd = () => {
      setIdCardUpload((prev) => ({ ...prev, loading: false }));
    };

    reader.addEventListener("loadstart", handleLoadStart);
    reader.addEventListener("load", handleLoad);
    reader.addEventListener("progress", handleProgress);
    reader.addEventListener("loadend", handleLoadEnd);

    reader.readAsDataURL(idCardFile);

    return () => {
      reader.removeEventListener("loadstart", handleLoadStart);
      reader.removeEventListener("load", handleLoad);
      reader.removeEventListener("progress", handleProgress);
      reader.removeEventListener("loadend", handleLoadEnd);
    };
  }, [watch("famous_id_card_image")]);

  type TOption = {
    id: number;
    name: string;
  };
  const options = [
    { id: 1, name: "Rap" },
    { id: 2, name: "pop" },
    { id: 3, name: "Blues" },
    { id: 4, name: "Rock" },
    { id: 5, name: "Mahraganat" },
    { id: 6, name: "Jazz" },
    { id: 7, name: "Metal & Heavy Metal" },
    { id: 8, name: "Sonata" },
    { id: 9, name: "Symphony" },
    { id: 10, name: "Orchestra" },
    { id: 11, name: "Concerto" },
  ];
  const { mutate, isPending } = useMutation<
    AxiosResponse<{ message: string }>,
    AxiosError<{ error: string }>,
    FormData
  >({
    mutationKey: ["artist-request"],
    mutationFn: (data) =>
      axiosServices.post("/famous-artist-requests", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    onError: (error) => {
      console.log(error);
      Swal.fire(
        error.response?.data.error || "something error happened",
        "",
        "error"
      );
    },
    onSuccess: (data) => {
      Swal.fire(
        data.data.message || "the request has been send to admin",
        "",
        "success"
      );
      handleReset();
    },
  });

  function handleReset() {
    reset();
    setIdCardUpload({ path: "", loading: false });
    setImageUpload({ path: "", loading: false });
    setOpen(false);
  }
  const submitting: SubmitHandler<TField> = (data) => {
    console.log("Form submitted with data:", data);
    const formData = new FormData();
    for (const key in data) {
      const value = data[key as keyof TField];
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    }
    console.log("FormData created:", formData);

    mutate(formData);
  };

  return (
    <Dialog
      title={isAr ? "انضم إلينا" : "Join us"}
      open={open}
      handleClose={handleReset}
    >
      <form onSubmit={handleSubmit(submitting)} className="px-9 pb-9 relative">
        {formInputs.map((input) => (
          <Controller
            key={input.name}
            control={control}
            name={input.name as keyof TField}
            render={({ field, fieldState: { error } }) => (
              <TextField
                legend={input.legend}
                variant="outline"
                {...field}
                value={field.value as string}
                error={!!error}
                helperText={error?.message}
                type={input.type || "text"}
              />
            )}
          />
        ))}
        <Controller
          control={control}
          name={"famous_division"}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <SelectField
              options={options}
              getOptionLabel={(option: TOption) => option.name}
              onChange={(newValue) => onChange(newValue.name)}
              value={options.find((el) => el.name == value)}
              variant="outline"
              helperText={error?.message}
              error={!!error}
              legend={isAr ? "اختر نوعك" : "Artist Division"}
            />
          )}
        />
        <Controller
          control={control}
          name="famous_profile_image"
          render={({ field, fieldState: { error } }) => (
            <label className="">
              <div
                className={clsx(
                  "border-1 border-purple-500 rounded h-33 flex-center text-[20px] gap-3 mt-9",
                  !!error && "border-red-500"
                )}
              >
                <RiUploadLine />
                {imageUpload.loading
                  ? t("validation.uploading")
                  : isAr
                  ? "اختر صورة"
                  : "Choose Profile Image"}
              </div>
              <input
                type="file"
                accept="image/*"
                min={1}
                className="hidden"
                onChange={(e) => field.onChange(e.target.files?.[0])}
              />
              <p className="text-red-500 font-normal text-[12px] m-1 mt-2">
                {error?.message}
              </p>
            </label>
          )}
        />
        {/* Profile image preview */}
        <div className="images flex-center mt-4">
          {imageUpload.loading ? (
            <Spinner2 w={10} h={10} />
          ) : (
            imageUpload.path && (
              <img
                src={imageUpload.path}
                width={200}
                height={200}
                alt="Profile Preview"
              />
            )
          )}
        </div>

        {/* ID Card Upload Field */}
        <Controller
          control={control}
          name="famous_id_card_image"
          render={({ field, fieldState: { error } }) => (
            <label className="">
              <div
                className={clsx(
                  "border-1 border-purple-500 rounded h-33 flex-center text-[20px] gap-3 mt-9",
                  !!error && "border-red-500"
                )}
              >
                <RiUploadLine />
                {idCardUpload.loading
                  ? t("validation.uploading")
                  : isAr
                  ? "اختر صورة الهوية"
                  : "Upload ID Card"}
              </div>
              <input
                type="file"
                accept="image/*"
                min={1}
                className="hidden"
                onChange={(e) => field.onChange(e.target.files?.[0])}
              />
              <p className="text-red-500 font-normal text-[12px] m-1 mt-2">
                {error?.message}
              </p>
            </label>
          )}
        />
        {/* ID Card preview */}
        <div className="images flex-center mt-4">
          {idCardUpload.loading ? (
            <Spinner2 w={10} h={10} />
          ) : (
            idCardUpload.path && (
              <img
                src={idCardUpload.path}
                width={200}
                height={200}
                alt="ID Card Preview"
              />
            )
          )}
        </div>

        <button
          type="submit"
          className="submit__button mt-9 "
          disabled={isPending || !isValid}
        >
          {isPending ? <Spinner /> : isAr ? "أرسل الآن" : "Send Now"}
        </button>
        {Object.keys(errors).length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600 text-sm">
              {isAr
                ? "يرجى تصحيح الأخطاء أعلاه"
                : "Please fix the errors above"}
            </p>
          </div>
        )}
      </form>
    </Dialog>
  );
}
interface TJoinUsTypes {
  type: string;
  imageOutline: string;
  imageFill: string;
}
export default function JoinUs() {
  const [joinUsType, setJoinUsType] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const { i18n } = useTranslation();
  const user = useAuth();
  const lang = i18n.language;
  const isAr = lang === "ar";
  const joinUsTypes = [
    {
      type: isAr ? "فنان جديد" : "New Artist",
      imageOutline: singingOutline,
      imageFill: singingFill,
    },
  ];

  return (
    <ProtectRoute condition={user?.isLogin || false} redirect={"/login"}>
      <div className="carousel overflow-hidden  my-17">
        <h3 className="font-extrabold text-4xl text-center mb-7 font-header">
          {isAr ? "اختر نوعك" : "Please select your type"}
        </h3>
        <div className="wrapper flex-center flex-col md:flex-row gap-14 mb-6">
          {joinUsTypes.map((type: TJoinUsTypes, i) => {
            const isChecked = type.type == joinUsType;
            return (
              <label
                key={i}
                className={clsx(
                  "bg-white shadow-[0px_22.34px_17.87px_0px_#0000000B] flex-center flex-col rounded-xl w-85 h-85 mb-6",
                  isChecked && "border-green-500 border"
                )}
                htmlFor={type.type}
              >
                <div className="images w-[184px] h-[184px] relative">
                  <img
                    src={type.imageOutline}
                    alt={`${type.type}-image-outline`}
                    className={clsx(
                      "w-full absolute top-0 left-0 transition-opacity duration-200",
                      type.type !== joinUsType ? "opacity-100" : "opacity-1"
                    )}
                  />
                  <img
                    src={type.imageFill}
                    alt={`${type.type}-image-fill`}
                    className={clsx(
                      "w-full absolute top-0 left-0 transition-opacity duration-200",
                      type.type !== joinUsType ? "opacity-1" : "opacity-100"
                    )}
                  />
                </div>
                <p className=" font-bold text-2xl tracking-tight mb-2 font-header">
                  <span className="capitalize">{type.type}</span>
                </p>
                <div className="w-7  h-7 border rounded-full p-1 has-checked:bg-green-500 bg-[#303030] transition-color has-checked:border-transparent flex-center relative">
                  <input
                    type="radio"
                    name="joinUsType"
                    value={type.type}
                    checked={isChecked}
                    className="appearance-none"
                    id={type.type}
                    onChange={(e) => setJoinUsType(e.target.value)}
                  />
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    className={clsx(
                      "text-white checkIcon transition-all duration-700",
                      isChecked && "show__checkIcon"
                    )}
                  >
                    <path
                      stroke-linejoin="round"
                      stroke-linecap="round"
                      stroke-width="2"
                      stroke="currentColor"
                      d="M4 12L10 18L20 6"
                    ></path>
                  </svg>
                </div>
              </label>
            );
          })}
          <JoinUsForm open={openDialog} setOpen={setOpenDialog} />
        </div>
        {/* accept button */}
        <button
          onClick={() => setOpenDialog(true)}
          disabled={!joinUsType}
          className=" cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 h-16 text-[28px] font- bg-green-500 p-2 flex-center rounded-3xl w-48 mx-auto text-white"
        >
          {isAr ? "التالي" : "Next"}
        </button>
      </div>
      <Pricing />
    </ProtectRoute>
  );
}
