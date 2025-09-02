import Topbar from "../common/Topbar";
import SidebarMenu from "./SidebarMenu";
import PaginationFooter from "../common/PaginationFooter";
import PaginationProvider from "../../context/PaginationProvider";
import { Outlet } from "react-router-dom";

const ProtectedLayout = () => {
  return (
    <PaginationProvider>
      <div className="protected-layout">
        <SidebarMenu />
        <Topbar />
        <div className="content-container">
          <Outlet />
        </div>
        <PaginationFooter />
      </div>
    </PaginationProvider>
  );
};

export default ProtectedLayout;
