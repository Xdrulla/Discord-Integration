import PropTypes from "prop-types"
import { Modal } from "antd"

const DocumentViewer = ({ fileUrl, fileName, open, onClose }) => {
  const isPdf = fileUrl?.startsWith("data:application/pdf")
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={`Visualizar Arquivo - ${fileName}`}
      width={800}
    >
      {isPdf ? (
        <iframe
          src={fileUrl}
          title="PDF Viewer"
          width="100%"
          height="600px"
          style={{ border: "1px solid #ccc", borderRadius: 4 }}
        />
      ) : (
        <img
          src={fileUrl}
          alt="Arquivo Justificativa"
          style={{ maxWidth: "100%", maxHeight: "600px", borderRadius: 4, border: "1px solid #ccc" }}
        />
      )}
    </Modal>
  )
}

DocumentViewer.propTypes = {
  fileUrl: PropTypes.string,
  fileName: PropTypes.string,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default DocumentViewer
