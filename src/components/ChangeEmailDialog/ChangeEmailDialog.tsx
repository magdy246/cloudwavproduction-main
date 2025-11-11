import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { axiosServices } from "../../utils/axios";
import { AxiosError } from "axios";
import Dialog from "../Dialog/Dialog";
import TextField from "../Form/TextField/TextField";
import { Spinner2 } from "../Spinner/Spinner";
import { useAuth } from "../../Providers/AuthContext";
import Swal from "sweetalert2";
import clsx from "clsx";
import { RiMailLine, RiCheckFill, RiArrowRightLine, RiAlertLine } from "@remixicon/react";
import HCaptchaComponent, { HCaptchaRef } from "../HCaptcha/HCaptcha";

interface ChangeEmailDialogProps {
  open: boolean;
  handleClose: () => void;
}

type Step = "send-old-otp" | "verify-old-otp" | "verify-new-otp" | "success";

export default function ChangeEmailDialog({ open, handleClose }: ChangeEmailDialogProps) {
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>("send-old-otp");
  const [newEmail, setNewEmail] = useState("");
  const [oldEmailOtp, setOldEmailOtp] = useState("");
  const [newEmailOtp, setNewEmailOtp] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const hcaptchaRef = useRef<HCaptchaRef>(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setCurrentStep("send-old-otp");
      setNewEmail("");
      setOldEmailOtp("");
      setNewEmailOtp("");
      setCaptchaToken(null);
    }
  }, [open]);

  // Step 1: Send OTP to old email
  const { mutate: sendOldEmailOtp, isPending: sendingOldOtp } = useMutation({
    mutationFn: () => axiosServices.post("/send-old-email-code", { captcha_token: captchaToken }),
     onSuccess: () => {
       setCurrentStep("verify-old-otp");
       Swal.fire({
         title: t("changeEmail.otpSent"),
         text: t("changeEmail.checkCurrentEmail"),
         icon: "success",
         timer: 3000,
         showConfirmButton: false,
       });
     },
     onError: (error: AxiosError<{ error: string }>) => {
       Swal.fire({
         title: t("error.title"),
         text: error.response?.data.error || t("changeEmail.failedToSendOtp"),
         icon: "error",
       });
       // Reset captcha on error
       hcaptchaRef.current?.reset();
       setCaptchaToken(null);
     },
  });

  // Step 2: Verify old email OTP and send OTP to new email
  const { mutate: verifyOldEmailOtp, isPending: verifyingOldOtp } = useMutation({
    mutationFn: (data: { old_email_code: string; new_email: string }) =>
      axiosServices.post("/verify-old-email-code", data),
     onSuccess: () => {
       setCurrentStep("verify-new-otp");
       Swal.fire({
         title: t("changeEmail.otpSent"),
         text: t("changeEmail.checkNewEmail", { email: newEmail }),
         icon: "success",
         timer: 3000,
         showConfirmButton: false,
       });
     },
     onError: (error: AxiosError<{ error: string }>) => {
       Swal.fire({
         title: t("error.title"),
         text: error.response?.data.error || t("changeEmail.invalidOtpOrEmail"),
         icon: "error",
       });
     },
  });

  // Step 3: Verify new email OTP
  const { mutate: verifyNewEmailOtp, isPending: verifyingNewOtp } = useMutation({
    mutationFn: (data: { new_email_code: string }) =>
      axiosServices.post("/verify-new-email-code", data),
     onSuccess: () => {
       setCurrentStep("success");
       auth.refetch(); // Refresh user data
       setTimeout(() => {
         handleClose();
         Swal.fire({
           title: t("success"),
           text: t("changeEmail.emailChangedSuccessfully"),
           icon: "success",
         });
       }, 2000);
     },
     onError: (error: AxiosError<{ error: string }>) => {
       Swal.fire({
         title: t("error.title"),
         text: error.response?.data.error || t("changeEmail.invalidOtp"),
         icon: "error",
       });
     },
  });

  const handleSendOldEmailOtp = () => {
    if (!captchaToken) {
      Swal.fire({
        title: t("error.title"),
        text: "Please complete the captcha verification",
        icon: "warning",
      });
      return;
    }
    sendOldEmailOtp();
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

  const handleVerifyOldEmailOtp = () => {
    if (oldEmailOtp.length !== 6) {
      Swal.fire({
        title: t("changeEmail.invalidOtp"),
        text: t("changeEmail.enterSixDigitCode"),
        icon: "warning",
      });
      return;
    }
    if (!newEmail) {
      Swal.fire({
        title: t("changeEmail.emailRequired"),
        text: t("changeEmail.enterNewEmail"),
        icon: "warning",
      });
      return;
    }
    verifyOldEmailOtp({
      old_email_code: oldEmailOtp,
      new_email: newEmail,
    });
  };

  const handleVerifyNewEmailOtp = () => {
    if (newEmailOtp.length !== 6) {
      Swal.fire({
        title: t("changeEmail.invalidOtp"),
        text: t("changeEmail.enterSixDigitCode"),
        icon: "warning",
      });
      return;
    }
    verifyNewEmailOtp({
      new_email_code: newEmailOtp,
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "send-old-otp":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <RiMailLine size={32} className="text-purple-600" />
              </div>
               <h3 className="text-xl font-semibold text-gray-800 mb-2">
                 {t("changeEmail.changeEmailAddress")}
               </h3>
               <p className="text-gray-600 text-sm">
                 {t("changeEmail.sendCodeToCurrentEmail")}
               </p>
            </div>

             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
               <p className="text-blue-800 text-sm">
                 <strong>{t("changeEmail.currentEmail")}:</strong> {auth?.authData?.email}
               </p>
             </div>

             {/* hCaptcha */}
             <div className="flex justify-center">
               <HCaptchaComponent
                 ref={hcaptchaRef}
                 onVerify={handleCaptchaVerify}
                 onError={handleCaptchaError}
                 onExpire={handleCaptchaExpire}
               />
             </div>

            <button
              onClick={handleSendOldEmailOtp}
              disabled={sendingOldOtp || !captchaToken}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
               {sendingOldOtp ? (
                 <>
                   <Spinner2 w={5} h={5} />
                   {t("changeEmail.sendingCode")}
                 </>
               ) : (
                 <>
                   {t("changeEmail.sendVerificationCode")}
                   <RiArrowRightLine size={16} />
                 </>
               )}
            </button>
          </div>
        );

      case "verify-old-otp":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <RiCheckFill size={32} className="text-green-600" />
              </div>
               <h3 className="text-xl font-semibold text-gray-800 mb-2">
                 {t("changeEmail.verifyCurrentEmail")}
               </h3>
               <p className="text-gray-600 text-sm">
                 {t("changeEmail.enterSixDigitCodeCurrent")}
               </p>
            </div>

             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
               <p className="text-blue-800 text-sm">
                 <strong>{t("changeEmail.codeSentTo")}:</strong> {auth?.authData?.email}
               </p>
             </div>

            {/* Spam Alert */}
            <div className={clsx(
              "p-4 rounded-lg border-2 border-amber-200 shadow-sm",
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

            {/* OTP Input */}
            <div className="space-y-4">
              <div className="flex justify-center gap-2 relative">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className={clsx(
                        "w-12 h-12 border-2 rounded-lg flex items-center justify-center text-lg font-semibold transition-colors",
                        oldEmailOtp.length > i
                          ? "border-purple-600 bg-purple-50 text-purple-700"
                          : "border-gray-300 text-gray-400",
                        verifyingOldOtp && "animate-pulse"
                      )}
                    >
                      {oldEmailOtp[i] || ""}
                    </div>
                  ))}
                <input
                  type="text"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  maxLength={6}
                  value={oldEmailOtp}
                  onChange={(e) => setOldEmailOtp(e.target.value.replace(/\D/g, ""))}
                  disabled={verifyingOldOtp}
                  autoComplete="off"
                />
              </div>
            </div>

             {/* New Email Input */}
             <TextField
               legend={t("changeEmail.newEmailAddress")}
               label={t("changeEmail.enterNewEmail")}
               type="email"
               value={newEmail}
               onChange={(e) => setNewEmail(e.target.value)}
               placeholder="example@email.com"
               disabled={verifyingOldOtp}
             />

            <button
              onClick={handleVerifyOldEmailOtp}
              disabled={verifyingOldOtp || oldEmailOtp.length !== 6 || !newEmail}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
               {verifyingOldOtp ? (
                 <>
                   <Spinner2 w={5} h={5} />
                   {t("changeEmail.verifying")}
                 </>
               ) : (
                 <>
                   {t("changeEmail.verifyAndSendToNewEmail")}
                   <RiArrowRightLine size={16} />
                 </>
               )}
            </button>
          </div>
        );

      case "verify-new-otp":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <RiMailLine size={32} className="text-blue-600" />
              </div>
               <h3 className="text-xl font-semibold text-gray-800 mb-2">
                 {t("changeEmail.verifyNewEmail")}
               </h3>
               <p className="text-gray-600 text-sm">
                 {t("changeEmail.enterSixDigitCodeNew")}
               </p>
            </div>

             <div className="bg-green-50 border border-green-200 rounded-lg p-4">
               <p className="text-green-800 text-sm">
                 <strong>{t("changeEmail.codeSentTo")}:</strong> {newEmail}
               </p>
             </div>

            {/* Spam Alert */}
            <div className={clsx(
              "p-4 rounded-lg border-2 border-amber-200 shadow-sm",
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

            {/* OTP Input */}
            <div className="space-y-4">
              <div className="flex justify-center gap-2 relative">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className={clsx(
                        "w-12 h-12 border-2 rounded-lg flex items-center justify-center text-lg font-semibold transition-colors",
                        newEmailOtp.length > i
                          ? "border-purple-600 bg-purple-50 text-purple-700"
                          : "border-gray-300 text-gray-400",
                        verifyingNewOtp && "animate-pulse"
                      )}
                    >
                      {newEmailOtp[i] || ""}
                    </div>
                  ))}
                <input
                  type="text"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  maxLength={6}
                  value={newEmailOtp}
                  onChange={(e) => setNewEmailOtp(e.target.value.replace(/\D/g, ""))}
                  disabled={verifyingNewOtp}
                  autoComplete="off"
                />
              </div>
            </div>

            <button
              onClick={handleVerifyNewEmailOtp}
              disabled={verifyingNewOtp || newEmailOtp.length !== 6}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
               {verifyingNewOtp ? (
                 <>
                   <Spinner2 w={5} h={5} />
                   {t("changeEmail.verifying")}
                 </>
               ) : (
                 <>
                   {t("changeEmail.completeEmailChange")}
                   <RiCheckFill size={16} />
                 </>
               )}
            </button>
          </div>
        );

      case "success":
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <RiCheckFill size={40} className="text-green-600" />
            </div>
             <div>
               <h3 className="text-xl font-semibold text-gray-800 mb-2">
                 {t("changeEmail.emailChangedSuccessfully")}
               </h3>
               <p className="text-gray-600 text-sm">
                 {t("changeEmail.emailUpdatedTo", { email: newEmail })}
               </p>
             </div>
             <div className="bg-green-50 border border-green-200 rounded-lg p-4">
               <p className="text-green-800 text-sm">
                 {t("changeEmail.canUseNewEmailToSignIn")}
               </p>
             </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
     <Dialog
       open={open}
       handleClose={handleClose}
       title={t("changeEmail.changeEmailAddress")}
     >
      <div className="p-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[
              { step: "send-old-otp", label: "1", title: "Send OTP" },
              { step: "verify-old-otp", label: "2", title: "Verify Old" },
              { step: "verify-new-otp", label: "3", title: "Verify New" },
              { step: "success", label: "✓", title: "Complete" },
            ].map((item, index) => {
              const isActive = currentStep === item.step;
              const isCompleted = 
                (item.step === "send-old-otp" && currentStep !== "send-old-otp") ||
                (item.step === "verify-old-otp" && ["verify-new-otp", "success"].includes(currentStep)) ||
                (item.step === "verify-new-otp" && currentStep === "success") ||
                (item.step === "success" && currentStep === "success");

              return (
                <div key={item.step} className="flex items-center">
                  <div
                    className={clsx(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    )}
                  >
                    {item.label}
                  </div>
                  {index < 3 && (
                    <div
                      className={clsx(
                        "w-8 h-0.5 mx-2 transition-colors",
                        isCompleted ? "bg-green-500" : "bg-gray-200"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}
      </div>
    </Dialog>
  );
}
