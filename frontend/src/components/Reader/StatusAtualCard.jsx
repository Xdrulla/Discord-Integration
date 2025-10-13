import React from 'react';
import PropTypes from 'prop-types';
import { Card, Progress, Typography, Space, Spin } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * Componente hero que mostra o status atual em tempo real
 * Exibe status de trabalho, tempo atual e progresso do dia
 */
const StatusAtualCard = ({ 
  loading, 
  statusAtual, 
  tempoTrabalhado, 
  tempoRestante, 
  progressoDia 
}) => {
  // Define ícone e cor baseado no status
  const getStatusConfig = (status) => {
    switch (status) {
      case 'trabalhando':
        return {
          icon: <CheckCircleOutlined className="status-icon success" />,
          text: 'TRABALHANDO',
          className: 'status-trabalhando',
          color: '#00D084'
        };
      case 'pausado':
        return {
          icon: <PauseCircleOutlined className="status-icon warning" />,
          text: 'EM PAUSA',
          className: 'status-pausado',
          color: '#FFB800'
        };
      case 'nao_iniciado':
        return {
          icon: <ClockCircleOutlined className="status-icon neutral" />,
          text: 'NÃO INICIADO',
          className: 'status-nao-iniciado',
          color: '#8C8C8C'
        };
      case 'finalizado':
        return {
          icon: <CheckCircleOutlined className="status-icon success" />,
          text: 'FINALIZADO',
          className: 'status-finalizado',
          color: '#00D084'
        };
      default:
        return {
          icon: <ClockCircleOutlined className="status-icon neutral" />,
          text: 'CARREGANDO...',
          className: 'status-loading',
          color: '#8C8C8C'
        };
    }
  };

  const statusConfig = getStatusConfig(statusAtual);
  const horaAtual = new Date().toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Mensagem motivacional baseada no progresso
  const getMensagemMotivacional = (progresso) => {
    if (progresso >= 100) return "Meta diária atingida! 🎉";
    if (progresso >= 80) return "Quase lá! 🏆";
    if (progresso >= 50) return "Ótimo progresso! 💪";
    if (progresso >= 25) return "Bom ritmo! ⚡";
    return "Vamos começar! 🚀";
  };

  if (loading) {
    return (
      <Card className="status-atual-card loading">
        <div className="status-loading-container">
          <Spin size="large" />
          <Text>Carregando status atual...</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`status-atual-card ${statusConfig.className}`}>
      <div className="status-atual-content">
        {/* Status principal */}
        <div className="status-header">
          <Space align="center" size="middle">
            {statusConfig.icon}
            <div className="status-info">
              <Title level={2} className="status-text">
                {statusConfig.text}
              </Title>
              <Text className="hora-atual">{horaAtual}</Text>
            </div>
          </Space>
        </div>

        {/* Informações do tempo */}
        <div className="tempo-info">
          <Space size="large" className="tempo-stats">
            <div className="tempo-item">
              <Text strong className="tempo-label">Trabalhado hoje</Text>
              <Title level={3} className="tempo-value">{tempoTrabalhado || '0h 0m'}</Title>
            </div>
            <div className="tempo-item">
              <Text strong className="tempo-label">Tempo restante</Text>
              <Title level={3} className="tempo-value">{tempoRestante || '0h 0m'}</Title>
            </div>
          </Space>
        </div>

        {/* Barra de progresso */}
        <div className="progresso-container">
          <Progress
            percent={Math.round(progressoDia || 0)}
            strokeColor={statusConfig.color}
            trailColor="rgba(0,0,0,0.1)"
            strokeWidth={8}
            className="progresso-barra"
          />
          <Text className="progresso-text">
            {Math.round(progressoDia || 0)}% concluído
          </Text>
        </div>

        {/* Mensagem motivacional */}
        <div className="mensagem-motivacional">
          <Text className="mensagem-text">
            {getMensagemMotivacional(progressoDia || 0)}
          </Text>
        </div>
      </div>
    </Card>
  );
};

StatusAtualCard.propTypes = {
  loading: PropTypes.bool,
  statusAtual: PropTypes.oneOf(['trabalhando', 'pausado', 'nao_iniciado', 'finalizado']),
  tempoTrabalhado: PropTypes.string,
  tempoRestante: PropTypes.string,
  progressoDia: PropTypes.number
};

export default StatusAtualCard;