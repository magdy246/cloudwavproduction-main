import axios from "axios";
import { getAccessToken } from "./functions";
import { toast } from "react-toastify";
// import { toast } from "react-toastify";

export const axiosServices = axios.create({
  baseURL: "https://api.cloudwavproduction.com/api",
  withCredentials: true,
});

axiosServices.interceptors.request.use(
  (config) => {
    const accessToke = getAccessToken();
    if (accessToke) {
      config.headers.Authorization = accessToke;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosServices.interceptors.response.use(
  (res) => res,
  (error) => {
    // token expired
    if (
      // error.response.status == 401 ||
      error?.response?.data?.message === "Unauthenticated." ||
      error?.response?.data?.message === "Token has expired"
    ) {
      localStorage.removeItem("access");
      window.location.href = "/login"
    //   if (!window.location.pathname.includes("/login"))
    //     // window.location.href = "/";
    //     // "";
      toast.error("form.plaseSignIn");
    }
    return Promise.reject(error);
  }
);
