import { upsertJustificativa, deleteJustificativa } from "../../../services/justificativaService"
import {
  showLoadingAlert,
  closeAlert,
  showError,
  showSuccess,
  confirmDeleteJustificativa
} from "../../common/alert"

export const handleApprovalHelper = async ({
  recordId,
  justifications,
  abonoHoras,
  adminNote,
  role,
  setJustifications,
  setSaving,
  setIsModalVisible,
  newStatus
}) => {
  const justification = justifications[recordId]
  if (!justification) return

  const [usuario, data] = recordId.split("_")

  const justificativaPayload = {
    usuario,
    data,
    text: justification.text,
    newEntry: justification.newEntry,
    newExit: justification.newExit,
    abonoHoras: abonoHoras || null,
    manualBreak: justification.manualBreak || null,
    status: newStatus,
    observacaoAdmin: role === "admin" ? adminNote : null,
  }

  setSaving(true)
  showLoadingAlert("Atualizando status da justificativa...")

  try {
    const result = await upsertJustificativa(justificativaPayload)
    if (result.success) {
      showSuccess(`Justificativa ${newStatus} com sucesso!`)
      setJustifications((prev) => ({
        ...prev,
        [recordId]: {
          ...prev[recordId],
          status: newStatus,
        },
      }))
      setIsModalVisible(false)
    } else {
      showError(result.error || "Erro ao atualizar justificativa.")
    }
  } catch (error) {
    console.error("Erro ao atualizar status da justificativa:", error)
    showError("Erro ao atualizar justificativa.")
  } finally {
    setSaving(false)
    closeAlert()
  }
}

export const confirmDeleteHelper = async ({
  currentRecord,
  setJustifications,
  setIsModalVisible
}) => {
  const result = await confirmDeleteJustificativa()
  if (!result.isConfirmed) return

  showLoadingAlert("Excluindo justificativa...")
  try {
    const res = await deleteJustificativa({
      usuario: currentRecord.usuario,
      data: currentRecord.data,
    })

    if (res.success) {
      setJustifications((prev) => {
        const newMap = { ...prev }
        delete newMap[currentRecord.id]
        return newMap
      })
      setIsModalVisible(false)
      showSuccess("Justificativa excluída com sucesso!")
    } else {
      showError(res.error || "Erro ao excluir justificativa.")
    }
  } catch (error) {
    console.error("Erro ao excluir justificativa:", error)
    showError("Erro ao excluir justificativa.")
  } finally {
    closeAlert()
  }
}
