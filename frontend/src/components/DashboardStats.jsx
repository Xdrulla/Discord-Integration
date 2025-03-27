import PropTypes from "prop-types";
import { useState } from "react";
import { Card, Row, Col, Statistic, Button, Empty } from "antd";
import { FileExcelOutlined, FilePdfOutlined } from "@ant-design/icons";
import { exportCSV, exportPDF } from "../helper/exportUtils";
import FilterBar from "./FilterBar";
import { useAuth } from "../context/useAuth";
import { converterParaMinutos, formatarMinutosParaHoras } from "../utils/timeUtils";

const DashboardStats = ({ data }) => {
  const { role, discordId } = useAuth();
  const [searchUser, setSearchUser] = useState("");

  const handleFilter = () => {
    setSearchUser(searchUser.trim());
  };

  const filteredData = role === "leitor"
    ? data.filter((record) => record.discordId === discordId)
    : searchUser
      ? data.filter((record) => record.usuario.toLowerCase().includes(searchUser.toLowerCase()))
      : data;

  const registrosConcluidos = filteredData.filter((record) => record.saida && record.saida !== "-");

  const totalMinutosBanco = registrosConcluidos.reduce((acc, record) => {
    return acc + converterParaMinutos(record.banco_horas || "0h 0m");
  }, 0);

  const totalMinutosTrabalhados = registrosConcluidos.reduce((acc, record) => {
    return acc + converterParaMinutos(record.total_horas || "0h 0m");
  }, 0);

  const diasComHorasExtras = registrosConcluidos.filter(record => {
    return converterParaMinutos(record.banco_horas || "0h 0m") > 0;
  }).length;

  const mediaMinutosExtras = diasComHorasExtras > 0
    ? Math.round(totalMinutosBanco / diasComHorasExtras)
    : 0;

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
                <Statistic title="Banco de Horas Total" value={formatarMinutosParaHoras(totalMinutosBanco)} />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic title="Média de Horas Extras Diárias" value={formatarMinutosParaHoras(mediaMinutosExtras)} />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic title="Total de Horas Trabalhadas no Mês" value={formatarMinutosParaHoras(totalMinutosTrabalhados)} />
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
