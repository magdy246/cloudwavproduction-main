import {
    RiArrowLeftSLine,
    RiArrowRightSLine,
  } from "@remixicon/react";
  import { ReactNode, useRef } from "react";
  import SimpleSlider from "../../../../components/SimpleSlider/SimpleSlider";
  
  export function SharedSections({
    title,
    slideToShow,
    slideToScroll,
    children,
  }: {
    children: ReactNode;
    title: string;
    slideToShow?: number;
    slideToScroll?: number;
  }) {
    const nextButton = useRef<HTMLButtonElement | null>(null);
    const previousButton = useRef<HTMLButtonElement | null>(null);
    return (
      <div className="mt-8 mx-7">
        {/* arrows */}
        <div className="controller__arrow">
          <button className="main__arrow" ref={nextButton}>
            <RiArrowLeftSLine color="white" />
          </button>
          <button className="main__arrow" ref={previousButton}>
            <RiArrowRightSLine color="white" />
          </button>
        </div>
  
        <h4 className="dashboard__main__title">{title}</h4>
        <div>
          <SimpleSlider
            slidesToScroll={slideToScroll}
            slidesToShow={slideToShow}
            nextButton={nextButton.current}
            perviousButton={previousButton.current}
          >
            {children}
          </SimpleSlider>
        </div>
      </div>
    );
  }