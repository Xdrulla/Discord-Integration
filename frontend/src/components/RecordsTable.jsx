import PropTypes from "prop-types"
import { useEffect, useState } from "react"
import {
  Table, Spin, Tag, Button, Dropdown, Menu, Tooltip,
  Modal, Input, Select, Space, DatePicker, message,
  Upload
} from "antd"
import {
  SettingOutlined, EditOutlined, CheckCircleOutlined, CloseCircleOutlined,
  UploadOutlined
} from "@ant-design/icons"
import { useAuth } from "../context/useAuth"
import dayjs from "dayjs"
import { deleteJustificativa, upsertJustificativa } from "../services/justificativaService"
import { extrairMinutosDeString } from "../utils/timeUtils"
import DocumentViewer from "./DocumentViewer"
import { confirmDeleteJustificativa } from "../common/alert"

const { Option } = Select

const RecordsTable = ({ loading, filteredData }) => {
  const { role, user, discordId } = useAuth()
  const [visibleColumns, setVisibleColumns] = useState([
    "usuario", "data", "entrada", "saida", "total_pausas", "total_horas", "justificativa"
  ])
  const [justifications, setJustifications] = useState({})
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [justificationText, setJustificationText] = useState("")
  const [justificationFile, setJustificationFile] = useState(null)
  const [abonoHoras, setAbonoHoras] = useState("")
  const [status, setStatus] = useState("pendente")
  const [viewerVisible, setViewerVisible] = useState(false)
  const [viewerFile, setViewerFile] = useState({ url: "", name: "" })
  const [newEntry, setNewEntry] = useState(null)
  const [newExit, setNewExit] = useState(null)
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })

  const isOwnJustification = currentRecord?.discordId && currentRecord.discordId === discordId;

  const toggleColumn = (columnKey) => {
    setVisibleColumns((prev) =>
      prev.includes(columnKey) ? prev.filter((key) => key !== columnKey) : [...prev, columnKey]
    )
  }

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
          abonoHoras: record.justificativa.abonoHoras || "",
        }
      }
    })
    setJustifications(mapped)
  }, [filteredData])

  const userName = user.email.split("@")[0];

  const showJustificationModal = (record) => {

    setCurrentRecord(record);
    const justification = justifications[record.id] || { text: "", status: "pendente", newEntry: null, newExit: null };
    setJustificationText(justification.text);
    setStatus(justification.status);
    setNewEntry(justification.newEntry ? dayjs(justification.newEntry) : null);
    setNewExit(justification.newExit ? dayjs(justification.newExit) : null);
    setAbonoHoras(justification.abonoHoras || "")

    const isOwnRecord = record.usuario.replace(/\s/g, "").toLowerCase().includes(userName.toLowerCase())
    const isAprovado = justification.status === "aprovado";
    const isAdminViewingOthers = role === "admin" && !isOwnRecord;

    setIsReadOnly(isAprovado || isAdminViewingOthers);
    setIsModalVisible(true);
  };

  const handleJustificationSubmit = async () => {
    let base64File = null
    let fileName = justificationFile?.name || null

    if (justificationFile) {
      base64File = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(justificationFile)
      })
    }

    const justificativaPayload = {
      usuario: currentRecord.usuario,
      data: currentRecord.data,
      text: justificationText,
      newEntry: newEntry ? newEntry.format("YYYY-MM-DD HH:mm") : null,
      newExit: newExit ? newExit.format("YYYY-MM-DD HH:mm") : null,
      abonoHoras: abonoHoras || null,
      status: role === "admin" ? status : "pendente",
      file: base64File,
      fileName,
    }

    try {
      const result = await upsertJustificativa(justificativaPayload)
      if (result.success) {
        message.success("Justificativa atualizada com sucesso!")

        setJustifications((prev) => ({
          ...prev,
          [currentRecord.id]: {
            text: justificationText,
            status: justificativaPayload.status,
            newEntry: justificativaPayload.newEntry,
            newExit: justificativaPayload.newExit,
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
      newEntry: justification.newEntry,
      newExit: justification.newExit,
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

  const confirmDelete = async () => {
    const result = await confirmDeleteJustificativa();

    if (result.isConfirmed) {
      try {
        const res = await deleteJustificativa({
          usuario: currentRecord.usuario,
          data: currentRecord.data,
        });

        if (res.success) {
          message.success("Justificativa excluída com sucesso!");
          setJustifications((prev) => {
            const newMap = { ...prev };
            delete newMap[currentRecord.id];
            return newMap;
          });
          setIsModalVisible(false);
        } else {
          message.error(res.error || "Erro ao excluir justificativa.");
        }
      } catch (error) {
        console.error("Erro ao excluir justificativa:", error);
        message.error("Erro ao excluir justificativa.");
      }
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
    {
      title: "Status",
      key: "status",
      responsive: ["lg"],
      render: (_, record) => {
        const status = justifications[record.id]?.status || record.justificativa?.status
        if (!status) return "-"
        return (
          <Tag color={status === "aprovado" ? "green" : status === "reprovado" ? "red" : "orange"}>
            {status.toUpperCase()}
          </Tag>
        )
      },
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
              {(() => {
                const isOwnRecord = record.usuario.replace(/\s/g, "").toLowerCase().includes(user.email.split("@")[0].toLowerCase());
                if (role === "admin" && !isOwnRecord) return "Visualizar";
                return justifications[record.id] ? "Editar" : "Adicionar";
              })()}
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
      ),
    },
  ].filter(column => visibleColumns.includes(column.key))

  return (
    <div className="table-container">
      <div className="table-header">
        <Dropdown overlay={<Menu>{columnOptions.map(({ key, label }) => (
          <Menu.Item key={key} onClick={() => toggleColumn(key)}>
            <input type="checkbox" checked={visibleColumns.includes(key)} readOnly className="checkbox" /> {label}
          </Menu.Item>
        ))}</Menu>} trigger={["click"]} className="column-dropdown">
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
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total) => `Total de ${total} registros`,
          }}
          onChange={(paginationConfig) => setPagination(paginationConfig)}
        />
      )}

      <Modal
        title={role === "admin" ? "Visualizar Justificativa" : "Justificar Horário"}
        open={isModalVisible}
        onOk={handleJustificationSubmit}
        onCancel={() => setIsModalVisible(false)}
        okText="Salvar"
        cancelText="Cancelar"
        footer={isReadOnly ? null : undefined}
      >
        <div className="justificativa-modal">
          <p>
            {role === "admin" ? "Visualização de justificativa para o usuário" : "Justifique por que houve um horário diferente ou um intervalo adicional para o usuário"} <b>{currentRecord?.usuario}</b> no dia <b>{currentRecord?.data}</b>.
          </p>
          <Input.TextArea
            rows={4}
            value={justificationText}
            onChange={(e) => setJustificationText(e.target.value)}
            placeholder="Descreva a justificativa..."
            disabled={isReadOnly}
          />
          {!isReadOnly && (
            <Upload
              beforeUpload={(file) => {
                const isAllowedType = file.type === "application/pdf" || file.type.startsWith("image/");
                const isLt5M = file.size / 1024 / 1024 < 5;

                if (!isAllowedType) {
                  message.error("Apenas imagens ou PDF são permitidos!");
                  return Upload.LIST_IGNORE;
                }

                if (!isLt5M) {
                  message.error("O arquivo deve ter menos de 5MB!");
                  return Upload.LIST_IGNORE;
                }

                setJustificationFile(file);
                return false;
              }}
              onRemove={() => setJustificationFile(null)}
              fileList={justificationFile ? [justificationFile] : []}
            >
              <Button icon={<UploadOutlined />} className="upload-button">
                Anexar Arquivo (Atestado, etc)
              </Button>
            </Upload>
          )}

          {role === "admin" && currentRecord?.justificativa?.file && (
            <div style={{ marginTop: 16 }}>
              <p>Arquivo enviado:</p>

              <Button
                type="link"
                onClick={() => {
                  setViewerFile({
                    url: currentRecord.justificativa.file,
                    name: currentRecord.justificativa.fileName
                  })
                  setViewerVisible(true)
                }}
                style={{ marginTop: 10 }}
              >
                📎 Ver em nova aba ({currentRecord.justificativa.fileName})
              </Button>

            </div>
          )}

          <DatePicker
            showTime
            value={newEntry}
            onChange={setNewEntry}
            placeholder="Entrada manual"
            className="input-margin"
            disabled={isReadOnly}
          />

          <DatePicker
            showTime
            value={newExit}
            onChange={setNewExit}
            placeholder="Saída manual"
            className="input-margin"
            disabled={isReadOnly}
          />

          {role === "admin" && (
            <Select
              value={status}
              onChange={(value) => {
                setStatus(value)
                handleApproval(currentRecord.id, value)
              }}
              className="input-margin"
            >
              <Option value="pendente">Pendente</Option>
              <Option value="aprovado">Aprovado</Option>
              <Option value="reprovado">Reprovado</Option>
            </Select>
          )}
          {!isReadOnly &&
            isOwnJustification &&
            currentRecord?.justificativa && (
              <Button
                danger
                style={{ marginTop: 12 }}
                onClick={confirmDelete}
              >
                Excluir Justificativa
              </Button>
            )
          }
        </div>
      </Modal>
      <DocumentViewer
        fileUrl={viewerFile.url}
        fileName={viewerFile.name}
        open={viewerVisible}
        onClose={() => setViewerVisible(false)}
      />

    </div>
  )
}

RecordsTable.propTypes = {
  loading: PropTypes.bool.isRequired,
  filteredData: PropTypes.arrayOf(PropTypes.object).isRequired
}

export default RecordsTable
