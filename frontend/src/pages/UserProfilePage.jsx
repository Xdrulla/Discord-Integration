import { Card, Typography, Button, Avatar } from "antd";
import { ArrowLeftOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const UserProfilePage = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="profile-container">
      <Card className="profile-card">
        <Button 
          type="link" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate("/dashboard")}
          className="back-button"
        >
          Voltar ao Dashboard
        </Button>

        <Avatar size={80} icon={<UserOutlined />} className="profile-avatar" />
        
        <Title level={3} className="profile-title">Perfil do Usuário</Title>
        <Text className="profile-text"><strong>Email:</strong> {user?.email}</Text>
        <Text className="profile-text"><strong>Permissão:</strong> {role === "admin" ? "Administrador" : "Leitor"}</Text>
      </Card>
    </div>
  );
};

export default UserProfilePage;
