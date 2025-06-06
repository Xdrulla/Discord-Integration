import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { UserOutlined, LogoutOutlined, TeamOutlined, CalendarOutlined } from "@ant-design/icons";
import { Dropdown, Menu, Avatar } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";

const UserProfile = () => {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState(null);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDisplayName = async () => {
      if (!user?.uid) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return;

        const { discordId } = userSnap.data();
        if (!discordId) return;

        const registrosRef = collection(db, "registros");
        const q = query(
          registrosRef,
          where("discordId", "==", discordId),
          orderBy("data", "desc")
        );
        const registrosSnap = await getDocs(q);

        if (!registrosSnap.empty) {
          const registro = registrosSnap.docs[0].data();
          if (registro?.usuario) {
            setDisplayName(registro.usuario);
            return;
          }
        }
      } catch (error) {
        console.error("Erro ao buscar nome do usuário via registros:", error);
      }

      setDisplayName(user?.email.split("@")[0] || "Usuário");
    };

    fetchDisplayName();
  }, [user]);

  const handleMenuClick = ({ key }) => {
    if (key === "user_profile") {
      navigate("/profile");
    // } else if (key === "manage_holidays") {
    //   navigate("/admin/manage-holidays");
    } else if (key === "manage_users") {
      navigate("admin/manage-users");
    } else if (key === "manage_goals") {
      navigate("/admin/goals");
    } else if (key === "logout") {
      logout();
    }
    setOpen(false);
  };

  const menuItems = [
    { key: "user_profile", label: "Perfil do Usuário", icon: <UserOutlined /> },
    { key: "manage_users", label: "Gerenciar Usuários", icon: <TeamOutlined /> },
    { key: "manage_goals", label: "Metas Mensais", icon: <CalendarOutlined /> },
    // { key: "manage_holidays", label: "Datas Especiais", icon: <GiftOutlined /> },
    { key: "logout", label: "Sair", icon: <LogoutOutlined /> },
  ];
  

  return (
    <Dropdown
      overlay={<Menu onClick={handleMenuClick} items={menuItems} />}
      trigger={["click"]}
      open={open}
      onOpenChange={setOpen}
    >
      <div className="user-profile">
        <span className="user-greeting">Olá! <strong>{displayName}</strong></span>
        <Avatar icon={<UserOutlined />} className="user-avatar" />
      </div>
    </Dropdown>
  );
};

UserProfile.propTypes = {
  logout: PropTypes.func,
};

export default UserProfile;
