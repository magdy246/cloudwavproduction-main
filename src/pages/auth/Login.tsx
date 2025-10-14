import logo from "../../assets/images/logo.svg";
import login1 from "../../assets/images/loginImage.svg";
import {
  RiArrowRightSLine,
  RiArrowLeftSLine,
  RiEyeLine,
  RiEyeOffLine,
} from "react-icons/ri";
// import { splitText } from "../../utils/functions";
import TextField from "../../components/Form/TextField/TextField";
import { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AnimationLink from "../../components/AnimationLink/AnimationLink";
import googleLogo from "../../assets/images/brands/google.svg";
// import appleLogo from "../../assets/images/brands/apple.svg";
// import facebookLogo from "../../assets/images/brands/facebook.svg";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useMutation } from "@tanstack/react-query";
import { axiosServices } from "../../utils/axios";
import Spinner from "../../components/Spinner/Spinner";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../Providers/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import ProtectRoute from "../../utils/ProtectRoute";
import HCaptchaComponent, { HCaptchaRef } from "../../components/HCaptcha/HCaptcha";

export function OAuthForm() {
  const { t } = useTranslation();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOAuthLogin = (provider:any) => {
    if (provider === 'google') {
      // Redirect to the Google OAuth endpoint
      window.location.href = 'https://api.cloudwavproduction.com/auth/google/redirect';
    } else if (provider === 'apple') {
      // Implement Apple login if needed
      console.log('Apple login not implemented yet');
    } else if (provider === 'facebook') {
      // Implement Facebook login if needed
      console.log('Facebook login not implemented yet');
    }
  };
  
  const oAuth = [
    {
      logo: googleLogo,
      name: "google",
    },
    // {
    //   logo: appleLogo,
    //   name: "apple",
    // },
    // {
    //   logo: facebookLogo,
    //   name: "facebook",
    // },
  ];
  
  return (
    <div>
      {/* line break */}
      <div className="flex items-center gap-10 mt-4">
        <div className="h-[1.3px] w-full bg-[#91949980]"></div>
        <p className="flex-1 text-nowrap text-[#919499] font-medium text-[14px]">
          {t("orSignInWith")}
        </p>
        <div className="h-[1.3px] w-full bg-[#91949980]"></div>
      </div>
      {/* OAuth integration */}
      <div className="flex mt-4 gap-10 justify-center">
        {oAuth.map((o) => (
          <button 
            key={o.name} 
            className="w-12 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleOAuthLogin(o.name)}
          >
            <img src={o.logo} alt={o.name} />
          </button>
        ))}
      </div>
      {/* create Account */}
      <p className="font-medium text-[14px] text-[#C4C4C4] text-center mt-6">
        {t("dontHaveAccount")}{" "}
        <AnimationLink to="/sign-up" className="text-purple-700">
          {t("SignUp")}
        </AnimationLink>
      </p>
    </div>
  );
}

export function AnimationGallery() {
  const { t } = useTranslation();
  const gallery = [
    {
      text: t("intro") + " 1",
      subText: t("subIntro") + " 1",
      image: login1,
    },
    {
      text: t("intro") + " 2",
      subText: t("subIntro") + " 2",
      image: login1,
    },
    {
      text: t("intro") + " 3",
      subText: t("subIntro") + " 3",
      image: login1,
    },
  ];
  const [count, setCount] = useState(0);
  const container = useRef(null);
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev >= gallery.length - 1) {
          return 0;
        } else if (prev <= 0) {
          prev += 1;
          return prev;
        } else {
          prev++;
          return prev;
        }
      });
    }, 8000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useGSAP(
    () => {
      gsap
        .timeline()
        .to(".main-text .letter", {
          yPercent: -100,
          stagger: 0.02,
          opacity: 0,
        })
        .to(".sub-text", {
          xPercent: -100,
          opacity: 0,
        })
        .to(".image img", {
          yPercent: 100,
        })
        .to(".image img", {
          attr: { src: gallery[count].image },
        })
        .to(".wrapper", {
          left: count * -600,
          duration: 0.1,
        })
        .to(".sub-text", {
          xPercent: 0,
          opacity: 1,
        })
        .to(".image img", {
          yPercent: 0,
        })
        .to(".main-text .letter", {
          yPercent: 0,
          stagger: 0.02,
          opacity: 1,
        });
    },
    {
      scope: container,
      dependencies: [count],
    }
  );

  function handleNextImage() {
    setCount((prev) => {
      if (prev >= gallery.length - 1) return prev;
      return (prev += 1);
    });
  }
  function handlePreviousImage() {
    setCount((prev) => {
      if (prev <= 0) return prev;
      return (prev -= 1);
    });
  }
  
  return (
    <div
      className="max-w-[600px] overflow-hidden relative hidden lg:block"
      ref={container}
    >
      <div className="wrapper flex relative">
        {gallery.map((g, i) => (
          <div
            className="bg-black pt-8 px-12 min-h-screen relative w-[600px] shrink-0 main-text"
            key={i}
          >
            {/* text  */}
            <div>
              <h3 className="text-white  font-extrabold text-[64px] leading-[90%] overflow-hidden ">
                {/* {splitText(g.text, "span", "inline-block","words")} */}
                {g.text}
              </h3>
              <p className="font-medium text-[14px] text-white mt-6 sub-text">
                {g.subText}
              </p>
            </div>
            {/* arrow */}
            <div className="flex gap-4 mt-11 z-10 relative">
              <button
                onClick={handlePreviousImage}
                disabled={count <= 0}
                className="left flex-center bg-white disabled:cursor-not-allowed disabled:hover:bg-white hover:bg-sky-500 transition-colors rounded-full w-6 h-6"
              >
                <RiArrowLeftSLine size={21} />
              </button>
              <button
                onClick={handleNextImage}
                disabled={count >= gallery.length - 1}
                className="right flex-center bg-white disabled:cursor-not-allowed disabled:hover:bg-white hover:bg-sky-500 transition-colors rounded-full w-6 h-6"
              >
                <RiArrowRightSLine size={21} />
              </button>
            </div>
            {/* image */}
          </div>
        ))}
      </div>
      <div className="absolute bottom-0 right-0 w-150 image">
        <img src={login1} alt="login-image" className="max-w-full" />
      </div>
    </div>
  );
}

// interface TLoginSuccess {
//   message: string;
//   access_token: string;
//   refresh_token: string;
//   expires_in: number;
//   token_type: string;
//   user?: {
//     name: string;
//     email: string;
//     google_id?: string;
//     updated_at: string;
//     created_at: string;
//     id: number;
//     refresh_token: string;
//     refresh_token_expires_at: string;
//   };
// }

export default function Login() {
  const auth = useAuth();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const hcaptchaRef = useRef<HCaptchaRef>(null);
  
  // Handle OAuth callback
  useEffect(() => {
    // Extract data from URL for Google OAuth callback
    if (location.pathname === '/auth/google/callback' || 
        window.location.href.includes('api.cloudwavproduction.com/auth/google/callback')) {
      setIsProcessingOAuth(true);
      
      // Function to handle JSON response shown directly in the browser
      const handleOAuthCallbackData = async () => {
        try {
          // Try to parse the JSON if it's directly in the page content
          const pageContent = document.body.textContent || "";
          if (pageContent.includes('"access_token"') && pageContent.includes('"refresh_token"')) {
            try {
              // Find JSON in the page content
              const jsonStartIndex = pageContent.indexOf('{');
              const jsonEndIndex = pageContent.lastIndexOf('}') + 1;
              const jsonString = pageContent.substring(jsonStartIndex, jsonEndIndex);
              
              // Parse the JSON response
              const responseData = JSON.parse(jsonString);
              
              // Process the authentication data
              processAuthData(responseData);
              
              return;
            } catch (jsonError) {
              console.error("Failed to parse JSON from page content", jsonError);
            }
          }
          
          // If not found in page content, try using URL parameters
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get('code');
          
          if (code) {
            // Exchange the authorization code for tokens
            const response = await axiosServices.post('/auth/google/callback', { code });
            processAuthData(response.data);
          }
        } catch (error) {
          console.error("Failed to process OAuth callback", error);
          setIsProcessingOAuth(false);
        }
      };
      
      // Function to process and save authentication data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const processAuthData = (data:any) => {
        if (!data) return;
        
        // Save authentication data to localStorage
        localStorage.setItem(
          "access",
          `${data.token_type} ${data.access_token}`
        );
        
        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
        }
        
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        
        // Update authentication state
        auth?.setIsLogin(true);
        
        // Redirect to home page
        navigate("/");
      };
      
      handleOAuthCallbackData();
    }
  }, [location, auth, navigate]);
  
  // Regular login mutation
  const { mutate, isPending, isError } = useMutation({
    mutationKey: ["login"],
    mutationFn: (data: Record<string, unknown>) =>
      axiosServices.post("/login", { ...(typeof data === "object" && data !== null ? data : {}), captcha_token: captchaToken }),
    onSuccess: (data) => {
      const loginResponse = data.data;
      localStorage.setItem(
        "access",
        `${loginResponse.token_type} ${loginResponse.access_token}`
      );
      
      if (loginResponse.refresh_token) {
        localStorage.setItem("refresh_token", loginResponse.refresh_token);
      }
      
      if (loginResponse.user) {
        localStorage.setItem("user", JSON.stringify(loginResponse.user));
      }
      
      auth?.setIsLogin(true);
      navigate("/");
    },
    onError: () => {
      // Reset captcha on error
      hcaptchaRef.current?.reset();
      setCaptchaToken(null);
    },
  });
  
  // Form validation
  const schema = z.object({
    email: z.string({
      message: t("validation.required"),
    }),
    password: z
      .string({
        message: t("validation.required"),
      })
      .min(8, {
        message: t("validation.password"),
      }),
  });
  // type TField = z.infer<typeof schema>;

  const { handleSubmit, control } = useForm({
    resolver: zodResolver(schema),
  });
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitting = (data:any) => {
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

  // Show loading spinner if processing OAuth
  if (isProcessingOAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-600">{t("processingLogin")}</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectRoute condition={!auth?.isLogin} redirect="/">
      <div className="min-h-screen flex items-center justify-center ">
        {/* login form */}
        <div className="py-6 pb-0 px-15 md:px-30 md:py:12 flex-1">
          <div className="image w-[120px]">
            <img src={logo} alt={"image-logo"} loading="lazy" />
          </div>
          <h3 className="font-bold text-purple-700 text-3xl mt-4 mb-7 ">
            {t("loginTitle")}
          </h3>
          <form onSubmit={handleSubmit(submitting)} className="flex-1">
            {/* email */}
            <Controller
              control={control}
              name={"email"}
              render={({ field, fieldState: { error } }) => {
                return (
                  <TextField
                    legend={t("emailOrUsername")}
                    label={t("emailOrUsername")}
                    type="text"
                    {...field}
                    error={!!error || isError}
                    helperText={error?.message}
                  />
                );
              }}
            />
            {/* password */}
            <Controller
              control={control}
              name={"password"}
              render={({ field, fieldState: { error } }) => {
                return (
                  <TextField
                    legend={t("password")}
                    label={
                      <p className="flex items-center justify-between">
                        {t("password")}
                        <AnimationLink
                          to="/forget-password"
                          className="text-purple-700 font-medium text-[14px]"
                        >
                          {t("forgetPassword")}
                        </AnimationLink>
                      </p>
                    }
                    type={showPassword ? "text" : "password"}
                    {...field}
                    error={!!error || isError}
                    helperText={error?.message}
                    endIcon={
                      <button
                        className="cursor-pointer "
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <RiEyeLine color="#919499" />
                        ) : (
                          <RiEyeOffLine color="#919499" />
                        )}
                      </button>
                    }
                  />
                );
              }}
            />
            
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
            
            <p className="error__message">{isError && t("errors.default")}</p>
            <button
              type="submit"
              className="submit__button disabled:opacity-45"
              disabled={isPending || !captchaToken}
            >
              {isPending ? <Spinner /> : t("SignUp")}
            </button>
          </form>
          <OAuthForm />
        </div>
        {/* login image */}
        <AnimationGallery />
      </div>
    </ProtectRoute>
  );
}