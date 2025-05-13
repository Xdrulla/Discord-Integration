import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Empty, Spin } from "antd";
import FilterBar from "./FilterBar";
import dayjs from "dayjs";
import { useAuth } from "../../context/useAuth";
import { carregarResumoMensal } from "../../helper/useFilteredRecord";

const DashboardStats = ({ resumo: initialResumo, loading: initialLoading }) => {
  const { role, discordId } = useAuth();
  const [resumo, setResumo] = useState(initialResumo);
  const [loading, setLoading] = useState(initialLoading);

  const [searchUser, setSearchUser] = useState("");
  const [dateRange, setDateRange] = useState([dayjs(), dayjs()]);

  useEffect(() => {
    const fetchResumo = async () => {
      setLoading(true);
      try {
        const usuario = role === "leitor" ? discordId : searchUser || discordId;
        const dataBase = dateRange[0] || dayjs();
        const ano = dataBase.year();
        const mes = dataBase.month() + 1;
        await carregarResumoMensal(usuario, ano, mes, setResumo, setLoading);
      } catch (error) {
        console.error("Erro ao carregar resumo:", error);
        setResumo(null);
        setLoading(false);
      }
    };

    fetchResumo();
  }, [searchUser, dateRange, role, discordId]);

  if (loading) return <Spin size="large" />;

  if (!resumo) return <Empty description="Resumo não disponível" />;

  return (
    <div className="stats-container">
      <FilterBar
        searchUser={searchUser}
        setSearchUser={setSearchUser}
        setDateRange={setDateRange}
        mode={role}
      />

      <Row gutter={16} style={{ marginTop: "20px" }}>
        <Col span={8}>
          <Card>
            <Statistic title="Banco de Horas Total" value={resumo.saldo} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Total de Horas Trabalhadas" value={resumo.total_horas} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Meta do Mês" value={resumo.meta} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: "20px" }}>
        <Col span={8}>
          <Card>
            <Statistic title="Horas em Dias Úteis" value={resumo.extras.dia_util} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Horas em Sábados" value={resumo.extras.sabado} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Horas em Domingos/Feriados" value={resumo.extras.domingo_feriado} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

DashboardStats.propTypes = {
  resumo: PropTypes.object,
  loading: PropTypes.bool.isRequired
};

export default DashboardStats;
