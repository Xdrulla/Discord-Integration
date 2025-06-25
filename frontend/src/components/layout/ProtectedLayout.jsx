import Topbar from "../common/Topbar";
import SidebarMenu from "./SidebarMenu";
import PaginationFooter from "../common/PaginationFooter";
import PaginationProvider from "../../context/PaginationProvider";
import { Outlet } from "react-router-dom";

const ProtectedLayout = () => {
  return (
    <PaginationProvider>
      <div className="protected-layout" style={{ display: "flex" }}>
        <SidebarMenu />

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Topbar />
          <div className="content-container">
            <Outlet />
          </div>
          <PaginationFooter />
        </div>
      </div>
    </PaginationProvider>
  );
};

export default ProtectedLayout;
