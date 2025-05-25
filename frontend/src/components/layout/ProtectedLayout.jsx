import { Outlet } from "react-router-dom";
import Topbar from "../common/Topbar";

const ProtectedLayout = () => {
  return (
    <div className="protected-layout">
      <Topbar />

      <div className="content-container">
        <Outlet />
      </div>
    </div>
  );
};

export default ProtectedLayout;
