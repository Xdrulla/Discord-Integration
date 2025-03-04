import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import { AuthProvider } from "./context/AuthProvider";
import PrivateRoute from "./PrivateRoute";
import ManageUsers from "./components/Admin/ManageUsers";
import Login from "./pages/Login";
import UserProfilePage from "./pages/UserProfilePage";
import ProtectedLayout from "./ProtectedLayout";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
        <Route path="/login" element={<Login />} />

          <Route element={<PrivateRoute><ProtectedLayout /></PrivateRoute>}>
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><UserProfilePage /></PrivateRoute>} />
            <Route path="/admin/manage-users" element={<PrivateRoute roleRequired="admin"><ManageUsers /></PrivateRoute>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
