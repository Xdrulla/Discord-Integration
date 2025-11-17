import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  AimOutlined, 
  RiseOutlined, 
  FallOutlined,
  MinusCircleOutlined,
  BankOutlined
} from "@ant-design/icons";
import PropTypes from "prop-types";
import { Progress } from "antd";

/**
 * Extrai minutos de uma string de horas (ex: "40h 30m" -> 2430)
 */
const extrairMinutos = (horasStr) => {
  if (!horasStr || typeof horasStr !== "string") return 0;
  
  const match = horasStr.trim().match(/^(-?)(\d+)h\s*(\d+(\.\d+)?)(m|min)?$/i);
  if (!match) return 0;
  
  const sinal = match[1] === "-" ? -1 : 1;
  const horas = parseInt(match[2]) || 0;
  const minutos = Math.round(parseFloat(match[3]) || 0);
  
  return sinal * (horas * 60 + minutos);
};

/**
 * Formata minutos para horas (ex: 150 -> "2h 30m")
 */
const formatarHoras = (minutos) => {
  const sinal = minutos < 0 ? "-" : "";
  const minutosAbs = Math.abs(minutos);
  const h = Math.floor(minutosAbs / 60);
  const m = minutosAbs % 60;
  return `${sinal}${h}h ${m}m`;
};

const DashboardOverview = ({ resumo }) => {
  if (!resumo) {
    return (
      <div className="dashboard-overview">
        <div className="overview-card">
          <ClockCircleOutlined className="overview-icon blue" />
          <div className="overview-text">
            <h3>Carregando...</h3>
            <p>Aguarde</p>
          </div>
        </div>
      </div>
    );
  }

  // Calcula progresso
  const horasTrabalhadas = resumo.horasTrabalhadas || extrairMinutos(resumo.total_horas);
  const metaMinutos = resumo.metaMinutos || extrairMinutos(resumo.meta);
  const saldoMesAtualMinutos = resumo.saldoMesAtualMinutos ?? (horasTrabalhadas - metaMinutos);
  const bancoAnteriorMinutos = resumo.bancoAcumuladoAnteriorMinutos || 0;
  const saldoTotalMinutos = resumo.saldoTotalMinutos ?? (bancoAnteriorMinutos + saldoMesAtualMinutos);
  
  const percentualMeta = metaMinutos > 0 ? Math.min(100, (horasTrabalhadas / metaMinutos) * 100) : 0;
  const faltam = metaMinutos - horasTrabalhadas;
  const atingiuMeta = horasTrabalhadas >= metaMinutos;

  return (
    <div className="dashboard-overview">
      {/* Horas Trabalhadas vs Meta */}
      <div className="overview-card overview-card-large">
        <div className="overview-header">
          <ClockCircleOutlined className="overview-icon blue" />
          <div className="overview-text">
            <h3>{formatarHoras(horasTrabalhadas)}</h3>
            <p>Horas Trabalhadas este Mês</p>
          </div>
        </div>
        <div className="overview-progress">
          <Progress 
            percent={Math.round(percentualMeta)} 
            strokeColor={atingiuMeta ? "#52c41a" : "#1890ff"}
            status={atingiuMeta ? "success" : "active"}
            strokeWidth={8}
            showInfo={true}
            format={(percent) => `${percent}%`}
          />
          <div className="overview-meta-info">
            <span>Meta: {resumo.meta || "0h 0m"}</span>
            {!atingiuMeta && faltam > 0 && (
              <span className="faltam">Faltam: {formatarHoras(faltam)}</span>
            )}
            {atingiuMeta && (
              <span className="atingiu">✓ Meta atingida!</span>
            )}
          </div>
        </div>
      </div>

      {/* Saldo do Mês Atual */}
      <div className={`overview-card ${saldoMesAtualMinutos >= 0 ? 'positive' : 'negative'}`}>
        {saldoMesAtualMinutos >= 0 ? (
          <RiseOutlined className="overview-icon green" />
        ) : (
          <FallOutlined className="overview-icon red" />
        )}
        <div className="overview-text">
          <h3>{formatarHoras(Math.abs(saldoMesAtualMinutos))}</h3>
          <p>{saldoMesAtualMinutos >= 0 ? "Banco do Mês" : "A Compensar"}</p>
        </div>
      </div>

      {/* Banco Acumulado Anterior */}
      {bancoAnteriorMinutos !== 0 && (
        <div className={`overview-card ${bancoAnteriorMinutos >= 0 ? 'positive' : 'negative'}`}>
          <BankOutlined className={`overview-icon ${bancoAnteriorMinutos >= 0 ? 'purple' : 'orange'}`} />
          <div className="overview-text">
            <h3>{formatarHoras(Math.abs(bancoAnteriorMinutos))}</h3>
            <p>{bancoAnteriorMinutos >= 0 ? "Banco Acumulado" : "Débito Anterior"}</p>
          </div>
        </div>
      )}

      {/* Saldo Total */}
      <div className={`overview-card ${saldoTotalMinutos >= 0 ? 'positive' : 'negative'}`}>
        {saldoTotalMinutos > 0 ? (
          <CheckCircleOutlined className="overview-icon green" />
        ) : saldoTotalMinutos < 0 ? (
          <MinusCircleOutlined className="overview-icon red" />
        ) : (
          <AimOutlined className="overview-icon gray" />
        )}
        <div className="overview-text">
          <h3>{formatarHoras(Math.abs(saldoTotalMinutos))}</h3>
          <p>
            {saldoTotalMinutos > 0 ? "Saldo Total Positivo" : 
             saldoTotalMinutos < 0 ? "Saldo Total a Compensar" : "Saldo Zerado"}
          </p>
        </div>
      </div>

      {/* Justificativas */}
      {(resumo.pendentes > 0 || resumo.aprovadas > 0) && (
        <>
          <div className="overview-card">
            <ExclamationCircleOutlined className="overview-icon orange" />
            <div className="overview-text">
              <h3>{resumo.pendentes || 0}</h3>
              <p>Justificativas Pendentes</p>
            </div>
          </div>

          <div className="overview-card">
            <CheckCircleOutlined className="overview-icon green" />
            <div className="overview-text">
              <h3>{resumo.aprovadas || 0}</h3>
              <p>Justificativas Aprovadas</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

DashboardOverview.propTypes = {
  resumo: PropTypes.shape({
    total_horas: PropTypes.string,
    horasTrabalhadas: PropTypes.number,
    meta: PropTypes.string,
    metaMinutos: PropTypes.number,
    saldoMesAtual: PropTypes.string,
    saldoMesAtualMinutos: PropTypes.number,
    bancoAcumuladoAnterior: PropTypes.string,
    bancoAcumuladoAnteriorMinutos: PropTypes.number,
    saldoTotal: PropTypes.string,
    saldoTotalMinutos: PropTypes.number,
    pendentes: PropTypes.number,
    aprovadas: PropTypes.number,
  }),
};

export default DashboardOverview;
