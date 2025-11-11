import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { axiosServices } from "../../utils/axios";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import useSnackbar from "../../components/Snackbar/Snackbar";
import { AxiosError } from "axios";
import { useAuth } from "../../Providers/AuthContext";
import { RiArrowRightLine, RiAlertLine } from "@remixicon/react";
import { Spinner2 } from "../../components/Spinner/Spinner";
import ProtectRoute from "../../utils/ProtectRoute";
import { useTranslation } from "react-i18next";

type TCredential = {
  birthDate: string;
  email: string;
  name: string;
  password: string;
  password_confirmation: string;
  phone: string;
};

interface TReuslt {
  data: {
    access_token: string;
    expires_in: number;
    message: string;
    token_type: string;
  };
}

export default function VerifiedEmail() {
  const [otpNumber, setOtpNumber] = useState<string>("");
  const auth = useAuth();
  const { t, i18n } = useTranslation();

  const credential: TCredential = JSON.parse(
    localStorage.getItem("credential") || "{}"
  );
  const { Content, handleChange } = useSnackbar();
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation<
    TReuslt,
    AxiosError<Error>,
    TCredential & { code: string }
  >({
    mutationKey: ["verified-email"],
    mutationFn: (data) => axiosServices.post("/verify-code", data),
    onError: (error) =>
      handleChange(error.response?.data.message || "", "error"),
    onSuccess: (data) => {
      const result = data?.data;
      localStorage.setItem(
        "access",
        `${result.token_type} ${result.access_token}`
      );
      auth?.setIsLogin(true);
      navigate("/");
      localStorage.removeItem("credential");
    },
  });

  const { mutate: sendOtpAgain, isPending: isSending } = useMutation({
    mutationKey: ["send-verified-again"],
    mutationFn: () => axiosServices.post("/register", credential),
    onSuccess: () => handleChange("the code has been send", "success"),
  });
  useEffect(() => {
    if (!credential.email) {
      navigate("/sign-up");
    }
  }, [credential]);

  useEffect(() => {
    if (otpNumber.length >= 6) {
      mutate({
        ...credential,
        code: otpNumber,
      });
    }
  }, [otpNumber]);
  return (
    <ProtectRoute redirect="/" condition={!auth?.isLogin}>
      <div className="flex-center h-screen bg-[#fafafa] ">
        <div className="border-gray-300 border rounded-xl py-10 px-15 ">
          <h3 className="text-3xl font-medium text-center mb-5 ">
            OTP Verification
          </h3>
          <div>
            <h4 className="font-normal text-center">Verify Your Email</h4>
            <p className="text-[12px] text-center text-gray-600">
              we Send a verification OTP to your email{" "}
              {credential.email?.slice(0, 3)}
              *********{credential.email?.slice(
                credential.email?.indexOf(".")
              )}{" "}
              <br /> enter code to verify and continuous{" "}
            </p>
          </div>
          
          {/* Spam Alert */}
          <div className={clsx(
            "mt-4 mb-4 p-4 rounded-lg border-2 border-amber-200 shadow-sm",
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

          <div className="inputs relative w-fit mx-auto">
            <div className="flex-center mt-8 ">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div
                    className={clsx(
                      otpNumber.length - 1 === i
                        ? "before:bg-purple-500"
                        : "before:bg-black",
                      "relative before:h-1 before:rounded-xl before:transition-colors before:w-full before:absolute before:bottom-0 before:left-0  mr-1 w-12 text-xl  h-12 rounded flex-center text-center",
                      (isPending || isSending) && "opacity-40"
                    )}
                  >
                    {otpNumber[i]}
                  </div>
                ))}
            </div>
            <div className="absolute inset-0 max-w-full">
              <input
                type="text"
                className="bg-transparent tracking-[18px] h-full  w-full overflow-hidden caret-transparent  opacity-0  disabled:cursor-not-allowed"
                maxLength={6}
                onChange={(e) => setOtpNumber(e.target.value)}
                disabled={isPending || isSending}
              />
            </div>
          </div>
          <button
            className="text-black cursor-pointer mt-5 text-[12px] w-full flex-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => sendOtpAgain()}
            disabled={isSending || isPending}
          >
            Send Again{" "}
            {isSending || isPending ? (
              <Spinner2 w={4} h={4} />
            ) : (
              <RiArrowRightLine size={15} />
            )}
          </button>
        </div>
      </div>
      <Content />
    </ProtectRoute>
  );
}
