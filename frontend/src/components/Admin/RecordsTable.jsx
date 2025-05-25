import PropTypes from "prop-types"
import { useEffect, useState } from "react"
import { Table, Spin, Dropdown, Menu, Button } from "antd"
import { SettingOutlined } from "@ant-design/icons"
import { useAuth } from "../../context/useAuth"
import dayjs from "dayjs"
import { uploadJustificativaFile, upsertJustificativa } from "../../services/justificativaService"
import { showLoadingAlert, closeAlert, showError, showSuccess } from "../common/alert"
import { getColumns } from "./justification/columns"
import JustificationModal from "./justification/JustificationModal"
import { confirmDeleteHelper, handleApprovalHelper } from "./justification/justificationHelpers"

const RecordsTable = ({ loading, filteredData }) => {
  const { role, discordId } = useAuth()
  const [visibleColumns, setVisibleColumns] = useState([
    "usuario",
    "data",
    "entrada",
    "saida",
    "total_pausas",
    "total_horas",
    "justificativa"
  ])
  const [justifications, setJustifications] = useState({})
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [justificationText, setJustificationText] = useState("")
  const [justificationFile, setJustificationFile] = useState(null)
  const [manualBreak, setManualBreak] = useState("")
  const [abonoHoras, setAbonoHoras] = useState("")
  const [status, setStatus] = useState("pendente")
  const [viewerVisible, setViewerVisible] = useState(false)
  const [viewerFile, setViewerFile] = useState({ url: "", name: "" })
  const [adminNote, setAdminNote] = useState("")
  const [newEntry, setNewEntry] = useState(null)
  const [newExit, setNewExit] = useState(null)
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [saving, setSaving] = useState(false)
  const [expandedRows, setExpandedRows] = useState([]);
  const isMobile = window.innerWidth <= 576;

  const isOwnJustification = currentRecord?.discordId && currentRecord.discordId === discordId

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
          manualBreak: record.justificativa.manualBreak || "",
          observacaoAdmin: record.justificativa.observacaoAdmin || "",
        }
      }
    })
    setJustifications(mapped)
  }, [filteredData])

  const showJustificationModal = (record) => {
    setCurrentRecord(record)
    const justification = justifications[record.id] || {
      text: "",
      status: "pendente",
      newEntry: null,
      newExit: null,
      abonoHoras: "",
      manualBreak: "",
      observacaoAdmin: ""
    }
    setJustificationText(justification.text)
    setStatus(justification.status)
    setNewEntry(justification.newEntry ? dayjs(justification.newEntry) : null)
    setNewExit(justification.newExit ? dayjs(justification.newExit) : null)
    setAbonoHoras(justification.abonoHoras)
    setManualBreak(justification.manualBreak)
    setAdminNote(justification.observacaoAdmin)

    const isOwnRecord = record.discordId && record.discordId === discordId
    const isAprovado = justification.status === "aprovado"
    const isAdminViewingOthers = role === "admin" && !isOwnRecord

    setIsReadOnly(isAprovado || isAdminViewingOthers)
    setIsModalVisible(true)
  }

  const handleJustificationSubmit = async () => {
    setSaving(true)
    showLoadingAlert("Salvando justificativa...")

    let fileUrl = null
    let fileName = null

    if (justificationFile) {
      try {
        const uploadRes = await uploadJustificativaFile(justificationFile)
        if (uploadRes.success) {
          fileUrl = uploadRes.url
          fileName = uploadRes.filename
        } else {
          showError("Erro ao enviar o arquivo.")
          setSaving(false)
          closeAlert()
          return
        }
      } catch (error) {
        console.error("Erro no upload do arquivo:", error)
        showError("Erro ao enviar o arquivo.")
        setSaving(false)
        closeAlert()
        return
      }
    }

    const justificativaPayload = {
      usuario: currentRecord.usuario,
      data: currentRecord.data,
      text: justificationText,
      newEntry: newEntry ? newEntry.format("YYYY-MM-DD HH:mm") : null,
      newExit: newExit ? newExit.format("YYYY-MM-DD HH:mm") : null,
      abonoHoras: abonoHoras || null,
      status: role === "admin" ? status : "pendente",
      file: fileUrl,
      fileName,
      manualBreak: manualBreak || null,
      observacaoAdmin: role === "admin" ? adminNote : null,
    }

    try {
      const result = await upsertJustificativa(justificativaPayload)
      if (result.success) {
        setJustifications((prev) => ({
          ...prev,
          [currentRecord.id]: {
            text: justificationText,
            status: justificativaPayload.status,
            newEntry: justificativaPayload.newEntry,
            newExit: justificativaPayload.newExit,
          },
        }))
        showSuccess("Justificativa salva com sucesso!")
        setIsModalVisible(false)
      } else {
        showError(result.error || "Erro ao salvar justificativa.")
      }
    } catch (error) {
      console.error("Erro na chamada de justificativa:", error)
      showError("Erro ao salvar justificativa.")
    } finally {
      setSaving(false)
      closeAlert()
    }
  }

  const toggleExpanded = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const columns = getColumns({
    visibleColumns,
    justifications,
    showJustificationModal,
    handleApproval: (recordId, newStatus) =>
      handleApprovalHelper({
        recordId,
        justifications,
        abonoHoras,
        adminNote,
        role,
        setJustifications,
        setSaving,
        setIsModalVisible,
        newStatus,
      }),
    role,
    discordId,
    isMobile,
    expandedRows,
    toggleExpanded,
  })

  return (
    <div className="table-container">
      <div className="table-header">
        <Dropdown
          overlay={
            <Menu>
              {columnOptions.map(({ key, label }) => (
                <Menu.Item key={key} onClick={() => toggleColumn(key)}>
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(key)}
                    readOnly
                    className="checkbox"
                  />
                  {label}
                </Menu.Item>
              ))}
            </Menu>
          }
          trigger={["click"]}
          className="column-dropdown"
        >
          <Button icon={<SettingOutlined />} className="column-btn">
            Configurar Colunas
          </Button>
        </Dropdown>
      </div>

      {loading ? (
        <Spin size="large" className="loading-spinner" />
      ) : isMobile ? (
        <div className="records-mobile-list">
          {filteredData.map((record) => (
            <div key={record.id} className="record-card">
              <div className="record-header">
                <strong>{record.usuario}</strong>
                <button onClick={() => toggleExpanded(record.id)}>
                  {expandedRows.includes(record.id) ? "Fechar" : "Ver Detalhes"}
                </button>
              </div>

              {expandedRows.includes(record.id) && (
                <div className="record-details">
                  <p><strong>Data:</strong> {record.data}</p>
                  <p><strong>Entrada:</strong> {record.entrada}</p>
                  <p><strong>Saída:</strong> {record.saida}</p>
                  <p><strong>Intervalo:</strong> {record.total_pausas}</p>
                  <p><strong>Horas Trabalhadas:</strong> {record.total_horas}</p>
                  <p><strong>Justificativa:</strong> {justifications[record.id]?.text || "-"}</p>
                </div>
              )}
            </div>
          ))}
        </div>
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
          scroll={{ y: 400 }}
          onChange={(paginationConfig) => setPagination(paginationConfig)}
        />
      )}

      <JustificationModal
        role={role}
        isModalVisible={isModalVisible}
        isReadOnly={isReadOnly}
        saving={saving}
        currentRecord={currentRecord}
        justificationText={justificationText}
        justificationFile={justificationFile}
        newEntry={newEntry}
        newExit={newExit}
        manualBreak={manualBreak}
        abonoHoras={abonoHoras}
        status={status}
        adminNote={adminNote}
        viewerFile={viewerFile}
        viewerVisible={viewerVisible}
        setJustificationText={setJustificationText}
        setJustificationFile={setJustificationFile}
        setNewEntry={setNewEntry}
        setNewExit={setNewExit}
        setManualBreak={setManualBreak}
        setAbonoHoras={setAbonoHoras}
        setStatus={setStatus}
        setAdminNote={setAdminNote}
        setViewerFile={setViewerFile}
        setViewerVisible={setViewerVisible}
        onSubmit={handleJustificationSubmit}
        onCancel={() => setIsModalVisible(false)}
        onDelete={() => confirmDeleteHelper({ currentRecord, setJustifications, setIsModalVisible })}
        isOwnJustification={isOwnJustification}
        handleApproval={(recordId, status) =>
          handleApprovalHelper({
            recordId,
            justifications,
            abonoHoras,
            adminNote,
            role,
            setJustifications,
            setSaving,
            setIsModalVisible,
            newStatus: status,
          })
        }
      />
    </div>
  )
}

RecordsTable.propTypes = {
  loading: PropTypes.bool.isRequired,
  filteredData: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default RecordsTable
