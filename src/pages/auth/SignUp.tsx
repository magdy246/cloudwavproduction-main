import logo from "../../assets/images/logo.svg";
import signUpImage from "../../assets/images/signUpImage.svg";
import { RiArrowRightSLine, RiArrowLeftSLine } from "react-icons/ri";
// import { splitText } from "../../utils/functions";
import TextField from "../../components/Form/TextField/TextField";
import { useState, useRef } from "react";
import { z } from "zod";

import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import googleLogo from "../../assets/images/brands/google.svg";
// import appleLogo from "../../assets/images/brands/apple.svg";
// import facebookLogo from "../../assets/images/brands/facebook.svg";
// import { useGSAP } from "@gsap/react";
import image1 from "../../assets/images/imageGroup/image1.svg";
import image2 from "../../assets/images/imageGroup/image2.svg";
import image3 from "../../assets/images/imageGroup/image3.svg";
import image4 from "../../assets/images/imageGroup/image4.svg";
import image5 from "../../assets/images/imageGroup/image5.svg";
// import { gsap } from "gsap";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { axiosServices } from "../../utils/axios";
import Spinner from "../../components/Spinner/Spinner";
import { useNavigate } from "react-router-dom";
import ProtectRoute from "../../utils/ProtectRoute";
import { useAuth } from "../../Providers/AuthContext";
import HCaptchaComponent, { HCaptchaRef } from "../../components/HCaptcha/HCaptcha";

export function OAuthForm() {
  // const { t } = useTranslation();

  // const oAuth = [
  //   {
  //     logo: googleLogo,
  //     name: "google",
  //   },
  //   // {
  //   //   logo: appleLogo,
  //   //   name: "apple",
  //   // },
  //   // {
  //   //   logo: facebookLogo,
  //   //   name: "facebook",
  //   // },
  // ];
  return (
    <div>
      {/* line break */}
      {/* <div className="flex items-center gap-10 mt-4">
        <div className="h-[1.3px] w-full bg-[#91949980]"></div>
        <p className="text-nowrap text-purple-700  font-medium text-[26px] text-center">
          {t("or")}
        </p>
        <div className="h-[1.3px] w-full bg-[#91949980]"></div>
      </div> */}
      {/* OAuth integration */}
      {/* <div className="flex  mt-4 gap-10 justify-center">
        {oAuth.map((o) => (
          <div key={o.name} className="w-10">
            <img src={o.logo} alt={o.name} />
          </div>
        ))}
      </div> */}
    </div>
  );
}

export function AnimationGallery() {
  const { t } = useTranslation();
  const gallery = [
    {
      texts: [
        {
          text: t("signUpIntro1"),
          className: "inline-block text-sky-500",
        },
        {
          text: t("signUpIntro2"),
          className: "inline-block text-purple-700",
        },
      ],
      imagesGroup: [image1, image2, image3, image4, image5],
      subText: t("signUpSubTitle"),
      image: signUpImage,
    },
  ];
  const [count] = useState<number>(0);
  const container = useRef<null | HTMLDivElement>(null);

  // const
  return (
    <div
      className="max-w-[600px] overflow-hidden relative hidden lg:block"
      ref={container}
    >
      <div className="wrapper flex relative">
        {gallery.map((g, i) => (
          <div
            className="bg-sky-100 pt-8 px-12 min-h-screen relative w-[600px] shrink-0 main-text"
            key={i}
          >
            {/* text  */}
            <div>
              <h3 className="text-black font-header font-extrabold text-[64px] leading-[90%] overflow-hidden ">
                {g.texts.map((text) =>
                text.text
                )}
              </h3>
              <p className="font-medium text-[14px] text-black mt-6 sub-text">
                {g.subText}
              </p>
              {/* imageGroup */}
              <div className="flex mt-4">
                {g.imagesGroup.map((image, i) => (
                  <div key={i} className="-ml-4">
                    <img src={image} alt={`user-image${i}`} />
                  </div>
                ))}
              </div>
            </div>
            {/* arrow */}
            <div className="flex gap-4 mt-11">
              <button
                // onClick={handlePreviousImage}
                disabled={count <= 0}
                className="left flex-center bg-white disabled:cursor-not-allowed disabled:hover:bg-white hover:bg-sky-900 transition-colors rounded-full w-6 h-6"
              >
                <RiArrowLeftSLine size={21} />
              </button>
              <button
                // onClick={handleNextImage}
                disabled={count >= gallery.length - 1}
                className="right flex-center bg-white disabled:cursor-not-allowed disabled:hover:bg-white hover:bg-sky-900 transition-colors rounded-full w-6 h-6"
              >
                <RiArrowRightSLine size={21} />
              </button>
            </div>
            {/* image */}
            <div className="-mr-12 h-80">
              <img src={g.image} className="w-full h-full object-contain" />
            </div>
          </div>
        ))}
      </div>
      {/* logo image */}
      <div className="absolute bottom-0 right-0 m-9">
        <img src={logo} alt="login-image" className="max-w-full" />
      </div>
    </div>
  );
}

interface TIField {
  name:
    | "name"
    | "birthDate"
    | "phone"
    | "password"
    | "password_confirmation"
    | "email";
  width: string;
  legend: string;
  label: string;
  type: string;
}
type ErrorMessage = {
  response: {
    data?: {
      message?: string;
    };
  };
};
export default function SignUp() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const auth = useAuth();
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const hcaptchaRef = useRef<HCaptchaRef>(null);
  const fields: TIField[] = [
    {
      name: "name",
      width: "50%",
      legend: t("enterYourName"),
      label: t("fullName"),
      type: "text",
    },
    {
      name: "email",
      width: "50%",
      legend: t("emailAddress"),
      label: t("emailAddress"),
      type: "text",
    },
    {
      name: "birthDate",
      width: "50%",
      legend: t("birthDate"),
      label: t("birthDate"),
      type: "date",
    },
    {
      name: "phone",
      width: "50%",
      legend: t("contact.phone"),
      label: t("contact.phone"),
      type: "number",
    },
    {
      name: "password",
      width: "50%",
      legend: t("password"),
      label: t("password"),
      type: "password",
    },
    {
      name: "password_confirmation",
      width: "50%",
      legend: t("confirmPassword"),
      label: t("confirmPassword"),
      type: "password",
    },
  ];

  // animation

  // validation
  const schema = z
    .object({
      name: z
        .string({
          message: t("validation.required"),
        })
        .min(4),
      email: z
        .string({
          message: t("validation.required"),
        })
        .email({
          message: t("validation.correctEmail"),
        }),
      password: z
        .string({
          message: t("validation.required"),
        })
        .min(8, {
          message: t("validation.password"),
        }),
      password_confirmation: z
        .string({ message: t("validation.required") })
        .min(8, {
          message: t("validation.password"),
        }),
      phone: z
        .string({
          message: t("validation.required"),
        })
        .min(11, {
          message: t("validation.validPhone"),
        }),
      birthDate: z.string({
        message: t("validation.required"),
      }),
    })
    .refine(
      ({ password, password_confirmation }) =>
        password === password_confirmation,
      {
        message: t("validation.confirmPassword"),
        path: ["password_confirmation"],
      }
    );
  type TField = z.infer<typeof schema>;

  const { handleSubmit, control, getValues } = useForm<TField>({
    resolver: zodResolver(schema),
  });
  // request
  const { mutate, isPending, isError, error } = useMutation<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    ErrorMessage,
    TField
  >({
    mutationKey: ["sign-up"],
    mutationFn: (data: TField) => axiosServices.post("/register", { ...data, captcha_token: captchaToken }),
    onSuccess: () => {
      localStorage.setItem("credential", JSON.stringify(getValues()));
      navigate("/verified-email", {
        replace: true,
      });
    },
    onError: () => {
      // Reset captcha on error
      hcaptchaRef.current?.reset();
      setCaptchaToken(null);
    },
  });

  const submitting: SubmitHandler<TField> = (data) => {
    if (!captchaToken) {
      // Show error message or focus captcha
      return;
    }
    mutate(data);
  };

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  const handleCaptchaError = (error: string) => {
    console.error('Captcha error:', error);
    setCaptchaToken(null);
  };

  const handleCaptchaExpire = () => {
    setCaptchaToken(null);
  };

  return (
    <ProtectRoute condition={!auth?.isLogin} redirect="/">
      <div className={clsx("min-h-screen flex items-center justify-center")}>
        {/* login form */}
        <>
          <div className="py-6 pb-0 px-15 md:px-30 md:py:12 flex-1">
            <h3 className="font-bold text-purple-700 text-3xl mt-4 mb-2 ">
              {t("servisespage.Get_started")}
            </h3>
            <form onSubmit={handleSubmit(submitting)} className="flex-1">
              {/* fields*/}
              <div className="flex flex-wrap gap-1">
                {fields.map((iField) => (
                  <Controller
                    control={control}
                    name={iField.name}
                    render={({ field, fieldState: { error } }) => {
                      return (
                        <div
                          className={clsx(
                            iField.width == "100%"
                              ? "w-full"
                              : "w-full md:w-[calc(50%-.15rem)]"
                          )}
                        >
                          <TextField
                            legend={iField.legend}
                            label={iField.label}
                            type={iField.type}
                            {...field}
                            error={!!error}
                            helperText={error?.message}
                          />
                        </div>
                      );
                    }}
                  />
                ))}
              </div>
              
              {/* hCaptcha */}
              <div className="mt-4">
                <HCaptchaComponent
                  ref={hcaptchaRef}
                  onVerify={handleCaptchaVerify}
                  onError={handleCaptchaError}
                  onExpire={handleCaptchaExpire}
                  className="flex justify-center"
                />
              </div>
              
              {isError && (
                <p className="error__message">
                  {error.response?.data?.message}
                </p>
              )}
              <button
                type="submit"
                className="submit__button disabled:opacity-50"
                disabled={isPending || !captchaToken}
              >
                {isPending ? <Spinner /> : t("signUp")}
              </button>
            </form>
            <OAuthForm />
          </div>
          {/* login image */}
          <AnimationGallery />
        </>
      </div>
    </ProtectRoute>
  );
}
