// ================================
// BREADCRUMB CONSTANTS
// ================================

/**
 * Breadcrumb separator types
 */
export const SEPARATOR_TYPES = {
  SLASH: '/',
  ARROW: '>',
  CHEVRON: 'chevron',
  DOT: '•',
};

/**
 * Default separator
 */
export const DEFAULT_SEPARATOR = SEPARATOR_TYPES.SLASH;

/**
 * Maximum items to display before collapsing
 */
export const DEFAULT_MAX_ITEMS = 8;

// ================================
// BREADCRUMB HELPER FUNCTIONS
// ================================

/**
 * Builds semantic classNames for Breadcrumb component (Ant Design v6)
 * @param {Object} customClassNames - Custom classNames object
 * @param {boolean} hasDropdown - Whether breadcrumb has dropdown menu
 * @returns {Object} Semantic classNames object
 */
export const buildSemanticClassNames = (customClassNames = {}, hasDropdown = false) => {
  return {
    root: `ds-breadcrumb__root ${hasDropdown ? 'ds-breadcrumb__root--with-menu' : ''} ${customClassNames.root || ''}`.trim(),
    item: `ds-breadcrumb__item ${customClassNames.item || ''}`.trim(),
    link: `ds-breadcrumb__link ${customClassNames.link || ''}`.trim(),
    separator: `ds-breadcrumb__separator ${customClassNames.separator || ''}`.trim(),
    ...customClassNames,
  };
};

/**
 * Builds semantic styles for Breadcrumb component (Ant Design v6)
 * @param {Object} customStyles - Custom styles object
 * @returns {Object} Semantic styles object
 */
export const buildSemanticStyles = (customStyles = {}) => {
  return {
    root: customStyles.root || {},
    item: customStyles.item || {},
    link: customStyles.link || {},
    separator: customStyles.separator || {},
    ...customStyles,
  };
};

/**
 * Builds breadcrumb items array for Ant Design v6
 * @param {Array} items - Array of breadcrumb items
 * @returns {Array} Formatted items for Ant Design Breadcrumb
 */
export const buildBreadcrumbItems = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  return items.map((item, index) => {
    const isLast = index === items.length - 1;

    return {
      title: item.title || item.label,
      href: !isLast ? item.href : undefined,
      onClick: !isLast ? item.onClick : undefined,
      menu: item.menu,
      className: item.className,
      ...item,
    };
  });
};

/**
 * Checks if breadcrumb has any items with dropdown menus
 * @param {Array} items - Array of breadcrumb items
 * @returns {boolean} True if any item has a menu
 */
export const hasDropdownMenu = (items = []) => {
  return Array.isArray(items) && items.some(item => item.menu);
};

/**
 * Builds className string for Breadcrumb root
 * @param {string} className - Custom className
 * @param {boolean} hasMenu - Whether breadcrumb has dropdown
 * @returns {string} Combined className string
 */
export const buildBreadcrumbClasses = (className = '', hasMenu = false) => {
  return [
    'ds-breadcrumb',
    hasMenu && 'ds-breadcrumb--with-menu',
    className,
  ].filter(Boolean).join(' ');
};
