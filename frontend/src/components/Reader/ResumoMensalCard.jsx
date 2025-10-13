import React from 'react';
import PropTypes from 'prop-types';
import { Card, Row, Col, Typography, Space, Progress, Skeleton, Tag } from 'antd';
import { 
  BankOutlined, 
  AimOutlined, 
  CalendarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { extrairMinutosDeString } from '../../utils/timeUtils';

const { Title, Text } = Typography;

/**
 * Card com resumo mensal e estatísticas de longo prazo
 * Mostra banco de horas, meta mensal e progresso semanal
 * NOVO: Inclui banco acumulado dos últimos 3 meses
 */
const ResumoMensalCard = ({ loading, resumoMensal, bancoAcumulado }) => {
  if (loading) {
    return (
      <Card className="resumo-mensal-card" title="RESUMO MENSAL">
        <Skeleton active />
      </Card>
    );
  }

  if (!resumoMensal) {
    return (
      <Card className="resumo-mensal-card" title="RESUMO MENSAL">
        <Text type="secondary">Dados não disponíveis</Text>
      </Card>
    );
  }

  // Calcula tendência do banco de horas
  const bancoMinutos = extrairMinutosDeString(resumoMensal.saldo || '0h 0m');
  const tendenciaBanco = bancoMinutos > 0 ? 'positiva' : bancoMinutos < 0 ? 'negativa' : 'neutra';
  
  // Calcula progresso da meta mensal
  const totalMinutos = extrairMinutosDeString(resumoMensal.total_horas || '0h 0m');
  const metaMinutos = extrairMinutosDeString(resumoMensal.meta || '160h 0m');
  const progressoMeta = metaMinutos > 0 ? Math.round((totalMinutos / metaMinutos) * 100) : 0;

  // Simula progresso da semana (posteriormente pode vir de API específica)
  const progressoSemana = 95; // Mock - 38h de 40h
  const horasSemana = '38h';

  const getTendenciaConfig = (tendencia) => {
    switch (tendencia) {
      case 'positiva':
        return {
          icon: <ArrowUpOutlined className="trend-icon positive" />,
          color: '#00D084',
          symbol: '⬆️'
        };
      case 'negativa':
        return {
          icon: <ArrowDownOutlined className="trend-icon negative" />,
          color: '#FF4757',
          symbol: '⬇️'
        };
      default:
        return {
          icon: <BankOutlined className="trend-icon neutral" />,
          color: '#8C8C8C',
          symbol: '➖'
        };
    }
  };

  const tendenciaConfig = getTendenciaConfig(tendenciaBanco);

  return (
    <Card 
      className="resumo-mensal-card"
      title="RESUMO MENSAL"
      headStyle={{ backgroundColor: '#fafafa' }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        
        {/* Banco de Horas Mensal */}
        <Row justify="space-between" align="middle" className="info-row banco-row">
          <Col>
            <Space>
              <BankOutlined className="icon banco" />
              <Text strong>Banco do Mês</Text>
            </Space>
          </Col>
          <Col>
            <Space align="center">
              <Title level={4} className={`valor-banco ${tendenciaBanco}`}>
                {resumoMensal.saldo}
              </Title>
              <span className="tendencia-symbol">
                {tendenciaConfig.symbol}
              </span>
            </Space>
          </Col>
        </Row>

        {/* Banco Acumulado 3 Meses - NOVO! */}
        {bancoAcumulado && (
          <Row justify="space-between" align="middle" className="info-row banco-acumulado-row">
            <Col>
              <Space>
                <BankOutlined className="icon banco-acumulado" />
                <div>
                  <Text strong>Banco Acumulado</Text>
                  <br />
                  <Text type="secondary" className="periodo-info">
                    últimos 3 meses
                  </Text>
                </div>
              </Space>
            </Col>
            <Col>
              <Space align="center">
                <Title level={4} className={`valor-banco-acumulado ${bancoAcumulado.tendencia}`}>
                  {bancoAcumulado.bancoAcumulado}
                </Title>
                <span className="tendencia-symbol">
                  {bancoAcumulado.tendencia === 'positiva' ? '⬆️' : 
                   bancoAcumulado.tendencia === 'negativa' ? '⬇️' : '➖'}
                </span>
              </Space>
            </Col>
          </Row>
        )}

        {/* Meta Mensal com Progresso */}
        <Row justify="space-between" align="middle" className="info-row">
          <Col span={24}>
            <Space>
              <AimOutlined className="icon meta" />
              <Text strong>Meta</Text>
              <Text type="secondary">({progressoMeta}% concluído)</Text>
            </Space>
            <div className="meta-progress">
              <Progress
                percent={progressoMeta}
                strokeColor="#1890ff"
                trailColor="rgba(0,0,0,0.1)"
                strokeWidth={6}
                showInfo={false}
              />
              <div className="meta-values">
                <Text className="meta-atual">{resumoMensal.total_horas}</Text>
                <Text type="secondary" className="meta-total">de {resumoMensal.meta}</Text>
              </div>
            </div>
          </Col>
        </Row>

        {/* Progresso da Semana */}
        <Row justify="space-between" align="middle" className="info-row">
          <Col>
            <Space>
              <CalendarOutlined className="icon semana" />
              <Text strong>Semana</Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Title level={4} className="valor-semana">
                {horasSemana}
              </Title>
              <Tag color={progressoSemana >= 90 ? 'success' : 'processing'}>
                {progressoSemana}%
              </Tag>
            </Space>
          </Col>
        </Row>

        {/* Justificativas (se houver) */}
        {(resumoMensal.pendentes > 0 || resumoMensal.aprovadas > 0) && (
          <div className="justificativas-info">
            <Space>
              {resumoMensal.pendentes > 0 && (
                <Tag color="orange">
                  {resumoMensal.pendentes} pendentes
                </Tag>
              )}
              {resumoMensal.aprovadas > 0 && (
                <Tag color="green">
                  {resumoMensal.aprovadas} aprovadas
                </Tag>
              )}
            </Space>
          </div>
        )}

        {/* Detalhamento do Banco Acumulado - NOVO! */}
        {bancoAcumulado && bancoAcumulado.detalhePeriodos && bancoAcumulado.detalhePeriodos.length > 0 && (
          <div className="detalhamento-banco">
            <Text strong className="detalhamento-titulo">
              📊 Detalhamento por período:
            </Text>
            <div className="periodos-grid">
              {bancoAcumulado.detalhePeriodos.map((periodo, index) => (
                <div key={index} className="periodo-item">
                  <Text className="periodo-nome">{periodo.periodo}</Text>
                  <Text className={`periodo-saldo ${periodo.saldo.includes('-') ? 'negativo' : 'positivo'}`}>
                    {periodo.saldo}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensagem motivacional */}
        <div className="mensagem-mensal">
          {progressoMeta >= 100 && (
            <Text type="success" className="parabeniza">
              🎉 Parabéns! Meta mensal atingida!
            </Text>
          )}
          {progressoMeta >= 80 && progressoMeta < 100 && (
            <Text className="quase-meta">
              🎯 Quase lá! Faltam poucos dias para a meta!
            </Text>
          )}
          {tendenciaBanco === 'positiva' && (
            <Text type="success" className="banco-positivo">
              💰 Seu banco de horas está positivo este mês!
            </Text>
          )}
          {bancoAcumulado && bancoAcumulado.tendencia === 'positiva' && (
            <Text type="success" className="banco-acumulado-positivo">
              🏦 Você tem {bancoAcumulado.bancoAcumulado} acumuladas nos últimos 3 meses!
            </Text>
          )}
          {bancoAcumulado && bancoAcumulado.tendencia === 'negativa' && (
            <Text type="warning" className="banco-acumulado-negativo">
              ⚠️ Atenção: Saldo negativo de {bancoAcumulado.bancoAcumulado} nos últimos 3 meses
            </Text>
          )}
        </div>

      </Space>
    </Card>
  );
};

ResumoMensalCard.propTypes = {
  loading: PropTypes.bool,
  resumoMensal: PropTypes.shape({
    saldo: PropTypes.string,
    total_horas: PropTypes.string,
    meta: PropTypes.string,
    pendentes: PropTypes.number,
    aprovadas: PropTypes.number,
    extras: PropTypes.object
  }),
  bancoAcumulado: PropTypes.shape({
    bancoAcumulado: PropTypes.string,
    tendencia: PropTypes.oneOf(['positiva', 'negativa', 'neutra']),
    detalhePeriodos: PropTypes.arrayOf(PropTypes.shape({
      periodo: PropTypes.string,
      saldo: PropTypes.string,
      totalHoras: PropTypes.string,
      meta: PropTypes.string
    })),
    mesAtual: PropTypes.object,
    mesesAnteriores: PropTypes.array,
    dataCalculo: PropTypes.string
  })
};

export default ResumoMensalCard;