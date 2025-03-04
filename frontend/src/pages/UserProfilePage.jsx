import { Card, Typography } from "antd";
import { useAuth } from "../context/useAuth";

const { Title, Text } = Typography;

const UserProfilePage = () => {
  const { user, role } = useAuth();

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Card style={{ width: 400 }}>
        <Title level={3}>Perfil do Usuário</Title>
        <Text><strong>Email:</strong> {user?.email}</Text><br />
        <Text><strong>Permissão:</strong> {role === "admin" ? "Administrador" : "Leitor"}</Text>
      </Card>
    </div>
  );
};

export default UserProfilePage;
