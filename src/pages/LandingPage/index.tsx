import Categories from "../../components/LandingPage/Categories/Categories";
import HeaderSection from "../../components/LandingPage/HeaderSection/HeaderSection";
import Hero from "../../components/LandingPage/Hero/Hero";
import Services from "../../components/LandingPage/Services/Services";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <HeaderSection />
      <Services />
      <Categories />
    </>
  );
}
