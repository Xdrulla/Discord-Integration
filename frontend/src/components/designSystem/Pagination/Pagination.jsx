import React from 'react';
import { Pagination as AntPagination } from 'antd';
import PropTypes from 'prop-types';
import {
  buildSemanticClassNames,
  buildSemanticStyles,
  buildPaginationClasses,
  PAGINATION_SIZES,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
} from '../../../helpers/pagination';

/**
 * Pagination - Navigation component for paginated content
 *
 * @component
 * @example
 * <Pagination total={100} pageSize={10} onChange={(page) => console.log(page)} />
 */
const Pagination = ({
  total = 0,
  current,
  defaultCurrent = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  showSizeChanger = true,
  showQuickJumper = false,
  showTotal,
  size = PAGINATION_SIZES.DEFAULT,
  className = '',
  classNames: customClassNames = {},
  styles: customStyles = {},
  onChange,
  onShowSizeChange,
  ...restProps
}) => {
  const semanticClassNames = buildSemanticClassNames(customClassNames);
  const semanticStyles = buildSemanticStyles(customStyles);
  const rootClassName = buildPaginationClasses(className, size);

  const defaultShowTotal = (total, range) => `${range[0]}-${range[1]} de ${total}`;

  return (
    <AntPagination
      total={total}
      current={current}
      defaultCurrent={defaultCurrent}
      pageSize={pageSize}
      pageSizeOptions={pageSizeOptions}
      showSizeChanger={showSizeChanger}
      showQuickJumper={showQuickJumper}
      showTotal={showTotal || defaultShowTotal}
      size={size}
      className={rootClassName}
      classNames={semanticClassNames}
      styles={semanticStyles}
      onChange={onChange}
      onShowSizeChange={onShowSizeChange}
      {...restProps}
    />
  );
};

Pagination.propTypes = {
  total: PropTypes.number,
  current: PropTypes.number,
  defaultCurrent: PropTypes.number,
  pageSize: PropTypes.number,
  pageSizeOptions: PropTypes.array,
  showSizeChanger: PropTypes.bool,
  showQuickJumper: PropTypes.bool,
  showTotal: PropTypes.func,
  size: PropTypes.oneOf(Object.values(PAGINATION_SIZES)),
  className: PropTypes.string,
  classNames: PropTypes.object,
  styles: PropTypes.object,
  onChange: PropTypes.func,
  onShowSizeChange: PropTypes.func,
};

export default Pagination;
