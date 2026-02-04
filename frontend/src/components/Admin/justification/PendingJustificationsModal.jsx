import PropTypes from "prop-types";
import { Card } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { Modal, Button } from "../../designSystem";

const PendingJustificationsModal = ({
  visible,
  onClose,
  justifications,
  onApprove,
  onReject,
}) => {
  return (
    <Modal
      title="Justificativas Pendentes"
      open={visible}
      onCancel={onClose}
      footer={null}
      className="pending-justifications-modal"
      size="md"
    >
      {justifications.map((j) => (
        <Card key={j.id} className="pending-card">
          <p>
            <strong>Usuário:</strong> {j.usuario}
          </p>
          <p>
            <strong>Data:</strong> {j.data}
          </p>
          <p>
            <strong>Justificativa:</strong> {j.justificativa.text || "-"}
          </p>
          <div className="pending-card-actions">
            <Button
              size="sm"
              variant="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => onApprove(j.id)}
            >
              Aprovar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              icon={<CloseCircleOutlined />}
              onClick={() => onReject(j.id)}
            >
              Reprovar
            </Button>
          </div>
        </Card>
      ))}
    </Modal>
  );
};

PendingJustificationsModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  justifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      usuario: PropTypes.string.isRequired,
      data: PropTypes.string.isRequired,
      justificativa: PropTypes.shape({
        text: PropTypes.string,
      }).isRequired,
    })
  ).isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
};

export default PendingJustificationsModal;
