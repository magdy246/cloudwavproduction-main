import { useGSAP } from "@gsap/react";
import {
  RiCheckDoubleLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiFolderWarningLine,
} from "@remixicon/react";
import clsx from "clsx";
import { gsap } from "gsap";
type TVariant = "warning" | "error" | "success";
import { useEffect, useRef, useState } from "react";
import { splitText } from "../../utils/functions";
import { createPortal } from "react-dom";
export default function useSnackbar() {
  const snackbarRef = useRef<HTMLDivElement>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    variant: TVariant;
  }>({
    open: true,
    message: "",
    variant: "success",
  });
  // animation
  useGSAP(
    () => {
      if (snackbar.open) {
        gsap
          .timeline()
          .to(snackbarRef.current, {
            opacity: 1,
            scale: 1,
            top: 20,
            duration: 1,
            ease: "circ.out",
          })
          .to(".letters span", {
            yPercent: 0,
            stagger: 0.01,
          });
        return;
      }
    },
    { scope: snackbarRef, dependencies: [snackbar.open] }
  );
  const variants = {
    success: {
      backgroundColor: "bg-green-300",
      color: "text-green-700",
      Icon: <RiCheckDoubleLine color="white" />,
    },
    error: {
      backgroundColor: "bg-red-300",
      color: "text-red-700",
      Icon: <RiErrorWarningLine color="white" />,
    },
    warning: {
      backgroundColor: "bg-yellow-300",
      color: "text-yellow-700",
      Icon: <RiFolderWarningLine color="white" />,
    },
  };

  useEffect(() => {
    let timeout:number;
    if (snackbar.open) {
      timeout = setTimeout(() => {
        setSnackbar((prev) => ({ ...prev, open: false }));
      }, 2000);
    }
    return ()=>clearTimeout(timeout);
  }, [snackbar.open]);
  return {
    Content: () =>
      createPortal(
        <div
          ref={snackbarRef}
          className={clsx(
            "flex p-3 w-fit rounded fixed left-1/2 -translate-x-1/2  gap-3 -top-full z-[999999]",
            variants[snackbar.variant as TVariant].backgroundColor
          )}
        >
          <div className="icon">
            {variants[snackbar.variant as TVariant].Icon}
          </div>
          <p className="text-white flex-1 ">
            <span className="letters overflow-hidden h-6 block">
              {splitText(snackbar.message, "span")}
            </span>
          </p>
          <div className="close">
            <button
              className="flex-center w-6 h-6 rounded-full hover:bg-white cursor-pointer transition-colors"
              onClick={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            >
              <RiCloseLine
                size={20}
                className={`${variants[snackbar.variant as TVariant].color}`}
              />
            </button>
          </div>
        </div>,
        document.body
      ),
    handleChange: (message: string, variant: TVariant) => {
      setSnackbar({
        message: message,
        variant: variant,
        open: true,
      });
    },
  };
}
