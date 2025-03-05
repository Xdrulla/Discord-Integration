import PropTypes from "prop-types";
import { useState } from 'react';
import { UserOutlined, SettingOutlined } from '@ant-design/icons';
import { Dropdown, Menu } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const UserProfile = () => {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleMenuClick = ({ key }) => {
    if (key === "user_profile") {
      navigate("/profile");
    } else if (key === "manage_users") {
      navigate("admin/manage-users");
    } else if (key === "logout") {
      logout();
    }
    setOpen(false);
  };

  const menuItems = [
    { key: "user_profile", label: "Perfil do Usuário", icon: <UserOutlined /> },
    { key: "manage_users", label: "Gerenciar Usuários", icon: <SettingOutlined /> },
    { key: "logout", label: "Sair" }
  ];

  return (
    <Dropdown
      overlay={<Menu onClick={handleMenuClick} items={menuItems} />}
      trigger={["click"]}
      open={open}
      onOpenChange={setOpen}
    >
      <UserOutlined className="user-profile-dropdown" />
      </Dropdown>
  );
};

UserProfile.propTypes = {
  logout: PropTypes.func.isRequired,
};

export default UserProfile;
