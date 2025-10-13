import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useRef } from "react";

export default function Spinner() {
  const loadingWave = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      gsap.to("div", {
        animationDelay: (i) => i * 0.2,
      });
    },
    { scope: loadingWave }
  );
  return (
    <div
      className="w-full gap-x-2 flex justify-center items-center"
      ref={loadingWave}
    >
      <div className="w-5 bg-[#d991c2] delay-75 h-5 rounded-full animate-bounce"></div>
      <div className="w-5  h-5 bg-[#9869b8] rounded-full animate-bounce"></div>
      <div className="w-5 h-5  bg-[#6756cc] rounded-full animate-bounce"></div>
    </div>
  );
}

export function Spinner2({
  w,
  h,
  // b = "black",
}: {
  w: number;
  h: number;
  b?: string;
}) {
  return (
    <div
      className={`w-${w} h-${h} border-3 border-t-black border-gray-300 rounded-full animate-spin`}
    ></div>
  );
}
