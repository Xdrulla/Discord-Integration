import { Tag, Button, Tooltip, Space } from "antd"
import { EditOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons"
import dayjs from "dayjs"
import { extrairMinutosDeString } from "../../../utils/timeUtils"
import PauseInProgress from "../../common/inProgressPause"

export const getColumns = ({
  visibleColumns,
  justifications,
  showJustificationModal,
  handleApproval,
  role,
  discordId,
  isMobile,
  toggleExpanded,
  expandedRows
}) => {
  const columns = [
    {
      title: "Usuário",
      dataIndex: "usuario",
      key: "usuario",
      render: (text, record) => (
        <div>
          <span>{text}</span>
          {isMobile && (
            <button
              className="mobile-toggle-button"
              onClick={() => toggleExpanded(record.id)}
            >
              {expandedRows.includes(record.id) ? "Fechar Detalhes" : "Ver Detalhes"}
            </button>
          )}
        </div>
      ),
    },
    {
      title: "Data",
      dataIndex: "data",
      key: "data",
      sorter: (a, b) => dayjs(a.data).unix() - dayjs(b.data).unix(),
      responsive: ["sm", "md", "lg"],
      render: (text) => <span className="data-bold">{text}</span>,
    },
    {
      title: "Entrada",
      dataIndex: "entrada",
      key: "entrada",
      sorter: (a, b) => a.entrada.localeCompare(b.entrada),
      responsive: ["md", "lg"],
      render: (text) => <Tag className="tag-success">{text}</Tag>,
    },
    {
      title: "Saída",
      dataIndex: "saida",
      key: "saida",
      sorter: (a, b) => a.saida.localeCompare(b.saida),
      responsive: ["md", "lg"],
      render: (text) =>
        text !== "-" ? <Tag className="tag-error">{text}</Tag> : "-",
    },
    {
      title: "Tempo de Intervalo",
      dataIndex: "total_pausas",
      key: "total_pausas",
      sorter: (a, b) =>
        extrairMinutosDeString(a.total_pausas) -
        extrairMinutosDeString(b.total_pausas),
      responsive: ["lg"],
      render: (text, record) => {
        const activePause = record.pausas?.find(p => !p.fim);

        const tooltipText = activePause
          ? `Pausa iniciada às ${new Date(activePause.inicio).toLocaleTimeString()}`
          : `Total de pausas registradas`;

        return (
          <Tooltip title={tooltipText}>
            <Tag className={activePause ? "tag-warning" : "tag-blue"}>
              {text}
              {activePause && (
                <>
                  {" "}
                  <PauseInProgress pausas={record.pausas} />
                </>
              )}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "Horas Trabalhadas",
      dataIndex: "total_horas",
      key: "total_horas",
      sorter: (a, b) =>
        extrairMinutosDeString(a.total_horas) -
        extrairMinutosDeString(b.total_horas),
      responsive: ["lg"],
      render: (text) => <Tag className="tag-purple">{text}</Tag>,
    },
    {
      title: "Status",
      key: "status",
      responsive: ["lg"],
      render: (_, record) => {
        const status = justifications[record.id]?.status || record.justificativa?.status
        if (!status) return "-"
        return (
          <Tag color={
            status === "aprovado"
              ? "green"
              : status === "reprovado"
                ? "red"
                : "orange"
          }>
            {status.toUpperCase()}
          </Tag>
        )
      },
    },
    {
      title: "Justificativa",
      dataIndex: "justificativa",
      key: "justificativa",
      responsive: ["lg"],
      render: (_, record) => {
        const justification = justifications[record.id]
        const isOwnRecord = record.discordId && record.discordId === discordId

        return (
          <Space>
            <Tooltip title={justification?.text || "Nenhuma justificativa"}>
              <Button
                icon={<EditOutlined />}
                onClick={() => showJustificationModal(record)}
              >
                {(() => {
                  if (role === "admin" && !isOwnRecord) return "Visualizar"
                  return justification ? "Editar" : "Adicionar"
                })()}
              </Button>
            </Tooltip>

            {role === "admin" && justification && justification.status === "pendente" && (
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
      },
    },
  ]

  return columns.filter((col) => visibleColumns.includes(col.key))
}