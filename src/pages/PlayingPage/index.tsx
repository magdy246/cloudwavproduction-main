import { Outlet } from "react-router-dom";
import Header from "../../components/Header/Header";

export default function Playing() {
  return (
    <>
      <Header type="dashboard" />
      <Outlet />
    </>
  );
}
