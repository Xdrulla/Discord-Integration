import PropTypes from "prop-types";
import { useState } from "react";
import { Card, Row, Col, Statistic, Button, Empty } from "antd";
import { FileExcelOutlined, FilePdfOutlined } from "@ant-design/icons";
import { exportCSV, exportPDF } from "../helper/exportUtils";
import FilterBar from "./FilterBar";
import { useAuth } from "../context/useAuth";

const DashboardStats = ({ data }) => {
  const { role, user } = useAuth();
  const [searchUser, setSearchUser] = useState("");

  const handleFilter = () => {
    setSearchUser(searchUser.trim());
  };

  const filteredData = role === "leitor"
    ? data.filter((record) => record.usuario === user.email)
    : searchUser
      ? data.filter((record) => record.usuario.toLowerCase().includes(searchUser.toLowerCase()))
      : data;

  const totalBancoHoras = filteredData.reduce((acc, record) => {
    const bancoHoras = record.banco_horas || "0h 0m";
    const match = bancoHoras.match(/(-?\d+)h\s*(-?\d+)m/);

    if (match) {
      const horasNum = parseInt(match[1]) || 0;
      const minutosNum = parseInt(match[2]) || 0;
      return acc + (horasNum + minutosNum / 60);
    }
    return acc;
  }, 0);

  const totalHorasTrabalhadas = filteredData.reduce((acc, record) => {
    const horas = record.total_horas || "0h 0m";
    const match = horas.match(/(\d+)h\s*(\d+)m/);
    if (match) {
      const horasNum = parseInt(match[1]) || 0;
      const minutosNum = parseInt(match[2]) || 0;
      return acc + horasNum + minutosNum / 60;
    }
    return acc;
  }, 0);

  const diasComHorasExtras = filteredData.filter(record => {
    const bancoHoras = record.banco_horas || "0h 0m";
    const match = bancoHoras.match(/(-?\d+)h\s*(-?\d+)m/);
    if (match) {
      const horasNum = parseInt(match[1]) || 0;
      const minutosNum = parseInt(match[2]) || 0;
      return horasNum > 0 || minutosNum > 0;
    }
    return false;
  }).length;

  const mediaHorasExtrasDiaria = diasComHorasExtras > 0
    ? (totalBancoHoras / diasComHorasExtras).toFixed(1)
    : "0h 0m";

  return (
    <div className="stats-container">
      {role === "admin" && (
        <FilterBar searchUser={searchUser} setSearchUser={setSearchUser} handleFilter={handleFilter} />
      )}

      {filteredData.length > 0 ? (
        <>
          <Row gutter={16}>
            <Col span={8}>
              <Card>
                <Statistic title="Banco de Horas Total" value={`${totalBancoHoras.toFixed(1)}h`} />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic title="Média de Horas Extras Diárias" value={`${mediaHorasExtrasDiaria}h`} />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic title="Total de Horas Trabalhadas no Mês" value={`${totalHorasTrabalhadas.toFixed(1)}h`} />
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
