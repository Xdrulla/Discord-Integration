import { useEffect, useState, useCallback } from "react";
import { Tabs } from "antd";
import { useLocation } from "react-router-dom";
import FilterBar from "./FilterBar";
import RecordsTable from "./RecordsTable";
import DashboardStats from "./DashboardStats";
import { useAuth } from "../../context/useAuth";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import debounce from "lodash.debounce";
import { io } from "socket.io-client";
import {
  notifyRealtimeUpdate,
  showLoadingAlert,
  closeAlert,
  showError,
  showSuccess,
} from "../common/alert";
import { carregarRegistrosFiltrados, carregarResumoMensal } from "../../helper/useFilteredRecord";
import DashboardGeneral from "./DashboardGeneral";
import DashboardOverview from "./DashboardOverview";
import PendingJustificationsModal from "./justification/PendingJustificationsModal";
import { upsertJustificativa } from "../../services/justificativaService";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const socket = io(import.meta.env.VITE_API_URL);

const Dashboard = () => {
  const { role, discordId } = useAuth();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'day'), // Últimos 30 dias
    dayjs() // Hoje
  ]);
  const [resumo, setResumo] = useState(null);
  const [resumoLoading, setResumoLoading] = useState(true);
  const [initialRecordId, setInitialRecordId] = useState(null);
  const [pendingModalVisible, setPendingModalVisible] = useState(false);
  const [pendingJustifications, setPendingJustifications] = useState([]);

  const handlePendingStatus = async (recordId, status) => {
    const record = data.find((r) => r.id === recordId);
    if (!record || !record.justificativa) return;

    const payload = {
      usuario: record.usuario,
      data: record.data,
      text: record.justificativa.text || "",
      newEntry: record.justificativa.newEntry || null,
      newExit: record.justificativa.newExit || null,
      abonoHoras: record.justificativa.abonoHoras || null,
      manualBreak: record.justificativa.manualBreak || null,
      status,
      observacaoAdmin: null,
    };

    showLoadingAlert("Atualizando status da justificativa...");

    try {
      const res = await upsertJustificativa(payload);
      if (res.success) {
        showSuccess(`Justificativa ${status} com sucesso!`);
        setData((prev) => {
          const updated = prev.map((r) =>
            r.id === recordId
              ? { ...r, justificativa: { ...r.justificativa, status } }
              : r
          );
          return updated;
        });
        setPendingJustifications((prev) => {
          const updated = prev.filter((j) => j.id !== recordId);
          if (updated.length === 0) setPendingModalVisible(false);
          return updated;
        });
      } else {
        showError(res.error || "Erro ao atualizar justificativa.");
      }
    } catch (error) {
      console.error("Erro ao atualizar justificativa:", error);
      showError("Erro ao atualizar justificativa.");
    } finally {
      closeAlert();
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reg = params.get('registro');
    if (reg) setInitialRecordId(reg);
  }, [location.search]);

  useEffect(() => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth() + 1;
    const usuario = role === "leitor"
      ? discordId
      : searchUser || discordId;

    if (usuario) {
      carregarResumoMensal(usuario, ano, mes, setResumo, setResumoLoading);
    }
  }, [searchUser, role, discordId]);


  useEffect(() => {
    carregarRegistrosFiltrados(role, discordId, setData, setFilteredData, setLoading);
  }, [role, discordId]);

  useEffect(() => {
    if (role === "admin" && data.length) {
      const pendentes = data.filter(
        (r) => r.justificativa?.status === "pendente"
      );
      setPendingJustifications(pendentes);
      if (pendentes.length > 0) setPendingModalVisible(true);
    }
  }, [data, role]);

  const applyFilters = useCallback(() => {
    let filtered = [...data];
    if (searchUser) {
      filtered = filtered.filter((record) =>
        record.usuario.toLowerCase().includes(searchUser.toLowerCase())
      );
    }

    if (dateRange[0] && dateRange[1]) {
      filtered = filtered.filter((record) => {
        const recordDate = dayjs(record.data);
        return (
          recordDate.isSameOrAfter(dayjs(dateRange[0]).startOf("day")) &&
          recordDate.isSameOrBefore(dayjs(dateRange[1]).endOf("day"))
        );
      });
    }

    if (role === "admin") {
      filtered.sort((a, b) => {
        const aIsPendente = a.justificativa?.status === "pendente";
        const bIsPendente = b.justificativa?.status === "pendente";

        if (aIsPendente && !bIsPendente) return -1;
        if (!aIsPendente && bIsPendente) return 1;
        return 0;
      });
    }

    setFilteredData(filtered);
  }, [data, searchUser, dateRange, role]);

  useEffect(() => {
    const debouncedFilter = debounce(() => applyFilters(), 500);
    debouncedFilter();
    return () => debouncedFilter.cancel();
  }, [searchUser, applyFilters]);

  useEffect(() => {
    applyFilters();
  }, [dateRange, applyFilters]);

  useEffect(() => {
    applyFilters();
  }, [data, applyFilters]);

  useEffect(() => {
    const atualizarRegistros = async () => {
      await carregarRegistrosFiltrados(role, discordId, setData, setFilteredData, setLoading);
    };

    socket.on("registro-atualizado", () => {
      if (role === "admin") {
        notifyRealtimeUpdate();
      }
      atualizarRegistros();
    });

    return () => socket.off("registro-atualizado");
  }, [role, discordId]);

  return (
    <>
      {role === "admin" && (
        <PendingJustificationsModal
          visible={pendingModalVisible}
          onClose={() => setPendingModalVisible(false)}
          justifications={pendingJustifications}
          onApprove={(id) => handlePendingStatus(id, "aprovado")}
          onReject={(id) => handlePendingStatus(id, "reprovado")}
        />
      )}
      <div className="dashboard-wrapper">
        <DashboardOverview resumo={resumo} />

        <Tabs defaultActiveKey="1" className="dashboard-tabs">
          <Tabs.TabPane tab="Registros de Ponto" key="1">
            <FilterBar
              role={role}
              searchUser={searchUser}
              setSearchUser={setSearchUser}
              dateRange={dateRange}
              setDateRange={setDateRange}
              currentTab="1"
            />

            <RecordsTable
              loading={loading}
              filteredData={filteredData}
              initialRecordId={initialRecordId}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab="Estatísticas" key="2">
            <DashboardStats resumo={resumo} loading={resumoLoading} todosRegistros={data} />
          </Tabs.TabPane>

          {role === "admin" && (
            <Tabs.TabPane tab="Resumo Geral" key="3">
              <DashboardGeneral />
            </Tabs.TabPane>
          )}
        </Tabs>
      </div>
    </>
  );
};

export default Dashboard;
