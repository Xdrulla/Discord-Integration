import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  InputNumber,
  Button,
  message,
  Card,
  Typography,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { db } from "../../config/firebaseConfig";
import { collection, getDocs, doc, setDoc, getDoc, query, where, orderBy, limit } from "firebase/firestore";

const { Title } = Typography;
const mesAtual = new Date().toISOString().slice(0, 7);

const GoalsManager = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const carregarUsuarios = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, "users"));
    const users = [];

    for (const docSnap of snapshot.docs) {
      const user = docSnap.data();
      const userId = docSnap.id;

      const metasRef = doc(db, "users", userId, "metas", mesAtual);
      const metaSnap = await getDoc(metasRef);
      const metaMinutos = metaSnap.exists() ? metaSnap.data().metaMinutos : 160 * 60;

      let nome = user.email.split("@")[0];
      if (user.discordId) {
        const registrosSnap = await getDocs(
          query(
            collection(db, "registros"),
            where("discordId", "==", user.discordId),
            orderBy("data", "desc"),
            limit(1)
          )
        );

        if (!registrosSnap.empty) {
          const ultimoRegistro = registrosSnap.docs[0].data();
          if (ultimoRegistro?.usuario) {
            nome = ultimoRegistro.usuario;
          }
        }
      }

      users.push({
        id: userId,
        nome,
        email: user.email,
        metaMinutos,
      });
    }

    setUsuarios(users);
    setLoading(false);
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const salvarMeta = async (id, minutos) => {
    try {
      await setDoc(doc(db, "users", id, "metas", mesAtual), { metaMinutos: minutos });
      message.success("Meta atualizada!");
    } catch (err) {
      console.error(err);
      message.error("Erro ao salvar meta.");
    }
  };

  const columns = [
    { title: "Nome", dataIndex: "nome", key: "nome" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Meta (horas)",
      dataIndex: "metaMinutos",
      key: "meta",
      render: (value, record) => (
        <InputNumber
          min={0}
          value={Math.round(value / 60)}
          onChange={(val) => {
            const atualizados = usuarios.map((u) =>
              u.id === record.id ? { ...u, metaMinutos: val * 60 } : u
            );
            setUsuarios(atualizados);
          }}
        />
      ),
    },
    {
      title: "Ações",
      render: (_, record) => (
        <Button onClick={() => salvarMeta(record.id, record.metaMinutos)}>Salvar</Button>
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

        <Title level={3} className="manage-users-title">Gerenciar Metas Mensais</Title>

        <Table
          dataSource={usuarios}
          columns={columns}
          rowKey="id"
          className="manage-users-table"
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default GoalsManager;
