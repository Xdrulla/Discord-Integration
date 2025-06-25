import Topbar from "../common/Topbar";
import SidebarMenu from "./SidebarMenu";
import { Outlet } from "react-router-dom";

const ProtectedLayout = () => {
  return (
    <div className="protected-layout" style={{ display: "flex" }}>
      <SidebarMenu />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Topbar />
        <div className="content-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ProtectedLayout;
