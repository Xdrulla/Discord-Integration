import PropTypes from "prop-types"
import { useEffect, useState } from "react"
import { Table, Spin, Tag, Button, Dropdown, Menu, Tooltip, Modal, Input, Select, Space, DatePicker, message } from "antd"
import { SettingOutlined, EditOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons"
import { useAuth } from "../context/useAuth"
import dayjs from "dayjs"
import { upsertJustificativa } from "../services/justificativaService"
import { extrairMinutosDeString } from "../utils/timeUtils"

const { Option } = Select

const RecordsTable = ({ loading, filteredData }) => {
  const { role, user } = useAuth()
  const [visibleColumns, setVisibleColumns] = useState([
    "usuario", "data", "entrada", "saida", "total_pausas", "total_horas", "justificativa"
  ])
  const [justifications, setJustifications] = useState({})
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [justificationText, setJustificationText] = useState("")
  const [status, setStatus] = useState("pendente")
  const [newEntry, setNewEntry] = useState(null)
  const [newExit, setNewExit] = useState(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })

  const toggleColumn = (columnKey) => {
    setVisibleColumns((prev) =>
      prev.includes(columnKey) ? prev.filter((key) => key !== columnKey) : [...prev, columnKey]
    )
  }

  const ROOTUSER = 'luan@goepik.com.br'

  const columnOptions = [
    { key: "usuario", label: "Usuário" },
    { key: "data", label: "Data" },
    { key: "entrada", label: "Entrada" },
    { key: "saida", label: "Saída" },
    { key: "total_pausas", label: "Tempo de Intervalo" },
    { key: "total_horas", label: "Horas Trabalhadas" },
    { key: "status", label: "Status" },
    { key: "justificativa", label: "Justificativa" }
  ]

  const menu = (
    <Menu className="column-menu">
      {columnOptions.map(({ key, label }) => (
        <Menu.Item key={key} onClick={() => toggleColumn(key)}>
          <input type="checkbox" checked={visibleColumns.includes(key)} readOnly className="checkbox" /> {label}
        </Menu.Item>
      ))}
    </Menu>
  )

  useEffect(() => {
    const hasAnyJustification = filteredData.some(reg => reg.justificativa)
    if (hasAnyJustification && !visibleColumns.includes("status")) {
      setVisibleColumns((prev) => [...prev, "status"])
    }
  }, [filteredData, visibleColumns])

  useEffect(() => {
    const mapped = {}
    filteredData.forEach((record) => {
      if (record.justificativa) {
        mapped[record.id] = {
          text: record.justificativa.text || "",
          status: record.justificativa.status || "pendente",
          newEntry: record.justificativa.newEntry || null,
          newExit: record.justificativa.newExit || null,
        }
      }
    })
    setJustifications(mapped)
  }, [filteredData])

  const showJustificationModal = (record) => {
    setCurrentRecord(record)
    const justification = justifications[record.id] || { text: "", status: "pendente", newEntry: null, newExit: null }
    setJustificationText(justification.text)
    setStatus(justification.status)
    setNewEntry(justification.newEntry ? dayjs(justification.newEntry) : null)
    setNewExit(justification.newExit ? dayjs(justification.newExit) : null)
    setIsModalVisible(true)
  }

  const handleJustificationSubmit = async () => {
    const justificativaPayload = {
      usuario: currentRecord.usuario,
      data: currentRecord.data,
      text: justificationText,
      newEntry: newEntry ? newEntry.format("YYYY-MM-DD HH:mm") : null,
      newExit: newExit ? newExit.format("YYYY-MM-DD HH:mm") : null,
      status: role === "admin" ? status : "pendente",
    }

    try {
      const result = await upsertJustificativa(justificativaPayload)
      if (result.success) {
        message.success("Justificativa atualizada com sucesso!")

        setJustifications((prev) => ({
          ...prev,
          [currentRecord.id]: {
            text: justificationText,
            status: role === "admin" ? status : "pendente",
            newEntry: newEntry ? newEntry.format("YYYY-MM-DD HH:mm") : null,
            newExit: newExit ? newExit.format("YYYY-MM-DD HH:mm") : null,
          },
        }))

        setIsModalVisible(false)

      } else {
        message.error(result.error || "Erro ao atualizar justificativa")
      }
    } catch (error) {
      console.error("Erro na chamada de justificativa:", error)
      message.error("Erro ao atualizar justificativa")
    }
  }

  const handleApproval = async (recordId, newStatus) => {
    const justification = justifications[recordId];
    if (!justification) return;

    const [usuario, data] = recordId.split("_");

    const justificativaPayload = {
      usuario,
      data,
      text: justification.text,
      newEntry: justification.newEntry ? dayjs(justification.newEntry).format("YYYY-MM-DD HH:mm") : null,
      newExit: justification.newExit ? dayjs(justification.newExit).format("YYYY-MM-DD HH:mm") : null,
      status: newStatus,
    };

    try {
      const result = await upsertJustificativa(justificativaPayload);
      if (result.success) {
        message.success(`Justificativa ${newStatus} com sucesso!`);
        setJustifications((prev) => ({
          ...prev,
          [recordId]: { ...prev[recordId], status: newStatus },
        }));
      } else {
        message.error(result.error || "Erro ao atualizar justificativa");
      }
    } catch (error) {
      console.error("Erro ao aprovar/reprovar justificativa:", error);
      message.error("Erro ao atualizar justificativa");
    }
  }

  const columns = [
    {
      title: "Usuário",
      dataIndex: "usuario",
      key: "usuario",
      sorter: (a, b) => a.usuario.localeCompare(b.usuario),
      responsive: ['xs', 'sm', 'md', 'lg'],
      render: (text) => <strong className="user-text">{text}</strong>,
    },
    {
      title: "Data",
      dataIndex: "data",
      key: "data",
      sorter: (a, b) => dayjs(a.data).unix() - dayjs(b.data).unix(),
      responsive: ['sm', 'md', 'lg'],
      render: (text) => <span className="data-bold">{text}</span>
    },
    {
      title: "Entrada",
      dataIndex: "entrada",
      key: "entrada",
      sorter: (a, b) => a.entrada.localeCompare(b.entrada),
      responsive: ['md', 'lg'],
      render: (text) => <Tag className="tag-success">{text}</Tag>
    },
    {
      title: "Saída",
      dataIndex: "saida",
      key: "saida",
      sorter: (a, b) => a.saida.localeCompare(b.saida),
      responsive: ['md', 'lg'],
      render: (text) => text !== "-" ? <Tag className="tag-error">{text}</Tag> : "-"
    },
    {
      title: "Tempo de Intervalo",
      dataIndex: "total_pausas",
      key: "total_pausas",
      sorter: (a, b) => extrairMinutosDeString(a.total_pausas) - extrairMinutosDeString(b.total_pausas),
      responsive: ['lg'],
      render: (text) => (
        <Tooltip title={`Total de pausas: ${text}`}>
          <Tag className="tag-blue">{text}</Tag>
        </Tooltip>
      )
    },
    {
      title: "Horas Trabalhadas",
      dataIndex: "total_horas",
      key: "total_horas",
      sorter: (a, b) => extrairMinutosDeString(a.total_horas) - extrairMinutosDeString(b.total_horas),
      responsive: ['lg'],
      render: (text) => <Tag className="tag-purple">{text}</Tag>
    },
    ...(
      user?.email?.includes(ROOTUSER)
        ? [
          {
            title: "Status",
            key: "status",
            responsive: ['lg'],
            render: (_, record) => {
              const backendStatus = record.justificativa?.status
              const localStatus = justifications[record.id]?.status
              const status = localStatus || backendStatus
              if (!status) return "-"
              return (
                <Tag color={status === "aprovado" ? "green" : status === "reprovado" ? "red" : "orange"}>
                  {status.toUpperCase()}
                </Tag>
              )
            }
          },
          {
            title: "Justificativa",
            dataIndex: "justificativa",
            key: "justificativa",
            responsive: ['lg'],
            render: (_, record) => (
              <Space>
                <Tooltip title={justifications[record.id]?.text || "Nenhuma justificativa"}>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => showJustificationModal(record)}
                  >
                    {justifications[record.id] ? "Editar" : "Adicionar"}
                  </Button>
                </Tooltip>

                {role === "admin" && justifications[record.id] && justifications[record.id].status === "pendente" && (
                  <>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleApproval(record.id, "aprovado")}
                    >
                      Aprovar
                    </Button>
                    <Button
                      type="danger"
                      icon={<CloseCircleOutlined />}
                      onClick={() => handleApproval(record.id, "reprovado")}
                    >
                      Reprovar
                    </Button>
                  </>
                )}
              </Space>
            )
          }
        ]
        : []
    )
  ].filter(column => visibleColumns.includes(column.key))

  return (
    <div className="table-container">
      <div className="table-header">
        <Dropdown overlay={menu} trigger={["click"]} className="column-dropdown">
          <Button icon={<SettingOutlined />} className="column-btn">Configurar Colunas</Button>
        </Dropdown>
      </div>
      {loading ? (
        <Spin size="large" className="loading-spinner" />
      ) : (
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `Total de ${total} registros`,
          }}
          onChange={(paginationConfig) => {
            setPagination(paginationConfig)
          }}
        />
      )}

      <Modal
        title="Justificar Horário"
        open={isModalVisible}
        onOk={handleJustificationSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText="Salvar"
        cancelText="Cancelar"
      >
        <p>
          Justifique por que houve um horário diferente ou um intervalo adicional para o usuário <b>{currentRecord?.usuario}</b> no dia <b>{currentRecord?.data}</b>.
        </p>
        <Input.TextArea
          rows={4}
          value={justificationText}
          onChange={(e) => setJustificationText(e.target.value)}
          placeholder="Descreva a justificativa..."
        />

        <DatePicker
          showTime
          value={newEntry}
          onChange={setNewEntry}
          placeholder="Entrada manual"
          className="input-margin"
        />

        <DatePicker
          showTime
          value={newExit}
          onChange={setNewExit}
          placeholder="Saída manual"
          className="input-margin"
        />

        {role === "admin" && (
          <Select value={status} onChange={setStatus} className="input-margin">
            <Option value="pendente">Pendente</Option>
            <Option value="aprovado">Aprovado</Option>
            <Option value="reprovado">Reprovado</Option>
          </Select>
        )}
      </Modal>
    </div>
  )
}

RecordsTable.propTypes = {
  loading: PropTypes.bool.isRequired,
  filteredData: PropTypes.arrayOf(PropTypes.object).isRequired
}

export default RecordsTable
