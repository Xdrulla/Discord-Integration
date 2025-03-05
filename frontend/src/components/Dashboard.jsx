import { useCallback, useEffect, useState } from "react";
import { Layout, Typography, Tabs } from "antd";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import FilterBar from "./FilterBar";
import RecordsTable from "./RecordsTable";
import DashboardStats from "./DashboardStats";
import { useAuth } from "../context/useAuth";

const { Header, Content } = Layout;
const { Title } = Typography;

const Dashboard = () => {
  const { user, role } = useAuth()
  const userName = user.email.split("@")[0]

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchUser, setSearchUser] = useState("");

  function ajustarFusoHorario(horario) {
    if (!horario || horario === "-") return "-";

    try {
      const dataUtc = new Date(`1970-01-01T${horario}:00Z`);
      const dataLocal = new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "America/Sao_Paulo",
      }).format(dataUtc);
      return dataLocal;
    } catch (error) {
      console.error("Erro ao converter fuso horário:", error);
      return horario;
    }
  }

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
      let registros = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          usuario: data.usuario,
          data: data.data,
          entrada: ajustarFusoHorario(data.entrada) || "-",
          saida: ajustarFusoHorario(data.saida) || "-",
          total_horas: formatarTempo(extrairMinutosDeString(data.total_horas)),
          total_pausas: calcularTotalPausas(data.pausas || []),
        };
      });

      if (role === "leitor") {
        registros = registros.filter((record) => record.usuario.includes(userName));
      }

      setData(registros);
      setFilteredData(registros);
      setLoading(false);
    };
    fetchData();
  }, [calcularTotalPausas, role, userName]);
  

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
        </div>
      </Header>
      <Content>
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Registros de Ponto" key="1">
            {role === "admin" && (
              <FilterBar searchUser={searchUser} setSearchUser={setSearchUser} handleFilter={handleFilter} />
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
