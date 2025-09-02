import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  InputNumber,
  Button,
  Card,
  Typography,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { db } from "../../config/firebaseConfig";
import { collection, getDocs, doc, setDoc, getDoc, query, where, orderBy, limit } from "firebase/firestore";
import { showError, showSuccess } from "../common/alert";

const { Title } = Typography;
const mesAtual = new Date().toISOString().slice(0, 7);

const GoalsManager = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState([]);
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 576;

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
      showSuccess("Meta atualizada com sucesso!");
    } catch (err) {
      console.error(err);
      showError("Erro ao salvar meta.");
    }
  };

  const toggleExpanded = (userId) => {
    setExpandedRows((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
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
        <div className="manage-users-header">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/dashboard")}
            className="back-button"
          >
            Voltar ao Dashboard
          </Button>

          <Title level={3} className="manage-users-title">Gerenciar Metas Mensais</Title>
        </div>

        <div className="manage-users-content">
          {isMobile ? (
            <div className="goals-mobile-list">
              {usuarios.map((usuario) => (
                <div key={usuario.id} className="goal-card">
                  <div className="goal-header">
                    <strong>{usuario.nome}</strong>
                    <button onClick={() => toggleExpanded(usuario.id)}>
                      {expandedRows.includes(usuario.id) ? "Fechar" : "Ver Detalhes"}
                    </button>
                  </div>

                  {expandedRows.includes(usuario.id) && (
                    <div className="goal-details">
                      <div className="goal-email-section">
                        <strong>Email:</strong>
                        <span>{usuario.email}</span>
                      </div>

                      <div className="goal-meta-section">
                        <strong>Meta (horas):</strong>
                        <div className="goal-input-container">
                          <InputNumber
                            min={0}
                            value={Math.round(usuario.metaMinutos / 60)}
                            onChange={(val) => {
                              const atualizados = usuarios.map((u) =>
                                u.id === usuario.id ? { ...u, metaMinutos: val * 60 } : u
                              );
                              setUsuarios(atualizados);
                            }}
                            className="mobile-goal-input"
                          />
                          <Button 
                            onClick={() => salvarMeta(usuario.id, usuario.metaMinutos)}
                            type="primary"
                            className="mobile-save-button"
                          >
                            Salvar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Table
              dataSource={usuarios}
              columns={columns}
              rowKey="id"
              className="manage-users-table"
              loading={loading}
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

export default GoalsManager;
