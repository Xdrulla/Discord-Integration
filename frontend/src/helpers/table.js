// ================================
// TABLE CONSTANTS
// ================================

/**
 * Table sizes
 */
export const TABLE_SIZES = {
  SMALL: 'small',
  MIDDLE: 'middle',
  LARGE: 'large',
};

/**
 * Table selection types
 */
export const SELECTION_TYPES = {
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
};

/**
 * Column alignment options
 */
export const COLUMN_ALIGN = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right',
};

/**
 * Column fixed positions (Ant Design v6 - logical positioning)
 */
export const COLUMN_FIXED = {
  START: 'start', // left in LTR, right in RTL
  END: 'end',     // right in LTR, left in RTL
  LEFT: 'left',   // deprecated but still supported
  RIGHT: 'right', // deprecated but still supported
};

/**
 * Default table size
 */
export const DEFAULT_TABLE_SIZE = TABLE_SIZES.MIDDLE;

/**
 * Default pagination page size
 */
export const DEFAULT_PAGE_SIZE = 10;

/**
 * Default pagination options
 */
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ================================
// TABLE HELPER FUNCTIONS
// ================================

/**
 * Builds semantic classNames for Table component (Ant Design v6)
 * @param {Object} customClassNames - Custom classNames object
 * @param {string} size - Table size
 * @param {boolean} bordered - Whether table has borders
 * @returns {Object} Semantic classNames object
 */
export const buildSemanticClassNames = (
  customClassNames = {},
  size = DEFAULT_TABLE_SIZE,
  bordered = false
) => {
  return {
    root: `ds-table__root ds-table--${size} ${bordered ? 'ds-table--bordered' : ''} ${customClassNames.root || ''}`.trim(),
    header: `ds-table__header ${customClassNames.header || ''}`.trim(),
    body: `ds-table__body ${customClassNames.body || ''}`.trim(),
    row: `ds-table__row ${customClassNames.row || ''}`.trim(),
    cell: `ds-table__cell ${customClassNames.cell || ''}`.trim(),
    ...customClassNames,
  };
};

/**
 * Builds semantic styles for Table component (Ant Design v6)
 * @param {Object} customStyles - Custom styles object
 * @returns {Object} Semantic styles object
 */
export const buildSemanticStyles = (customStyles = {}) => {
  return {
    root: customStyles.root || {},
    header: customStyles.header || {},
    body: customStyles.body || {},
    row: customStyles.row || {},
    cell: customStyles.cell || {},
    ...customStyles,
  };
};

/**
 * Builds className string for Table root
 * @param {string} className - Custom className
 * @param {string} size - Table size
 * @param {boolean} bordered - Whether table has borders
 * @param {boolean} striped - Whether table has striped rows
 * @returns {string} Combined className string
 */
export const buildTableClasses = (
  className = '',
  size = DEFAULT_TABLE_SIZE,
  bordered = false,
  striped = false
) => {
  return [
    'ds-table',
    `ds-table--${size}`,
    bordered && 'ds-table--bordered',
    striped && 'ds-table--striped',
    className,
  ].filter(Boolean).join(' ');
};

/**
 * Validates column fixed position (v6 uses logical positioning)
 * @param {string} fixed - Fixed position
 * @returns {string} Valid fixed position
 */
export const validateColumnFixed = (fixed) => {
  const validPositions = Object.values(COLUMN_FIXED);
  return validPositions.includes(fixed) ? fixed : null;
};

/**
 * Builds default pagination config
 * @param {number} total - Total number of records
 * @param {number} pageSize - Page size
 * @param {Array} pageSizeOptions - Page size options
 * @returns {Object} Pagination config
 */
export const buildPaginationConfig = (
  total = 0,
  pageSize = DEFAULT_PAGE_SIZE,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS
) => {
  return {
    total,
    pageSize,
    pageSizeOptions,
    showSizeChanger: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} de ${total}`,
    showQuickJumper: true,
  };
};

/**
 * Builds row selection config
 * @param {string} type - Selection type (checkbox or radio)
 * @param {Function} onChange - Selection change handler
 * @param {Array} selectedRowKeys - Selected row keys
 * @returns {Object} Row selection config
 */
export const buildRowSelection = (type = SELECTION_TYPES.CHECKBOX, onChange, selectedRowKeys = []) => {
  return {
    type,
    onChange,
    selectedRowKeys,
  };
};

/**
 * Formats column with common settings
 * @param {Object} column - Column definition
 * @returns {Object} Formatted column
 */
export const formatColumn = (column) => {
  return {
    key: column.key || column.dataIndex,
    dataIndex: column.dataIndex,
    title: column.title,
    width: column.width,
    align: column.align || COLUMN_ALIGN.LEFT,
    fixed: validateColumnFixed(column.fixed),
    sorter: column.sorter,
    filters: column.filters,
    render: column.render,
    ellipsis: column.ellipsis !== false,
    ...column,
  };
};

/**
 * Formats all columns in array
 * @param {Array} columns - Array of column definitions
 * @returns {Array} Formatted columns
 */
export const formatColumns = (columns = []) => {
  return columns.map(formatColumn);
};

/**
 * Checks if table has selection
 * @param {Object} rowSelection - Row selection config
 * @returns {boolean} True if table has selection
 */
export const hasSelection = (rowSelection) => {
  return !!rowSelection;
};

/**
 * Checks if table is scrollable
 * @param {Object} scroll - Scroll config
 * @returns {boolean} True if table is scrollable
 */
export const isScrollable = (scroll) => {
  return !!(scroll && (scroll.x || scroll.y));
};
