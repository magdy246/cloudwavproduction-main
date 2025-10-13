import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
export default function ProtectRoute({
  condition,
  children,
  redirect,
}: {
  condition: boolean;
  children: ReactNode;
  redirect: string | (() => void);
}) {
  if (condition) {
    return children;
  }
  if (typeof redirect === "function") {
    redirect();
    return;
  }
  return <Navigate to={redirect} />;
}
