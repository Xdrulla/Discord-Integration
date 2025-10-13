import React, { useState, useEffect } from 'react';
import { Row, Col } from 'antd';
import { useAuth } from '../../context/useAuth';
import StatusAtualCard from './StatusAtualCard';
import MeuDiaCard from './MeuDiaCard';
import ResumoMensalCard from './ResumoMensalCard';
import AcoesRapidasCard from './AcoesRapidasCard';
import { useReaderData } from '../../hooks/useReaderData';

/**
 * Dashboard principal para usuários leitores
 * Interface otimizada focada nas informações essenciais do dia atual
 */
const ReaderDashboard = () => {
  const { user, discordId } = useAuth();
  const {
    registroHoje,
    resumoMensal,
    bancoAcumulado,
    loading,
    statusAtual,
    tempoTrabalhado,
    tempoRestante,
    horarioSaidaPrevisto,
    progressoDia
  } = useReaderData(discordId);

  return (
    <div className="reader-dashboard">
      {/* Header com informações do usuário */}
      <div className="reader-dashboard__header">
        <h1 className="reader-dashboard__title">
          <span className="brand">🏢 GoEPIK</span>
          <span className="user-info">
            {user?.email?.split('@')[0]} • {new Date().toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: '2-digit' 
            })}
          </span>
        </h1>
      </div>

      {/* Grid principal com componentes */}
      <Row gutter={[4, 4]} className="reader-dashboard__grid">
        {/* Status Atual - Componente Hero */}
        <Col xs={24} className="reader-dashboard__status">
          <StatusAtualCard
            loading={loading}
            statusAtual={statusAtual}
            tempoTrabalhado={tempoTrabalhado}
            tempoRestante={tempoRestante}
            progressoDia={progressoDia}
          />
        </Col>

        {/* Meu Dia - Informações essenciais */}
        <Col xs={24} md={12}>
          <MeuDiaCard
            loading={loading}
            registroHoje={registroHoje}
            horarioSaidaPrevisto={horarioSaidaPrevisto}
          />
        </Col>

        {/* Resumo Mensal - Visão de longo prazo */}
        <Col xs={24} md={12}>
          <ResumoMensalCard
            loading={loading}
            resumoMensal={resumoMensal}
            bancoAcumulado={bancoAcumulado}
          />
        </Col>

        {/* Ações Rápidas - Funcionalidades contextuais */}
        <Col xs={24}>
          <AcoesRapidasCard
            registroHoje={registroHoje}
            statusAtual={statusAtual}
          />
        </Col>
      </Row>
    </div>
  );
};

export default ReaderDashboard;