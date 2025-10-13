import { ReactNode, useEffect, useState } from "react";
import SectionLoading from "../SectionLoading/SectionLoading";

export function ImageComponent({
  path,
  children,
  fallback,
  loading,
}: {
  path: string;
  children: ReactNode;
  fallback: string | ReactNode;
  loading?: string | ReactNode;
}) {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    if (!path) {
      setStatus("error");
      return;
    }
    const img = new Image();

    img.onload = () => setStatus("success");
    img.onerror = () => setStatus("error");

    img.src = path;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [path]);
  if (status === "loading") {
    return loading ? (
      loading
    ) : (
      <SectionLoading className="w-40 h-40 rounded-full" />
    );
  }
  if (status === "error") {
    return <>{fallback}</>;
  }
  if (status === "success") {
    return children;
  }
}