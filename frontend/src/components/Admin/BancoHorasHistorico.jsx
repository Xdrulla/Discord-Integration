import { useState, useEffect } from "react";
import { Card, Alert } from "antd";
import { BankOutlined, HistoryOutlined } from "@ant-design/icons";
import { Table, Loading, EmptyState } from "../designSystem";
import PropTypes from "prop-types";
import axios from "axios";

const BancoHorasHistorico = ({ discordId }) => {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!discordId) return;

    const fetchHistorico = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = await import("firebase/auth").then(({ getAuth }) => 
          getAuth().currentUser?.getIdToken()
        );

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/banco-horas/historico/${discordId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setHistorico(response.data.historico);
        }
      } catch (err) {
        console.error("Erro ao buscar histórico:", err);
        setError("Não foi possível carregar o histórico de banco de horas.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistorico();
  }, [discordId]);

  const columns = [
    {
      title: "Mês/Ano",
      dataIndex: "mesAno",
      key: "mesAno",
      render: (mesAno) => {
        const [ano, mes] = mesAno.split("-");
        const meses = [
          "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
          "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        return `${meses[parseInt(mes) - 1]} ${ano}`;
      },
    },
    {
      title: "Saldo",
      dataIndex: "saldoFormatado",
      key: "saldo",
      render: (saldo, record) => {
        const isPositivo = record.saldoMinutos >= 0;
        return (
          <span
            style={{
              color: isPositivo ? "#52c41a" : "#ff4d4f",
              fontWeight: "600",
            }}
          >
            {isPositivo ? "+" : ""}{saldo}
          </span>
        );
      },
    },
    {
      title: "Fechado em",
      dataIndex: "fechadoEm",
      key: "fechadoEm",
      render: (data) => new Date(data).toLocaleDateString("pt-BR"),
    },
  ];

  const calcularSaldoTotal = () => {
    return historico.reduce((acc, item) => acc + item.saldoMinutos, 0);
  };

  const formatarMinutos = (minutos) => {
    const sinal = minutos < 0 ? "-" : "+";
    const minutosAbs = Math.abs(minutos);
    const h = Math.floor(minutosAbs / 60);
    const m = minutosAbs % 60;
    return `${sinal}${h}h ${m}m`;
  };

  if (loading) {
    return (
      <Card title={<><HistoryOutlined /> Histórico de Banco de Horas</>}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <Loading size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={<><HistoryOutlined /> Histórico de Banco de Horas</>}>
        <Alert message={error} type="warning" showIcon />
      </Card>
    );
  }

  if (historico.length === 0) {
    return (
      <Card title={<><HistoryOutlined /> Histórico de Banco de Horas</>}>
        <EmptyState
          title="Nenhum histórico encontrado"
          description="O histórico de banco de horas aparecerá aqui após o fechamento dos meses."
        />
      </Card>
    );
  }

  const saldoTotal = calcularSaldoTotal();

  return (
    <Card
      title={<><HistoryOutlined /> Histórico de Banco de Horas (Últimos 6 meses)</>}
      extra={
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <BankOutlined style={{ fontSize: "1.2rem" }} />
          <span style={{ fontWeight: "600", fontSize: "1.1rem" }}>
            Saldo Acumulado: 
            <span style={{ 
              color: saldoTotal >= 0 ? "#52c41a" : "#ff4d4f",
              marginLeft: "0.5rem" 
            }}>
              {formatarMinutos(saldoTotal)}
            </span>
          </span>
        </div>
      }
    >
      <Table
        dataSource={historico}
        columns={columns}
        rowKey="mesAno"
        pagination={false}
        size="middle"
      />
    </Card>
  );
};

BancoHorasHistorico.propTypes = {
  discordId: PropTypes.string.isRequired,
};

export default BancoHorasHistorico;

