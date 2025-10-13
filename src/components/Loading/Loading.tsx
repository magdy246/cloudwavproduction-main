import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import logo from "../../assets/images/logo.svg"; // Adjust the path as needed

const Loading = () => {
  const loadingRef = useRef(null);

  useEffect(() => {
    // Enter animation: slide in from left with bounce effect
    gsap.fromTo(
      loadingRef.current,
      { x: "-100%", opacity: 0 },
      { x: "0%", opacity: 1, duration: 1, ease: "bounce.out" }
    );

    return () => {
      // Exit animation: slide out to right
      gsap.to(loadingRef.current, {
        x: "100%",
        opacity: 0,
        duration: 0.7,
        ease: "power2.in",
      });
    };
  }, []);

  return (
    <div
      ref={loadingRef}
      className="flex min-h-[100vh] items-center justify-center text-xl font-bold"
    >
      <img src={logo} alt="logo" />
    </div>
  );
};

export default Loading;
