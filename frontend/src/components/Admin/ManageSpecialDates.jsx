import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Input, Table, Typography, message, Popconfirm, Select } from "antd";
import { ArrowLeftOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  fetchSpecialDates,
  addSpecialDate,
  deleteSpecialDate
} from "../../services/specialDateService";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { showError, showSuccess } from "../common/alert";

const { Title } = Typography;

const ManageSpecialDates = () => {
  const [holidays, setHolidays] = useState([]);
  const [formData, setFormData] = useState({ data: "", nome: "", usuarios: [] });
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const data = await fetchSpecialDates();
      setHolidays(data);
    } catch (error) {
      showError("Erro ao carregar datas especiais");
    }
  };

  useEffect(() => {
    fetchData();
    const loadUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const userList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          label: data.usuario || data.email,
          value: data.discordId,
        };
      });
      setUsers(userList);
    };
    loadUsers();
  }, []);

  const handleAddHoliday = async () => {
    const { data, nome } = formData;
    if (!data || !nome) return message.warning("Preencha todos os campos.");

    try {
      await addSpecialDate({ data, nome, usuarios: formData.usuarios });
      showSuccess("Data especial adicionada com sucesso!");
      setFormData({ data: "", nome: "", usuarios: [] });
      fetchData();
    } catch (error) {
      showError("Erro ao adicionar data especial");
    }
  };

  const handleDelete = async (data) => {
    try {
      await deleteSpecialDate(data);
      showSuccess("Data especial removida com sucesso!");
      fetchData();
    } catch (error) {
      showError("Erro ao remover data especial");
    }
  };

  const columns = [
    { title: "Data", dataIndex: "data", key: "data" },
    { title: "Nome", dataIndex: "nome", key: "nome" },
    {
      title: "Usuários",
      dataIndex: "usuarios",
      key: "usuarios",
      render: (ids) => {
        if (!ids || ids.length === 0) return "Todos";
        const nomes = ids.map(id => {
          const match = users.find(u => u.value === id);
          return match ? match.label : id;
        });
        return nomes.join(", ");
      },
    },
    {
      title: "Ação",
      dataIndex: "data",
      key: "action",
      render: (data) => (
        <Popconfirm title="Tem certeza que deseja excluir?" onConfirm={() => handleDelete(data)}>
          <Button type="link" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="manage-holidays-container">
      <Card className="manage-holidays-card">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/dashboard")}
          className="back-button"
        >
          Voltar ao Dashboard
        </Button>

        <Title level={3} className="manage-holidays-title">Gerenciar Datas Especiais</Title>

        <div className="holiday-form">
          <Input
            type="date"
            value={formData.data}
            onChange={(e) => setFormData({ ...formData, data: e.target.value })}
            className="holiday-input-date"
          />
          <Input
            placeholder="Descrição da data"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            className="holiday-input-nome"
          />
          <Select
            mode="multiple"
            allowClear
            style={{ minWidth: 250 }}
            placeholder="Selecionar usuários (opcional)"
            value={formData.usuarios}
            onChange={(values) => setFormData({ ...formData, usuarios: values })}
            options={users}
            className="holiday-select-users"
          />

          <Button type="primary" onClick={handleAddHoliday}>Adicionar</Button>
        </div>

        <Table
          dataSource={holidays}
          columns={columns}
          rowKey="data"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default ManageSpecialDates;
