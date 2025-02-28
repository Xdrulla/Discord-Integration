import PropTypes from "prop-types";
import { useState } from "react";
import { Card, Row, Col, Statistic, Button, Empty } from "antd";
import { FileExcelOutlined, FilePdfOutlined } from "@ant-design/icons";
import { exportCSV, exportPDF } from "../helper/exportUtils";
import FilterBar from "./FilterBar";

const DashboardStats = ({ data }) => {
  const [searchUser, setSearchUser] = useState("");

  const handleFilter = () => {
    setSearchUser(searchUser.trim());
  };

  const filteredData = searchUser
    ? data.filter((record) => record.usuario.toLowerCase().includes(searchUser.toLowerCase()))
    : data;

  const totalHoras = filteredData.reduce((acc, record) => {
    const horas = record.total_horas || "0h 0m";
    const match = horas.match(/(\d+)h\s*(\d+)m/);
    if (match) {
      const horasNum = parseInt(match[1]) || 0;
      const minutosNum = parseInt(match[2]) || 0;
      return acc + horasNum + minutosNum / 60;
    }
    return acc;
  }, 0);

  const mediaDiaria = totalHoras > 0 ? (totalHoras / filteredData.length).toFixed(1) : "0h 0m";

  const totalIntervalos = filteredData.reduce((acc, record) => acc + (record.pausas?.length || 0), 0);

  return (
    <div className="stats-container">
      <FilterBar searchUser={searchUser} setSearchUser={setSearchUser} handleFilter={handleFilter} />

      {filteredData.length > 0 ? (
        <>
          <Row gutter={16}>
            <Col span={8}>
              <Card>
                <Statistic title="Horas Trabalhadas no Mês" value={`${totalHoras.toFixed(1)}h`} />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic title="Média Diária" value={`${mediaDiaria}h`} />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic title="Intervalos por Dia" value={totalIntervalos} />
              </Card>
            </Col>
          </Row>

          <div className="export-buttons">
            <Button icon={<FileExcelOutlined />} onClick={() => exportCSV(filteredData)}>
              Exportar CSV
            </Button>
            <Button icon={<FilePdfOutlined />} onClick={() => exportPDF(filteredData)}>
              Exportar PDF
            </Button>
          </div>
        </>
      ) : (
        <Empty description="Nenhum registro encontrado para este usuário" />
      )}
    </div>
  );
};

DashboardStats.propTypes = {
  data: PropTypes.array.isRequired
};

export default DashboardStats;
