import clsx from "clsx";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import TextField from "../TextField/TextField";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { RiArrowDownSLine, RiCloseLine } from "@remixicon/react";

export default function SelectField({
  options,
  getOptionLabel,
  onChange,
  label,
  legend,
  value,
  variant,
  error,
  helperText,
  className,
}: {
  options: any;
  getOptionLabel: (option: any) => string | number;
  onChange: (newValue: any) => void;
  legend?: string;
  label?: string;
  value: any;
  variant?: "contained" | "outline";
  error?: boolean;
  helperText?: string;
  className?: string;
}) {
  const [searchValue, setSearchValue] = useState<string | number>("");
  const [showOption, setShowOption] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  // animation
  useGSAP(
    () => {
      if (showOption) {
        gsap.timeline().to(".optionList", {
          opacity: 1,
          scale: 1,
          translateY: 0,
          display: "block",
        });

        return;
      } else {
        gsap.to(".optionList", {
          display: "none",
          opacity: 0,
          scale: 0.9,
          translateY: 10,
        });
      }
    },
    { scope: container, dependencies: [showOption] }
  );

  useEffect(() => {
    setSearchValue(value ? getOptionLabel(value) : "");
  }, [value]);

  //function
  // update option
  const updateOption = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onChange(searchValue);
  };
  // check if search value is a option
  const CheckSelectOption = () => {
    const foundOption = options.find(
      (option: any) => getOptionLabel(option) === searchValue
    );
    setShowOption(false);

    !foundOption && setSearchValue("");
  };
  return (
    <div ref={container}>
      {/* options */}
      <div className="relative">
        <TextField
          type="text"
          value={`${searchValue}`}
          onChange={updateOption}
          onFocus={() => setShowOption(true)}
          onBlur={CheckSelectOption}
          legend={legend}
          label={label}
          variant={variant}
          error={error}
          helperText={helperText}
          className={className}
          endIcon={
            <div className="flex">
              <button
                className="cursor-pointer"
                onClick={() => {
                  setSearchValue("");
                  onChange("");
                }}
              >
                <RiCloseLine />
              </button>
              <button
                className={clsx(
                  "cursor-pointer rotate-0 transition-all",
                  showOption && "rotate-180"
                )}
                onClick={() => setShowOption((prev) => !prev)}
              >
                <RiArrowDownSLine />
              </button>
            </div>
          }
        />
        <ul
          className={clsx(
            "optionList",
            "bg-white shadow-xl absolute w-full max-h-[200px] rounded  opacity-0 left-0 overflow-y-scroll "
          )}
        >
          {options
            // .filter((option: any) =>
            //   getOptionLabel(option)
            //     .toString()
            //     .toLowerCase()
            //     .includes(searchValue.toString().toLowerCase())
            // )
            .map((option: any) => (
              <li
                className={clsx(
                  "hover:text-white hover:bg-purple-500 transition-colors",
                  getOptionLabel(option) === searchValue &&
                    "bg-purple-500 text-white"
                )}
              >
                <button
                  className="w-full flex cursor-pointer px-5 py-3"
                  onClick={() => {
                    setSearchValue(getOptionLabel(option));
                    onChange(option);
                    setShowOption(false);
                  }}
                >
                  {getOptionLabel(option)}
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
