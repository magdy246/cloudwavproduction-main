import { RiMailFill, RiPhoneFill, RiCheckFill, RiAlertLine } from "@remixicon/react";
import { Controller, useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import TextField from "../../components/Form/TextField/TextField";
import AnimationLink from "../../components/AnimationLink/AnimationLink";
import arrowBack from "../../assets/images/icons/arrowBack.svg";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGSAP } from "@gsap/react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useAuth } from "../../Providers/AuthContext";
import ProtectRoute from "../../utils/ProtectRoute";
import { useMutation } from "@tanstack/react-query";
import { axiosServices } from "../../utils/axios";
import { AxiosError } from "axios";
import Swal from "sweetalert2";
import Spinner from "../../components/Spinner/Spinner";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import HCaptchaComponent, { HCaptchaRef } from "../../components/HCaptcha/HCaptcha";

function OtpVerified({ email }: { email: string }) {
  const [otp, setOtp] = useState<string[]>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const schema = z.object({
    email: z
      .string({ message: t("validation.required") })
      .email({ message: t("validation.correctEmail") }),
    password: z
      .string({ message: t("validation.required") })
      .min(8, t("validation.password")),
  });

  type TFields = z.infer<typeof schema>;

  const { mutate, isPending } = useMutation<
    any,
    AxiosError<Error>,
    TFields & { verification_code: string; password_confirmation: string }
  >({
    mutationKey: ["otp-verified"],
    mutationFn: (data) => axiosServices.post("/reset-password", data),
    onError: () => Swal.fire("the otp is incorrect", "", "error"),
    onSuccess: () => {
      Swal.fire("Password reset successfully", "", "success");
      navigate("/login");
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TFields>({
    resolver: zodResolver(schema),
  });

  console.log(errors);

  useEffect(() => {
    if (!email) return;
    setValue("email", email);
  }, [email]);

  const fields = [
    {
      name: "email",
      legend: "Email",
      type: "email",
      disabled: true,
    },
    {
      name: "password",
      legend: "Password",
      type: "password",
    },
  ];

  const onSubmit: SubmitHandler<TFields> = (data) => {
    mutate({
      ...data,
      password_confirmation: data.password,
      verification_code: otp!.join(""),
    });
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-20 h-20 rounded-full bg-purple-700 flex-center mb-4">
        <RiCheckFill size={40} color="white" />
      </div>

      <h3 className="text-purple-700 font-bold text-3xl text-center">
        OTP Verification
      </h3>

      <p className="font-medium text-[14px] text-[#C4C4C4] text-center mt-2 mb-6">
        Enter the OTP sent to your email
      </p>

      {/* Spam Alert */}
      <div className={clsx(
        "mb-6 p-4 rounded-lg border-2 border-amber-200 shadow-sm",
        i18n.dir() === "rtl" 
          ? "bg-gradient-to-l from-amber-50 to-orange-50 text-right" 
          : "bg-gradient-to-r from-amber-50 to-orange-50 text-left"
      )}>
        <div className={clsx(
          "flex items-start gap-3",
          i18n.dir() === "rtl" && "flex-row-reverse"
        )}>
          <div className="flex-shrink-0 mt-0.5">
            <RiAlertLine className="text-amber-600" size={20} />
          </div>
          <div className="flex-1">
            <h5 className="font-semibold text-amber-900 text-sm mb-1">
              {t("changeEmail.spamAlertTitle")}
            </h5>
            <p className="text-amber-800 text-xs leading-relaxed">
              {t("changeEmail.spamAlertMessage")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6 relative">
        {Array(6)
          .fill("")
          .map((_, index) => (
            <div
              className={clsx(
                "w-12 h-12 rounded-lg border-2 border-purple-700 text-center text-xl flex-center overflow-hidden",
                isPending && "animate-pulse"
              )}
            >
              <span
                key={otp?.[index]}
                className={clsx("transition-all block animate-slide")}
              >
                {otp?.[index]}
              </span>
            </div>
          ))}
        <div className="absolute inset-0">
          <input
            disabled={isPending}
            type="text"
            className="w-full h-full opacity-0 disabled:cursor-not-allowed"
            maxLength={6}
            onChange={(e) => setOtp(e.target.value.split(""))}
          />
        </div>
      </div>

      <div className="w-full flex-1">
        {fields.map((fieldInput) => (
          <Controller
            key={fieldInput.name}
            name={fieldInput.name as keyof TFields}
            control={control}
            render={({ field, fieldState }) => {
              return (
                <TextField
                  legend={fieldInput.legend}
                  type={fieldInput.type}
                  disabled={fieldInput.disabled}
                  {...field}
                  autoComplete="off"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              );
            }}
          />
        ))}
      </div>

      <button
        className="submit__button"
        onClick={handleSubmit(onSubmit)}
        disabled={isPending}
      >
        {isPending ? <Spinner /> : "submit"}
      </button>

      <p className="text-[#C4C4C4] text-sm mt-4">Didn't receive code?</p>
    </div>
  );
}
export default function ForgetPassword() {
  const auth = useAuth();
  const { t, i18n } = useTranslation();
  const carousel = useRef<HTMLDivElement | null>(null);
  const [steps, setSteps] = useState<number>(0);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const hcaptchaRef = useRef<HCaptchaRef>(null);

  const schema = z.object({
    email: z.string().email(),
  });
  type TField = z.infer<typeof schema>;
  const { control, handleSubmit, watch } = useForm<TField>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending } = useMutation<any, AxiosError<Error>, TField>({
    mutationKey: ["forget-password"],
    mutationFn: (data) => axiosServices.post("/forgot-password", { ...data, captcha_token: captchaToken }),
    onError: () => {
      Swal.fire("the email is incorrect", "", "error");
      // Reset captcha on error
      hcaptchaRef.current?.reset();
      setCaptchaToken(null);
    },
    onSuccess: () => setSteps(1),
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

  useGSAP(
    () => {
      gsap.to(".wrapper", {
        left: -100 * steps + "%",
        ease: "power2.inOut",
      });
    },
    { scope: carousel, dependencies: [steps] }
  );
  return (
    <ProtectRoute condition={!auth?.isLogin} redirect="/">
      <div className="min-h-screen bg-sky-100 flex-center p-0 ">
        <div
          className="carousel overflow-hidden mx-auto max-w-160"
          ref={carousel}
        >
          <div className="wrapper flex relative">
            {/* card 1 */}
            <div className="min-w-full shrink-0">
              {/* {steps == 0 && ( */}
              <div className="bg-white pb-4 pt-9 px-9 md:rounded-4xl rounded-0">
                <h3 className="text-purple-700 font-bold text-3xl text-center">
                  Forgot Password
                </h3>
                <p className="font-medium text-[14px] text-[#C4C4C4] text-center mt-2">
                  Please select option to send link reset password
                </p>
                {/* email */}
                <div className="px-6 py-6 shadow-[0px_10px_15px_0px_#2980971A] rounded-[14px] transition-colors border-2 mt-2 border-purple-700">
                  <div className="flex items-center gap-9">
                    {/* logo */}
                    <div className="w-14 h-14 rounded-full flex-center bg-purple-700 shrink-0">
                      <RiMailFill color="white" />
                    </div>
                    {/* text */}
                    <div>
                      <h5 className="text-purple-700 font-semibold text-[18px]">
                        Reset via Email
                      </h5>
                      <p className="text-[#C4C4C4] font-medium text-[12px] md:text-[16px]">
                        We will send a link to reset your password
                      </p>
                    </div>
                  </div>
                  {/* text field */}
                  <div className="mt-2">
                    <Controller
                      name="email"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          type="text"
                          legend="Email Address"
                          {...field}
                          error={!!error}
                          helperText={error?.message}
                          autoComplete="off"
                          className="bg-[#F5F7FB]"
                        />
                      )}
                    />
                  </div>
                </div>
                {/* phone */}
                <div className="px-6 py-6 shadow-[0px_10px_15px_0px_#2980971A] rounded-[14px] transition-colors border-2 mt-10 border-transparent">
                  <div className="flex items-center gap-9">
                    {/* logo */}
                    <div className="w-14 h-14 rounded-full flex-center bg-[#98A0B233] shrink-0">
                      <RiPhoneFill color="#919499" />
                    </div>
                    {/* text */}
                    <div>
                      <h5 className="text-[#98A0B2] font-semibold text-[18px]">
                        Reset via SMS
                      </h5>
                      <p className="text-[#C4C4C4] font-medium text-[12px] md:text-[16px]">
                        We will send a link to reset your phone
                      </p>
                    </div>
                  </div>
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
                
                {/* button */}
                <button
                  className="submit__button bg-purple-700 mt-4 disabled:opacity-50"
                  onClick={handleSubmit(submitting)}
                  disabled={isPending || !captchaToken}
                >
                  {isPending ? <Spinner /> : "Send Link Reset Password"}
                </button>
                <AnimationLink
                  to="/sign-up"
                  className="flex mt-3 gap-2 text-[#C4C4C4]"
                >
                  <img src={arrowBack} alt="arrow icon" />
                  Back to sign in
                </AnimationLink>
              </div>
              {/* )} */}
            </div>
            {/* OTP verified */}
            <div className="shrink-0 bg-white  min-w-full rounded-4xl px-4 py-6">
              {steps == 1 && <OtpVerified email={watch("email")} />}
            </div>
          </div>
        </div>
        {/* card2 */}
      </div>
    </ProtectRoute>
  );
}
