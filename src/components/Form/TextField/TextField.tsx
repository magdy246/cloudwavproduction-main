import { InputHTMLAttributes, ReactNode, useId, useRef } from "react";
import clsx from "clsx";
// import { useTranslation } from "react-i18next";
interface TTextField extends InputHTMLAttributes<HTMLInputElement> {
  label?: string | ReactNode;
  legend?: string | ReactNode;
  endIcon?: ReactNode;
  helperText?: string;
  error?: boolean;
  variant?: "outline" | "contained";
}
// type TTextField = InputHTMLAttributes<HTMLInputElement> & {
//   label: string;
// };
export default function TextField({
  label,
  legend,
  endIcon,
  helperText,
  error,
  variant,
  ...props
}: TTextField) {
  const id = useId();
  const ref = useRef<HTMLInputElement | null>(null);
  return (
    <div >
      <label htmlFor={id} className="font-medium text-[#919499] text-[14px] ">
        {label}
      </label>
      <div className="py-4  relative group">
        <span
          onClick={() => ref.current?.focus()}
          className={clsx(
            `absolute px-2  group-has-placeholder-shown:top-1/2  -translate-y-1/2 font-normal group-has-placeholder-shown:text-[14px] text-md group-has-focus:text-[10px] 
          group-has-placeholder-shown:bg-transparent group-has-focus:bg-white bg-white text-[#C4C4C4] group-has-focus:top-4 top-4 transition-all`,
            error && "text-red-500",
            variant === "outline"
              ? "bg-transparent group-has-focus:bg-transparent text-purple-500 left-3  group-has-placeholder-shown:left-3"
              : "left-9  group-has-focus:left-9"
          )}
        >
          {legend}
        </span>
        <div
          className={clsx(
            " pr-6 flex py-3",
            props.className,
            error && "border-red-500",
            variant === "outline"
              ? " border-b-1 border-b-purple-500 rounded-none h-[48px] pl-3"
              : "h-[65px] border-[1.3px] rounded-[14px] flex-center  border-[#C4C4C480] pl-9",
          )}
        >
          <input
            {...props}
            id={id}
            className="w-full h-full focus:outline-none"
            ref={ref}
            placeholder={props.placeholder ? props.placeholder : ""}
          />
          {endIcon}
        </div>
      </div>
      <p className="text-red-500 font-normal text-[12px] m-1 ml-3 -mt-2">
        {helperText}
      </p>
    </div>
  );
}
