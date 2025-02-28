import { useCallback, useEffect, useState } from "react";
import { Layout, Typography, Tabs, Button } from "antd";
import { collection, getDocs } from "firebase/firestore";
import { useAuth } from "../context/useAuth";
import { db } from "../firebaseConfig";
import FilterBar from "./FilterBar";
import RecordsTable from "./RecordsTable";
import DashboardStats from "./DashboardStats";

const { Header, Content } = Layout;
const { Title } = Typography;

const Dashboard = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchUser, setSearchUser] = useState("");

  function formatarTempo(minutos) {
    if (!minutos || isNaN(minutos)) return "0h 0m";
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = Math.round(minutos % 60);
    return `${horas}h ${minutosRestantes}m`;
  }

  function extrairMinutosDeString(tempoString) {
    if (!tempoString) return 0;

    if (typeof tempoString === "object" && tempoString.totalHoras) {
      tempoString = tempoString.totalHoras;
    }

    if (typeof tempoString !== "string") return 0;

    const partes = tempoString.match(/(\d+)h\s*(\d+(\.\d+)?)m/);
    if (partes) {
      const horas = parseInt(partes[1]) || 0;
      const minutos = parseFloat(partes[2]) || 0;
      return horas * 60 + minutos;
    }
    return 0;
  }

  const calcularTotalPausas = useCallback((pausas) => {
    if (!pausas || pausas.length === 0) return "0h 0m";

    let totalMinutos = 0;
    pausas.forEach((p) => {
      if (!p.duracao) return;

      const partes = p.duracao.match(/(\d+)h(\d+(\.\d+)?)m/);
      if (partes) {
        const horas = parseInt(partes[1]) || 0;
        const minutos = parseFloat(partes[2]) || 0;
        totalMinutos += horas * 60 + minutos;
      }
    });

    return formatarTempo(totalMinutos);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "registros"));
      const registros = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          usuario: data.usuario,
          data: data.data,
          entrada: data.entrada || "-",
          saida: data.saida || "-",
          total_horas: formatarTempo(extrairMinutosDeString(data.total_horas)),
          total_pausas: calcularTotalPausas(data.pausas || []),
        };
      });

      setData(registros);
      setFilteredData(registros);
      setLoading(false);
    };
    fetchData();
  }, [calcularTotalPausas]);

  const handleFilter = () => {
    let filtered = [...data];
    if (searchUser) {
      filtered = filtered.filter((record) =>
        record.usuario.toLowerCase().includes(searchUser.toLowerCase())
      );
    }
    setFilteredData(filtered);
  };

  return (
    <Layout className="dashboard-container">
      <Header className="dashboard-header">
        <div className="header-content">
          <Title level={2}>Registros de Ponto</Title>
          <Button onClick={logout} type="primary">Sair</Button>
        </div>
      </Header>
      <Content>
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Registros de Ponto" key="1">
            <FilterBar searchUser={searchUser} setSearchUser={setSearchUser} handleFilter={handleFilter} />
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
