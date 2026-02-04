import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Dropdown, Menu } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Table, Loading, Button } from "../designSystem";
import { useAuth } from "../../context/useAuth";
import dayjs from "dayjs";
import {
  uploadJustificativaFile,
  upsertJustificativa,
} from "../../services/justificativaService";
import {
  showLoadingAlert,
  closeAlert,
  showError,
  showSuccess,
} from "../common/alert";
import { getColumns } from "./justification/columns";
import JustificationModal from "./justification/JustificationModal";
import {
  confirmDeleteHelper,
  handleApprovalHelper,
} from "./justification/justificationHelpers";
import PauseInProgress from "../common/inProgressPause";
import usePagination from "../../context/usePagination";

const RecordsTable = ({ loading, filteredData, initialRecordId }) => {
  const { role, discordId } = useAuth();
  const [visibleColumns, setVisibleColumns] = useState([
    "usuario",
    "data",
    "entrada",
    "saida",
    "total_pausas",
    "total_horas",
    "justificativa",
  ]);
  const [justifications, setJustifications] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [justificationText, setJustificationText] = useState("");
  const [justificationFile, setJustificationFile] = useState(null);
  const [manualBreak, setManualBreak] = useState("");
  const [abonoHoras, setAbonoHoras] = useState("");
  const [status, setStatus] = useState("pendente");
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerFile, setViewerFile] = useState({ url: "", name: "" });
  const [adminNote, setAdminNote] = useState("");
  const [newEntry, setNewEntry] = useState(null);
  const [newExit, setNewExit] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const { pagination, setPagination, setShowPagination } = usePagination();
  const [saving, setSaving] = useState(false);
  const [expandedRows, setExpandedRows] = useState([]);
  const [tableHeight, setTableHeight] = useState(window.innerHeight - 300);
  const isMobile = window.innerWidth <= 576;

  const isOwnJustification =
    currentRecord?.discordId && currentRecord.discordId === discordId;

  const toggleColumn = (columnKey) => {
    setVisibleColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey],
    );
  };

  const columnOptions = [
    { key: "usuario", label: "Usuário" },
    { key: "data", label: "Data" },
    { key: "entrada", label: "Entrada" },
    { key: "saida", label: "Saída" },
    { key: "total_pausas", label: "Tempo de Intervalo" },
    { key: "total_horas", label: "Horas Trabalhadas" },
    { key: "status", label: "Status" },
    { key: "justificativa", label: "Justificativa" },
  ];

  useEffect(() => {
    if (!initialRecordId || !filteredData.length) return;
    const record = filteredData.find((r) => r.id === initialRecordId);
    if (record) {
      showJustificationModal(record);
    }
  }, [initialRecordId, filteredData]);

  useEffect(() => {
    const hasAnyJustification = filteredData.some((reg) => reg.justificativa);
    if (hasAnyJustification && !visibleColumns.includes("status")) {
      setVisibleColumns((prev) => [...prev, "status"]);
    }
  }, [filteredData, visibleColumns]);

  useEffect(() => {
    const updateHeight = () => setTableHeight(window.innerHeight - 300);
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  useEffect(() => {
    const mapped = {};
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
        };
      }
    });
    setJustifications(mapped);
  }, [filteredData]);

  useEffect(() => {
    setPagination((prev) => {
      const total = filteredData.length;
      const maxPage = Math.ceil(total / prev.pageSize) || 1;
      const current = prev.current > maxPage ? maxPage : prev.current;
      return { ...prev, total, current };
    });
    // Ativar paginação para esta tela
    setShowPagination(true);
    
    // Cleanup: desativar paginação quando o componente for desmontado
    return () => setShowPagination(false);
  }, [filteredData, setPagination, setShowPagination]);

  const showJustificationModal = (record) => {
    setCurrentRecord(record);
    const justification = justifications[record.id] || {
      text: "",
      status: "pendente",
      newEntry: null,
      newExit: null,
      abonoHoras: "",
      manualBreak: "",
      observacaoAdmin: "",
    };
    setJustificationText(justification.text);
    setStatus(justification.status);
    setNewEntry(justification.newEntry ? dayjs(justification.newEntry) : null);
    setNewExit(justification.newExit ? dayjs(justification.newExit) : null);
    setAbonoHoras(justification.abonoHoras);
    setManualBreak(justification.manualBreak);
    setAdminNote(justification.observacaoAdmin);

    const isOwnRecord = record.discordId && record.discordId === discordId;
    const isAprovado = justification.status === "aprovado";
    const isAdminViewingOthers = role === "admin" && !isOwnRecord;

    setIsReadOnly(isAprovado || isAdminViewingOthers);
    setIsModalVisible(true);
  };

  const handleJustificationSubmit = async () => {
    setSaving(true);
    showLoadingAlert("Salvando justificativa...");

    let fileUrl = null;
    let fileName = null;

    if (justificationFile) {
      try {
        const uploadRes = await uploadJustificativaFile(justificationFile);
        if (uploadRes.success) {
          fileUrl = uploadRes.url;
          fileName = uploadRes.filename;
        } else {
          showError("Erro ao enviar o arquivo.");
          setSaving(false);
          closeAlert();
          return;
        }
      } catch (error) {
        console.error("Erro no upload do arquivo:", error);
        showError("Erro ao enviar o arquivo.");
        setSaving(false);
        closeAlert();
        return;
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
    };

    try {
      const result = await upsertJustificativa(justificativaPayload);
      if (result.success) {
        setJustifications((prev) => ({
          ...prev,
          [currentRecord.id]: {
            text: justificationText,
            status: justificativaPayload.status,
            newEntry: justificativaPayload.newEntry,
            newExit: justificativaPayload.newExit,
          },
        }));
        showSuccess("Justificativa salva com sucesso!");
        setIsModalVisible(false);
      } else {
        showError(result.error || "Erro ao salvar justificativa.");
      }
    } catch (error) {
      console.error("Erro na chamada de justificativa:", error);
      showError("Erro ao salvar justificativa.");
    } finally {
      setSaving(false);
      closeAlert();
    }
  };

  const toggleExpanded = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
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
  });

  const paginatedData = filteredData.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize,
  );

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
          <Button variant="secondary" icon={<SettingOutlined />} className="column-btn">
            Configurar Colunas
          </Button>
        </Dropdown>
      </div>

      {loading ? (
        <Loading size="lg" className="loading-spinner" />
      ) : isMobile ? (
        <>
          <div className="records-mobile-list">
            {paginatedData.map((record) => (
              <div key={record.id} className="record-card">
                <div className="record-header">
                  <strong>{record.usuario}</strong>
                  <button onClick={() => toggleExpanded(record.id)}>
                    {expandedRows.includes(record.id)
                      ? "Fechar"
                      : "Ver Detalhes"}
                  </button>
                </div>

                {expandedRows.includes(record.id) && (
                  <div className="record-details">
                    <p>
                      <strong>Data:</strong> <span>{record.data}</span>
                    </p>
                    <p>
                      <strong>Entrada:</strong> <span>{record.entrada}</span>
                    </p>
                    <p>
                      <strong>Saída:</strong> <span>{record.saida}</span>
                    </p>
                    <p>
                      <strong>Intervalo:</strong> 
                      <span>
                        {record.total_pausas}
                        {record.pausas?.find((p) => !p.fim) && (
                          <>
                            {" "}
                            <PauseInProgress pausas={record.pausas} />
                          </>
                        )}
                      </span>
                    </p>
                    <p>
                      <strong>Horas:</strong> <span>{record.total_horas}</span>
                    </p>
                    <div className="record-justification-actions">
                      <p>
                        <strong>Justificativa:</strong>{" "}
                        {justifications[record.id]?.text || "-"}
                      </p>

                      <div className="record-justification-buttons">
                        <Button
                          variant="secondary"
                          icon={<EditOutlined />}
                          onClick={() => showJustificationModal(record)}
                          size="sm"
                        >
                          {(() => {
                            const justification = justifications[record.id];
                            const isOwnRecord = record.discordId === discordId;
                            if (role === "admin" && !isOwnRecord)
                              return "Visualizar";
                            return justification ? "Editar" : "Adicionar";
                          })()}
                        </Button>

                        {role === "admin" &&
                          justifications[record.id]?.status === "pendente" && (
                            <>
                              <Button
                                variant="primary"
                                icon={<CheckCircleOutlined />}
                                size="sm"
                                onClick={() =>
                                  handleApprovalHelper({
                                    recordId: record.id,
                                    justifications,
                                    abonoHoras,
                                    adminNote,
                                    role,
                                    setJustifications,
                                    setSaving,
                                    setIsModalVisible,
                                    newStatus: "aprovado",
                                  })
                                }
                              >
                                Aprovar
                              </Button>
                              <Button
                                variant="destructive"
                                icon={<CloseCircleOutlined />}
                                size="sm"
                                onClick={() =>
                                  handleApprovalHelper({
                                    recordId: record.id,
                                    justifications,
                                    abonoHoras,
                                    adminNote,
                                    role,
                                    setJustifications,
                                    setSaving,
                                    setIsModalVisible,
                                    newStatus: "reprovado",
                                  })
                                }
                              >
                                Reprovar
                              </Button>
                            </>
                          )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

        </>
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={paginatedData}
            rowKey="id"
            pagination={false}
          // scroll={{ y: tableHeight }}
          />
        </>
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
        onDelete={() =>
          confirmDeleteHelper({
            currentRecord,
            setJustifications,
            setIsModalVisible,
          })
        }
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
  );
};

RecordsTable.propTypes = {
  loading: PropTypes.bool.isRequired,
  filteredData: PropTypes.arrayOf(PropTypes.object).isRequired,
  initialRecordId: PropTypes.string,
};

export default RecordsTable;
