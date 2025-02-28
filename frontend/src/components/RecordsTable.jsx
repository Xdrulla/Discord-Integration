import PropTypes from "prop-types";
import { useState } from "react";
import { Table, Spin, Tag, Button, Dropdown, Menu, Tooltip } from "antd";
import { SettingOutlined } from "@ant-design/icons";

const RecordsTable = ({ loading, filteredData }) => {
  const [visibleColumns, setVisibleColumns] = useState([
    "usuario", "data", "entrada", "saida", "total_pausas", "total_horas"
  ]);

  const toggleColumn = (columnKey) => {
    setVisibleColumns((prev) =>
      prev.includes(columnKey) ? prev.filter((key) => key !== columnKey) : [...prev, columnKey]
    );
  };

  const columnOptions = [
    { key: "usuario", label: "Usuário" },
    { key: "data", label: "Data" },
    { key: "entrada", label: "Entrada" },
    { key: "saida", label: "Saída" },
    { key: "total_pausas", label: "Tempo de Intervalo" },
    { key: "total_horas", label: "Horas Trabalhadas" }
  ];

  const menu = (
    <Menu className="column-menu">
      {columnOptions.map(({ key, label }) => (
        <Menu.Item key={key} onClick={() => toggleColumn(key)}>
          <input type="checkbox" checked={visibleColumns.includes(key)} readOnly className="checkbox" /> {label}
        </Menu.Item>
      ))}
    </Menu>
  );

  const columns = [
    {
      title: "Usuário",
      dataIndex: "usuario",
      key: "usuario",
      render: (text) => <strong className="user-text">{text}</strong>,
    },
    {
      title: "Data",
      dataIndex: "data",
      key: "data",
    },
    {
      title: "Entrada",
      dataIndex: "entrada",
      key: "entrada",
      render: (text) => <Tag color="success">{text}</Tag>
    },
    {
      title: "Saída",
      dataIndex: "saida",
      key: "saida",
      render: (text) => text !== "-" ? <Tag color="error">{text}</Tag> : "-"
    },
    {
      title: "Tempo de Intervalo",
      dataIndex: "total_pausas",
      key: "total_pausas",
      render: (text) => (
        <Tooltip title={`Total de pausas: ${text}`}>
          <Tag color="blue">{text}</Tag>
        </Tooltip>
      )
    },
    {
      title: "Horas Trabalhadas",
      dataIndex: "total_horas",
      key: "total_horas",
      render: (text) => <Tag color="purple">{text}</Tag>
    }
  ].filter(column => visibleColumns.includes(column.key));

  return (
    <div className="table-container">
      <div className="table-header">
        <Dropdown overlay={menu} trigger={["click"]} className="column-dropdown">
          <Button icon={<SettingOutlined />} className="column-btn">Configurar Colunas</Button>
        </Dropdown>
      </div>
      {loading ? <Spin size="large" className="loading-spinner" /> : <Table columns={columns} dataSource={filteredData} rowKey="id" />}
    </div>
  );
};

RecordsTable.propTypes = {
  loading: PropTypes.bool.isRequired,
  filteredData: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default RecordsTable;
