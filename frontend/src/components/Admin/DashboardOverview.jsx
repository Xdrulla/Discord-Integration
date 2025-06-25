import { ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, AimOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

const DashboardOverview = ({ resumo }) => {
  return (
    <div className="dashboard-overview">
      <div className="overview-card">
        <ClockCircleOutlined className="overview-icon blue" />
        <div className="overview-text">
          <h3>{resumo?.total_horas || "0h"}</h3>
          <p>Horas Trabalhadas</p>
        </div>
      </div>

      <div className="overview-card">
        <ExclamationCircleOutlined className="overview-icon orange" />
        <div className="overview-text">
          <h3>{resumo?.pendentes || 0}</h3>
          <p>Justificativas Pendentes</p>
        </div>
      </div>

      <div className="overview-card">
        <CheckCircleOutlined className="overview-icon green" />
        <div className="overview-text">
          <h3>{resumo?.aprovadas || 0}</h3>
          <p>Justificativas Aprovadas</p>
        </div>
      </div>

      <div className="overview-card">
        <AimOutlined className="overview-icon purple" />
        <div className="overview-text">
          <h3>{resumo?.meta || "0h"}</h3>
          <p>Meta Mensal</p>
        </div>
      </div>
    </div>
  );
};

DashboardOverview.propTypes = {
  resumo: PropTypes.shape,
};

export default DashboardOverview;
