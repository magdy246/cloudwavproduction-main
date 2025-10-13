import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import { Outlet, ScrollRestoration } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <Header type="landingPage" />
      <ScrollRestoration />
      <Outlet />
      <ToastContainer />
      <Footer />
    </>
  );
}

export default App;
