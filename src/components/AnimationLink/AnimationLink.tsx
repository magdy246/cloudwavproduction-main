import { Link, LinkProps, useLocation, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

export default function AnimationLink({ to, children, ...other }: LinkProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // set page css style
  const { contextSafe } = useGSAP(() => {});

  const handleAnimation = contextSafe(() => {
    if (pathname !== to) {
      gsap.to(".page-transition", {
        scaleY: 1,
      });
      gsap.to(".page-transition > div", {
        scaleY: 1,
        ease: "circ.inOut",
        transformOrigin: "bottom",
        stagger: 0.2,
      });

      setTimeout(() => {
        gsap.to(".page-transition", {
          transformOrigin: "top",
          scaleY: 0,
        });
        gsap.to(".page-transition > div", {
          scaleY: 0,
          ease: "circ.out",
          transformOrigin: "top",
          stagger: 0.2,
          duration: 0.2,
        });
        navigate(to);
      }, 1500);
    }
  });
  // handle on click on link
  const handleNavigation = contextSafe(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      handleAnimation();
      // check if current path not equal href animation the page
    }
  );
  return (
    <Link
      to={to}
      onClick={handleNavigation}
      replace={true}
      {...other}
    >
      {children}
    </Link>
  );
}
