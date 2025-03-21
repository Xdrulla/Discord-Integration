import { useState } from "react";
import { Card, Typography, Button, Avatar, Modal, Input, message, Space } from "antd";
import { ArrowLeftOutlined, UserOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import { getAuth, updatePassword } from "firebase/auth";
import { savePassword } from "../common/alert";

const { Title, Text } = Typography;

const UserProfilePage = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const handlePasswordChange = async () => {
    if (!user) {
      message.error("Usuário não autenticado.");
      return;
    }
    
    if (newPassword.length < 6) {
      message.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      await updatePassword(auth.currentUser, newPassword);
      savePassword()
      setIsModalOpen(false);
      setNewPassword("");
    } catch (error) {
      console.error("Erro ao atualizar senha:", error);
      if (error.code === "auth/requires-recent-login") {
        message.error("Você precisa fazer login novamente para alterar a senha.");
      } else {
        message.error("Erro ao alterar a senha. Tente novamente.");
      }
    }
  };

  return (
    <div className="profile-container">
      <Card className="profile-card">
        <Button 
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/dashboard")}
          className="back-button"
        >
          Voltar ao Dashboard
        </Button>

        <Avatar size={100} icon={<UserOutlined />} className="profile-avatar" />
        
        <Title level={3} className="profile-title">{user?.displayName || "Usuário"}</Title>
        <Text className="profile-text"><strong>Email:</strong> {user?.email}</Text>
        <Text className="profile-text"><strong>Permissão:</strong> {role === "admin" ? "Administrador" : "Leitor"}</Text>

        <Space direction="vertical" className="profile-actions">
          <Button 
            type="primary"
            icon={<LockOutlined />}
            onClick={() => setIsModalOpen(true)}
            className="change-password-button"
          >
            Alterar Senha
          </Button>
        </Space>
      </Card>

      <Modal
        title="Alterar Senha"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handlePasswordChange}
        okText="Salvar"
        cancelText="Cancelar"
        centered
        width={450}
      >
        <div className="modal-content">
          <Text className="modal-description">
            Insira uma nova senha para sua conta. A senha deve ter no mínimo 6 caracteres.
          </Text>
          <Input.Password
            placeholder="Nova senha"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="password-input"
          />
        </div>
      </Modal>
    </div>
  );
};

export default UserProfilePage;
