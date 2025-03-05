import { Outlet } from "react-router-dom";
import SidebarMenu from "./components/SidebarMenu";
import UserProfile from "./pages/UserProfile"

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
