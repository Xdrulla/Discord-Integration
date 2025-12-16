// ================================
// PAGINATION CONSTANTS
// ================================

export const PAGINATION_SIZES = {
  SMALL: 'small',
  DEFAULT: 'default',
};

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ================================
// PAGINATION HELPER FUNCTIONS
// ================================

export const buildSemanticClassNames = (customClassNames = {}) => {
  return {
    root: `ds-pagination__root ${customClassNames.root || ''}`.trim(),
    item: `ds-pagination__item ${customClassNames.item || ''}`.trim(),
    ...customClassNames,
  };
};

export const buildSemanticStyles = (customStyles = {}) => {
  return {
    root: customStyles.root || {},
    item: customStyles.item || {},
    ...customStyles,
  };
};

export const buildPaginationClasses = (className = '', size = PAGINATION_SIZES.DEFAULT) => {
  return [
    'ds-pagination',
    size === PAGINATION_SIZES.SMALL && 'ds-pagination--small',
    className,
  ].filter(Boolean).join(' ');
};
