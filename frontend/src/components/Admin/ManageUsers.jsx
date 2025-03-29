import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebaseConfig";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { Table, Select, message, Card, Button, Typography, Switch } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title } = Typography;

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(userData);
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
      );
      message.success("Permissão alterada com sucesso!");
    } catch (error) {
      message.error("Erro ao alterar permissão.", error);
    }
  };

  const columns = [
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Permissão",
      dataIndex: "role",
      key: "role",
      render: (role, record) => (
        <Select value={role} onChange={(value) => handleRoleChange(record.id, value)}>
          <Select.Option value="admin">Admin</Select.Option>
          <Select.Option value="leitor">Leitor</Select.Option>
        </Select>
      ),
    },
    {
      title: "Notificações (Admin)",
      dataIndex: "receberNotificacoes",
      key: "receberNotificacoes",
      render: (value, record) => (
        <Switch
          checked={value}
          onChange={async (checked) => {
            try {
              const userRef = doc(db, "users", record.id);
              await updateDoc(userRef, { receberNotificacoes: checked });
              setUsers((prev) =>
                prev.map((u) => u.id === record.id ? { ...u, receberNotificacoes: checked } : u)
              );
              message.success("Notificação atualizada com sucesso!");
            } catch (err) {
              message.error("Erro ao atualizar notificações.", err);
            }
          }}
          disabled={record.role !== "admin"}
        />
      ),
    },
    {
      title: "Notificações (Leitor)",
      dataIndex: "receberNotificacoesLeitor",
      key: "receberNotificacoesLeitor",
      render: (value, record) => (
        <Switch
          checked={value}
          onChange={async (checked) => {
            try {
              const userRef = doc(db, "users", record.id);
              await updateDoc(userRef, { receberNotificacoesLeitor: checked });
              setUsers((prev) =>
                prev.map((u) => u.id === record.id ? { ...u, receberNotificacoesLeitor: checked } : u)
              );
              message.success("Notificação para leitor atualizada com sucesso!");
            } catch (err) {
              message.error("Erro ao atualizar notificações.", err);
            }
          }}
          disabled={record.role !== "leitor"}
        />
      ),
    },
  ];

  return (
    <div className="manage-users-container">
      <Card className="manage-users-card">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/dashboard")}
          className="back-button"
        >
          Voltar ao Dashboard
        </Button>

        <Title level={3} className="manage-users-title">Gerenciar Usuários</Title>

        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          className="manage-users-table"
        />
      </Card>
    </div>
  );
};

export default ManageUsers;
