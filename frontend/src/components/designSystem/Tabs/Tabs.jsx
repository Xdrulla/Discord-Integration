import React from 'react';
import { Tabs as AntTabs } from 'antd';
import PropTypes from 'prop-types';
import {
  buildSemanticClassNames,
  buildSemanticStyles,
  buildTabsItems,
  buildTabsClasses,
  validateTabPlacement,
  isEditableTabs,
  TAB_PLACEMENT,
  TAB_TYPES,
  TAB_SIZES,
  DEFAULT_TAB_PLACEMENT,
  DEFAULT_TAB_TYPE,
  DEFAULT_TAB_SIZE,
} from '../../../helpers/tabs';

/**
 * Tabs - Navigation component for organizing content into separate views
 *
 * Based on Ant Design v6.0 Tabs with Plus UI Design System tokens.
 * Supports line, card, and editable-card types with logical positioning.
 *
 * @component
 * @example
 * // Basic usage
 * <Tabs
 *   items={[
 *     { key: '1', label: 'Tab 1', children: <div>Content 1</div> },
 *     { key: '2', label: 'Tab 2', children: <div>Content 2</div> },
 *   ]}
 * />
 *
 * @example
 * // Card type
 * <Tabs
 *   type="card"
 *   items={items}
 * />
 *
 * @example
 * // Vertical tabs (start placement)
 * <Tabs
 *   tabPlacement="start"
 *   items={items}
 * />
 *
 * @example
 * // Editable tabs
 * <Tabs
 *   type="editable-card"
 *   onEdit={(targetKey, action) => console.log(action, targetKey)}
 *   items={items}
 * />
 */
const Tabs = ({
  // Ant Design v6 props
  items = [],
  type = DEFAULT_TAB_TYPE,
  tabPlacement = DEFAULT_TAB_PLACEMENT, // v6: uses logical positioning
  size = DEFAULT_TAB_SIZE,
  activeKey,
  defaultActiveKey,

  // Custom props
  className = '',
  classNames: customClassNames = {},
  styles: customStyles = {},

  // Events
  onChange,
  onEdit,
  onTabClick,
  onTabScroll,

  ...restProps
}) => {
  // Validate and process placement (v6 logical positioning)
  const validPlacement = validateTabPlacement(tabPlacement);

  // Process items for Ant Design v6
  const processedItems = buildTabsItems(items);

  // Check if editable
  const editable = isEditableTabs(type);

  // Build semantic structure for v6
  const semanticClassNames = buildSemanticClassNames(customClassNames, type, validPlacement);
  const semanticStyles = buildSemanticStyles(customStyles);
  const rootClassName = buildTabsClasses(className, type, validPlacement, size);

  return (
    <AntTabs
      items={processedItems}
      type={type}
      tabPlacement={validPlacement}
      size={size}
      activeKey={activeKey}
      defaultActiveKey={defaultActiveKey}
      className={rootClassName}
      classNames={semanticClassNames}
      styles={semanticStyles}
      onChange={onChange}
      onEdit={editable ? onEdit : undefined}
      onTabClick={onTabClick}
      onTabScroll={onTabScroll}
      {...restProps}
    />
  );
};

Tabs.propTypes = {
  /**
   * Array of tab items
   * Each item: { key, label, children, disabled, icon, closable, className }
   */
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
      children: PropTypes.node,
      disabled: PropTypes.bool,
      icon: PropTypes.node,
      closable: PropTypes.bool,
      className: PropTypes.string,
    })
  ).isRequired,

  /**
   * Tab type/variant
   * 'line' | 'card' | 'editable-card'
   */
  type: PropTypes.oneOf(Object.values(TAB_TYPES)),

  /**
   * Tab placement (v6 - logical positioning)
   * 'top' | 'bottom' | 'start' | 'end'
   * Note: 'start' = left in LTR, right in RTL
   *       'end' = right in LTR, left in RTL
   */
  tabPlacement: PropTypes.oneOf(Object.values(TAB_PLACEMENT)),

  /**
   * Tab size
   * 'small' | 'middle' | 'large'
   */
  size: PropTypes.oneOf(Object.values(TAB_SIZES)),

  /**
   * Current active tab key (controlled)
   */
  activeKey: PropTypes.string,

  /**
   * Default active tab key (uncontrolled)
   */
  defaultActiveKey: PropTypes.string,

  /**
   * Additional CSS class for root element
   */
  className: PropTypes.string,

  /**
   * Semantic classNames object for internal elements (Ant Design v6)
   * Available keys: root, nav, tab, tabPanel, inkBar
   */
  classNames: PropTypes.shape({
    root: PropTypes.string,
    nav: PropTypes.string,
    tab: PropTypes.string,
    tabPanel: PropTypes.string,
    inkBar: PropTypes.string,
  }),

  /**
   * Semantic styles object for internal elements (Ant Design v6)
   * Available keys: root, nav, tab, tabPanel, inkBar
   */
  styles: PropTypes.shape({
    root: PropTypes.object,
    nav: PropTypes.object,
    tab: PropTypes.object,
    tabPanel: PropTypes.object,
    inkBar: PropTypes.object,
  }),

  /**
   * Callback when active tab changes
   */
  onChange: PropTypes.func,

  /**
   * Callback when tab is added or removed (editable-card only)
   */
  onEdit: PropTypes.func,

  /**
   * Callback when tab is clicked
   */
  onTabClick: PropTypes.func,

  /**
   * Callback when tab list scrolls
   */
  onTabScroll: PropTypes.func,
};

export default Tabs;
