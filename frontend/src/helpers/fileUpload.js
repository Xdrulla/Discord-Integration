// ================================
// FILE UPLOAD CONSTANTS
// ================================

export const FILE_UPLOAD_VARIANTS = {
  DEFAULT: 'default',
};

export const DEFAULT_FILE_UPLOAD_VARIANT = FILE_UPLOAD_VARIANTS.DEFAULT;

export const DEFAULT_FILE_UPLOAD_ACCEPT = [
  'image/svg+xml',
  'image/png',
  'image/jpeg',
  'image/gif',
  'application/pdf',
  'video/mp4',
  '.fig',
].join(',');

export const DEFAULT_FILE_UPLOAD_HINT = 'Click to upload';
export const DEFAULT_FILE_UPLOAD_DESCRIPTION = 'or drag and drop';
export const DEFAULT_FILE_UPLOAD_HELP_TEXT = 'SVG, PNG, JPG or GIF (max. 800×400px)';

export const UPLOAD_STATUSES = {
  DONE: 'done',
  UPLOADING: 'uploading',
  ERROR: 'error',
  REMOVED: 'removed',
};

export const FILE_KINDS = {
  PDF: 'pdf',
  VIDEO: 'video',
  FIGMA: 'figma',
  IMAGE: 'image',
  FILE: 'file',
};

// ================================
// FILE UPLOAD HELPER FUNCTIONS
// ================================

export const buildFileUploadClasses = ({
  variant = DEFAULT_FILE_UPLOAD_VARIANT,
  disabled = false,
  className = '',
} = {}) => {
  return [
    'ds-file-upload',
    `ds-file-upload--${variant}`,
    disabled && 'ds-file-upload--disabled',
    className,
  ].filter(Boolean).join(' ');
};

export const buildUploadSemanticClassNames = (
  customClassNames = {},
  variant = DEFAULT_FILE_UPLOAD_VARIANT
) => {
  return {
    root: `ds-file-upload__root ds-file-upload--${variant} ${customClassNames.root || ''}`.trim(),
    list: `ds-file-upload__list ${customClassNames.list || ''}`.trim(),
    item: `ds-file-upload__list-item ${customClassNames.item || ''}`.trim(),
    ...customClassNames,
  };
};

export const buildUploadSemanticStyles = (customStyles = {}) => {
  return {
    root: customStyles.root || {},
    list: customStyles.list || {},
    item: customStyles.item || {},
    ...customStyles,
  };
};

export const getFileExtension = (fileName = '') => {
  const safeName = String(fileName);
  const lastDot = safeName.lastIndexOf('.');
  if (lastDot === -1) return '';
  return safeName.slice(lastDot + 1).toLowerCase();
};

export const getFileKind = ({ name = '', type = '' } = {}) => {
  const extension = getFileExtension(name);
  const mime = String(type).toLowerCase();

  if (extension === 'pdf' || mime.includes('pdf')) return FILE_KINDS.PDF;
  if (extension === 'fig') return FILE_KINDS.FIGMA;
  if (extension === 'mp4' || mime.includes('video')) return FILE_KINDS.VIDEO;
  if (mime.startsWith('image/')) return FILE_KINDS.IMAGE;

  return FILE_KINDS.FILE;
};

export const formatFileSize = (bytes) => {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) return '';

  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;

  if (value >= GB) return `${(value / GB).toFixed(1)} GB`;
  if (value >= MB) return `${(value / MB).toFixed(1)} MB`;
  if (value >= KB) return `${Math.round(value / KB)} KB`;
  return `${value} B`;
};

export const formatUploadStatusText = ({ status, percent } = {}) => {
  const normalizedPercent = Number(percent);
  const safePercent = Number.isFinite(normalizedPercent) ? Math.round(normalizedPercent) : undefined;

  if (status === UPLOAD_STATUSES.DONE) return '100% uploaded';
  if (status === UPLOAD_STATUSES.ERROR) return 'Upload failed';
  if (status === UPLOAD_STATUSES.UPLOADING && Number.isFinite(safePercent)) return `${safePercent}% uploaded`;

  return '';
};
