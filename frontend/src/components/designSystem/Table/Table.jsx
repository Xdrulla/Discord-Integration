import React from 'react';
import { Table as AntTable } from 'antd';
import PropTypes from 'prop-types';
import {
  buildSemanticClassNames,
  buildSemanticStyles,
  buildTableClasses,
  buildPaginationConfig,
  buildRowSelection,
  formatColumns,
  hasSelection,
  isScrollable,
  TABLE_SIZES,
  SELECTION_TYPES,
  COLUMN_ALIGN,
  COLUMN_FIXED,
  DEFAULT_TABLE_SIZE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
} from '../../../helpers/table';

/**
 * Table - Data table component for displaying structured data
 *
 * Based on Ant Design v6.0 Table with Plus UI Design System tokens.
 * Supports sorting, filtering, pagination, row selection, and fixed columns.
 *
 * @component
 * @example
 * // Basic table
 * <Table
 *   columns={[
 *     { title: 'Name', dataIndex: 'name', key: 'name' },
 *     { title: 'Age', dataIndex: 'age', key: 'age' },
 *   ]}
 *   dataSource={[
 *     { key: '1', name: 'John', age: 32 },
 *     { key: '2', name: 'Jane', age: 28 },
 *   ]}
 * />
 *
 * @example
 * // Table with selection
 * <Table
 *   columns={columns}
 *   dataSource={data}
 *   rowSelection={{
 *     type: 'checkbox',
 *     onChange: (selectedRowKeys) => console.log(selectedRowKeys),
 *   }}
 * />
 *
 * @example
 * // Table with pagination
 * <Table
 *   columns={columns}
 *   dataSource={data}
 *   pagination={{
 *     total: 100,
 *     pageSize: 10,
 *     showSizeChanger: true,
 *   }}
 * />
 */
const Table = ({
  // Ant Design props
  columns = [],
  dataSource = [],
  rowKey = 'key',
  size = DEFAULT_TABLE_SIZE,
  bordered = false,
  loading = false,
  pagination = undefined,
  rowSelection,
  scroll,

  // Custom props
  className = '',
  classNames: customClassNames = {},
  styles: customStyles = {},
  striped = false,

  // Events
  onChange,
  onRow,

  ...restProps
}) => {
  // Format columns
  const formattedColumns = formatColumns(columns);

  // Build pagination config
  const paginationConfig =
    pagination === false
      ? false
      : pagination
      ? {
          ...buildPaginationConfig(
            pagination.total,
            pagination.pageSize || DEFAULT_PAGE_SIZE,
            pagination.pageSizeOptions || DEFAULT_PAGE_SIZE_OPTIONS
          ),
          ...pagination,
        }
      : {
          ...buildPaginationConfig(),
          pageSize: DEFAULT_PAGE_SIZE,
        };

  // Build semantic structure for v6
  const semanticClassNames = buildSemanticClassNames(customClassNames, size, bordered);
  const semanticStyles = buildSemanticStyles(customStyles);
  const rootClassName = buildTableClasses(className, size, bordered, striped);

  // Check if table has special features
  const withSelection = hasSelection(rowSelection);
  const scrollable = isScrollable(scroll);

  return (
    <AntTable
      columns={formattedColumns}
      dataSource={dataSource}
      rowKey={rowKey}
      size={size}
      bordered={bordered}
      loading={loading}
      pagination={paginationConfig}
      rowSelection={rowSelection}
      scroll={scroll}
      className={rootClassName}
      classNames={semanticClassNames}
      styles={semanticStyles}
      onChange={onChange}
      onRow={onRow}
      {...restProps}
    />
  );
};

Table.propTypes = {
  /**
   * Table columns configuration
   * Each column: { title, dataIndex, key, width, align, fixed, sorter, filters, render, ellipsis }
   */
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.node.isRequired,
      dataIndex: PropTypes.string,
      key: PropTypes.string,
      width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      align: PropTypes.oneOf(Object.values(COLUMN_ALIGN)),
      fixed: PropTypes.oneOf(Object.values(COLUMN_FIXED)),
      sorter: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
      filters: PropTypes.array,
      render: PropTypes.func,
      ellipsis: PropTypes.bool,
    })
  ).isRequired,

  /**
   * Data source array
   */
  dataSource: PropTypes.array.isRequired,

  /**
   * Row key (unique identifier for each row)
   */
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

  /**
   * Table size
   * 'small' | 'middle' | 'large'
   */
  size: PropTypes.oneOf(Object.values(TABLE_SIZES)),

  /**
   * Whether to show borders
   */
  bordered: PropTypes.bool,

  /**
   * Loading state
   */
  loading: PropTypes.bool,

  /**
   * Pagination configuration
   * Set to false to disable pagination
   */
  pagination: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.shape({
      total: PropTypes.number,
      pageSize: PropTypes.number,
      current: PropTypes.number,
      pageSizeOptions: PropTypes.array,
      showSizeChanger: PropTypes.bool,
      showQuickJumper: PropTypes.bool,
      showTotal: PropTypes.func,
      onChange: PropTypes.func,
    }),
  ]),

  /**
   * Row selection configuration
   * { type: 'checkbox' | 'radio', onChange: function, selectedRowKeys: array }
   */
  rowSelection: PropTypes.shape({
    type: PropTypes.oneOf(Object.values(SELECTION_TYPES)),
    onChange: PropTypes.func,
    selectedRowKeys: PropTypes.array,
    getCheckboxProps: PropTypes.func,
  }),

  /**
   * Scroll configuration for fixed header/columns
   * { x: number | string, y: number | string }
   */
  scroll: PropTypes.shape({
    x: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    y: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),

  /**
   * Additional CSS class for root element
   */
  className: PropTypes.string,

  /**
   * Semantic classNames object for internal elements (Ant Design v6)
   * Available keys: root, header, body, row, cell
   */
  classNames: PropTypes.shape({
    root: PropTypes.string,
    header: PropTypes.string,
    body: PropTypes.string,
    row: PropTypes.string,
    cell: PropTypes.string,
  }),

  /**
   * Semantic styles object for internal elements (Ant Design v6)
   * Available keys: root, header, body, row, cell
   */
  styles: PropTypes.shape({
    root: PropTypes.object,
    header: PropTypes.object,
    body: PropTypes.object,
    row: PropTypes.object,
    cell: PropTypes.object,
  }),

  /**
   * Whether to show striped rows
   */
  striped: PropTypes.bool,

  /**
   * Callback when table state changes (pagination, filters, sorter)
   */
  onChange: PropTypes.func,

  /**
   * Callback for row props
   */
  onRow: PropTypes.func,
};

export default Table;
