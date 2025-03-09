import { useEffect, useState } from "react";
import { Layout, Typography, Tabs } from "antd";
import FilterBar from "./FilterBar";
import RecordsTable from "./RecordsTable";
import DashboardStats from "./DashboardStats";
import { useAuth } from "../context/useAuth";
import { fetchRegistros } from "../services/registroService";

const { Header, Content } = Layout;
const { Title } = Typography;

const Dashboard = () => {
  const { user, role } = useAuth();
  const userName = user.email.split("@")[0];

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchUser, setSearchUser] = useState("");

  useEffect(() => {
    const carregarRegistros = async () => {
      try {
        let registros = await fetchRegistros();

        if (role === "leitor") {
          registros = registros.filter((record) => record.usuario.includes(userName));
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

  const handleFilter = () => {
    let filtered = [...data];
    if (searchUser) {
      filtered = filtered.filter((record) =>
        record.usuario.toLowerCase().includes(searchUser.toLowerCase())
      );
    }
    setFilteredData(filtered);
  };

  console.log('data', data);


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
