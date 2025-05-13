import { useEffect, useState, useCallback } from "react";
import { Layout, Typography, Tabs, Tooltip, Row, Col } from "antd";
import FilterBar from "./FilterBar";
import RecordsTable from "./RecordsTable";
import DashboardStats from "./DashboardStats";
import { useAuth } from "../../context/useAuth";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { PlusOutlined } from "@ant-design/icons";
import debounce from "lodash.debounce";
import { io } from "socket.io-client";
import { notifyRealtimeUpdate } from "../common/alert";
import { carregarRegistrosFiltrados, carregarResumoMensal } from "../../helper/useFilteredRecord";
import DashboardGeneral from "./DashboardGeneral";
import AddManualRecordModal from "./AddManualRecordModal";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Header, Content } = Layout;
const { Title } = Typography;
const socket = io(import.meta.env.VITE_API_URL);

const Dashboard = () => {
  const { role, discordId } = useAuth();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [resumo, setResumo] = useState(null);
  const [resumoLoading, setResumoLoading] = useState(true);
  const [manualModalOpen, setManualModalOpen] = useState(false);

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

    setFilteredData(filtered);
  }, [data, searchUser, dateRange]);

  useEffect(() => {
    const debouncedFilter = debounce(() => applyFilters(), 500);
    debouncedFilter();
    return () => debouncedFilter.cancel();
  }, [searchUser, applyFilters]);

  useEffect(() => {
    applyFilters();
  }, [dateRange, applyFilters]);

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
      <Layout className="dashboard-container">
        <Header className="dashboard-header">
          <div className="header-content">
            <Title level={2}>Registros de Ponto</Title>
          </div>
        </Header>
        <Content>
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="Registros de Ponto" key="1">
              {role === "admin" && (
                <FilterBar
                  role={role}
                  searchUser={searchUser}
                  setSearchUser={setSearchUser}
                  setDateRange={setDateRange}
                />
              )}
              {["leitor", "admin"].includes(role) && (
                <Row>
                  <Col>
                    <Tooltip title="Inserir registro manual">
                      <button
                        className="add-manual-button"
                        onClick={() => setManualModalOpen(true)}
                      >
                        <PlusOutlined />
                      </button>
                    </Tooltip>
                  </Col>
                </Row>

              )}

              <RecordsTable loading={loading} filteredData={filteredData} />
            </Tabs.TabPane>

            <Tabs.TabPane tab="Estatísticas" key="2">
              <DashboardStats resumo={resumo} loading={resumoLoading} />
            </Tabs.TabPane>

            {role === "admin" && (
              <Tabs.TabPane tab="Resumo Geral" key="3">
                <DashboardGeneral />
              </Tabs.TabPane>
            )}

          </Tabs>
        </Content>
      </Layout>
      <AddManualRecordModal open={manualModalOpen} onClose={() => setManualModalOpen(false)} />
    </>
  );
};

export default Dashboard;
