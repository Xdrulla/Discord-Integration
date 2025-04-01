import { useState, useEffect } from "react";
import { Card, Typography, Button, Avatar, Modal, Input, message, Form } from "antd";
import { ArrowLeftOutlined, UserOutlined, LockOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import { getAuth, updatePassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import {
  errorDiscordIdUpdate,
  savePassword,
  successDiscordIdUpdate,
} from "../common/alert";

const { Title, Text } = Typography;

const UserProfilePage = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth();


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [discordId, setDiscordId] = useState("");
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [discordIdError, setDiscordIdError] = useState("");

  useEffect(() => {
    const fetchDiscordId = async () => {
      if (!user?.uid) return;
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setDiscordId(userSnap.data().discordId || "");
        }
      } catch (error) {
        console.error("Erro ao buscar discordId:", error);
        message.error("Erro ao buscar informações do perfil.");
      }
    };

    fetchDiscordId();
  }, [user]);

  const handleSaveDiscordId = async () => {
    if (!user?.uid) {
      console.warn("user.uid indefinido!");
      return;
    }

    const isValidId = /^\d{17,20}$/.test(discordId);
    if (!isValidId) {
      setDiscordIdError("O Discord ID deve conter apenas números e ter entre 17 e 20 dígitos.");
      return;
    }

    setDiscordIdError("");
    setSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { discordId }, { merge: true });
      const updatedSnap = await getDoc(userRef);
      console.log("📦 Dados atualizados:", updatedSnap.data());
      successDiscordIdUpdate();
    } catch (error) {
      console.error("Erro ao atualizar Discord ID:", error);
      errorDiscordIdUpdate();
    }
    setSaving(false);
  };

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
      savePassword();
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
          Voltar
        </Button>

        <Avatar size={96} icon={<UserOutlined />} className="profile-avatar" />

        <Title level={3} className="profile-title">
          {user?.displayName || "Usuário"}
        </Title>

        <div className="profile-info">
          <Text><strong>Email:</strong> {user?.email}</Text>
          <Text><strong>Permissão:</strong> {role === "admin" ? "Administrador" : "Leitor"}</Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          className="profile-section"
          onFinish={handleSaveDiscordId}
        >
          <Form.Item
            label="Discord ID"
            validateStatus={discordIdError ? "error" : ""}
            help={discordIdError}
          >
            <Input
              placeholder="Ex: 123456789012345678"
              value={discordId}
              onChange={(e) => {
                setDiscordId(e.target.value);
                if (discordIdError) setDiscordIdError("")
              }}
              maxLength={30}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              htmlType="submit"
              loading={saving}
              className="profile-button"
            >
              Salvar Discord ID
            </Button>
          </Form.Item>
        </Form>

        <Button
          type="primary"
          icon={<LockOutlined />}
          onClick={() => setIsModalOpen(true)}
          className="profile-button"
        >
          Alterar Senha
        </Button>
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
            Insira uma nova senha com pelo menos 6 caracteres.
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
