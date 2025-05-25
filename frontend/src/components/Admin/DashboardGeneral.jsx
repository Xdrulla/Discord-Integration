import { useCallback, useEffect, useState } from "react";
import { Table, Button, Select, Row, Col, Typography, message } from "antd";
import { FileExcelOutlined, FilePdfOutlined } from "@ant-design/icons";
import { auth } from "../../config/firebaseConfig";
import axios from "axios";
const { Title } = Typography;

const DashboardGeneral = () => {
  const [resumos, setResumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);

  const meses = [
    { label: "Janeiro", value: 1 }, { label: "Fevereiro", value: 2 },
    { label: "Março", value: 3 }, { label: "Abril", value: 4 },
    { label: "Maio", value: 5 }, { label: "Junho", value: 6 },
    { label: "Julho", value: 7 }, { label: "Agosto", value: 8 },
    { label: "Setembro", value: 9 }, { label: "Outubro", value: 10 },
    { label: "Novembro", value: 11 }, { label: "Dezembro", value: 12 }
  ];

  const carregarResumo = useCallback(async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser.getIdToken();
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/registro/resumo-geral/${ano}/${mes}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResumos(response.data);
    } catch (err) {
      message.error("Erro ao carregar resumo geral.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [ano, mes]);

  const exportar = async (formato) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const link = `${import.meta.env.VITE_API_URL}/registro/resumo-geral-exportar/${ano}/${mes}?format=${formato}`;
      const response = await axios.get(link, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob"
      });

      const blob = new Blob([response.data], { type: formato === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Resumo_${ano}_${String(mes).padStart(2, "0")}.${formato === "pdf" ? "pdf" : "xlsx"}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      message.error("Erro ao exportar arquivo.");
      console.error(err);
    }
  };

  useEffect(() => {
    carregarResumo();
  }, [carregarResumo]);

  const columns = [
    { title: "Nome", dataIndex: "nome", key: "nome" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Total", dataIndex: "total_horas", key: "total" },
    { title: "Saldo", dataIndex: "saldo", key: "saldo" },
    { title: "Meta", dataIndex: "meta", key: "meta" },
    { title: "Dia Útil", dataIndex: ["extras", "dia_util"], key: "util" },
    { title: "Sábado", dataIndex: ["extras", "sabado"], key: "sabado" },
    { title: "Domingo/Feriado", dataIndex: ["extras", "domingo_feriado"], key: "domingo" }
  ];

  return (
    <div className="dashboard-general-container">
      <Title level={3} className="title">Resumo Geral de Ponto</Title>

      <Row gutter={16} className="filters-row">
        <Col>
          <Select value={mes} options={meses} onChange={setMes} style={{ width: 150 }} />
        </Col>
        <Col>
          <Select
            value={ano}
            onChange={setAno}
            options={[2024, 2025].map(y => ({ label: y, value: y }))}
            style={{ width: 120 }}
          />
        </Col>
        <Col>
          <Button icon={<FileExcelOutlined />} onClick={() => exportar("excel")}>
            Exportar Excel
          </Button>
        </Col>
        <Col>
          <Button icon={<FilePdfOutlined />} onClick={() => exportar("pdf")}>
            Exportar PDF
          </Button>
        </Col>
      </Row>

      <Table
        dataSource={Array.isArray(resumos) ? resumos : []}
        columns={columns}
        loading={loading}
        rowKey="email"
        scroll={{ x: "max-content" }}
        pagination={false}
      />
    </div>
  );
};

export default DashboardGeneral;
