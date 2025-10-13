import clsx from "clsx";
import { HTMLAttributes } from "react";

export default function SectionLoading(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "animate-pulse bg-gray-300 ",
        props.className
      )}
    />
  );
}
