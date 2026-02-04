import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../config/firebaseConfig";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { Select, message, Card, Switch } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Header, Breadcrumb, Button, Table } from "../designSystem";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 576;

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

  const toggleExpanded = (userId) => {
    setExpandedRows((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const columns = [
    { 
      title: "Email", 
      dataIndex: "email", 
      key: "email",
      width: 200,
      ellipsis: true,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl']
    },
    {
      title: "Permissão",
      dataIndex: "role",
      key: "role",
      width: 120,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (role, record) => (
        <Select 
          value={role} 
          onChange={(value) => handleRoleChange(record.id, value)}
          className="role-select"
        >
          <Select.Option value="admin">Admin</Select.Option>
          <Select.Option value="leitor">Leitor</Select.Option>
        </Select>
      ),
    },
    {
      title: "Notificações (Admin)",
      dataIndex: "receberNotificacoes",
      key: "receberNotificacoes",
      width: 180,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (value, record) => (
        <div className="notification-switch-container">
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
            className={`notification-switch ${
              record.role !== "admin" ? "disabled" : ""
            } ${value ? "enabled" : "disabled-state"}`}
          />
          <span className={`switch-label ${
            record.role !== "admin" ? "unavailable" : 
            value ? "active" : "inactive"
          }`}>
            {record.role !== "admin" ? "N/A" : value ? "Ativo" : "Inativo"}
          </span>
        </div>
      ),
    },
    {
      title: "Notificações (Leitor)",
      dataIndex: "receberNotificacoesLeitor",
      key: "receberNotificacoesLeitor",
      width: 180,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (value, record) => (
        <div className="notification-switch-container">
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
            className={`notification-switch ${
              record.role !== "leitor" ? "disabled" : ""
            } ${value ? "enabled" : "disabled-state"}`}
          />
          <span className={`switch-label ${
            record.role !== "leitor" ? "unavailable" : 
            value ? "active" : "inactive"
          }`}>
            {record.role !== "leitor" ? "N/A" : value ? "Ativo" : "Inativo"}
          </span>
        </div>
      ),
    },
  ];

  const breadcrumbItems = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Gerenciar Usuários" },
  ];

  return (
    <div className="manage-users-container">
      <Header
        title="Gerenciar Usuários"
        description="Gerencie permissões e notificações dos usuários"
        breadcrumb={<Breadcrumb items={breadcrumbItems} />}
        actions={
          <Button
            variant="ghost"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/dashboard")}
          >
            Voltar
          </Button>
        }
      />

      <Card className="manage-users-card">
        <div className="manage-users-content">
          {isMobile ? (
            <div className="users-mobile-list">
              {users.map((user) => (
                <div key={user.id} className="user-card">
                  <div className="user-header">
                    <strong>{user.email}</strong>
                    <button onClick={() => toggleExpanded(user.id)}>
                      {expandedRows.includes(user.id) ? "Fechar" : "Ver Detalhes"}
                    </button>
                  </div>

                  {expandedRows.includes(user.id) && (
                    <div className="user-details">
                      <div className="user-role-section">
                        <strong>Permissão:</strong>
                        <Select 
                          value={user.role} 
                          onChange={(value) => handleRoleChange(user.id, value)}
                          className="mobile-role-select"
                        >
                          <Select.Option value="admin">Admin</Select.Option>
                          <Select.Option value="leitor">Leitor</Select.Option>
                        </Select>
                      </div>

                      <div className="user-notifications-section">
                        <div className="notification-row">
                          <strong>Notificações (Admin):</strong>
                          <div className="notification-switch-container">
                            <Switch
                              checked={user.receberNotificacoes}
                              onChange={async (checked) => {
                                try {
                                  const userRef = doc(db, "users", user.id);
                                  await updateDoc(userRef, { receberNotificacoes: checked });
                                  setUsers((prev) =>
                                    prev.map((u) => u.id === user.id ? { ...u, receberNotificacoes: checked } : u)
                                  );
                                  message.success("Notificação atualizada com sucesso!");
                                } catch (err) {
                                  message.error("Erro ao atualizar notificações.", err);
                                }
                              }}
                              disabled={user.role !== "admin"}
                              className={`notification-switch ${
                                user.role !== "admin" ? "disabled" : ""
                              } ${user.receberNotificacoes ? "enabled" : "disabled-state"}`}
                            />
                            <span className={`switch-label ${
                              user.role !== "admin" ? "unavailable" : 
                              user.receberNotificacoes ? "active" : "inactive"
                            }`}>
                              {user.role !== "admin" ? "N/A" : user.receberNotificacoes ? "Ativo" : "Inativo"}
                            </span>
                          </div>
                        </div>

                        <div className="notification-row">
                          <strong>Notificações (Leitor):</strong>
                          <div className="notification-switch-container">
                            <Switch
                              checked={user.receberNotificacoesLeitor}
                              onChange={async (checked) => {
                                try {
                                  const userRef = doc(db, "users", user.id);
                                  await updateDoc(userRef, { receberNotificacoesLeitor: checked });
                                  setUsers((prev) =>
                                    prev.map((u) => u.id === user.id ? { ...u, receberNotificacoesLeitor: checked } : u)
                                  );
                                  message.success("Notificação para leitor atualizada com sucesso!");
                                } catch (err) {
                                  message.error("Erro ao atualizar notificações.", err);
                                }
                              }}
                              disabled={user.role !== "leitor"}
                              className={`notification-switch ${
                                user.role !== "leitor" ? "disabled" : ""
                              } ${user.receberNotificacoesLeitor ? "enabled" : "disabled-state"}`}
                            />
                            <span className={`switch-label ${
                              user.role !== "leitor" ? "unavailable" : 
                              user.receberNotificacoesLeitor ? "active" : "inactive"
                            }`}>
                              {user.role !== "leitor" ? "N/A" : user.receberNotificacoesLeitor ? "Ativo" : "Inativo"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Table
              dataSource={users}
              columns={columns}
              rowKey="id"
              className="manage-users-table"
              scroll={{ x: 800 }}
              size="middle"
              pagination={false}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default ManageUsers;
