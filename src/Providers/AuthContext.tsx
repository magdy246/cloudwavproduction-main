import {
  UseMutationResult,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { useContext, type ReactNode, useState, useEffect } from "react";
import { axiosServices } from "../utils/axios";
import { getAccessToken } from "../utils/functions";
import { AxiosError } from "axios";
import { AuthContext } from "../Context";

export interface TAuthData {
  id: number;
  name: string;
  email: string;
  role: string;
  artist_id: number | null;
  video_creator_id: number | null;
  bussiness_price: number;
  private_price: number;
}

export interface LogoutResult {
  message: string;
}

export interface TAuthContext {
  isLogin: boolean;
  setIsLogin: (val: boolean) => void | ((prev: boolean) => boolean);
  logout: UseMutationResult<LogoutResult, AxiosError<Error>, void, unknown>;
  authData: TAuthData | undefined;
  isLoadingData: boolean;
  refetch: () => void;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isLogin, setIsLogin] = useState(false);

  const { data: authData = {}, isFetching: isLoadingData,refetch } = useQuery({
    queryKey: ["auth-data"],
    queryFn: () => axiosServices.get("/user"),
    select: (data) => data.data,
    enabled: isLogin,
  });

  const logout = useMutation<LogoutResult, AxiosError<Error>>({
    mutationKey: ["logout"],
    mutationFn: () => axiosServices.post("/logout"),
    onSuccess: () => {
      localStorage.removeItem("access");
      window.location.pathname = "/";
    },
  });

  useEffect(() => {
    if (getAccessToken()) {
      setIsLogin(true);
    }
  }, [getAccessToken()]);

  const value: TAuthContext = {
    isLogin,
    setIsLogin,
    logout,
    authData,
    isLoadingData,
    refetch
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw Error("Wrapped Component InSide AuthProvider");
  }
  return context;
}
