import { useEffect, useState, useCallback } from "react";
import { Layout, Typography, Tabs } from "antd";
import FilterBar from "./FilterBar";
import RecordsTable from "./RecordsTable";
import DashboardStats from "./DashboardStats";
import { useAuth } from "../context/useAuth";
import { fetchRegistros } from "../services/registroService";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import debounce from "lodash.debounce";
import { io } from "socket.io-client";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Header, Content } = Layout;
const { Title } = Typography;
const socket = io(import.meta.env.VITE_API_URL);

const Dashboard = () => {
  const { user, role } = useAuth();
  const userName = user.email.split("@")[0];

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);

  useEffect(() => {
    const carregarRegistros = async () => {
      try {
        let registros = await fetchRegistros();

        if (role === "leitor") {
          registros = registros.filter((record) =>
            record.usuario.replace(/\s/g, "").toLowerCase().includes(userName.toLowerCase())
          )
        }

        setData(registros);
        setFilteredData(registros);
      } catch (error) {
        console.error("Erro ao carregar registros:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarRegistros();
  }, [role, userName]);

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
    socket.on("registro-atualizado", (data) => {
      console.log("📡 Registro atualizado em tempo real!", data);
      setData((prev) => {
        const atualizado = prev.filter(item => item.id !== data.usuario + "_" + data.data);
        return [...atualizado, {
          id: data.usuario + "_" + data.data,
          ...data
        }];
      });
    });

    return () => socket.off("registro-atualizado");
  }, []);

  return (
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
                searchUser={searchUser}
                setSearchUser={setSearchUser}
                setDateRange={setDateRange}
              />
            )}
            <RecordsTable loading={loading} filteredData={filteredData} />
          </Tabs.TabPane>

          <Tabs.TabPane tab="Estatísticas" key="2">
            <DashboardStats data={filteredData} />
          </Tabs.TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
};

export default Dashboard;
