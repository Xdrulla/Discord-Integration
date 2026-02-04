import PropTypes from "prop-types"
import { useState } from "react"
import {
  DatePicker,
  message,
} from "antd"
import { Modal } from "../designSystem"
import { useAuth } from "../../context/useAuth"
import { addManualRecord } from "../../services/manualRecordService"
import { showError, showSuccess } from "../common/alert"
import { IMaskInput } from "react-imask"

const AddManualRecordModal = ({ open, onClose }) => {
  const { user, discordId, displayName } = useAuth()
  const [date, setDate] = useState(null)
  const [entrada, setEntrada] = useState(null)
  const [saida, setSaida] = useState(null)
  const [intervalo, setIntervalo] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!date || !entrada || !saida) {
      return message.warning("Preencha todos os campos obrigatórios.");
    }

    setLoading(true);
    try {
      const payload = {
        data: date.format("YYYY-MM-DD"),
        entrada: entrada.format("YYYY-MM-DD HH:mm"),
        saida: saida.format("YYYY-MM-DD HH:mm"),
        total_pausas: intervalo || "0h 0m",
        usuario: displayName || user.email.split("@")[0],
        discordId,
      };

      const res = await addManualRecord(payload);

      if (res.success) {
        showSuccess("Registro manual enviado com sucesso!");
        onClose();
        setDate(null);
        setEntrada(null);
        setSaida(null);
        setIntervalo("");
      } else {
        showError(res.error || "Erro ao adicionar registro manual.");
      }
    } catch (error) {
      console.error("Erro ao enviar registro manual:", error);
      showError("Erro ao adicionar registro manual.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Adicionar Registro Manual"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Salvar"
      cancelText="Cancelar"
      size="md"
    >
      <p>Informe os dados para inserir um novo registro manual.</p>
      <DatePicker
        value={date}
        onChange={setDate}
        style={{ width: "100%", marginBottom: 16 }}
        placeholder="Data do registro"
      />
      <DatePicker
        showTime
        value={entrada}
        onChange={setEntrada}
        style={{ width: "100%", marginBottom: 16 }}
        placeholder="Entrada"
      />
      <DatePicker
        showTime
        value={saida}
        onChange={setSaida}
        style={{ width: "100%", marginBottom: 16 }}
        placeholder="Saída"
      />
      <IMaskInput
        mask="00h 00m"
        lazy={true}
        unmask={false}
        value={intervalo}
        onAccept={(value) => setIntervalo(value)}
        placeholder="Pausas/Intervalo - ex: 01h 30m (opcional)"
        className="ant-input-masked input-margin"
      />
    </Modal>
  )
}

AddManualRecordModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default AddManualRecordModal
