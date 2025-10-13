import React from 'react';
import PropTypes from 'prop-types';
import { Card, Row, Col, Typography, Space, Tag, Skeleton } from 'antd';
import { 
  LoginOutlined, 
  LogoutOutlined, 
  PauseCircleOutlined, 
  TrophyOutlined 
} from '@ant-design/icons';
import { calcularTotalPausas, podeSerFinalizado } from '../../utils/readerUtils';

const { Title, Text } = Typography;

/**
 * Card com informações essenciais do dia atual de trabalho
 * Mostra entrada, saída prevista, pausas e meta diária
 */
const MeuDiaCard = ({ loading, registroHoje, horarioSaidaPrevisto }) => {
  if (loading) {
    return (
      <Card className="meu-dia-card" title="MEU DIA DE TRABALHO">
        <Skeleton active />
      </Card>
    );
  }

  const totalPausas = calcularTotalPausas(registroHoje);
  const jaFinalizou = podeSerFinalizado(registroHoje);
  const limitePausa = '1h 0m'; // Limite padrão de 1h de pausa por dia

  return (
    <Card 
      className="meu-dia-card"
      title="MEU DIA DE TRABALHO"
      headStyle={{ backgroundColor: '#fafafa' }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        
        {/* Entrada */}
        <Row justify="space-between" align="middle" className="info-row">
          <Col>
            <Space>
              <LoginOutlined className="icon entrada" />
              <Text strong>Entrada</Text>
            </Space>
          </Col>
          <Col>
            <Title level={4} className="valor-entrada">
              {registroHoje?.entrada || '--:--'}
            </Title>
          </Col>
        </Row>

        {/* Saída Prevista */}
        <Row justify="space-between" align="middle" className="info-row">
          <Col>
            <Space>
              <LogoutOutlined className="icon saida" />
              <Text strong>Saída prevista</Text>
              {jaFinalizou && <Tag color="success">✨</Tag>}
            </Space>
          </Col>
          <Col>
            <Title level={4} className="valor-saida">
              {horarioSaidaPrevisto}
            </Title>
          </Col>
        </Row>

        {/* Pausas */}
        <Row justify="space-between" align="middle" className="info-row">
          <Col>
            <Space>
              <PauseCircleOutlined className="icon pausas" />
              <Text strong>Pausas hoje</Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Title level={4} className="valor-pausas">
                {totalPausas}
              </Title>
              <Text type="secondary" className="limite-pausas">
                de {limitePausa} máx
              </Text>
            </Space>
          </Col>
        </Row>

        {/* Meta Diária */}
        <Row justify="space-between" align="middle" className="info-row meta-row">
          <Col>
            <Space>
              <TrophyOutlined className="icon meta" />
              <Text strong>Meta</Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Title level={4} className="valor-meta">
                8h
              </Title>
              {jaFinalizou && (
                <Tag color="gold" icon={<TrophyOutlined />}>
                  Quase lá! 🏆
                </Tag>
              )}
            </Space>
          </Col>
        </Row>

        {/* Mensagem contextual */}
        {registroHoje?.entrada && !registroHoje?.saida && (
          <div className="mensagem-contextual">
            <Text type="secondary" className="dica-horario">
              💡 Baseado na sua entrada às {registroHoje.entrada}, você pode sair às {horarioSaidaPrevisto}
            </Text>
          </div>
        )}

        {!registroHoje?.entrada && (
          <div className="mensagem-contextual">
            <Text type="secondary" className="dica-inicio">
              👋 Registre sua entrada para começar a contar o tempo!
            </Text>
          </div>
        )}

      </Space>
    </Card>
  );
};

MeuDiaCard.propTypes = {
  loading: PropTypes.bool,
  registroHoje: PropTypes.shape({
    entrada: PropTypes.string,
    saida: PropTypes.string,
    total_horas: PropTypes.string,
    total_pausas: PropTypes.string,
    pausas: PropTypes.array
  }),
  horarioSaidaPrevisto: PropTypes.string
};

export default MeuDiaCard;