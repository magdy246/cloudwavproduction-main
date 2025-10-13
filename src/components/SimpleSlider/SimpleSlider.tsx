import { useRef, type ReactNode, useEffect } from "react";
import Slider from "react-slick";

interface SimpleSliderProps {
  children: ReactNode;
  slidesToShow?: number;
  slidesToScroll?: number;
  nextButton: HTMLButtonElement | null;
  perviousButton: HTMLButtonElement | null;
}

interface TSlider {
  slickNext: () => void;
  slickPrev: () => void;
}

export default function SimpleSlider({
  children,
  slidesToShow = 5,
  slidesToScroll = 2,
  nextButton,
  perviousButton,
}: SimpleSliderProps) {
  let sliderRef = useRef<TSlider | null>(null);

  const defaultSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow,
    slidesToScroll,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
    ],
  };

  useEffect(() => {
    const abort = new AbortController();
    nextButton?.addEventListener(
      "click",
      () => sliderRef.current?.slickNext(),
      {
        signal: abort.signal,
      }
    );
    perviousButton?.addEventListener(
      "click",
      () => sliderRef.current?.slickPrev(),
      {
        signal: abort.signal,
      }
    );
    return () => abort.abort("remove even listener");
  }, [nextButton, perviousButton]);

  return (
    <div>
      <Slider
        // ref={(slider:TSlider) => (sliderRef.current )}
        {...defaultSettings}
      >
        {children}
      </Slider>
    </div>
  );
}
