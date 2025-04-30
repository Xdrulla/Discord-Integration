import PropTypes from "prop-types";
import { Card, Row, Col, Statistic, Empty, Spin } from "antd";

const DashboardStats = ({ resumo, loading }) => {  
  if (loading) return <Spin size="large" />;

  if (!resumo) return <Empty description="Resumo não disponível" />;

  return (
    <div className="stats-container">
      <Row gutter={16}>
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
