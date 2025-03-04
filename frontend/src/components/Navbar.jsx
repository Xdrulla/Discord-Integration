import { useAuth } from "../context/useAuth";
import { Link } from "react-router-dom";
import { Button } from "antd";
import UserProfile from "../pages/UserProfile";

const Navbar = () => {
  const { role } = useAuth();

  return (
    <nav style={{ display: "flex", justifyContent: "space-between", padding: "10px" }}>
      <div>
        {role === "admin" && <Link to="/admin/manage-users" style={{ marginLeft: "10px" }}><Button>Gerenciar Usuários</Button></Link>}
      </div>
      <UserProfile />
    </nav>
  );
};

export default Navbar;
