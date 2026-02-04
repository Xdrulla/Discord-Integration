import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChartOutlined,
  UserOutlined,
  CalendarOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";

import { useAuth } from "../../context/useAuth";
import { Sidebar, Button } from "../designSystem";

const SidebarMenu = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [collapsed, setCollapsed] = useState(!isMobile);
  const { logout, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setCollapsed(!mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCollapse = () => {
    if (!isMobile) {
      setCollapsed(!collapsed);
    }
  };

  // Menu items no formato do Ant Design Menu
  const menuItems = [
    {
      key: "/dashboard",
      label: "Dashboard",
      icon: <BarChartOutlined />,
      onClick: () => navigate("/dashboard"),
    },
    ...(role === "admin"
      ? [
          {
            key: "/admin/manage-users",
            label: "Usuários",
            icon: <UserOutlined />,
            onClick: () => navigate("/admin/manage-users"),
          },
          {
            key: "/admin/goals",
            label: "Metas",
            icon: <CalendarOutlined />,
            onClick: () => navigate("/admin/goals"),
          },
        ]
      : []),
    {
      key: "/profile",
      label: "Perfil",
      icon: <SettingOutlined />,
      onClick: () => navigate("/profile"),
    },
  ];

  // Logo com toggle
  const logoContent = (
    <div className="ds-sidebar__logo-wrapper">
      <span className="ds-sidebar__brand">GoEPIK</span>
      <button className="ds-sidebar__toggle" onClick={toggleCollapse}>
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </button>
    </div>
  );

  // Footer com botão de logout
  const footerContent = (
    <Button
      variant="ghost"
      icon={<LogoutOutlined />}
      onClick={logout}
      className="ds-sidebar__logout"
    >
      {!collapsed && "Sair"}
    </Button>
  );

  return (
    <Sidebar
      logo={logoContent}
      menuItems={menuItems}
      footer={footerContent}
      collapsed={collapsed}
      className={`sidebar ${location.pathname}`}
      selectedKeys={[location.pathname]}
    />
  );
};

export default SidebarMenu;
