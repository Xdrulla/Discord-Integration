import PropTypes from "prop-types";
import { useEffect, useState, useMemo } from "react";
import { Card, Row, Col, Statistic } from "antd";
import { Loading, EmptyState } from "../designSystem";
import FilterBar from "./FilterBar";
import dayjs from "dayjs";
import { useAuth } from "../../context/useAuth";
import { carregarResumoMensal } from "../../helper/useFilteredRecord";
import { debounce } from "lodash";

const DashboardStats = ({ resumo: initialResumo, loading: initialLoading, todosRegistros }) => {
  const { role, discordId } = useAuth();
  const [resumo, setResumo] = useState(initialResumo);
  const [loading, setLoading] = useState(initialLoading);

  const [searchUser, setSearchUser] = useState("");
  const [dateRange, setDateRange] = useState([dayjs(), dayjs()]);

  const discordIdFromSearch = useMemo(() => {
    if (!searchUser || !todosRegistros?.length) return null;

    const match = todosRegistros.find((r) =>
      r.usuario?.toLowerCase().includes(searchUser.toLowerCase())
    );

    return match?.discordId || null;
  }, [searchUser, todosRegistros]);

  useEffect(() => {
    const fetchResumo = async () => {
      setLoading(true);
      try {
        const usuario = role === "leitor"
          ? discordId
          : discordIdFromSearch || discordId;

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

    const debouncedFetch = debounce(fetchResumo, 500);
    debouncedFetch();

    return () => debouncedFetch.cancel();
  }, [searchUser, discordIdFromSearch, dateRange, role, discordId]);

  if (loading) return <Loading size="lg" />;

  if (!resumo) return <EmptyState description="Resumo não disponível" />;

  return (
    <div className="stats-container">
      <FilterBar
        role={role}
        searchUser={searchUser}
        setSearchUser={setSearchUser}
        setDateRange={setDateRange}
        currentTab="2"
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
  loading: PropTypes.bool.isRequired,
  todosRegistros: PropTypes.array.isRequired,
};

export default DashboardStats;
