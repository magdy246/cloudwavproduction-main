import { Outlet } from "react-router-dom";
import Drawer from "../../components/DashboardComponents/Drawer/Drawer";
import Header from "../../components/DashboardComponents/Header/Header";
import { useDashboard } from "../../Providers/DashboardContext";
import { useEffect } from "react";
// import { useAuth } from "../../Providers/AuthContext";
// import ProtectRoute from "../../utils/ProtectRoute";
// import { useAuth } from "../../Providers/AuthContext";
// import ProtectRoute from "../../utils/ProtectRoute";

export default function Dashboard() {
  const { drawerWidth, sm, setSm } = useDashboard();
  // const auth = useAuth();
  useEffect(() => {
    function handleResizeWindow() {
      if (window.innerWidth <= 776) {
        setSm(true);
      } else {
        setSm(false);
      }
    }
    handleResizeWindow();
    window.addEventListener("resize", handleResizeWindow);
    return () => {
      window.removeEventListener("resize", handleResizeWindow);
    };
  }, []);

  return (
    // <ProtectRoute
    //   // condition={!auth.isLoadingData && auth.authData?.role == "admin"}
    //   // redirect={"/404"}
    // >
    <div className="font-cairo">
      <Drawer />
      <div
        className={` ms-auto transition-all`}
        style={{ width: sm ? "100%" : `calc(100% - ${drawerWidth}px)` }}
      >
        <Header />
        <div>
          <Outlet />
        </div>
      </div>
    </div>
    // </ProtectRoute>
  );
}
