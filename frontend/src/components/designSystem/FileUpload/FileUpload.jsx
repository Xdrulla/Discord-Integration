import { Upload, Flex, Typography, Progress, Button } from 'antd';
import {
  CloudUploadOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileOutlined,
  VideoCameraOutlined,
  SketchOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  DeleteOutlined,
} from '@ant-design/icons';
import PropTypes from 'prop-types';
import {
  buildFileUploadClasses,
  buildUploadSemanticClassNames,
  buildUploadSemanticStyles,
  formatFileSize,
  formatUploadStatusText,
  getFileKind,
  FILE_KINDS,
  UPLOAD_STATUSES,
  DEFAULT_FILE_UPLOAD_ACCEPT,
  DEFAULT_FILE_UPLOAD_DESCRIPTION,
  DEFAULT_FILE_UPLOAD_HELP_TEXT,
  DEFAULT_FILE_UPLOAD_HINT,
  DEFAULT_FILE_UPLOAD_VARIANT,
  FILE_UPLOAD_VARIANTS,
} from '../../../helpers/fileUpload';

const { Text } = Typography;

const getKindIcon = (kind) => {
  if (kind === FILE_KINDS.PDF) return <FilePdfOutlined />;
  if (kind === FILE_KINDS.VIDEO) return <VideoCameraOutlined />;
  if (kind === FILE_KINDS.FIGMA) return <SketchOutlined />;
  if (kind === FILE_KINDS.IMAGE) return <FileImageOutlined />;
  return <FileOutlined />;
};

/**
 * FileUpload - Upload de arquivos com drag-and-drop e lista customizada
 *
 * @component
 * @example
 * <FileUpload multiple />
 */
const FileUpload = ({
  // Ant Design props
  disabled = false,
  multiple = true,
  accept = DEFAULT_FILE_UPLOAD_ACCEPT,
  maxCount,
  fileList,
  defaultFileList,
  onChange,
  beforeUpload,
  customRequest,
  action,
  onRemove,
  onPreview,
  onDownload,
  openFileDialogOnClick = true,

  // ✨ Ant Design v6: Estrutura semântica
  classNames: customClassNames = {},
  styles: customStyles = {},

  // Design System props
  variant = DEFAULT_FILE_UPLOAD_VARIANT,
  hint = DEFAULT_FILE_UPLOAD_HINT,
  description = DEFAULT_FILE_UPLOAD_DESCRIPTION,
  helpText = DEFAULT_FILE_UPLOAD_HELP_TEXT,
  showHelpText = true,
  uploadingIndicator = 'progress',
  showRemoveOnDone = false,
  className = '',

  // Customização interna (classes)
  dropzoneClassName = '',
  ...restProps
}) => {
  const rootClassName = buildFileUploadClasses({ variant, disabled, className });
  const semanticClassNames = buildUploadSemanticClassNames(customClassNames, variant);
  const semanticStyles = buildUploadSemanticStyles(customStyles);

  const dropzoneContentClassName = [
    'ds-file-upload__dropzone-content',
    dropzoneClassName,
  ].filter(Boolean).join(' ');

  const renderItem = (_originNode, file, _list, actions) => {
    const kind = getFileKind({ name: file?.name, type: file?.type });
    const sizeText = formatFileSize(file?.size);
    const percent = Number(file?.percent);
    const safePercent = Number.isFinite(percent) ? Math.min(Math.max(Math.round(percent), 0), 100) : undefined;
    const statusText = formatUploadStatusText({ status: file?.status, percent: safePercent });

    const isDone = file?.status === UPLOAD_STATUSES.DONE;
    const isUploading = file?.status === UPLOAD_STATUSES.UPLOADING;
    const isError = file?.status === UPLOAD_STATUSES.ERROR;

    const linePercent = isDone ? 100 : (Number.isFinite(safePercent) ? safePercent : 0);
    const metaText = [sizeText, statusText].filter(Boolean).join(' — ');

    const showCircleIndicator = (
      uploadingIndicator === 'progress'
      && isUploading
      && Number.isFinite(safePercent)
    );

    const showRemoveButton = (
      (isError || showRemoveOnDone || !isDone)
      && (!showCircleIndicator)
      && (isUploading ? uploadingIndicator === 'remove' : true)
    );

    return (
      <Flex vertical className="ds-file-upload__item" gap={8}>
        <Flex align="center" justify="space-between" className="ds-file-upload__item-header" gap={12}>
          <Flex align="center" className="ds-file-upload__item-left" gap={12}>
            <Flex
              align="center"
              justify="center"
              className={`ds-file-upload__file-icon ds-file-upload__file-icon--${kind}`}
            >
              {getKindIcon(kind)}
            </Flex>

            <Flex vertical className="ds-file-upload__file-meta" gap={2}>
              <Text className="ds-file-upload__file-name" ellipsis={{ tooltip: file?.name }}>
                {file?.name}
              </Text>
              {!!metaText && (
                <Text className="ds-file-upload__file-subtitle">
                  {metaText}
                </Text>
              )}
            </Flex>
          </Flex>

          <Flex align="center" className="ds-file-upload__item-right" gap={8}>
            {isDone && <CheckCircleFilled className="ds-file-upload__status-icon ds-file-upload__status-icon--done" />}

            {isError && (
              <CloseCircleFilled className="ds-file-upload__status-icon ds-file-upload__status-icon--error" />
            )}

            {showCircleIndicator && (
              <Progress
                type="circle"
                percent={safePercent}
                size={20}
                showInfo={false}
                className="ds-file-upload__status-progress"
              />
            )}

            {showRemoveButton && (
              <Button
                type="text"
                aria-label="Remove file"
                icon={<DeleteOutlined />}
                className="ds-file-upload__remove-button"
                onClick={actions.remove}
              />
            )}
          </Flex>
        </Flex>

        <Progress
          type="line"
          percent={linePercent}
          size="small"
          showInfo={false}
          status={isError ? 'exception' : (isDone ? 'success' : 'active')}
          className="ds-file-upload__line-progress"
        />
      </Flex>
    );
  };

  return (
    <Upload.Dragger
      disabled={disabled}
      multiple={multiple}
      accept={accept}
      maxCount={maxCount}
      fileList={fileList}
      defaultFileList={defaultFileList}
      onChange={onChange}
      beforeUpload={beforeUpload}
      customRequest={customRequest}
      action={action}
      onRemove={onRemove}
      onPreview={onPreview}
      onDownload={onDownload}
      openFileDialogOnClick={openFileDialogOnClick}
      listType="text"
      showUploadList={{
        showRemoveIcon: false,
        showDownloadIcon: false,
        showPreviewIcon: false,
      }}
      itemRender={renderItem}
      className={rootClassName}
      classNames={semanticClassNames}
      styles={semanticStyles}
      {...restProps}
    >
      <Flex vertical align="center" justify="center" className={dropzoneContentClassName} gap={6}>
        <Flex align="center" justify="center" className="ds-file-upload__dropzone-icon">
          <CloudUploadOutlined className="ds-file-upload__dropzone-icon-svg" />
        </Flex>

        <Text className="ds-file-upload__dropzone-hint">
          <Text className="ds-file-upload__dropzone-hint-action">{hint}</Text>
          {' '}
          {description}
        </Text>

        {showHelpText && (
          <Text className="ds-file-upload__dropzone-help">
            {helpText}
          </Text>
        )}
      </Flex>
    </Upload.Dragger>
  );
};

FileUpload.propTypes = {
  disabled: PropTypes.bool,
  multiple: PropTypes.bool,
  accept: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  maxCount: PropTypes.number,
  fileList: PropTypes.array,
  defaultFileList: PropTypes.array,
  onChange: PropTypes.func,
  beforeUpload: PropTypes.func,
  customRequest: PropTypes.func,
  action: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  onRemove: PropTypes.func,
  onPreview: PropTypes.func,
  onDownload: PropTypes.func,
  openFileDialogOnClick: PropTypes.bool,

  className: PropTypes.string,
  variant: PropTypes.oneOf(Object.values(FILE_UPLOAD_VARIANTS)),
  hint: PropTypes.node,
  description: PropTypes.node,
  helpText: PropTypes.node,
  showHelpText: PropTypes.bool,
  uploadingIndicator: PropTypes.oneOf(['progress', 'remove']),
  showRemoveOnDone: PropTypes.bool,

  dropzoneClassName: PropTypes.string,

  classNames: PropTypes.shape({
    root: PropTypes.string,
    list: PropTypes.string,
    item: PropTypes.string,
  }),

  styles: PropTypes.shape({
    root: PropTypes.object,
    list: PropTypes.object,
    item: PropTypes.object,
  }),
};

export default FileUpload;
