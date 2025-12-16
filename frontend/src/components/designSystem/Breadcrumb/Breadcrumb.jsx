import React from 'react';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import PropTypes from 'prop-types';
import {
  buildSemanticClassNames,
  buildSemanticStyles,
  buildBreadcrumbItems,
  buildBreadcrumbClasses,
  hasDropdownMenu,
  SEPARATOR_TYPES,
  DEFAULT_SEPARATOR,
  DEFAULT_MAX_ITEMS,
} from '../../../helpers/breadcrumb';

/**
 * Breadcrumb - Navigation component showing current location in hierarchy
 *
 * Based on Ant Design v6.0 Breadcrumb with Plus UI Design System tokens.
 * Supports separators, dropdown menus, and responsive behavior.
 *
 * @component
 * @example
 * // Basic usage
 * <Breadcrumb
 *   items={[
 *     { title: 'Home', href: '/' },
 *     { title: 'Products', href: '/products' },
 *     { title: 'Details' },
 *   ]}
 * />
 *
 * @example
 * // With custom separator
 * <Breadcrumb
 *   separator=">"
 *   items={items}
 * />
 *
 * @example
 * // With dropdown menu
 * <Breadcrumb
 *   items={[
 *     { title: 'Home', href: '/' },
 *     {
 *       title: 'Products',
 *       menu: {
 *         items: [
 *           { key: '1', label: 'Electronics' },
 *           { key: '2', label: 'Clothing' },
 *         ],
 *       },
 *     },
 *     { title: 'Details' },
 *   ]}
 * />
 */
const Breadcrumb = ({
  // Ant Design props
  items = [],
  separator = DEFAULT_SEPARATOR,

  // Custom props
  className = '',
  classNames: customClassNames = {},
  styles: customStyles = {},
  maxItems = DEFAULT_MAX_ITEMS,

  ...restProps
}) => {
  // Process items for Ant Design v6
  const processedItems = buildBreadcrumbItems(items);

  // Check if any item has dropdown menu
  const hasMenu = hasDropdownMenu(processedItems);

  // Build semantic structure for v6
  const semanticClassNames = buildSemanticClassNames(customClassNames, hasMenu);
  const semanticStyles = buildSemanticStyles(customStyles);
  const rootClassName = buildBreadcrumbClasses(className, hasMenu);

  return (
    <AntBreadcrumb
      items={processedItems}
      separator={separator}
      className={rootClassName}
      classNames={semanticClassNames}
      styles={semanticStyles}
      {...restProps}
    />
  );
};

Breadcrumb.propTypes = {
  /**
   * Array of breadcrumb items
   * Each item can have: title, href, onClick, menu, className
   */
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.node,
      label: PropTypes.node,
      href: PropTypes.string,
      onClick: PropTypes.func,
      menu: PropTypes.shape({
        items: PropTypes.array,
      }),
      className: PropTypes.string,
    })
  ),

  /**
   * Separator between breadcrumb items
   * Can be a string or React element
   */
  separator: PropTypes.node,

  /**
   * Maximum number of items to display before collapsing
   */
  maxItems: PropTypes.number,

  /**
   * Additional CSS class for root element
   */
  className: PropTypes.string,

  /**
   * Semantic classNames object for internal elements (Ant Design v6)
   * Available keys: root, item, link, separator
   */
  classNames: PropTypes.shape({
    root: PropTypes.string,
    item: PropTypes.string,
    link: PropTypes.string,
    separator: PropTypes.string,
  }),

  /**
   * Semantic styles object for internal elements (Ant Design v6)
   * Available keys: root, item, link, separator
   */
  styles: PropTypes.shape({
    root: PropTypes.object,
    item: PropTypes.object,
    link: PropTypes.object,
    separator: PropTypes.object,
  }),
};

export default Breadcrumb;
