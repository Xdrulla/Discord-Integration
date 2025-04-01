import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../../context/useAuth";

const PrivateRoute = ({ children, roleRequired }) => {
  const { user, role, loading } = useAuth();
  useAuth

  if (loading) return null; // Evita redirecionar antes de carregar

  if (!user) return <Navigate to="/login" />;
  
  if (roleRequired && role !== roleRequired) return <Navigate to="/dashboard" />;

  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  roleRequired: PropTypes.node.isRequired,
}

export default PrivateRoute;

