import { Outlet } from "react-router-dom";
import SidebarMenu from "../layout/SidebarMenu"
import UserProfile from "../Auth/UserProfile";

const ProtectedLayout = () => {
  return (
    <div className="protected-layout">
      <SidebarMenu />

      <div className="content-container">
        <div className="user-profile-container">
          <UserProfile />
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default ProtectedLayout;
