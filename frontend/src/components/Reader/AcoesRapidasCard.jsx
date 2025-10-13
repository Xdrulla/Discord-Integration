import React from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Space, Typography } from 'antd';
import { 
  EditOutlined, 
  HistoryOutlined, 
  QuestionCircleOutlined,
  SettingOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

/**
 * Card com ações rápidas contextuais baseadas no estado atual
 * Oferece funcionalidades relevantes para o usuário leitor
 */
const AcoesRapidasCard = ({ registroHoje, statusAtual }) => {
  const navigate = useNavigate();

  // Determina ações disponíveis baseado no contexto
  const getAcoesDisponiveis = () => {
    const acoes = [];

    // Sempre disponível: Ver histórico completo
    acoes.push({
      key: 'historico',
      label: 'Ver Histórico',
      icon: <HistoryOutlined />,
      onClick: () => navigate('/dashboard'),
      type: 'default'
    });

    // Justificar registro - disponível se há registro hoje
    if (registroHoje && registroHoje.entrada) {
      acoes.push({
        key: 'justificar',
        label: 'Justificar Registro',
        icon: <EditOutlined />,
        onClick: () => handleJustificarRegistro(),
        type: 'primary'
      });
    }

    // Configurações de perfil
    acoes.push({
      key: 'perfil',
      label: 'Meu Perfil',
      icon: <SettingOutlined />,
      onClick: () => navigate('/profile'),
      type: 'default'
    });

    // Central de ajuda
    acoes.push({
      key: 'ajuda',
      label: 'Ajuda',
      icon: <QuestionCircleOutlined />,
      onClick: () => handleAbrirAjuda(),
      type: 'default'
    });

    return acoes;
  };

  const handleJustificarRegistro = () => {
    // TODO: Implementar modal de justificativa
    // Por enquanto, redireciona para dashboard com foco no registro
    if (registroHoje?.id) {
      navigate(`/dashboard?registro=${registroHoje.id}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleAbrirAjuda = () => {
    // TODO: Implementar central de ajuda ou modal
    console.log('Abrindo central de ajuda...');
    // Por enquanto, pode abrir modal ou redirecionar para FAQ
  };

  const acoes = getAcoesDisponiveis();

  return (
    <Card 
      className="acoes-rapidas-card"
      title="AÇÕES RÁPIDAS"
      headStyle={{ backgroundColor: '#fafafa' }}
    >
      <div className="acoes-container">
        <Space 
          wrap 
          size={[12, 12]} 
          className="acoes-grid"
        >
          {acoes.map(acao => (
            <Button
              key={acao.key}
              type={acao.type}
              icon={acao.icon}
              onClick={acao.onClick}
              className={`acao-button acao-${acao.key}`}
              size="large"
            >
              {acao.label}
            </Button>
          ))}
        </Space>

        {/* Dicas contextuais */}
        <div className="dicas-contextuais">
          {statusAtual === 'nao_iniciado' && (
            <Text type="secondary" className="dica">
              💡 Use o Discord ou registre manualmente para iniciar seu ponto
            </Text>
          )}
          
          {statusAtual === 'trabalhando' && registroHoje?.entrada && (
            <Text type="secondary" className="dica">
              ⏰ Não esqueça de registrar pausas e sua saída no horário correto
            </Text>
          )}
          
          {statusAtual === 'pausado' && (
            <Text type="warning" className="dica">
              ⏸️ Você está em pausa - lembre-se de voltar ao trabalho
            </Text>
          )}
          
          {statusAtual === 'finalizado' && (
            <Text type="success" className="dica">
              ✅ Dia de trabalho concluído! Bom descanso!
            </Text>
          )}
        </div>

        {/* Atalhos do teclado (futuro) */}
        <div className="atalhos-info" style={{ display: 'none' }}>
          <Text type="secondary" className="atalhos-texto">
            Atalhos: H (Histórico) • J (Justificar) • P (Perfil) • ? (Ajuda)
          </Text>
        </div>
      </div>
    </Card>
  );
};

AcoesRapidasCard.propTypes = {
  registroHoje: PropTypes.shape({
    id: PropTypes.string,
    entrada: PropTypes.string,
    saida: PropTypes.string
  }),
  statusAtual: PropTypes.oneOf(['trabalhando', 'pausado', 'nao_iniciado', 'finalizado'])
};

export default AcoesRapidasCard;