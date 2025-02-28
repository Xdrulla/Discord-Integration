import { useAuth } from "../context/AuthProvider";
import { Link } from "react-router-dom";
import { Button } from "antd";

const Navbar = () => {
  const { role, logout } = useAuth();

  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>
      {role === "admin" && <Link to="/admin/manage-users"><Button>Gerenciar Usuários</Button></Link>}
      <Button onClick={logout}>Sair</Button>
    </nav>
  );
};

export default Navbar;
