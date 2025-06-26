import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../components/Admin/Dashboard";
import { AuthProvider } from "../context/AuthProvider";
import PrivateRoute from "../components/Auth/PrivateRoute";
import ManageUsers from "../components/Admin/ManageUsers";
import UserProfilePage from "../components/Auth/UserProfilePage";
import ProtectedLayout from "../components/layout/ProtectedLayout";
import AuthPage from "../components/Auth/Login";
import GoalsManager from "../components/Auth/GoalsManager";
import ManageSpecialDates from "../components/Admin/ManageSpecialDates";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<AuthPage />} />

          <Route element={<PrivateRoute><ProtectedLayout /></PrivateRoute>}>
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><UserProfilePage /></PrivateRoute>} />
            <Route path="/admin/manage-users" element={<PrivateRoute roleRequired="admin"><ManageUsers /></PrivateRoute>} />
            <Route path="/admin/goals" element={<PrivateRoute roleRequired="admin"><GoalsManager /></PrivateRoute>} />
            <Route path="/admin/manage-holidays" element={<PrivateRoute roleRequired="admin"><ManageSpecialDates /></PrivateRoute>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
