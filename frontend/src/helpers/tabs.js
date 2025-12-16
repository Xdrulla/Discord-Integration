// ================================
// TABS CONSTANTS
// ================================

/**
 * Tab placement options (Ant Design v6 - logical positioning)
 */
export const TAB_PLACEMENT = {
  TOP: 'top',
  BOTTOM: 'bottom',
  START: 'start', // left in LTR, right in RTL
  END: 'end',     // right in LTR, left in RTL
};

/**
 * Tab types/variants
 */
export const TAB_TYPES = {
  LINE: 'line',
  CARD: 'card',
  EDITABLE_CARD: 'editable-card',
};

/**
 * Tab sizes
 */
export const TAB_SIZES = {
  SMALL: 'small',
  MIDDLE: 'middle',
  LARGE: 'large',
};

/**
 * Default tab placement
 */
export const DEFAULT_TAB_PLACEMENT = TAB_PLACEMENT.TOP;

/**
 * Default tab type
 */
export const DEFAULT_TAB_TYPE = TAB_TYPES.LINE;

/**
 * Default tab size
 */
export const DEFAULT_TAB_SIZE = TAB_SIZES.MIDDLE;

// ================================
// TABS HELPER FUNCTIONS
// ================================

/**
 * Builds semantic classNames for Tabs component (Ant Design v6)
 * @param {Object} customClassNames - Custom classNames object
 * @param {string} type - Tab type (line, card, editable-card)
 * @param {string} placement - Tab placement (top, bottom, start, end)
 * @returns {Object} Semantic classNames object
 */
export const buildSemanticClassNames = (
  customClassNames = {},
  type = DEFAULT_TAB_TYPE,
  placement = DEFAULT_TAB_PLACEMENT
) => {
  return {
    root: `ds-tabs__root ds-tabs__root--${type} ds-tabs__root--${placement} ${customClassNames.root || ''}`.trim(),
    nav: `ds-tabs__nav ${customClassNames.nav || ''}`.trim(),
    tab: `ds-tabs__tab ${customClassNames.tab || ''}`.trim(),
    tabPanel: `ds-tabs__panel ${customClassNames.tabPanel || ''}`.trim(),
    inkBar: `ds-tabs__ink-bar ${customClassNames.inkBar || ''}`.trim(),
    ...customClassNames,
  };
};

/**
 * Builds semantic styles for Tabs component (Ant Design v6)
 * @param {Object} customStyles - Custom styles object
 * @returns {Object} Semantic styles object
 */
export const buildSemanticStyles = (customStyles = {}) => {
  return {
    root: customStyles.root || {},
    nav: customStyles.nav || {},
    tab: customStyles.tab || {},
    tabPanel: customStyles.tabPanel || {},
    inkBar: customStyles.inkBar || {},
    ...customStyles,
  };
};

/**
 * Builds tabs items array for Ant Design v6
 * @param {Array} items - Array of tab items
 * @returns {Array} Formatted items for Ant Design Tabs
 */
export const buildTabsItems = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  return items.map((item) => ({
    key: item.key,
    label: item.label,
    children: item.children,
    disabled: item.disabled || false,
    icon: item.icon,
    closable: item.closable,
    className: item.className,
    ...item,
  }));
};

/**
 * Builds className string for Tabs root
 * @param {string} className - Custom className
 * @param {string} type - Tab type
 * @param {string} placement - Tab placement
 * @param {string} size - Tab size
 * @returns {string} Combined className string
 */
export const buildTabsClasses = (
  className = '',
  type = DEFAULT_TAB_TYPE,
  placement = DEFAULT_TAB_PLACEMENT,
  size = DEFAULT_TAB_SIZE
) => {
  return [
    'ds-tabs',
    `ds-tabs--${type}`,
    `ds-tabs--${placement}`,
    `ds-tabs--size-${size}`,
    className,
  ].filter(Boolean).join(' ');
};

/**
 * Validates tab placement (v6 uses logical positioning)
 * @param {string} placement - Tab placement
 * @returns {string} Valid placement value
 */
export const validateTabPlacement = (placement) => {
  const validPlacements = Object.values(TAB_PLACEMENT);
  return validPlacements.includes(placement) ? placement : DEFAULT_TAB_PLACEMENT;
};

/**
 * Checks if tabs are editable (editable-card type)
 * @param {string} type - Tab type
 * @returns {boolean} True if editable
 */
export const isEditableTabs = (type) => {
  return type === TAB_TYPES.EDITABLE_CARD;
};
