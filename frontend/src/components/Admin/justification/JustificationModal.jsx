import PropTypes from "prop-types"
import {
  Modal,
  Input,
  Button,
  Upload,
  Select,
  DatePicker,
  message
} from "antd"
import { UploadOutlined } from "@ant-design/icons"
import DocumentViewer from "../../common/DocumentViewer"
import dayjs from "dayjs"

const { Option } = Select

const JustificationModal = ({
  role,
  isModalVisible,
  isReadOnly,
  saving,
  currentRecord,
  justificationText,
  justificationFile,
  newEntry,
  newExit,
  manualBreak,
  abonoHoras,
  status,
  adminNote,
  viewerFile,
  viewerVisible,
  setJustificationText,
  setJustificationFile,
  setNewEntry,
  setNewExit,
  setManualBreak,
  setAbonoHoras,
  setStatus,
  setAdminNote,
  setViewerFile,
  setViewerVisible,
  onSubmit,
  onCancel,
  onDelete,
  isOwnJustification,
  handleApproval
}) => {
  return (
    <>
      <Modal
        title={role === "admin" ? "Visualizar Justificativa" : "Justificar Horário"}
        open={isModalVisible}
        onOk={onSubmit}
        onCancel={onCancel}
        okText={saving ? "Salvando..." : "Salvar"}
        okButtonProps={{ disabled: saving }}
        cancelText="Cancelar"
        footer={isReadOnly ? null : undefined}
      >
        <div className="justificativa-modal">
          <p>
            {role === "admin"
              ? "Visualização de justificativa para o usuário"
              : "Justifique por que houve um horário diferente ou um intervalo adicional para o usuário"}{" "}
            <b>{currentRecord?.usuario}</b> no dia <b>{currentRecord?.data}</b>.
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
                const isAllowedType = file.type === "application/pdf" || file.type.startsWith("image/")
                const isLt5M = file.size / 1024 / 1024 < 5

                if (!isAllowedType) {
                  message.error("Apenas imagens ou PDF são permitidos!")
                  return Upload.LIST_IGNORE
                }

                if (!isLt5M) {
                  message.error("O arquivo deve ter menos de 5MB!")
                  return Upload.LIST_IGNORE
                }

                setJustificationFile(file)
                return false
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
                    name: currentRecord.justificativa.fileName,
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
            value={newEntry ? dayjs(newEntry) : null}
            onChange={setNewEntry}
            placeholder="Entrada manual"
            className="input-margin"
            disabled={isReadOnly}
          />

          <DatePicker
            showTime
            value={newExit ? dayjs(newExit) : null}
            onChange={setNewExit}
            placeholder="Saída manual"
            className="input-margin"
            disabled={isReadOnly}
          />

          <Input
            placeholder="Intervalo manual (ex: 1h 15m)"
            value={manualBreak}
            onChange={(e) => setManualBreak(e.target.value)}
            className="input-margin"
            disabled={isReadOnly}
          />

          <Input
            placeholder="Abono de horas (ex: 2h 0m)"
            value={abonoHoras}
            onChange={(e) => setAbonoHoras(e.target.value)}
            className="input-margin"
            disabled={isReadOnly && role !== "admin"}
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

          {role === "admin" && (
            <Input.TextArea
              placeholder="Observações adicionais (ex: aprovado com alteração no abono)"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              className="input-margin"
            />
          )}

          {!isReadOnly && isOwnJustification && currentRecord?.justificativa && (
            <Button danger style={{ marginTop: 12 }} onClick={onDelete}>
              Excluir Justificativa
            </Button>
          )}
        </div>
      </Modal>

      <DocumentViewer
        fileUrl={viewerFile.url}
        fileName={viewerFile.name}
        open={viewerVisible}
        onClose={() => setViewerVisible(false)}
      />
    </>
  )
}

JustificationModal.propTypes = {
  role: PropTypes.string.isRequired,
  isModalVisible: PropTypes.bool.isRequired,
  isReadOnly: PropTypes.bool.isRequired,
  saving: PropTypes.bool.isRequired,
  currentRecord: PropTypes.object,
  justificationText: PropTypes.string,
  justificationFile: PropTypes.object,
  newEntry: PropTypes.any,
  newExit: PropTypes.any,
  manualBreak: PropTypes.string,
  abonoHoras: PropTypes.string,
  status: PropTypes.string,
  adminNote: PropTypes.string,
  viewerFile: PropTypes.object.isRequired,
  viewerVisible: PropTypes.bool.isRequired,
  setJustificationText: PropTypes.func.isRequired,
  setJustificationFile: PropTypes.func.isRequired,
  setNewEntry: PropTypes.func.isRequired,
  setNewExit: PropTypes.func.isRequired,
  setManualBreak: PropTypes.func.isRequired,
  setAbonoHoras: PropTypes.func.isRequired,
  setStatus: PropTypes.func.isRequired,
  setAdminNote: PropTypes.func.isRequired,
  setViewerFile: PropTypes.func.isRequired,
  setViewerVisible: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isOwnJustification: PropTypes.bool.isRequired,
  handleApproval: PropTypes.func.isRequired,
}

export default JustificationModal
