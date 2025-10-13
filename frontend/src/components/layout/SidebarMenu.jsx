import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChartOutlined,
  UserOutlined,
  CalendarOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
} from "@ant-design/icons";

import { useAuth } from "../../context/useAuth";

const SidebarMenu = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [collapsed, setCollapsed] = useState(!isMobile);
  const { logout, role } = useAuth();
  const location = useLocation();

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

  const menuItems = role === "admin" 
    ? [
        { key: "/dashboard", label: "Dashboard Admin", icon: <BarChartOutlined /> },
        { key: "/admin/manage-users", label: "Usuários", icon: <UserOutlined /> },
        { key: "/admin/goals", label: "Metas", icon: <CalendarOutlined /> },
        { key: "/profile", label: "Perfil", icon: <SettingOutlined /> },
      ]
    : [
        { key: "/reader-dashboard", label: "Meu Ponto", icon: <HomeOutlined /> },
        { key: "/dashboard", label: "Histórico", icon: <BarChartOutlined /> },
        { key: "/profile", label: "Perfil", icon: <SettingOutlined /> },
      ];

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-toggle" onClick={toggleCollapse}>
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </div>

      <div className="sidebar-brand">GoEPIK</div>

      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.key} className={location.pathname === item.key ? "active" : ""}>
            <Link to={item.key}>
              <span className="icon">{item.icon}</span>
              {(!collapsed || isMobile) && <span className="label">{item.label}</span>}
            </Link>
          </li>
        ))}

        <li>
          <button className="logout-btn" onClick={logout}>
            <span className="icon"><LogoutOutlined /></span>
            {(!collapsed || isMobile) && <span className="label">Sair</span>}
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default SidebarMenu;
