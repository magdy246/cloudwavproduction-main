import { useGSAP } from "@gsap/react";
import { useRef, useEffect, type ReactNode } from "react";
import { gsap } from "gsap";
import { createPortal } from "react-dom";
import { RiCloseLine } from "@remixicon/react";
import clsx from "clsx";

// Dialog Header
function DialogHeader({
  title,
  handleClose,
}: {
  title: string;
  handleClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-500 rounded-t-xl text-white">
      <p className="text-lg font-semibold tracking-wide">{title}</p>
      <button
        onClick={handleClose}
        className="hover:bg-white/20 p-1.5 rounded-full transition cursor-pointer"
        aria-label="Close dialog"
      >
        <RiCloseLine size={24} className="text-white" />
      </button>
    </div>
  );
}

// Dialog Content
function DialogContent({ children }: { children: ReactNode }) {
  return <div className="max-h-[70vh] overflow-y-auto p-4">{children}</div>;
}

// Dialog Root
export default function Dialog({
  open,
  handleClose,
  title,
  children,
}: {
  open: boolean;
  handleClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  useGSAP(
    () => {
      if (open) {
        gsap.to(container.current, {
          autoAlpha: 1,
          duration: 0.4,
          ease: "power3.out",
        });
        gsap.from(".dialog-card", {
          y: 40,
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
        });
      } else {
        gsap.to(container.current, {
          autoAlpha: 0,
          duration: 0.3,
          ease: "power3.inOut",
        });
      }
    },
    { scope: container, dependencies: [open] }
  );

  return createPortal(
    <div
      ref={container}
      className={clsx(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/40 opacity-0 invisible"
      )}
    >
      {/* Backdrop click */}
      <div
        className="absolute inset-0"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Dialog card */}
      <div className="dialog-card relative z-10 w-[90%] lg:w-[700px] mx-4 bg-white rounded-xl shadow-lg overflow-hidden">
        <DialogHeader title={title} handleClose={handleClose} />
        <DialogContent>{children}</DialogContent>
      </div>
    </div>,
    document.body
  );
}
